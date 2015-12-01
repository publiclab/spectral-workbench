SpectralWorkbench.Datum = Class.extend({

  tags: [],

  init: function(args, _graph) {

    this.args = args;
  
    this.json  = args;
    this.title = args.title;
    this.id    = args.id;
    this.graph = _graph;

    var _datum = this;


    /* ======================================
     * Turns <a> link with specified selector into a download
     * link for the currently viewed data, as a JSON file
     */
    _datum.downloadJSON = function(selector) {

      $(selector).click(function() {

        $(this).attr('download','spectralwb-' + _datum.id + '.json')
               .attr('href','data:application/json;utf8,'+JSON.stringify(_datum.toJSON()));

      });

    }


    /* ======================================
     * Create a new tag and add it to self,
     * then run it.
     * This is a bit weird -- we want to parse the tag immediately, but 
     * we actually do so asynchronously with the callback, which is called 
     * when we get a response from the server. This causes some havoc with 
     * our tests, but is a faster response for the user.
     */
    _datum.addTag = function(name, callback) {

      var tag = new SpectralWorkbench.Tag(_datum, name, false, callback);

      // we just do these before waiting to hear back from the above: 

      _datum.tags.push(tag);

      _datum.parseTag(tag);

      return tag;

    }


    /* ======================================
     * Create new tags and add them to self,
     * then run them. Unfinished.
     */
    /*
    _datum.addTags = function(names, callback) {

      var tags = {};

      // grey out graph during load
      _datum.graph.opacity(0.5);

      names.split(',').forEach(function(tagname, index) {

        // dont yet submit 
        var tag = new SpectralWorkbench.Tag(_datum, tagname, { batch: true }, callback);

        // this gets messy, but whatever
        _tag.startSpinner();
        
        // we just do these before waiting to hear back from the above: 
        
        _datum.tags.push(tag);

        tags[tagname] = tag;

        _datum.tags.push(tag);

      });

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


      return tags;

    }
    */

    /* ======================================
     * Cleanly removes all tags with given name and refreshes graph, and 
     * execute callback() on completion(s) if provided, because
     * this is asynchronous! Callback is passed to .remove() which executes it.
     */
    _datum.removeTag = function(name, callback) {

      _datum.tags.forEach(function(tag) {

        if (tag.name == name) {

          // if it affected the datum display, tags are flushed and reloaded
          // -- and tag is removed from _datum.tags after roundtrip
          tag.destroy(callback); 

        }

      });

    }


    /* ======================================
     * Find tags by name, run callback(tag) on each if provided
     */
    _datum.getTag = function(name, callback) {

      var response = false;

      _datum.tags.forEach(function(tag) {

        if (tag.name == name) {

          if (callback) callback(tag);
          response = tag;

        }

      });

      return response;

    }


    /* ======================================
     * Find powertags by key, run callback(tag) on each if provided
     */
    _datum.getPowerTag = function(key, callback) {

      var powertags = [];
      _datum.tags.forEach(function(tag) {
        if (tag.powertag && tag.key == key) {

          powertags.push(tag);
          if (callback) callback(tag);

        }
      });

      return powertags;

    }


    /* ======================================
     * Get tags from server, populate datum.tags
     */
    _datum.fetchTags = function() {

      // flush existing displayed tag elements if any
      _datum.tags.forEach(function(tag) {

        // this only removes those by the TagForm, not in the Operations table
        tag.el.remove();

        // also remove them from the Operations table:
        if (tag.operationEl) tag.operationEl.remove();

      });

      // flush local tag objects
      _datum.tags = [];

      $('#tags .loading').remove();

      // don't split here; specialize via inheritance
      if (_datum instanceof SpectralWorkbench.Spectrum) {

        _datum.graph.opacity(0.5);

        $.ajax({

          url: "/spectrums/" + _datum.id + "/tags",
          type: "GET",
          dataType: "json",
       
          success: function(response) {

            response.forEach(function(tag) {

              _datum.tags.push(new SpectralWorkbench.Tag(_datum, tag.name, tag));

            });

            _datum.parseTags();

          }

        });

      } else {

        console.log('datum.fetchTags() only works on spectrums for now.');

      }

    }


    _datum.parseTags = function() {

      _datum.tags.forEach(function(tag) {

        _datum.parseTag(tag);

      });

      _datum.graph.opacity(1);

    }


    _datum.parseTag = function(tag) {

      if (tag.powertag) {

        if (tag.key == "subtract") {

          SpectralWorkbench.API.Core.subtract(_datum, tag.value);

        } else if (tag.key == "transform") {

          SpectralWorkbench.API.Core.transform(_datum, tag.value);

        } else if (tag.key == "smooth") {

          SpectralWorkbench.API.Core.smooth(_datum, tag.value);

        } else if (tag.key == "blend") {

          var blend_id = tag.value.split('#')[0],
              expression = tag.value.split('#')[1];

          SpectralWorkbench.API.Core.blend(_datum, blend_id, expression);

        } else if (tag.key == "range") {

          SpectralWorkbench.API.Core.range(_datum, +tag.value.split('-')[0], +tag.value.split('-')[1]);

        }

      }

    }

  }

});
