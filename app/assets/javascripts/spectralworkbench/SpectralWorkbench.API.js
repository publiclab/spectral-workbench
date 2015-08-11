SpectralWorkbench.API = Class.extend({

  version: '2.0',
  init: function(_graph) {

    var api = this;

    // override flot graphing
    $.plot = function(el,data,options) {

      // do this differently for sets and spectra
      if (_graph.dataType == 'set') {

        // we have to re-load each .data into each datum.spectra
        // -- we could/should do this via a spectrum.load call?
        $.each(_graph.datum.spectra,function(i,spectrum) {
          spectrum.json.data.lines = [];
          spectrum.average = [];
          
          $.each(data[i].data,function(i,line) {

            var average = line[1];
            if (average <= 1) average *= 100; // if it's too low, auto-recognize that it's a percentage? This is not great. 

            spectrum.json.data.lines.push({
              wavelength: line[0],
              average: average 
            });

          });

          // and then reload that into its native data store, too, 
          // in spectrum.average = {y: 0, x: 0}
          spectrum.load(spectrum.json.data.lines);

        });

      } else if (_graph.dataType == 'spectrum') {

        _graph.datum.json.data.lines = [];
        _graph.datum.average = [];
        
        $.each(data[i].data,function(i,line) {

          var average = line[1];
          if (average <= 1) average *= 100; // if it's too low, auto-recognize that it's a percentage? This is not great. 

          _graph.datum.json.data.lines.push({
            wavelength: line[0],
            average: average 
          });

          // and then reload that into its native data store, too, 
          // in spectrum.average = {y: 0, x: 0}
          _graph.datum.load(_graph.datum.json.data.lines);

        });

      }

      // then display it in d3:
      _graph.load(_graph.datum, _graph.chart);

    }

  }

});
