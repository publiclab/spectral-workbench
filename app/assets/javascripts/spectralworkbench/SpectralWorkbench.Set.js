SpectralWorkbench.Set = SpectralWorkbench.Datum.extend({

  // data as it arrives from server-side JSON
  init: function(data) {

    this.data    = data; 
    this.spectra = []; 

    // provide backward compatability for API v1
    if ($W && $W.data) {
      $W.data = data;
    }

    $.each(this.data.spectra, function(i,spectrum) {

      this.spectra.push(new SpectralWorkbench.Spectrum(spectrum));

    });
  },

  d3: function() {

    var data = [];

    $.each(this.spectra, function(i,spectrum) {
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

});
