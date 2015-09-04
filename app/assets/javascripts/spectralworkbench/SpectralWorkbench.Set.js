SpectralWorkbench.Set = SpectralWorkbench.Datum.extend({

  // data as it arrives from server-side JSON
  init: function(data, _graph) {

    this._super(data, _graph);

    this.spectra = []; 

    var set = this;

    set.load = function() {

      $.each(set.json.spectra, function(i,spectrum) {
     
        set.spectra.push(new SpectralWorkbench.Spectrum(spectrum));
     
      });

    }

    set.d3 = function() {
 
      var data = [];
 
      $.each(set.spectra, function(i,spectrum) {

        data = data.concat([
          {
            values: spectrum.average,
            key:    spectrum.title,
            id:     spectrum.id
          }
        ]);

      });
 
      return data;
 
    }



    /* ======================================
     * Output server-style JSON of the spectrum
     * with all active powertags/operations applied -- exactly as currently seen in the graph
     * STUBBED FOR NOW; could aggreate 
     */
    set.toJSON = function() {

      var json = [];

      set.spectra.forEach(function(spectrum) {

        json.push({
          id: spectrum.id,
          title: spectrum.json.title,
          notes: spectrum.json.notes,
          author: spectrum.json.author,
          lines: spectrum.toJSON()
        });

      });

      return json;

    }


    set.getOverexposure = function() {

      var overexposure = [];
      set.spectra.map(function(spectrum) {

        overexposure.push(spectrum.getOverexposure());

      });

      return overexposure;
    }

    this.load();

  }

});
