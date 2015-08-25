SpectralWorkbench.Datum = Class.extend({

  tags: [],

  init: function(args) {

    this.args = args;
    var _datum = this;


    /* 
     * ======================================
     * Create a new tag and add it to self
     */
    _datum.addTag = function(name, callback) {

      _datum.tags.push(new SpectralWorkbench.Tag(_datum, name, false, callback));

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

          }

        });

      //} else {

      //  console.log('This only works on spectrums for now.');

      //}

    }
  }

});
