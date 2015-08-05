SpectralWorkbench.API = Class.extend({

  version: '2.0',
  init: function(graph) {

    var api = this;

    // override flot graphing
    $.plot = function(el,data,options) {

      // do this differently for sets and spectra
      if (graph.dataType == 'set') {

        // we have to re-load each .data into each datum.spectrum.data
        $.each(graph.datum.spectra,function(i,spectrum) {
          spectrum.data = [];
          $.each(data[i].data,function(i,line) {
            spectrum.data.push({
              wavelength: line[0],
              average:    line[1]
            });
          });
        });

        // then display it in d3:
        graph.load(graph.datum,graph.chart);

      }
    }

  }

});
