SpectralWorkbench.API.Legacy = {

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

        $W.data = json;

      }

    }

  },

  override: function(_graph) {

    // override flot graphing
    $.plot = function(el,data,options) {

      // do this differently for sets and spectra
      if (_graph.dataType == 'set') {

        // we have to re-load each .data into each datum.spectra
        // -- we could/should do this via a spectrum.load call?
        $.each(_graph.datum.spectra,function(i,spectrum) {
          spectrum.json.data.lines = [];
          spectrum.average = [];

          var max = 0;
          data[i].data.map(function(i) { if (this > max) max = this; });
          
          $.each(data[i].data,function(i,line) {

            var average = line[1];
            if (max <= 1) average *= 100;    // if max is too low, auto-recognize that it's a percentage? This is not great, but better than before. 
            if (max <= 0.01) average *= 100; // repeat for some operations which divide by 100 again :-( 

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
        
        $.each(_graph.datum.json.data,function(i,line) {

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

}
