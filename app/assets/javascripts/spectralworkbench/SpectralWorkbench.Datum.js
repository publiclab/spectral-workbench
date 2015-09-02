SpectralWorkbench.Datum = Class.extend({

  tags: [],

  init: function(args) {

    this.args = args;
  
    this.json  = args;
    this.title = args.title;
    this.id    = args.id;
    this.graph = args.graph;

    var _datum = this;

    /* 
     * ======================================
     * Create a new tag and add it to self,
     * then run it
     */
    _datum.addTag = function(name, callback) {

      _datum.tags.push(new SpectralWorkbench.Tag(_datum, name, false, callback));

      _datum.parseTag(_datum.tags[_datum.tags.length-1]);

    }


    /* 
     * ======================================
     * Cleanly remove a tag by name and refresh graph, and 
     * execute callback() on completion if provided
     */
    _datum.removeTag = function(name, callback) {

      _datum.tags.forEach(function(tag) {
        if (tag.name == name) {

          tag.destroy(); // if it affected the datum display, tags are flushed and reloaded
          if (callback) callback(tag);

        }
      });

    }


    /* 
     * ======================================
     * Find tags by name, run callback(tag) on each if provided
     */
    _datum.getTag = function(name, callback) {

      var response;
      _datum.tags.forEach(function(tag) {
        if (tag.name == name) {

          if (callback) callback(tag);
          response = tag;

        }
      });
      return response;

    }


    /* 
     * ======================================
     * Find powertags by key, run callback(tag) on each if provided
     */
    _datum.getPowerTag = function(key, callback) {

      var powertags = [];
      _datum.tags.forEach(function(tag) {
        if (tag.powertag && tag.key == key) {

          if (callback) callback(tag);
          powertags.push(tag);

        }
      });

      return powertags;

    }


    /* 
     * ======================================
     * Get tags from server, populate datum.tags
     */
    _datum.fetchTags = function() {

      // flush existing displayed tag elements if any
      _datum.tags.forEach(function(tag) {
        tag.el.remove();
      });
      // flush local tag objects
      _datum.tags = [];

      $('#tags .loading').remove();

      // don't split here; specialize via inheritance
      if (_datum instanceof SpectralWorkbench.Spectrum) {

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

    }


    _datum.parseTag = function(tag) {

      if (tag.powertag) {

        if (tag.key == "subtract") {

          SpectralWorkbench.API.Core.subtract(_datum, tag.value);

        } else if (tag.key == "transform") {

          SpectralWorkbench.API.Core.transform(_datum, tag.value);

        } else if (tag.key == "blend") {

          var blend_id = tag.value.split('#')[0],
              expression = tag.value.split('#')[1];

          SpectralWorkbench.API.Core.blend(_datum, blend_id, expression);

        } else if (tag.key == "range") {

          SpectralWorkbench.API.Core.range(_datum, +tag.value.split('-')[0], +tag.value.split('-')[1]);

        }

      }

    }

    // apply tags here:
    _datum.fetchTags(); 

  }

});
