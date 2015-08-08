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
            if (average < 1) average *= 100; // if it's too low, auto-recognize that it's a percentage?
            spectrum.json.data.lines.push({
              wavelength: line[0],
              average: average 
            });

          });

          // and then reload that into its native data store, too, 
          // in spectrum.average = {y: 0, x: 0}
          spectrum.load(spectrum.json.data.lines);

        });

        // then display it in d3:
        _graph.load(_graph.datum, _graph.chart);

      }
    }

  },

  Legacy: {

    load: function(json, dataType) {
      // provide backward compatability for API v1
      if ($W && $W.data) {
 
        // formatting of $W.data in API v1 is not same as vanilla JSON
        $W.data = [];

        if (dataType == "set") { 

          $.each(json.spectra,function(i,spectrum) {

            var lines = [];

            $.each(spectrum.data.lines,function(i,line) {
              lines.push([line.wavelength,line.average]);
            });

            $W.data.push({data: lines});

          });

        } else if (dataType == "spectrum") {

          $W.data = data;

        }
 
      }

    }

  }

});
