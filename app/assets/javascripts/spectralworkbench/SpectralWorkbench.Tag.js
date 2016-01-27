SpectralWorkbench.Tag = Class.extend({

  // <json> is a JSON obj of the tag as received from the server; 
  // if this doesn't exist, it's a new tag
  // <callback> will be called as callback(tag, ajaxResponse)
  init: function(datum, name, json, callback) {

    var _tag = this;

    _tag.name = name;
    _tag.datum = datum;


    if (json) { 

      // it's an existing tag; don't upload
      _tag.json = json;
      _tag.id = json.id;
      _tag.uploadable = false;
      _tag.created_at = new Date(json.created_at);

    } else {

      // it's a new tag; upload when done constructing
      _tag.uploadable = true;
      _tag.json = {};

    }

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

      // for PowerTags: this will have to be adapted as we add tags to sets
      if (_tag.data) data.tag.data = _tag.data;

      $.ajax({
 
        url: "/tags",
        type: "POST",
        dataType: "json",
        data: data,
        success: function(response) {

          _tag.uploadSuccess(response, callback);

        },
        error: _tag.uploadError
 
      });

    }


    // used on failed tag upload
    _tag.notify_and_offer_clear = function() {

      var notice = _tag.datum.graph.UI.notify("The tag you've applied couldn't be saved, but it's been run locally. <a class='tag-clear-" + _tag.id + "'>Clear it now</a>.");

      $('.tag-clear-' + _tag.id).click(function() {

        _tag.destroy();
        notice.remove();

      });

    }


    _tag.uploadSuccess = function(response, callback) {

      _tag.stopSpinner();
      _tag.datum.graph.tagForm.clearError();

      // remove grey out of graph after load
      _tag.datum.graph.undim();

      if (response['saved']) {

        // response is a JSON object whose keys are tagnames
        if (response['saved'][_tag.name]) {

          var tag_response = response['saved'][_tag.name];

          // this will typically copy in .id, .snapshot_id, .created_at, 
          // and .has_dependent_spectra (some for powertags)
          Object.keys(tag_response).forEach(function(key) {

            _tag[key] = tag_response[key];

            if (key == 'created_at') _tag.created_at = new Date(tag_response.created_at);

          });

        }

        // parse it once we hear back; powertags only
        if (_tag.parse) _tag.parse();

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

      $('span#tag_' + _tag.id).css('background', '#bbb')
                                                             .html(_tag.el.html() + " <i class='fa fa-spinner fa-spin fa-white'></i>");

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

        // remove it from datum.tags:
        _tag.datum.tags.splice(_tag.datum.tags.indexOf(_tag), 1);

        if (callback) callback(_tag);

    }


    // actually insert DOM elements into the page
    _tag.render = function() {

      var container = $('#tags span.list');
 
      _tag.el = $("<span id='tag_" + _tag.id + "'></span>");

      container.append(_tag.el);

      _tag.el.attr('rel', 'tooltip')
             .addClass('label label-info')
             .append("<a href='/tags/" + _tag.name + "'>" + _tag.name+"</a> ")

        // this is for regular tag display, to the left:
        _tag.el.append("<a class='tag-delete'>x</a>");
        _tag.deleteEl = $('#tag_' + _tag.id + ' .tag-delete');
        _tag.deleteEl.attr('data-id', _tag.id)
                     .click(function() { _tag.destroy(); });

      // deletion listener
      _tag.deleteEl.bind('ajax:success', function(){

        _tag.cleanUp();

      });
 
    }

    if (!(_tag instanceof SpectralWorkbench.PowerTag)) { // note: this section overridden in PowerTag

      if (_tag.uploadable && callback) {
 
        _tag.upload(callback);
 
        // render called after upload, in uploadSuccess
 
      } else {
 
        if (callback) callback(); // callback directly, as we don't need to wait for an upload

        _tag.render();
 
      }

    }

    _tag.datum.tags.push(_tag);

    return _tag;
 
  }

});
