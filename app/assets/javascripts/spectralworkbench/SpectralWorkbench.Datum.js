SpectralWorkbench.Datum = Class.extend({

  tags: [],

  init: function(args) {

    this.args = args;
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
     * Get tags from server, populate datum.tags
     */
    _datum.fetchTags = function() {

      $('#tags .loading').remove();

      // don't split here; specialize via inheritance
      //if (_graph.dataType == "spectrum") {

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

      //} else {

      //  console.log('This only works on spectrums for now.');

      //}

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

        }

      }

    }

  }

});
