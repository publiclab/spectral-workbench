SpectralWorkbench.Set = SpectralWorkbench.Datum.extend({

  // data as it arrives from server-side JSON
  init: function(data) {
  
    this.json  = data;
    this.lines = data.data.lines;
    this.title = data.title;
    this.id    = data.id;

    this.average = [];
    this.red     = [];
    this.green   = [];
    this.blue    = [];

    // Set up x and y properties like data.x and data.y
    $.each(this.lines,function(i,line) {

      if (line.wavelength == null) {

        var x = line.pixel;
        // change graph labels

      } else var x = line.wavelength;

      // only parse in data if it's in a given range, if there's a range directive
      if (!this.data.data.hasOwnProperty('range') || x > data.data.range.low && x < data.data.range.high) { 
   
        average.push({ y: parseInt(line.average / 2.55)/100, x: x })
        red.push(    { y: parseInt(line.r       / 2.55)/100,       x: x })
        green.push(  { y: parseInt(line.g       / 2.55)/100,       x: x })
        blue.push(   { y: parseInt(line.b       / 2.55)/100,       x: x })

      }

    });
  },

  d3: function() {
    return [
      {
        values: this.average,
        key:    this.title+" (average)",
        color:  '#444',
        id:     this.id
      },
      {
        values: this.red,
        key:    this.title+" (R)",
        color:  'rgba(255,0,0,0.2)'
      },
      {
        values: this.green,
        key:    this.title+" (G)",
        color:  'rgba(0,255,0,0.2)'
      },
      {
        values: this.blue,
        key:    this.title+" (B)",
        color:  'rgba(0,0,255,0.2)'
      }
    ];
  }

});
