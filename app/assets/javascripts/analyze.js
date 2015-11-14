//= require graph.js
var ajax_load = "<img src='/images/spinner-small.gif' alt='loading...' />";
spectrum = "";
var legends;
$W = {
  ajaxLoading: "<i class='fa fa-spinner fa-spin'></i>",
  latestPosition: null,
  updateLegendTimeout: null,
  data: [],
  mode: "combined",
  initialize: function(args) {
    this.spectrum_id = args['spectrum_id']
    this.sample_row = args['sample_row']
    this.calibrated = args['calibrated']
    this.form_authenticity_token = args['form_authenticity_token']
    this.interface = args['interface'] || false
    this.title = args['title']
    this.spectrum = args['spectrum_data']
    this.data = [{label: $W.title+" = 0% ",data:[]}]
    scaled = true
    this.show_average()
    this.init_hovers()
    this.alert_overexposure()
    $("#compareForm").submit(function(){
      var url = "/spectrums/"+$W.spectrum_id+"/compare_search?q="+$("#searchinput").val()
      $("#result").html($W.ajaxLoading).load(url)
    });
    $("#fitAdjustForm").submit(function(){
      var url = "/match/"+$W.spectrum_id+"?fit="+$("#fitinput").val()
      $("#result").html($W.ajaxLoading).load(url+"&c=1")
      $("#results").html($W.ajaxLoading).load(url)
    });
    $('#units').click($W.units)
    $('#createSet').click(function() {
      var f = document.createElement('form');
      f.style.display = 'none';
      $('#graph').append(f);
      f.id = "createsetform"
      var i = document.createElement('input');
      i.name = "authenticity_token"
      i.value = $W.form_authenticity_token
      $('#createsetform').append(i);
      f.method = 'POST';
      f.action = "/sets/new/"+spectra.join(',')
      f.submit();
    })
    $('#extract').click($W.extract)
    $('#clone').click(function() {
      // use uniq_id as a CSS class, only show those from the same device
      $('.cloneCalibration').show()
    })
    // we could switch to "selection" http://people.iola.dk/olau/flot/examples/selection.html
    $('#calibrate').click(function() {
      $("#toolbar_notification").html("Click on the middle blue band (<a href='//publiclab.org/wiki/spectral-workbench-calibration'>Learn more</a>)")
      // observe clicks to graph:
      $("#graph").bind("plotclick", function (event, pos, item) {
        $W.second_calibration($W.getPixelFromWavelength(pos.x),435.833)
        // axis coordinates for other axes, if present, are in pos.x2, pos.x3, ...
      });
    })
    $('#embedcode').click(function() {
      this.focus()
      this.select()
    })
    $('.btn-embed').click(function() {
      var size = prompt("What size, in WIDTHxHEIGHT, in pixels?","500x550")
      var width = size.split('x')[0]
      var height = size.split('x')[1]
      $('#embedcode').val("<iframe width='"+width+"px' height='"+height+"px' border='0' src='//spectralworkbench.org/spectrums/embed2/"+$W.spectrum_id+"?width="+width+"&height="+height+"'></iframe>")
      $('#embedcode').focus()
      $('#embedcode').select()
    })
  },

  init_hovers: function() {
    $("#graph").bind("plothover",  function (event, pos, item) {
      $W.latestPosition = pos;
      if (!$W.updateLegendTimeout)
        $W.updateLegendTimeout = setTimeout($W.updateLegend, 50);
    });
    legends = $("#graph .legendLabel");
    legends.each(function () {
      // fix the widths so they don't jump around
      $(this).css('width', $(this).width()+10);
    });
  },

  // must update to function during RGB mode
  updateLegend: function() {
    $W.updateLegendTimeout = null;

    var pos = $W.latestPosition;

    var axes = $W.plot.getAxes();
    if (pos.x < axes.xaxis.min || pos.x > axes.xaxis.max ||
      pos.y < axes.yaxis.min || pos.y > axes.yaxis.max)
      return;

    var i, j, dataset = $W.plot.getData();
    for (i = 0; i < dataset.length; ++i) {
      var series = dataset[i];

      // find the nearest points, x-wise
      for (j = 0; j < series.data.length; ++j)
        if (series.data[j][0] > pos.x)
        break;

      // now interpolate
      var y, p1 = series.data[j - 1], p2 = series.data[j];
      if (p1 == null)
        y = p2[1];
      else if (p2 == null)
        y = p1[1];
      else
        y = p1[1] + (p2[1] - p1[1]) * (pos.x - p1[0]) / (p2[0] - p1[0]);

      $('#wavelength').html(parseInt(pos.x))
      legends.eq(i).html(series.label.replace(/=.*%/, "= " + parseInt(y) + "%"));
    }
  },

  second_calibration: function(x1,w1) {
    $("#toolbar_notification").html("Click on the bright green band")
    // observe clicks to graph:
    $("#graph").bind("plotclick", function (event, pos, item) {
      $W.complete_calibration(x1,w1,$W.getPixelFromWavelength(pos.x),546.074)
    });
  },

  complete_calibration: function(x1,w1,x2,w2) {
    $("#toolbar_notification").html("Calibrating...")
    var f = document.createElement('form');
    f.style.display = 'none';
    $('#graph').append(f);
    f.id = "calibrateform"
    var i = document.createElement('input');
    i.name = "authenticity_token"
    i.value = $W.form_authenticity_token
    $('#calibrateform').append(i);
    f.method = 'POST';
    f.action = "/spectra/calibrate/"+$W.spectrum_id+"?x1="+x1+"&w1="+w1+"&x2="+x2+"&w2="+w2
    f.submit();
  },

  overexposure_threshold: 20, // how many pixels of consecutive 100% triggers an overexposure warning
  /* Inspects a given color channel recursively for sequential
   * pixels of 100%, which would indicate overexposure. Returns
   * whether it passed the threshold and the last inspected index.
   */
  overexposure_recurse: function(data,i,count,color) {
    if (count > $W.overexposure_threshold) return [true,i]
    else {
      if (data[i][color] >= 250) {
        return $W.overexposure_recurse(data,i+2,count+2,color)
      } else return [false,i]
    }
  },

  detect_overexposure: function() {
    var overexposed = {r: false, g: false, b: false}
    var colors = ["r","g","b"]
    // check each channel for plateaus at 100%:
    $.each(colors,function(index,color) {
      var i = 0;
      while (i < $W.spectrum.lines.length) {
        var line = $W.spectrum.lines[i]
        var scan = $W.overexposure_recurse($W.spectrum.lines,i,0,color)
        if (scan[0]) {
          overexposed[color] = true
          i = $W.spectrum.lines.length
        } else i = scan[1]+10
      }
    })
    return overexposed
  },
  // checks overexposure and displays an alert if it is so, and what channel
  alert_overexposure: function() {
    var oe = $W.detect_overexposure()
    if (oe['r'] || oe['g'] || oe['b']) {
      var msg = "Light source is too strong or camera is too sensitive; overexposure in channels: "
      var channels = []
      if (oe.r) channels.push("red")
      if (oe.g) channels.push("green")
      if (oe.b) channels.push("blue")
      $W.notify(msg+channels.join(', ')+". <a href='//publiclab.org/wiki/spectral-workbench-usage#Overexposure'>Learn how to fix this</a>.","warning",false)
    }
  },

  //setTimeout(5000,$W.alert_overexposure)
  notify: function(msg,type,expire) {
    if (expire == null) expire = true
    var id = parseInt(Math.random()*100000)
    $('#alerts').html($('#alerts').html()+"<div id='notify_"+id+"' class='notify'></div>")
    if (type == "warning") $('#notify_'+id).html("<b>Warning:</b> "+msg).addClass('alert warning')
    if (type == "error") $('#notify_'+id).html("<b>Error:</b> "+msg).addClass('alert error')
    if (expire) {
      setTimeout(function() {
        $('#notify_'+id).remove()
      },3000)
    }
  },

  show_combined: function() {
    this.mode = "combined"
    $W.data[0] = {label: "webcam",data:[]}
    $W.data[1] = {label: "r",data:[]}
    $W.data[2] = {label: "g",data:[]}
    $W.data[3] = {label: "b",data:[]}
    //$W.data[4] = {label: "overexposed",data:[]}

    flotoptions.colors = [ "#ffffff", "rgba(255,0,0,0.3)", "rgba(0,255,0,0.3)", "rgba(0,0,255,0.3)", "#ffff00"]
  },

  show_rgb: function() {
    this.mode = "rgb"
    this.data = [
      {label: "red = 0% ",data:[]},
      {label: "green = 0% ",data:[]},
      {label: "blue = 0% ",data:[]},
    ]
    $.each(this.spectrum.lines,function(index,line) {
      if (line.wavelength == null) {
        line.wavelength = index
        scaled = false
      }
      $W.data[0].data.push([line.wavelength,line.r/2.55])
      $W.data[1].data.push([line.wavelength,line.g/2.55])
      $W.data[2].data.push([line.wavelength,line.b/2.55])
    })
    flotoptions.colors = [ "#ff0000", "#00ff00", "#0000ff" ]
    this.plot = $.plot($("#graph"),this.data,flotoptions);
  },

  show_average: function() {
    this.mode = "average"
    $W.data = [{label: $W.title+" = 0% ",data:[]}]
    $.each(this.spectrum.lines,function(index,line) {
      if (line.wavelength == null) {
        line.wavelength = index
        scaled = false
      }
      $W.data[0].data.push([line.wavelength,line.average/(2.55)])
    })
    flotoptions.xaxis.show = scaled
    this.plot = $.plot($("#graph"),$W.data,flotoptions);
  },

  toggle_mode: function() {
    if (this.mode == "rgb") $W.show_average()
    else $W.show_rgb()
  },

  is_data_ascending_in_nm: function() {
    var left_redness = 0, right_redness = 0
    // sum redness and unblueness for each half
    $.each(this.spectrum.lines,function(index,line) {
      if (index > $W.spectrum.lines.length/2) {
        left_redness += line.r
        left_redness -= line.b
      } else {
        right_redness += line.r
        right_redness -= line.b
      }
    })
    return (left_redness > right_redness)
  },

  units: function() {
    if (flotoptions.xaxis.tickFormatter == wavenumbers) {
      flotoptions.xaxis.tickFormatter = nanometers
      flotoptions.xaxis.tickSize = 100
    } else {
      flotoptions.xaxis.tickFormatter = wavenumbers
      flotoptions.xaxis.tickSize = wavenumber_tickSize
    }
    $.plot($("#graph"),this.data,flotoptions);
  },

  extract: function() {
    var f = document.createElement('form');
    f.style.display = 'none';
    $('#graph').append(f);
    f.id = "extractform"
    var i = document.createElement('input');
    i.name = "authenticity_token"
    i.value = $W.form_authenticity_token
    $('#extractform').append(i);
    f.method = 'POST';
    f.action = "/spectrums/extract/"+$W.spectrum_id
    f.submit();
  },

  set_sample_row: function() {
    var rownum = prompt('Enter the percentage from the top edge from which you would like to extract a spectrum.','100')
    $("#imagelink")[0].onclick = ""
    $('#imagelink').tooltip('destroy')
    if (rownum) window.location = '/spectrums/setsamplerow/'+$W.spectrum_id+'?row='+rownum/100.00
  },

  click_to_set_sample_row: function() {
    $("#imagelink")[0].onclick = ""
    $('#imagelink').tooltip('destroy')
    $('#image').click(function(e){
      var offX, offY;
      if (!(e.offsetX || e.offsetY)) {
	offX = e.pageX - $(e.target).offset().left;
	offY = e.pageY - $(e.target).offset().top;
      } else {
	offX = e.offsetX;
	offY = e.offsetY;
      }
      window.location = '/spectrums/setsamplerow/'+$W.spectrum_id+'?row='+offY/$('#image').height()
    })
  },

  getPixelFromWavelength: function(wavelength) {
    end_wavelength = $W.spectrum.lines[$W.spectrum.lines.length-1].wavelength
    start_wavelength = $W.spectrum.lines[0].wavelength
    if (start_wavelength > end_wavelength) {
      tmp = start_wavelength
      start_wavelength = end_wavelength
      end_wavelength = tmp
    }
    return ((wavelength - start_wavelength)/(end_wavelength-start_wavelength))*$W.spectrum.lines.length
  }

}
