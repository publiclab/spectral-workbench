SpectralWorkbench.Tag = Class.extend({

  // <json> is a JSON obj of the tag as received from the server; 
  // if this doesn't exist, it's a new tag
  // <callback> will be called as callback(tag, ajaxResponse)
  init: function(datum, name, json, callback) {

    var _tag = this;

    _tag.name = name;
    _tag.datum = datum;

    if (json) { 

      if (json.hasOwnProperty('batch')) { // we (mis)use json as options in a new tag; pass { batch: true } to stop tag from uploading

        // it's going to be batch-submitted by the parent Datum; don't upload
        _tag.uploadable = false;

      } else {

        // it's an existing tag; don't upload
        _tag.json = json;
        _tag.id = json.id;
        _tag.uploadable = false;

      }

    } else {

      // it's a new tag; upload when done constructing
      _tag.uploadable = false;
      _tag.json = {};

    }

    if (_tag.name.match(/[\w\.]+:[\w0-9\-\*\+\[\]\(\)]+/)) {

      _tag.powertag = true;
      _tag.key = _tag.name.split(':')[0];
      _tag.value = _tag.name.split(':')[1];

    } else _tag.powertag = false;

    _tag.startSpinner = function() {

      $('#tag-form-' + _tag.datum.id + ' .add-on i').removeClass('icon-tag')
                                                    .addClass('icon-spin')
                                                    .addClass('icon-spinner');

    }

    _tag.stopSpinner = function() {

      $('#tag-form-' + _tag.datum.id + ' .add-on i').addClass('icon-tag')
                                                    .removeClass('icon-spin')
                                                    .removeClass('icon-spinner');

    }


    // if new, send tag to server
    _tag.upload = function(callback) {

      // this gets messy, but whatever
      _tag.startSpinner();

      // grey out graph during load
      _tag.datum.graph.opacity(0.5);

      $.ajax({
        url: "/tags",
        type: "POST",
        dataType: "json",
 
        data: {
          authenticity_token: $('meta[name=csrf-token]').attr('content'),
          tag: {
            spectrum_id: _tag.datum.id,
            name: _tag.name
          }
        },

        success: _tag.uploadSuccess,

        error: _tag.uploadError
 
      });

    }


    // used on failed tag upload
    _tag.notify_and_offer_clear = function() {

      var notice = SpectralWorkbench.API.Core.notify("The tag you've applied couldn't be saved, but it's been run locally. <a class='tag-clear-" + _tag.id + "'>Clear it now</a>.");

      $('.tag-clear-' + _tag.id).click(function() {

        _tag.destroy();
        notice.remove();

      });

    }


    _tag.uploadSuccess = function(response) {

      _tag.stopSpinner();

      // remove grey out of graph after load
      _tag.datum.graph.opacity(1);

      if (response['saved'] && response['saved'].length > 0) {

        _tag.id = response['saved'][_tag.name].id; // response is a JSON object whose properties are tagnames, each with property <id>

        // render them!
        _tag.render();

        // from init() call
        if (callback) callback(_tag, response);

      }

      if (response['errors'] && response['errors'].length > 0) {

        _tag.datum.graph.tagForm.error(response['errors']);
        _tag.notify_and_offer_clear();
        console.log(response.responseText);

      }

    }


    _tag.uploadError = function(response) {

      _tag.datum.graph.tagForm.error('There was an error.');
      _tag.notify_and_offer_clear();
      console.log(response.responseText);

    }


    // Delete it from the server, then from the DOM;
    _tag.destroy = function(callback) {

      $('tr#tag_' + _tag.id + ' .label, span#tag_' + _tag.id).css('background', '#bbb')
                                                             .html(_tag.el.html() + " <i class='icon icon-spinner icon-spin icon-white'></i>");

      $('tr#tag_' + _tag.id).css('color', '#bbb')

      $.ajax({
        url: "/tags/" + _tag.id,
        type: "DELETE",
        success: function(response) {

          _tag.cleanUp(callback);
 
        }
      });
 
    }


    // scrubs local tag data; for use after deletion
    _tag.cleanUp = function(callback) {

        // if it failed to initialize, the element may not exist
        if (_tag.el) _tag.el.remove();
        if (_tag.operationEl) _tag.operationEl.remove();

        // remove it from datum.tags:
        var index = _tag.datum.tags.indexOf(_tag);
        _tag.datum.tags.splice(index, 1);

        // if it affected the datum display, reload it:
        if (_tag.powertag) {

          // flush the graph range so the image gets resized:
          _tag.datum.graph.range = false;
          _tag.datum.load();
          _tag.datum.parseTags();
          _tag.datum.graph.reload();
          _tag.datum.graph.refresh();

        }

        if (callback) callback(_tag);

    }


    // actually insert DOM elements into the page
    _tag.render = function() {

      var container = $('#tags span.list');
      var operationTable = $('table.operations');
 
      _tag.el = $("<span id='tag_" + _tag.id + "'></span>");

      // display in Operations table;
      // perhaps abstract into PowerTag or Operation subclass
      if (_tag.powertag) {
        _tag.operationEl = $("<tr id='tag_" + _tag.id + "'></tr>");
        _tag.operationEl.append("<td class='title'><span class='label purple'>" + _tag.name + "</span></td>");
        _tag.operationEl.append("<td class='date'>" + moment(_tag.json.created_at).format("MMM Do YYYY hh:mm a") + "</td>");
        _tag.operationEl.append("<td class='description'><a href='//publiclab.org/wiki/spectral-workbench-tags#" + _tag.key + "'>" + _tag.description() + "</a></td>");
        _tag.operationEl.append("<td class='operations-tools'><a class='tagdelete'><i class='icon icon-remove'></i></a></td>");
        operationTable.append(_tag.operationEl);
      }

      container.append(_tag.el);

      _tag.el.attr('rel', 'tooltip')
             .addClass('label label-info')
             .append("<a href='/tags/" + _tag.name + "'>" + _tag.name+"</a> ")
             .append("<a class='tagdelete'>x</a>");

      _tag.deleteEl = $('#tag_' + _tag.id + ' .tagdelete');

      _tag.deleteEl.attr('data-id', _tag.id)
                   .click(function() { 
                            if (!_tag.powertag || confirm('Are you sure? This tag contains functional data used in the display and analysis of the spectrum.')) _tag.destroy();
      });

      if (_tag.powertag) {

        // we use CSS classnames to identify tag types by color
        _tag.el.addClass('purple');
        _tag.el.attr('title', 'This is a powertag.');

      }

      // deletion listener
      _tag.deleteEl.bind('ajax:success', function(){

        _tag.cleanUp();

      });
 
    }


    _tag.description = function() {
      if      (_tag.key == "smooth")      return "Rolling average smoothing.";
      else if (_tag.key == "range")       return "Limits wavelength range.";
      else if (_tag.key == "transform")   return "Filters this spectrum with a math expression.";
      else if (_tag.key == "subtract")    return "Subtracts another spectrum from this.";
      else if (_tag.key == "calibration") return "Copies calibration from another spectrum.";
      else if (_tag.key == "cloneOf")     return "Spectrum is a copy of <a href='/spectrums/" + _tag.value + "'>Spectrum #" + _tag.value + "</a>.";
      else                                return "No description yet.";
    }


    if (_tag.uploadable) _tag.upload(callback);
    else {

      if (callback) callback(); // callback directly, as we don't need to wait for an upload
      _tag.render();

    }

    return _tag;
 
  }

});
