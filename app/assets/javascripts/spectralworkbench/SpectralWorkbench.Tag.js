SpectralWorkbench.Tag = Class.extend({

  // these tagnames will trigger a snapshot to be saved to the server:
  // this list must be kept consistent with that in /app/models/tag.rb
  snapshot_tagnames: [

    "calibrate",
    "linearCalibration",
    "subtract",
    "transform",
    "range",
    "crossSection",
    "smooth",
    "flip"

  ],

  has_reference: false, // default
  has_snapshot: false, // default

  // <json> is a JSON obj of the tag as received from the server; 
  // if this doesn't exist, it's a new tag
  // <callback> will be called as callback(tag, ajaxResponse)
  init: function(datum, name, json, callback) {

    var _tag = this;

    _tag.name = name;
    _tag.datum = datum;

    if (json) { 

      // this isn't used yet; it will be when Datum.addTags() is complete
      // we (mis)use json as options in a new tag; pass { batch: true } to stop tag from uploading
      if (json.hasOwnProperty('batch')) { 

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
      _tag.uploadable = true;
      _tag.json = {};

    }

    // detect powertags by format
    if (_tag.name.match(/[\w\.]+:[\w0-9\-\*\+\[\]\(\)]+/)) {

      _tag.powertag = true;
      _tag.key = _tag.name.split(':')[0];
      _tag.value = _tag.name.split(':')[1];
      _tag.value_snapshot = _tag.value; // include snapshot syntax if exists

      if (_tag.name.match("#")) {
        _tag.has_reference = true;
        _tag.snapshot_id = _tag.value.split('#')[1];
        _tag.value = _tag.value.split('#')[0];
      }

      // scan for tags that require snapshots, but this isn't the right place to save it -- we need to parse it!
      if (_tag.snapshot_tagnames.indexOf(_tag.key) != -1) _tag.has_snapshot = true;

    } else _tag.powertag = false;

    _tag.startSpinner = function() {

      $('#tag-form-' + _tag.datum.id + ' .add-on i').removeClass('fa-tag')
                                                    .addClass('fa-spin')
                                                    .addClass('fa-spinner');

    }

    _tag.stopSpinner = function() {

      $('#tag-form-' + _tag.datum.id + ' .add-on i').addClass('fa-tag')
                                                    .removeClass('fa-spin')
                                                    .removeClass('fa-spinner');

    }


    // if new, send tag to server
    _tag.upload = function(callback) {

      // this gets messy, but whatever
      _tag.startSpinner();

      // grey out graph during load
      _tag.datum.graph.dim();

      var data = {
        authenticity_token: $('meta[name=csrf-token]').attr('content'),
        tag: {
          spectrum_id: _tag.datum.id,
          name: _tag.name
        }
      };

      // this will have to be adapted as we add tags to sets
      if (_tag.snapshot) data.tag.data = _tag.data;

      $.ajax({
 
        url: "/tags",
        type: "POST",
        dataType: "json",
        data: data,
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
      _tag.datum.graph.undim();

      if (response['saved']) {

        if (response['saved'][_tag.name]) {

          // response is a JSON object whose properties are tagnames, each with property <id>
          if (response['saved'][_tag.name].hasOwnProperty('id')) _tag.id = response['saved'][_tag.name].id;

          // response will be sorted by name, but a new name will be received for snapshotted tags; we update local name here:
          if (response['saved'][_tag.name].hasOwnProperty('name')) _tag.name = response['saved'][_tag.name].name;

        }

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
                                                             .html(_tag.el.html() + " <i class='fa fa-spinner fa-spin fa-white'></i>");

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

        _tag.datum.graph.dim();

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

          // re-fetch spectrum data, as it may have been overwritten by various tags:
          _tag.datum.fetch(false, function() {

            _tag.datum.parseTags();
            _tag.datum.graph.reload();
            _tag.datum.graph.refresh();
            _tag.datum.graph.undim();

          });

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
        if (_tag.has_snapshot) {
          _tag.operationEl.append("<td class='snapshot'><a href='https://publiclab.org/wiki/spectral-workbench-snapshots'><i rel='tooltip' title='This operation generated a data snapshot. Click to learn more.' class='fa fa-thumb-tack'></i></a></td>");
        } else {
          _tag.operationEl.append("<td class='snapshot'></td>");
        }
        _tag.operationEl.append("<td class='title'><span class='label purple'>" + _tag.name + "</span></td>");
        _tag.operationEl.append("<td class='date'><small>" + moment(_tag.json.created_at).format("MMM Do YYYY hh:mm a") + "</small></td>");
        _tag.operationEl.append("<td class='description'><a href='//publiclab.org/wiki/spectral-workbench-tags#" + _tag.key + "'>" + _tag.description() + "</a></td>");
        _tag.operationEl.append("<td class='operations-tools'><a class='tagdelete'><i class='fa fa-remove'></i></a></td>");
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
      if      (_tag.key == "smooth")            return "Rolling average smoothing.";
      else if (_tag.key == "range")             return "Limits wavelength range.";
      else if (_tag.key == "transform")         return "Filters this spectrum with a math expression.";
      else if (_tag.key == "subtract")          return "Subtracts another spectrum from this.";
      else if (_tag.key == "calibrate")         return "Copies calibration from <a href='/spectrums/" + _tag.value + "'>Spectrum #" + _tag.value + "</a>.";
      else if (_tag.key == "cloneOf")           return "Spectrum is a copy of <a href='/spectrums/" + _tag.value + "'>Spectrum #" + _tag.value + "</a>.";
      else if (_tag.key == "linearCalibration") return "Manually calibrated with two reference points.";
      else if (_tag.key == "error")             return "Scores a calibration 'fit' is by comparison to a known reference; lower is better, zero is perfect.";
      else if (_tag.key == "calibrationQuality")return "Roughly indicates how good a calibration 'fit' is.";
      else if (_tag.key == "crossSection")      return "Sets the row of pixels, counting from top row, used to generate the graph.";
      else if (_tag.key == "flip")              return "Indicates that the spectrum image has been flipped horizontally.";
      else                                      return "No description yet.";
    }


    _tag.parse = function() {

      if (_tag.powertag) {

        if (_tag.key == "subtract") {

          SpectralWorkbench.API.Core.subtract(_tag.datum, _tag.value_snapshot);

        } else if (_tag.key == "flip:horizontal") {

          SpectralWorkbench.API.Core.flipHorizontal(_tag.datum);

        } else if (_tag.key == "calibrate") {

          if (_tag.has_reference) SpectralWorkbench.API.Core.copyCalibration(_tag.datum, _tag.value_snapshot);

        } else if (_tag.key == "transform") {

          SpectralWorkbench.API.Core.transform(_tag.datum, _tag.value_snapshot);

        } else if (_tag.key == "smooth") {

          SpectralWorkbench.API.Core.smooth(_tag.datum, _tag.value);

        } else if (_tag.key == "blend") {

          var blend_id = _tag.value_snapshot.split('$')[0],
              expression = _tag.value_snapshot.split('$')[1];

          SpectralWorkbench.API.Core.blend(_tag.datum, blend_id, expression);

        } else if (_tag.key == "range") {

          SpectralWorkbench.API.Core.range(_tag.datum, +_tag.value.split('-')[0], +_tag.value.split('-')[1]);

        }

      }

      // save the parsed tag data
      if (_tag.snapshot) _tag.data = JSON.stringify(_tag.datum.json.data);

    }

    if (_tag.uploadable && callback) {

      _tag.parse();
      _tag.upload(callback);

    } else {

      if (callback) callback(); // callback directly, as we don't need to wait for an upload
      _tag.render();

    }

    return _tag;
 
  }

});
