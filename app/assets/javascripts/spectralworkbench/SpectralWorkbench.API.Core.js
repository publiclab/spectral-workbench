/*
 * General API methods.
 */

SpectralWorkbench.API.Core = {


  fetchSpectrum: function(id, callback) {

    // coerce into string:
    if (("" + id).match(/\#/)) {
      snapshot_id = parseInt(("" + id).split('#')[1]);
      url = "/snapshots/" + snapshot_id + ".json";
      is_snapshot = true;
    } else {
      url = "/spectrums/" + id + ".json";
      is_snapshot = false;
    }

    /* Fetch data */ 
    $.ajax({
      url: url,
      type: "GET",
      dataType: "json",

      success: function(data) {

        if (is_snapshot) data.data = { lines: data.lines }; // doesn't receive a full Spectrum model, just the data, so we rearrange to match

        var spectrum = new SpectralWorkbench.Spectrum(data);

        spectrum.snapshot = is_snapshot;

        if (callback) callback(spectrum);

      }
 
    });

  },


  /* Will return a snapshot or spectrum depending on if snapshots exist. */
  fetchLatestSnapshot: function(id, callback) {

    // coerce into string:
    url = "/spectrums/latest/" + id + ".json";

    /* Fetch data */ 
    $.ajax({
      url: url,
      type: "GET",
      dataType: "json",

      success: function(data) {

        // this is messy, but fetchLatestSnapshot returns snapshots, not spectra. 
        // SpectralWorkbench.Spectrum doesn't know.
        data.snapshot_id = data.id;
        data.id = id;

        var spectrum = new SpectralWorkbench.Spectrum(data);

        if (callback) callback(spectrum);

      }
 
    });

  },


  /* let's put it in Spectrum?: */
  exportSVG: function(name) {

    var dataUrl = "data:image/svg+xml;utf8,"+$('#graph').html();
    $('.export .svg').attr('download', name+'.svg');
    $('.export .svg').attr('href', dataUrl);

    return $('.export .svg');

  },


  // clone calibration from spectrum of id <from_id> to <spectrum>
  copyCalibration: function(spectrum, from_id, callback) {

    SpectralWorkbench.API.Core.fetchSpectrum(from_id, function(source) {

        // what if the image sizes don't match? 
        // well, they should, if they're from the same device.
        spectrum.json.data.lines.forEach(function(line, i) {
          line.wavelength = source.json.data.lines[i].wavelength;
        });
 
        // reload the spectrum data:
        spectrum.load();
         
        if (callback) callback(spectrum);

    });

  },


  // apply a provided expression on every pixel of <spectrum>
  transform: function(spectrum, expression) {

    var red     = spectrum.red,
        green   = spectrum.green,
        blue    = spectrum.blue,
        average = spectrum.average,
        r       = red.map(function(d){ return d.y }),
        g       = green.map(function(d){ return d.y }),
        b       = blue.map(function(d){ return d.y }),
        a       = average.map(function(d){ return d.y });

    // we could parse this, actually...
    eval('var transform = function(R,G,B,A,X,Y,I,P,a,r,g,b) { return ' + expression + '; }');

    average.forEach(function(P, i) { 

      P.y = transform(
        +red[i].y,     //R
        +green[i].y,   //G
        +blue[i].y,    //B
        +average[i].y, //A
        +average[i].x, //X
        +average[i].y, //Y
        i,             //I
        P,             //P
        a,             //a
        r,             //r
        g,             //g
        b              //b
      );

    });

    // some issue here on indexing...
    spectrum.graph.refresh();

  },


  // Clip out a given subset of wavelengths from this spectrum.
  // Works for spectra, not sets.
  // Untested for multiple successive use on one Spectrum.
  // Sets graph.range, which is used in Spectrum.load to change 
  // spectrum.average, .red, .blue, .green, 
  // but doesn't affect original spectrum.json.data.lines.
  range: function(datum, start, end) {

    // ensure start < end
    if (start > end) {
      var tmp = end;
      end = start;
      start = tmp;
    }

    var channels = ['red', 'blue', 'green', 'average'];

    channels.forEach(function(_channel, i) {

      var startIndex = 0, endIndex = datum[_channel].length - 1;

      // count up to first in-range index
      while (true) {
        if (datum[_channel][startIndex].x > start) break;
        startIndex += 1;
      }

      // count down to first in-range index
      while (true) {
        if (datum[_channel][endIndex].x < end) break;
        endIndex -= 1;
      } 

      datum[_channel] = datum[_channel].slice(startIndex, endIndex);

    });

    // adjust the Graph range directly;
    // this is used in graph and image DOM sizing and conversions
    datum.graph.range = [start, end];
 
  },


  // fetch another spectrum, blend it with this one according to expression
  blend: function(datum, spectrum_id, expression, callback) {

    var red     = datum.red,
        green   = datum.green,
        blue    = datum.blue,
        average = datum.average,
        blender;

    SpectralWorkbench.API.Core.fetchSpectrum(spectrum_id, function(blender) {

      // we could parse this, actually...
      eval('var blend = function(R1,G1,B1,A1,R2,G2,B2,A2,X,Y,P) { return ' + expression + '; }');
    
      average.forEach(function(P, i) { 
    
        if (red[i])   var R1 = +red[i].y;
        else          var R1 = 0;
        if (green[i]) var G1 = +green[i].y;
        else          var G1 = 0;
        if (blue[i])  var B1 = +blue[i].y;
        else          var B1 = 0;
    
        var A1 = +average[i].y,
            X = +average[i].x,
            Y = +average[i].y;
    
        var R2 = +blender.getIntensity(i, 'red');
            G2 = +blender.getIntensity(i, 'green');
            B2 = +blender.getIntensity(i, 'blue');
            A2 = +blender.getIntensity(i, 'average');
     
        P.y = +blend(R1,G1,B1,A1,R2,G2,B2,A2,X,Y,P);
    
      });
     
      if (callback) callback();

    });

  },


  // fetch another spectrum, subtract it from this one
  subtract: function(datum, spectrum_id, callback) {

    var channels = [datum.red, datum.blue, datum.green, datum.average];

    SpectralWorkbench.API.Core.fetchSpectrum(spectrum_id, function(subtractor) {
       
      channels.forEach(function(_channel) {
     
        _channel = _channel.map(function(point) { 
     
          point.y -= +subtractor.getIntensity(point.x);
     
        });
     
      });
       
      if (callback) callback();
 
    });
    
  },


  // use a rolling average to smooth data: not time-averaging!
  smooth: function(datum, distance) {

    var average = [];

    datum.average.forEach(function(p, i) {

      average.push(p);

      for (var offset = -distance; offset <= distance; offset += 1) {

        if (offset != 0 && (i + offset) > 0 && (i + offset) < datum.average.length) {

          average[i].y += datum.average[i + offset].y;

        }

      }

      average[i].y /= (distance * 2 + 1);

    });

    datum.average = average;

  },


  /* 
   * Display a spectrum by given id and store in an array graph.comparisons.
   * Counterpart to API.Core.addComparison(), which adds a comparison to 
   * the Comparisons table.
   */
  compare: function(graph, datum, callback) {

    // standardize this! and reuse it in similar()
    graph.comparisons = graph.comparisons || [];
    graph.comparisons.push(datum);

    var combined = graph.datum.d3();

    graph.comparisons.forEach(function(comparison) {

      comparison = comparison.d3()[0];

      // switch to use default color array
      comparison.color = "red";
      combined.push(comparison);

    });

    graph.data.datum(combined, graph.idKey);

    // refresh the graph:
    graph.refresh();

    if (callback) callback();

  },


  // display a spectrum by given id (and store in an array graph.comparisons)
  similar: function(graph, id, fit, callback) {

    callback = callback || SpectralWorkbench.API.Core.compare;

    fit = fit || 20;

    $.ajax({
      url: "/match/search/" + id + ".json",
      type: "GET",
      dataType: "json",

      data: {
        fit: fit,
      },

      success: function(response) {

        if (callback) {

          response.forEach(function(spectrum) {

            // rewrite compare() to accept an array

            callback(graph, spectrum);

          });

        }

      }

    });
    
  },


  // find highest peak in given channel "r", "g", "b", 
  // in given range (if any), with a min. 
  // required intensity of 5
  // <data> is an instance of spectrum.json.data.lines, like:
  // SpectralWorkbench.API.Core.findMax(graph.datum.json.data.lines, 'b');
  // returns { index: <int>, value: <int> } -- index is a pixel position
  findMax: function(data, channel, startIndex, endIndex) {

    var max = { index: 0, 
                value: 0 },
        min_required_intensity = 5;

    startIndex = startIndex || 0;
    endIndex = endIndex || data.length-1;

    data.slice(startIndex, endIndex).forEach(function(line, index){

      if (line[channel] > max.value && line[channel] > min_required_intensity) {
        max.index = index + startIndex;
        max.value = line[channel];
      }

    });

    return max;

  },


  // Attempts to autodetect calibration,
  // adapted from https://gist.github.com/Sreyanth/8dcb8343e4770cd9d301
  // returns [r, g, b] as original image pixel positions from stored json data
  // -- a gotcha is that sometimes stored json pixel data is not full-width;
  // we are transitioning to using native image widths instead of downscaled
  attemptCalibration: function(graph) {

    var green = SpectralWorkbench.API.Core.findMax(graph.datum.json.data.lines, 'g');
    var red   = SpectralWorkbench.API.Core.findMax(graph.datum.json.data.lines, 'r', green.index + 50);

      var estimated_blue_peak = green.index - 1.707 * (red.index - green.index);
      var blueSearchDistance = 5;

    var blue  = SpectralWorkbench.API.Core.findMax(graph.datum.json.data.lines, 'b', estimated_blue_peak - blueSearchDistance, estimated_blue_peak + blueSearchDistance);

    return [ red.index,
             green.index,
             blue.index ];

  },


  // We compare the ratios of peak distances to 
  // see if it is a good fit based on what they *should* be
  // Accepts any unit, as it works on ratios
  calibrationFit: function(r,g,b) {

    var gb_diff = g - b;
    var rg_diff = r - g;
    var rb_diff = r - b;

    /*
    The ratio of peaks should be as follows:

    |-------B-----------G-------R---------|
                1.707   :   1
    */
    
    var gbrg = gb_diff / rg_diff;
    var diff = gbrg - 1.707; // diff should therefore = 0
    
    console.log("GB/RG ratio:" + gbrg);
    console.log("Expected ratio: 1.707");
    console.log("Diff in these ratios:" + diff);
    
    var percentageError = diff * 100 / 1.707; // percentage away from expected
    
    console.log("percentage error in GB/RG ratio: " + percentageError + " %");
  
    var allowedError = 5;

    console.log("Allowed percentage is: " + allowedError + " %");
    console.log("Expected to be a CFL?: " + (percentageError < allowedError && percentageError > -1 * allowedError));

    return percentageError;

  },


  /* 
   * Given a blue 2 and green 2 peak source image pixel position,
   * and a spectrum to compare against, look 
   * for an expected red peak and reply with a "score"
   * for how good the calibration is based on the expected 
   * ratio of (G-B):(R-G) = 1.707:1
   * <g> and <b> are x-coordinates in data space.
   * Returns distance in nanometer wavelength using provided b + g,
   * where 0 indicates a perfect fit. 
   * The ratio of peaks should be as follows:
   * 
   *  |-------B-----------G-------R---------|
   *              1.707   :   1
   * 
   * But, we should recalculate the 1.707 using a really good spectrum from NIST.
   */
  calibrationFitGB: function(b, g, spectrum) {

    var bg2gr = 1.707, // expected ratio
        gb_diff = g - b,
        expected_r = g + (gb_diff / bg2gr), // estimate where the r peak should be
        found_r = spectrum.getNearbyPeak(expected_r, 5); // look around nearby for an actual peak

    return found_r - expected_r;

  },


  /* 
   * Assesses calibration accuracy by comparison to a well-established reference.
   * Essentially, we're asking: with this spectrum, 
   * if it were calibrated with w1, w2, x1, x2, 
   * would it match our best known CFL spectrum?
   * 
   * Using the method:
   * 1. find all major troughs and peaks in ref,
   *    where troughs are midpoints of troughs 
   *    (since they should have flat floors)
   *    find corresponding ones for spectrum, 
   * 2. measure heights of peaks above the average of their neighboring troughs (local heights)
   * 3. do same for reference,
   * 3. scale to max global heights of spectrum and reference, respectively,
   * 4. RMSE the local heights & return error
   * 
   * Wavelengths sourced from NIST & Wikipedia's Ocean Optics reference: 
   * http://publiclab.org/notes/warren/09-30-2015/new-wavelength-calibration-procedure-preview-for-spectral-workbench-2-0#c12626
   * Intensities sourced from reference spectrum: 
   * http://publiclab.org/notes/warren/09-30-2015/new-wavelength-calibration-procedure-preview-for-spectral-workbench-2-0#c12620
   */
  rmseCalibration: function(spectrum, w1, w2, x1, x2) {

    // points as [wavelength, intensity], where intensity is out of 255
    // 
    // values are stretched such that they have the same range of intensities, 0-1.00
    // Indented values are troughs -- midpoint between the known peaks
    var points = [
          [404.66,   4],
          [435.83,  86],
          [487.70,  64],
          [543.50, 117],
          [546.07,  93],
          [577.00,   6],
          [579.10,  15],
          [587.60,  58],
          [593.00,  50],
          [598.00,  23],
          [611.60, 155],
          [630.00,  41],
          [650.00,  16],
          [661.00,   7]
        ],
        troughs = [
          [420.245,  0],
          [461.765,  0],
          [515.6,    0],
          [544.785, 87],
          [561.535,  8],
          [578.05,  75],
          [583.35,  48],
          [590.3,   29],
          [595.5,   31],
          [604.8,   17],
          [620.8,   24],
          [640,      3],
          [655.5,    1]
        ],
        max = 155 - (17+24)/2, // local max
        max2 = 0,
        error = 0;


    // PROBLEM: we would Spectrum.getIntensity, but we want
    // only a temp calibration, so we can evaluate it before
    // committing. So we build our own little tools:

    var tempCalibration = spectrum.calibrate(w1, w2, x1, x2, false); // returns a temp spectrum.json.data.lines, without flipping data or image (false)

    // create a custom intensity getter for not-yet-saved calibrations.
    var getIntensity = function(wavelength) {

      var nmPerPx         = (tempCalibration[tempCalibration.length-1].wavelength - tempCalibration[0].wavelength) / tempCalibration.length,
          startWavelength = tempCalibration[0].wavelength,
          index = parseInt((wavelength - startWavelength) / nmPerPx); // each index should be contents of 1 pixel

      if (tempCalibration[index]) return tempCalibration[index].average; // if this index exists
      else return 0; // or it doesn't

    }

    var localBaseline;

    // calculate local baseline, store in points[3], save max2
    points.forEach(function(point, index) {

      // add it as a third array index
      point.push(getIntensity(point[0]));

      if (index > 0 && troughs[index]) { 
        localBaseline = (troughs[index - 1][1] + troughs[index][1]) / 2;
        var localBaseline2 = (getIntensity(troughs[index - 1][0]) + getIntensity(troughs[index][0])) / 2;
      } else if (index > 0) {
        localBaseline = (0 + troughs[index - 1][1]) / 2;
        var localBaseline2 = (0 + getIntensity(troughs[index - 1][0])) / 2;
      } else {
        localBaseline = (0 + troughs[index][1]) / 2;
        var localBaseline2 = (0 + getIntensity(troughs[index][0])) / 2;
      }

      point.push(localBaseline2);

      if (max2 < (point[2] - localBaseline2)) max2 = point[2] - localBaseline2;

    });

    points.forEach(function(point, index) {


      // adjust for max intensity of each spectrum; compare to average of 2 neighboring troughs
      error += Math.pow(   10 * ((point[2] - point[3]) / max2)
                         - 10 * ((point[1] - localBaseline) / max), 2); // percentages greater than 1 so squaring exaggerates rather than minimizes error

    });

    return Math.sqrt(error);

  },


  /*
   * Adds a comparison to the Comparisons table; counterpart to API.Core.compare(),
   * which actually adds it to the graph and displayed chart.
   */
  addComparison: function(_graph, id, author, title) {

    $('li.comparisons').show();

    $('table.comparisons').append('<tr class="spectrum spectrum-comparison-' + id + '"></tr>');

    var compareEl = $('table.comparisons tr.spectrum-comparison-' + id);
    compareEl.append('<td class="title"><a href="/spectrums/' + id + '">' + title + '</a></td>');
    compareEl.append('<td class="author"><a href="/profile/' + author + '">' + author + '</a></td>');
    compareEl.append('<td class="comparison-tools"></td>');

    compareEl.find('td.comparison-tools').append('<a data-id="' + id + '" class="remove"><i class="fa fa-remove"></i></a>');
    compareEl.find('.comparison-tools .remove').click(function(){

      compareEl.remove();

      var combined = _graph.datum.d3();

      // get rid of self
      _graph.comparisons.forEach(function(datum){
        if (datum.id != +$(this).attr('data-id')) _graph.comparisons.splice(_graph.comparisons.indexOf(datum), 1);
      });

      // re-assemble display data
      _graph.comparisons.forEach(function(comparison) {
     
        comparison = comparison.d3()[0];
        comparison.color = "red";
        combined.push(comparison);
     
      });

      _graph.data.datum(combined, _graph.idKey);
      _graph.refresh();

      // this isn't working...
      $('li.comparisons a').tab('show');

    });

  }

}
