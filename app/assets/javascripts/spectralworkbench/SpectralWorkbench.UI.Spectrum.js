SpectralWorkbench.UI.Spectrum = Class.extend({

  init: function(_graph) {

    var _ui = this;

    // Initialize tools buttons
    $('.tool-calibrate').click(        function() { new SpectralWorkbench.UI.ToolPane('calibrate2',         _graph); });
    $('.tool-range').click(            function() { new SpectralWorkbench.UI.ToolPane('range',              _graph); });
    $('.tool-smooth').click(           function() { new SpectralWorkbench.UI.ToolPane('smooth',             _graph); });
    $('.tool-transform').click(        function() { new SpectralWorkbench.UI.ToolPane('transform',          _graph); });
    $('.tool-blend').click(            function() { new SpectralWorkbench.UI.ToolPane('blend',              _graph); });

    $('.tool-cross-section').click(    function() { new SpectralWorkbench.UI.ToolPane('crossSection',       _graph); });

    // Tool panes that display a list of spectra
    $('.tool-copy-calibration').click( function() { new SpectralWorkbench.UI.SpectraPane('copyCalibration', _graph); });
    $('.tool-subtraction').click(      function() { new SpectralWorkbench.UI.SpectraPane('subtraction',     _graph); });

    $('.tool-compare').click(          function() { new SpectralWorkbench.UI.SpectraPane('compare',         _graph); });
    $('.tool-similar').click(          function() { new SpectralWorkbench.UI.SpectraPane('similar',         _graph); });

    // Set up JSON download

    _graph.datum.downloadJSON('.btn-download-json');

    $('.btn-save-as-set').click(function() {
      $(this).attr('href', "/sets/new/" + graph.datum.id + ',' + graph.comparisons.map(function(spectrum) { return spectrum.id; }).join(','));
    });

  },

  // initiate a notification on the page, which fades after <expire> seconds, or doesn't if <expire> is not supplied
  // also returns the notification element
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

      }, expire * 1000);

    }

    return $('#notify-' + id);

  },


  // still needed?
/*
  initNotifications: function() {

    $('#notification-count').html(+$('.notifications-container').html());
    if (+$('#notification-count').html() > 0) $('#notifications').show();
    
  },
*/


  // checks overexposure and displays an alert if it is so
  // we might just want a class of alert filters separate from the API, or
  // in a special zone
  alertOverexposure: function(datum) {

    var overexposure = datum.getOverexposure();

    if (datum instanceof SpectralWorkbench.Spectrum) {

      if (overexposure['r'] || overexposure['g'] || overexposure['b']) {

        var msg = "This spectrum looks overexposed. <a href='//publiclab.org/wiki/spectral-workbench-usage#Overexposure'>Learn how to fix this</a>."

        datum.graph.UI.notify(msg, "warning");

      }

    } else {

      // what? WHAT?

    }

  },


  // checks overexposure and displays an alert if it is so
  // we might just want a class of alert filters separate from the API, or
  // in a special zone
  alertTooDark: function(datum) {

    if (datum.getTooDark()) {

      var msg = "This spectrum seems very dim. You may need to choose a new image cross section that intersects your spectrum data. <a href='//publiclab.org/wiki/spectral-workbench-calibration#Cross+section'>Learn how to fix this</a>."

      datum.graph.UI.notify(msg, "warning")

    }

  }

});
