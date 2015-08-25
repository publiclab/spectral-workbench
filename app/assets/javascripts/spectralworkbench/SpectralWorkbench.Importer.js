SpectralWorkbench.Importer = Class.extend({

  init: function(url, chart, type, callback) {

    var importer = this;

    /* Fetch data */ 
    d3.json(url, function(error, data) {
 
      if (type == "spectrum") {
 
        var datum = new SpectralWorkbench.Spectrum(data);
 
      } else if (type == "set") {
 
        var datum = new SpectralWorkbench.Set(data);
 
      }
 
      callback(datum, chart);
 
    });

  }

});
