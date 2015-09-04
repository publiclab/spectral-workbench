SpectralWorkbench.API.Core = {

  // initiate a notification on the page, which fades after <expire> seconds, or doesn't if <expire> is not supplied
  notify: function(message, type, expire) {

    expire = expire || false;

    if (type) {
      title = "<b>"+type[0].toUpperCase() + type.substr(1, type.length-1) + ":</b> ";
    } else title = "";

    if (expire == null) expire = true

    var id = parseInt(Math.random()*100000)

    $('.notifications-container').append("<p id='notify-" + id + "' class='alert'></p>")

    $('#notify-' + id).html(title + message).addClass('alert-' + type)

    $('#notification-count').html($('.notifications-container p').length);
    $('.notification-count-icon').show();

    if (expire) {

      setTimeout(function() {

        $('#notify-'+id).remove()

        $('#notification-count').html($('.notifications-container p').length);
        if ($('.notifications-container p').length == 0) $('.notification-count-icon').hide();
        else $('.notification-count-icon').show();

      }, expire*1000);

    }

  },

  // does this really belong here? No. 
  initNotifications: function() {

    $('#notification-count').html(+$('.notifications-container').html());
    if (+$('#notification-count').html() > 0) $('#notifications').show();
    
  },

  exportSVG: function(name) {

    var dataUrl = "data:image/svg+xml;utf8,"+$('#graph').html();
    $('.export .svg').attr('download', name+'.svg');
    $('.export .svg').attr('href', dataUrl);

  },


  // linear calibrate using pixel positions <x1> and <x2>, to known wavelengths <w1> <w2>
  // and optional callback(response)
  calibrate: function(id, x1, w1, x2, w2, callback) {

    $.ajax({
      url: "/spectra/calibrate/0.json", // ugly
      type: "POST",

      data: {
        authenticity_token: $('meta[name=csrf-token]').attr('content'),
        id: id,
        x1: x1,
        x2: x2,
        w1: w1,
        w2: x2
      },

      success: function(response) {

        if (callback) callback(response);

      }

    });

  },


  // clone calibration from spectrum of id <from_id> to spectrum of id <to_id>
  // -- this could be rewritten to be more client-sided
  copyCalibration: function(from_id, datum, callback) {

    callback = callback || function(response) { SpectralWorkbench.API.Core.notify('Calibration cloned from spectrum #' + from_id); }

    $.ajax({
      url: "/spectrums/clone/" + datum.id + ".json",
      type: "POST",

      data: {
        authenticity_token: $('meta[name=csrf-token]').attr('content'),
        clone_id: from_id
      },

      success: function(response) {

        // refresh data on client side
        datum.fetch();
        
        callback(response);

      }

    });

  },


  // apply a provided expression on every pixel of this spectrum
  transform: function(datum, expression) {

    var red     = datum.red,
        green   = datum.green,
        blue    = datum.blue,
        average = datum.average,
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
    datum.graph.refresh();

  },


  // clip out a given subset of wavelengths from this spectrum
  // works for spectra, not sets
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

    // adjust the graph range directly:
    datum.graph.range = [start, end];

    // reload the graph data:
    datum.graph.reload();
    // refresh the graph:
    datum.graph.refresh();
 
  },


  // fetch another spectrum, blend it with this one according to expression
  blend: function(datum, spectrum_id, expression) {

    var red     = datum.red,
        green   = datum.green,
        blue    = datum.blue,
        average = datum.average,
        url = "/spectrums/" + spectrum_id + ".json",
        blender;

    /* Fetch data */ 
    d3.json(url, function(error, data) {
 
      blender = new SpectralWorkbench.Spectrum(data);

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

      // reload the graph data:
      datum.graph.reload();
      // refresh the graph:
      datum.graph.refresh();
 
    });
    

  },


  // fetch another spectrum, subtract it from this one
  subtract: function(datum, spectrum_id) {

    var channels = [datum.red, datum.blue, datum.green, datum.average];

    var url = "/spectrums/" + spectrum_id + ".json",
        subtractor;


    /* Fetch data */ 
    d3.json(url, function(error, data) {
 
      subtractor = new SpectralWorkbench.Spectrum(data);

      channels.forEach(function(_channel) {

        _channel = _channel.map(function(point) { 
 
          point.y -= +subtractor.getIntensity(point.x);
 
        });

      });

      // reload the graph data:
      datum.graph.reload();
      // refresh the graph:
      datum.graph.refresh();
 
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

    // reload the graph data:
    datum.graph.reload();
    // refresh the graph:
    datum.graph.refresh();

  },


  // checks overexposure and displays an alert if it is so
  // we might just want a class of alert filters separate from the API, or
  // in a special zone
  alertOverexposure: function(datum) {

    var overexposure = datum.getOverexposure();

    if (datum instanceof SpectralWorkbench.Spectrum) {

      if (overexposure['r'] || overexposure['g'] || overexposure['b']) {

        var msg = "This spectrum looks overexposed. <a href='//publiclab.org/wiki/spectral-workbench-usage#Overexposure'>Learn how to fix this</a>."

        SpectralWorkbench.API.Core.notify(msg, "warning")

      }

    } else {

    }

  },


  // checks overexposure and displays an alert if it is so
  // we might just want a class of alert filters separate from the API, or
  // in a special zone
  alertTooDark: function(datum) {

    if (datum.getTooDark()) {

      var msg = "This spectrum seems very dim. You may need to choose a new image cross section that intersects your spectrum data. <a href='//publiclab.org/wiki/spectral-workbench-calibration#Cross+section'>Learn how to fix this</a>."

      SpectralWorkbench.API.Core.notify(msg, "warning")

    }

  }

}
