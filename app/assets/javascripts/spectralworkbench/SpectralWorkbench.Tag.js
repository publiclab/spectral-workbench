SpectralWorkbench.Tag = Class.extend({

  // <json> is a JSON obj of the tag as received from the server; 
  // if this doesn't exist, it's a new tag
  init: function(datum, name, json, callback) {

    var _tag = this;

    // spectrum, for now:
    _tag.dataType = 'spectrum';
    _tag.name = name;
    _tag.datum = datum;

    if (json) {
      _tag.isNew = false;
      _tag.json = json;
      _tag.id = json.id;
    } else {
      _tag.isNew = true;
      _tag.json = {};
    }

    if (_tag.name.match(/[a-zA-Z-]+:[a-zA-Z0-9-]+/)) {
      _tag.powertag = true;
      _tag.key = _tag.name.split(':')[0];
      _tag.value = _tag.name.split(':')[1];
    }


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
    _tag.upload = function() {

      // this gets messy, but whatever
      _tag.startSpinner();

      $.ajax({
        url: "/tags",
        type: "POST",
 
        data: {
          authenticity_token: $('meta[name=csrf-token]').attr('content'),
          tag: {
            spectrum_id: _tag.datum.id,
            name: _tag.name
          }
        },
 
        success: function(response) {
 
          _tag.stopSpinner();

          // render them!
          _tag.render();

          // from init() call
          if (callback) callback(response);

          $('#taginput').prop('disabled',false);
 
          var formId = "#tag-form-" + _tag.datum.id;
         
          $(formId + ' input.name').val("");
          $(formId + ' .control-group').removeClass('error');
          $(formId + ' .control-group .help-inline').remove();
         
          if (response['errors'] && response['errors'].length > 0) {
         
            $(formId + ' .control-group').addClass('error');
            $(formId + ' .control-group .help-inline').remove();
            $(formId + ' .control-group').append('<span class="help-inline">'+response['errors']+'</span>');
         
          }
         
          $(formId + ' input.name').prop('disabled',false);

        },
 
      });

    }


    // Delete it from the server, then from the DOM;
    // this is not often used; data-remote=true and data-method=delete do a good job already
    _tag.destroy = function(callback) {
 
      $.ajax({
        url: "/tags/" + _tag.id,
        type: "DELETE",
        success: function(response) {

          _tag.cleanUp();
          if (callback) callback(response);
 
        }
      });
 
    }


    // scrubs local tag data; for use after deletion
    _tag.cleanUp = function() {

        _tag.el.remove();

        // remove it from datum.tags:
        var index = _tag.datum.tags.indexOf(_tag);
        _tag.datum.tags.splice(index, 1);

        // if it affected the datum display, reload it:
        if (_tag.powertag) {
          _tag.datum.load();
          _tag.datum.parseTags();
          _tag.datum.reloadGraph();
          _tag.datum.refreshGraph();
        }

    }


    // actually insert DOM elements into the page
    _tag.render = function() {
 
      var container = $('#tags span.list');
 
      _tag.el = $("<span id='tag_" + _tag.id + "'></span>");

      container.append(_tag.el);

      _tag.el.attr('rel', 'tooltip')
             .addClass('label label-info')
             .append("<a href='/tags/" + _tag.name + "'>" + _tag.name+"</a> ")
             .append("<a class='tagdelete'>x</a>");

      _tag.deleteEl = $('#tag_' + _tag.id + ' .tagdelete');

      _tag.deleteEl.attr('data-id', _tag.id)
                   .attr('data-remote', true)
                   .attr('data-method', 'delete')
                   .attr('href', "/tags/" + _tag.id);

      if (_tag.powertag) {

        // we use CSS classnames to identify tag types by color
        _tag.el.addClass('purple');
        _tag.el.attr('title', 'This is a powertag.');
        _tag.deleteEl.attr('data-confirm', 'Are you sure? This tag contains functional data used in the display and analysis of the spectrum.');

      }

      // deletion listener
      _tag.deleteEl.bind('ajax:success', function(){

        _tag.cleanUp();

      });
 
    }


    if (_tag.isNew) _tag.upload();
    else _tag.render();
 
  }

});
