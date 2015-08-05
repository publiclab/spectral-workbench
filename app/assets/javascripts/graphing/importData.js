SpectralWorkbench.Graph.prototype.importData = function(url, chart, callback) {

  var that = this, _chart = chart;

  /* Fetch data */ 
  d3.json(url, function(error, data) {

    var processedData = [];

    if (that.dataType == "spectrum") {

      var lines   = data.data.lines,
          average = [],
          red     = [],
          green   = [],
          blue    = [];

      // Set up x and y properties like data.x and data.y
      $.each(lines,function(i,line) {

        if (line.wavelength == null) {

          var x = line.pixel;
          // change graph labels

        } else var x = line.wavelength;

        // only parse in data if it's in a given range, if there's a range directive
        if (!data.data.hasOwnProperty('range') || x > data.data.range.low && x < data.data.range.high) { 
     
          average.push({ y: parseInt(line.average / 2.55)/100, x: x })
          red.push(    { y: parseInt(line.r / 2.55)/100,       x: x })
          green.push(  { y: parseInt(line.g / 2.55)/100,       x: x })
          blue.push(   { y: parseInt(line.b / 2.55)/100,       x: x })

        }

      });

      processedData = processedData.concat([
        {
          values: average,
          key: data.title+" (average)",
          color: '#444',
          id: data.id
        },
        {
          values: red,
          key: data.title+" (R)",
          color: 'rgba(255,0,0,0.2)'
        },
        {
          values: green,
          key: data.title+" (G)",
          color: 'rgba(0,255,0,0.2)'
        },
        {
          values: blue,
          key: data.title+" (B)",
          color: 'rgba(0,0,255,0.2)'
        }
      ]);

    } else if (that.dataType == "set") {

      var spectra = data.spectra;

      $.each(spectra, function(i,spectrum) {

        var average = [];

        // Set up x and y properties like data.x and data.y
        $.each(spectrum.data.lines, function(i,line) {
          if (line.wavelength == null) {

            var x = line.pixel;
            // change graph labels

          } else var x = line.wavelength;
       
          // only parse in data if it's in a given range, if there's a range directive
          if (!spectrum.data.hasOwnProperty('range') || x > spectrum.data.range.low && x < spectrum.data.range.high) { 
            average.push({ y: line.average / 255, x: x });
          }

        });

        processedData = processedData.concat([
          {
            values: average,
            key: spectrum.title,
            id: spectrum.id
          }
        ]);

      });

    }
    callback(processedData, chart);

  });
}
