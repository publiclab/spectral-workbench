SpectralWorkbench.Set = SpectralWorkbench.Datum.extend({

  // data as it arrives from server-side JSON
  init: function(data) {

    this.json    = data; 
    this.spectra = []; 
    var set = this;

    // provide backward compatability for API v1
    if ($W && $W.data) {

      // formatting of $W.data in API v1 is not same as vanilla JSON... have to research
      // write this into graph.API.Legacy.import()
      $W.data = [];

      $.each(set.json.spectra,function(i,spectrum) {
        var lines = [];
        $.each(spectrum.data.lines,function(i,line) {
          lines.push([line.wavelength,line.average]);
        });
        $W.data.push({data: lines});
      });

    }

    this.load = function(spectra) {

      set.json.spectra = spectra;

      $.each(spectra, function(i,spectrum) {
     
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

    this.load(this.json.spectra);

  }

});
