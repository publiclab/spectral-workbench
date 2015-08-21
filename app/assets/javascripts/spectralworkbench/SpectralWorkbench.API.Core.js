SpectralWorkbench.API.Core = {

  // initiate a notification on the page, which fades after <expire> seconds, or doesn't if <expire> is not supplied
  notify: function(message, type, expire) {

    if (expire == null) expire = true

    var id = parseInt(Math.random()*100000)

    $('.datum-alerts').append("<div id='notify-"+id+"' class='alert'></div>")

    if (type == "warning") $('#notify-' + id).html("<b>Warning:</b> " + message).addClass('alert-warning')
    if (type == "error")   $('#notify-' + id).html("<b>Error:</b> "   + message).addClass('alert-error')

    if (expire) {

      setTimeout(function() {
        $('#notify_'+id).remove()
      }, 3000);

    }

  },

  // add tag to current datum
  setTag: function(name) {

  },

  // return given tags metadata of current datum
  getTag: function(name) {

  },

  // programmatically set range for current datum
  setRange: function() {
    
  },

  // checks overexposure and displays an alert if it is so, and what channel.
  // we might just want a class of alert filters separate from the API, or
  // in a special zone
  alertOverexposure: function(_datum) {

    var overexposure = _datum.getOverexposure();

    if (_datum.dataType == "spectrum") {

      if (overexposure['r'] || overexposure['g'] || overexposure['b']) {

        var msg = "This spectrum looks overexposed. <a href='//publiclab.org/wiki/spectral-workbench-usage#Overexposure'>Learn how to fix this</a>."

        SpectralWorkbench.API.Core.notify(msg, "warning", false)

      }

    } else {

    }

  }

}
