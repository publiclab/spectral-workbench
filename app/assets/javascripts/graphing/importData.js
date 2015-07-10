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
      $.each(lines,function(i,data) {

        if (data.wavelength == null) {

          var x = data.pixel;
          // change graph labels

        } else var x = data.wavelength;
     
        average.push({ y: parseInt(data.average / 2.55)/100, x: x })
        red.push(    { y: parseInt(data.r / 2.55)/100,       x: x })
        green.push(  { y: parseInt(data.g / 2.55)/100,       x: x })
        blue.push(   { y: parseInt(data.b / 2.55)/100,       x: x })

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
        $.each(spectrum.data.lines, function(i,data) {
          if (data.wavelength == null) {

            var x = data.pixel;
            // change graph labels

          } else var x = data.wavelength;
       
          average.push({ y: data.average / 255, x: x })

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
