SpectralWorkbench.Set = SpectralWorkbench.Datum.extend({

  // data as it arrives from server-side JSON
  init: function(data) {

    this._super();

    this.json    = data; 
    this.spectra = []; 
    var set = this;

    this.load = function() {

      $.each(set.json.spectra, function(i,spectrum) {
     
        set.spectra.push(new SpectralWorkbench.Spectrum(spectrum));
     
      });

    }

    this.d3 = function() {
 
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

    this.getOverexposure = function() {

      var overexposure = [];
      set.spectra.map(function(spectrum) {

        overexposure.push(spectrum.getOverexposure());

      });

      return overexposure;
    }

    this.load();

  }

});
