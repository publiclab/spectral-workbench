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

  // add tag to current datum
  addTag: function(spectrum_id, name, callback) {

    $.ajax({
      url: "/tags",
      type: "POST",

      data: {
        authenticity_token: $('meta[name=csrf-token]').attr('content'),
        tag: {
          spectrum_id: spectrum_id,
          name: name
        }
      },

      success: function(response) {

        response = JSON.parse(response);

        $.each(response['saved'],function(i,tag) {

          var tag_name = tag[0],
              tag_id   = tag[1],
              color    = "";

          // we use CSS classnames to identify tag types
          if (tag_name.match(/[a-zA-Z-]+:[a-zA-Z0-9-]+/)) color = " purple";

          $('#tags').append(" <span id='tag_"+tag_id+"' rel='tooltip' title='This is a powertag.' class='label label-info" + color + "'><a href='/tags/"+tag_name+"'>"+tag_name+"</a> <a class='tagdelete' data-method='delete' href='/tags/"+tag_id+"'>x</a></span> ");

          // deletion listener
          $('#tag_'+tag_id).bind('ajax:success', function(e,tagid){
            $('#tag_'+tagid).remove();
          });

        });

        $('#taginput').prop('disabled',false);

        callback(response);

      },

    });

  },

  // return given tags metadata of current datum
  getTag: function(name) {

  },

  // programmatically set range for current datum
  setRange: function() {
    
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
