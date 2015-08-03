SpectralWorkbench.Importer = Class.extend({

  init: function(url, chart, type, callback) {

    /* Fetch data */ 
    d3.json(url, function(error, data) {
 
      if (type == "spectrum") {
 
        var datum = new SpectralWorkbench.Spectrum(data);
 
      // and here, generate an array of SW.Spectrums
      } else if (type == "set") {
 
        var datum = new SpectralWorkbench.Set(data);
 
      }
 
      callback(spectrum, chart);
 
    });
  }

});
