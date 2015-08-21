SpectralWorkbench.Spectrum = SpectralWorkbench.Datum.extend({

  /* <data> is a JSON object as it arrives from the server
   */
  init: function(data) {
  
    this.json  = data;
    this.title = data.title;
    this.id    = data.id;

    this.average = [];
    this.red     = [];
    this.green   = [];
    this.blue    = [];

    var _spectrum = this;

    this.load = function(lines) {

      // Set up x and y properties like data.x and data.y for d3
      $.each(lines,function(i,line) {
     
        if (line.wavelength == null) {
     
          var x = line.pixel;
          // change graph labels
     
        } else var x = line.wavelength;

        // only parse in data if it's in a given range, if there's a range directive
        if (!_spectrum.json.data.hasOwnProperty('range') || x > _spectrum.json.data.range.low && x < _spectrum.json.data.range.high) { 
    
          _spectrum.average.push({ y: parseInt(line.average / 2.55)/100, x: x })

          if (line.r) _spectrum.red.push(    { y: parseInt(line.r       / 2.55)/100,       x: x })
          if (line.g) _spectrum.green.push(  { y: parseInt(line.g       / 2.55)/100,       x: x })
          if (line.b) _spectrum.blue.push(   { y: parseInt(line.b       / 2.55)/100,       x: x })
     
        }
     
      });

    }

    /* Inspects a given color channel recursively for sequential
     * pixels of 100%, which would indicate overexposure. Returns
     * whether it passed the threshold and the last inspected index.
     * <threshold> is how many pixels of consecutive 100% triggers an overexposure warning
     * <consecutive> is how many pixels of consecutive 100% triggers an overexposure warning
     */
    var overexposure_recurse = function(data, i, count, color, threshold, consecutive) {

      if (count > consecutive) return [true, i]
      else {

        if (data[i][color] >= threshold) {
          return overexposure_recurse(data, i+2, count+2, color, threshold, consecutive)
        } else return [false,i]

      }

    }
 
    _spectrum.getOverexposure = function(threshold, consecutive) {

      var _overexposed = {r: false, g: false, b: false}
          _colors = ["r","g","b"],
          _lines = _spectrum.json.data.lines;

      threshold = threshold || 250;
      consecutive = consecutive || 20;

      // check each channel for plateaus at 100%:
      _colors.forEach(function(index, color) {

        var spectrumIndex = 0;

        while (spectrumIndex < _lines.length) {

          var line = _lines[spectrumIndex];
          var scan = overexposure_recurse(_lines, spectrumIndex, 0, color, threshold, consecutive);

          if (scan[0]) {

            _overexposed[color] = true;
            spectrumIndex = _lines.length; // skip to end

          } else spectrumIndex = scan[1] + 10;

        }

      })

      return _overexposed;

    }

    this.load(_spectrum.json.data.lines);

    this.d3 = function() {
      return [
        {
          values: _spectrum.average,
          key:    _spectrum.title+" (average)",
          color:  '#444',
          id:     _spectrum.id
        },
        {
          values: _spectrum.red,
          key:    _spectrum.title+" (R)",
          color:  'rgba(255,0,0,0.2)'
        },
        {
          values: _spectrum.green,
          key:    _spectrum.title+" (G)",
          color:  'rgba(0,255,0,0.2)'
        },
        {
          values: _spectrum.blue,
          key:    _spectrum.title+" (B)",
          color:  'rgba(0,0,255,0.2)'
        }
      ];
    }
  }

});
