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


  // programmatically set range for current datum
  setRange: function(_graph) {

    // we could set the tag, then re-fetch the spectrum data? Or do it ourselves, client-side? 
    // graph.addTag: function(spectrum_id, name, callback) {

    // >>>>>>>>>>>

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
  copyCalibration: function(from_id, to_id, callback) {

    callback = callback || function(response) { SpectralWorkbench.API.Core.notify('Calibration cloned from spectrum #' + from_id); }

    $.ajax({
      url: "/spectrums/clone/" + to_id + ".json",
      type: "POST",

      data: {
        authenticity_token: $('meta[name=csrf-token]').attr('content'),
        clone_id: from_id
      },

      success: function(response) {

        // calibrate client side
        callback(response);

      }

    });

  },


  // fetch another spectrum, subtract it from this one
  subtract: function(datum, spectrum_id, channel) {

    channel = channel || "average";

    channel = datum[channel];

    var url = "/spectrums/" + spectrum_id + ".json",
        subtractor;


    /* Fetch data */ 
    d3.json(url, function(error, data) {
 
      subtractor = new SpectralWorkbench.Spectrum(data);

      channel = channel.map(function(point) { 

        point.y -= subtractor.getIntensity(point.x);

      });

      // refresh the graph:
      datum.refresh();
 
    });
    

  },


  // checks overexposure and displays an alert if it is so
  // we might just want a class of alert filters separate from the API, or
  // in a special zone
  alertOverexposure: function(_graph) {

    var overexposure = _graph.datum.getOverexposure();

    if (_graph.dataType == "spectrum") {

      if (overexposure['r'] || overexposure['g'] || overexposure['b']) {

        var msg = "This spectrum looks overexposed. <a href='//publiclab.org/wiki/spectral-workbench-usage#Overexposure'>Learn how to fix this</a>."

        SpectralWorkbench.API.Core.notify(msg, "warning")

      }

    } else {

    }

  }

}
