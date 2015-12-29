SpectralWorkbench.Datum = Class.extend({

  init: function(args, _graph) {

    this.args = args;
  
    this.json  = args;
    this.title = args.title;
    this.id    = args.id;
    this.graph = _graph;
    this.tags = [];

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
     * Create a new Tag or PowerTag depending on name,
     * upload it, parse it accordingly.
     */
    _datum.addTag = function(name, callback) {

      var type = SpectralWorkbench.Tag;

      if (name.match(/[\w\.]+:[\w0-9\-\#\*\+\[\]\(\)]+/)) type = SpectralWorkbench.PowerTag;

      return new type(_datum, name, false, callback);

    }


    /* ======================================
     * Return array of tags with given name, run 
     * callback(tag), if provided, on each.
     */
    _datum.getTags = function(name, callback) {

      var response = [];

      _datum.tags.forEach(function(tag) {

        if (tag.name == name) {

          if (callback) callback(tag);
          response.push(tag);

        }

      });

      return response;

    }


    /* ======================================
     * Return first tag with given name, run 
     * callback(tag) on the result.
     */
    _datum.getTag = function(name, callback) {

      var response = false;

      _datum.tags.forEach(function(tag) {

        if (tag.name == name) {

          response = tag;

        }

      });

      if (callback) callback(response);

      return response;

    }


    /* ======================================
     * Find powertags by key, run callback(tag) on each if provided
     */
    _datum.getPowerTag = function(key, callback) {

      var powertags = [];
      _datum.tags.forEach(function(tag) {
        if (tag instanceof SpectralWorkbench.PowerTag && tag.key == key) {

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

        _datum.graph.dim();

        $.ajax({

          url: "/spectrums/" + _datum.id + "/tags",
          type: "GET",
          dataType: "json",
       
          success: function(response) {

            response.sort(function(a, b) {
              if (a.created_at && a.created_at < b.created_at) return -1;
              else return 1;
            });

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

        if (tag instanceof SpectralWorkbench.PowerTag) tag.parse();

      });

      _datum.graph.undim();

    }

  }

});
