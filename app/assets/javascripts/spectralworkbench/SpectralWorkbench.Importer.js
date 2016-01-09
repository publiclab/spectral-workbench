SpectralWorkbench.Importer = Class.extend({

  init: function(url, graph, callback) {

    var importer = this;
    /* Fetch data */ 
    $.ajax({
      url: url,
      type: "GET",
      dataType: "json",
      success: function(data) {
 
        if (graph.dataType == "spectrum") {
 
          var datum = new SpectralWorkbench.Spectrum(data, graph);
  
        } else if (graph.dataType == "set") {
  
          var datum = new SpectralWorkbench.Set(data, graph);
  
        }

        callback(datum);
 
        // fetch and apply tags here -- i.e. only if they're the graph's primary data:
        datum.fetchTags(); 

      }
 
    });

  }

});
