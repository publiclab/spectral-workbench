SpectralWorkbench.Importer = Class.extend({

  init: function(url, graph, callback) {

    var importer = this;

    /* Fetch data */ 
    d3.json(url, function(error, data) {
 
      if (graph.dataType == "spectrum") {
 
        var datum = new SpectralWorkbench.Spectrum(data);
 
      } else if (graph.dataType == "set") {
 
        var datum = new SpectralWorkbench.Set(data);
 
      }
 
      callback(datum);
 
    });

  }

});
