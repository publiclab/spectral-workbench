SpectralWorkbench.Spectrum = SpectralWorkbench.Datum.extend({

  /* <data> is a JSON object as it arrives from the server
   */
  init: function(data) {

    // provide backward compatability for API v1, but 
    // don't overwrite if a Set has already done so
    if ($W && $W.data && $W.data == []) {
      $W.data = data;
    }
  
    this.json  = data;
    this.lines = data.data.lines;
    this.title = data.title;
    this.id    = data.id;

    this.average = [];
    this.red     = [];
    this.green   = [];
    this.blue    = [];

    var spectrum = this;

    // Set up x and y properties like data.x and data.y
    $.each(this.lines,function(i,line) {

      if (line.wavelength == null) {

        var x = line.pixel;
        // change graph labels

      } else var x = line.wavelength;

      // only parse in data if it's in a given range, if there's a range directive
      if (!spectrum.json.data.hasOwnProperty('range') || x > spectrum.json.data.range.low && x < spectrum.json.data.range.high) { 
   
        spectrum.average.push({ y: parseInt(line.average / 2.55)/100, x: x })
        spectrum.red.push(    { y: parseInt(line.r       / 2.55)/100,       x: x })
        spectrum.green.push(  { y: parseInt(line.g       / 2.55)/100,       x: x })
        spectrum.blue.push(   { y: parseInt(line.b       / 2.55)/100,       x: x })

      }

    });

    this.d3 = function() {
      return [
        {
          values: spectrum.average,
          key:    spectrum.title+" (average)",
          color:  '#444',
          id:     spectrum.id
        },
        {
          values: spectrum.red,
          key:    spectrum.title+" (R)",
          color:  'rgba(255,0,0,0.2)'
        },
        {
          values: spectrum.green,
          key:    spectrum.title+" (G)",
          color:  'rgba(0,255,0,0.2)'
        },
        {
          values: spectrum.blue,
          key:    spectrum.title+" (B)",
          color:  'rgba(0,0,255,0.2)'
        }
      ];
    }
  }

});
