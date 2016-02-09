SpectralWorkbench.Datum = Class.extend({

  init: function(args, _graph) {

    this.args = args;
  
    this.json  = args;
    this.title = args.title;
    this.id    = args.id;
    this.graph = _graph;
    this.tags = [];
    this.powertags = [];

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
     * upload it (if Tag), and run a callback. See addAndParseTag() and
     * addAndUploadTag() for PowerTag options.
     */
    _datum.addTag = function(name, callback, json) {

      json = json || false;

      // is it possible to have Tag constructor simply return a PowerTag if it matches?
      // i.e. move this code into Tag?

      var type = SpectralWorkbench.Tag;

      if (name.match(/[\w\.]+:[\w0-9\-#\*\+\[\]\(\)]+/)) type = SpectralWorkbench.PowerTag;

      return new type(_datum, name, json, callback);

    }


    /* ======================================
     * Create a new Tag or PowerTag, parse it (if PowerTag), 
     * then refresh and reload the graph (if PowerTag). This
     * does not upload PowerTags; see addAndUploadTag().
     */
    _datum.addAndParseTag = function(name, callback, json) {

      var parseCallback = function(tag) {

        tag.parse(function(tag) { 

          if (callback) callback(tag);

          _datum.graph.reload_and_refresh();

        });

      }

      return _datum.addTag(name, parseCallback, json);

    }


    /* ======================================
     * Create a new Tag or PowerTag, parse it (if PowerTag), 
     * upload it, then refresh and reload the graph (if PowerTag). 
     * This is more commonly used than addAndParseTag(), as it
     * manages the required parsing before uploading, in order
     * to generate an up-to-date snapshot on the server side.
     */
    _datum.addAndUploadTag = function(name, callback, json) {

      var parseCallback = function(tag) {

        if (tag instanceof SpectralWorkbench.PowerTag) {

          tag.parse(function(tag) { 
 
            tag.upload(function(tag) {
 
              if (callback) callback(tag);
 
              if (tag.passive) _datum.graph.undim();
              else _datum.graph.reload_and_refresh();
 
            });
 
          });

        } else {

          tag.upload(callback);

        }

      }

      return _datum.addTag(name, parseCallback, json);

    }


    /* ======================================
     * Create a new Tag or PowerTag, fetch latest 
     * reference snapshot, then parse it (if PowerTag), 
     * upload it, then refresh and reload the graph (if PowerTag). 
     * This is more commonly used than addAndParseTag(), as it
     * manages the required parsing before uploading, in order
     * to generate an up-to-date snapshot on the server side.
     */
    _datum.addAndUploadTagWithReference = function(name, callback, json) {

      var parseCallback = function(tag) {

        if (tag instanceof SpectralWorkbench.PowerTag) {

          // here we do something different from addAndUploadTag;
          // we first fetch the latest reference (if any):
          tag.fetchReference(function() {

            tag.parse(function(tag) { 
  
              tag.upload(function(tag) {
  
                if (callback) callback(tag);
  
                if (tag.passive) _datum.graph.undim();
                else _datum.graph.reload_and_refresh();
  
              });

            });
 
          });

        } else {

          tag.upload(callback);

        }

      }

      return _datum.addTag(name, parseCallback, json);

    }


    /* ======================================
     * Return array of tags with given name, run 
     * callback(tag), if provided, on each.
     * Supplying no reference snapshot returns
     * snapshotted tags; i.e. getTag('calibrate:1') 
     * will return tag 'calibrate:1#2', but getTag('calibrate:1#2')
     * will not return 'calibrate:1' or 'calibrate:1#3'.
     */
    _datum.getTags = function(name, callback) {

      var response = [];

      _datum.tags.forEach(function(tag) {

        // test against snapshot-referencing tags too:
        if (tag.name == name || (tag.key + ':' + tag.value) == name) {

          if (callback) callback(tag);
          response.push(tag);

        }

      });

      return response;

    }


    /* ======================================
     * Return first tag with given name, run 
     * callback(tag) on the result.
     * Supplying no reference snapshot returns
     * snapshotted tags; i.e. getTag('calibrate:1') 
     * will return tag 'calibrate:1#2', but getTag('calibrate:1#2')
     * will not return 'calibrate:1' or 'calibrate:1#3'.
     */
    _datum.getTag = function(name, callback) {

      var response = false;

      _datum.tags.forEach(function(tag) {

        // test against snapshot-referencing tags too:
        if (tag.name == name || (tag.key + ':' + tag.value) == name) {

          response = tag;

        }

      });

      if (callback) callback(response);

      return response;

    }


    /* ======================================
     * Return first powertag with given key, run 
     * callback(tag) on the result.
     */
    _datum.getPowerTag = function(key, callback) {

      var response = false;

      _datum.tags.forEach(function(tag) {

        if (tag.key == key) {

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
     * Get tags from server, populate datum.tags, run them
     */
    _datum.fetchTags = function() {

      // flush existing displayed tag elements if any
      _datum.tags.forEach(function(tag) {

        // this only removes those by the TagForm, not in the Operations table
        if (tag.el) tag.el.remove();

        // also remove them from the Operations table:
        if (tag.operationEl) tag.operationEl.remove();

      });

      // flush local tag objects
      _datum.tags = [];

      $('#tags .loading').remove();

      // don't split here; specialize via inheritance
      if (_datum instanceof SpectralWorkbench.Spectrum) {

        _datum.graph.dim();

        console.log("fetching tags for spectrum", _datum.id);

        $.ajax({

          url: "/spectrums/" + _datum.id + "/tags",
          type: "GET",
          dataType: "json",
       
          success: function(response) {

            response.sort(function(a, b) {
              if (a.created_at && a.created_at < b.created_at) return -1;
              else return 1;
            });

            // just add, don't parse:
            response.forEach(function(json, i) {

              _datum.addTag(json.name, false, json);

            });

            // now rely on parseTags to chain them and parse
            _datum.parseTags(function() {

              // Check the URL hash for directives, such
              // as `calibrate:foo` from the original page load;
              // these should clear out the first time they're checked.
              _datum.graph.readHashDirectives();

            });

          }

        });

      } else {

        console.log('datum.fetchTags() only works on spectrums for now.');

      }

    }


    /* ======================================
     * Parses tags sequentially; this may involve
     * asynchronous calls, so we queue them. 
     * We use jQuery $.Deferred to wait for each to
     * to complete its asynchronous requests before 
     * proceeding to the next:
     * http://stackoverflow.com/questions/7743952/how-to-use-jquerys-deferred-object-with-custom-javascript-objects
     */
    _datum.parseTags = function(callback) {

      _datum.tagQueue = new Array();

      _datum.powertags.forEach(function(tag, index) {

        _datum.tagQueue.push(tag.deferredParse(_datum.tagQueue)
          .done(function() {

             if (index == _datum.powertags.length - 1) {

               _datum.graph.reload_and_refresh();
               if (callback) callback();

             }

          })
          .fail(function() {

             console.log('failed to parse' + tag.name);

          })
        );

      });

    }

  }

});
