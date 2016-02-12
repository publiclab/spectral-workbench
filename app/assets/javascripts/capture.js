//= require graph.js
// window.webcam.getCameraList()
$W = {
  data: null,
  baseline: null,
  full_data: [],
  unflipped_data: [],
  flipped: false,
  rotated: false,
  pos: 0,
  sample_height: 1,
  // height and width of the output stream container
  width: 640,
  height: 480,
  waterfall_height: 150,
  scale_h: 1,
  scale_w: 1,
  // width: 1280,
  // height: 720,
  frame: 0,

  initialize: function(args) {
    this.mobile = args['mobile'] || false
    this.flipped = args['flipped'] == true || false
    this.interface = args['interface'] || false
    this.mode = args['mode'] || 'combined'
    flotoptions.colors = [ "#ffffff", "rgba(255,0,0,0.3)", "rgba(0,255,0,0.3)", "rgba(0,0,255,0.3)", "#ffff00"]
    this.calibrated = args['calibrated'] || false
    this.width = args['width'] || this.width
    this.height = args['height'] || this.height
    if (args['height']) {
      this.options.height = args['height']
      this.options.width = args['width']
    }

    if (args.video_row) {
      this.sample_start_row = args.video_row;
    } else {
      // this is camera sample row, not saved image sample row!
      this.sample_start_row = localStorage.getItem('sw:samplestartrow') || this.width/2;
    }
    this.setSampleRow(this.sample_start_row)

    getUserMedia(this.options, this.success, this.deviceError)

    window.webcam = this.options
    this.canvas = document.getElementById("canvas")
    $('canvas').width = this.width+"px"
    this.canvas.width = this.width
    this.canvas.height = this.waterfall_height
    this.ctx = this.canvas.getContext("2d")
    this.image = this.ctx.getImageData(0, 0, this.width, this.height);

    // create canvas for the sidebar preview if there's a "preview" canvas element:
    if ($('#preview').length > 0) {
      this.preview_ctx = $('#preview')[0].getContext('2d')
    }

    setInterval($W.alert_overexposure, 500); // every 0.5 seconds
    setInterval(function() {

      $W.getRecentCalibrations('.select-calibration');

    }, 10000); // every 10 seconds
    $('.btn-switch-calibration-configure').click(function() {
      window.location = "/capture?calibration_id=" + $('.select-calibration-configure').val()
    });

    $('.btn-switch-calibration-capture').click(function() {
      window.location = "/capture?calibration_id=" + $('.select-calibration-capture').val()
    });

    $W.data = [{label: "webcam",data:[]}]
    if ($('video')[0]) {
      $('video')[0].width = "320"
      $('video')[0].height = "240"
    } else {
      $('video').width = "320"
      $('video').height = "240"
    }
  },

  success: function (stream) {
    //console.log('success')
    if ($W.options.context === 'webrtc') {
      $('#heightIndicator').show()
      $('#webcam-msg').hide()
      var video = $W.options.videoEl, vendorURL = window.URL || window.webkitURL;
      window.stream = stream
      window.video = video
      //if (!!stream) {
      //  video.src = null;
      //  stream.stop();
      //}
      if (navigator.mozGetUserMedia) video.mozSrcObject = stream;
      else video.src = vendorURL ? vendorURL.createObjectURL(stream) : stream;
      video.onerror = function (e) {
        stream.stop();
      };
      //video.play()
      // flip image horiz. based on init terms
      if ($W.flipped == true) {
        $W.flipped = false; // <= turn it false because f_h() will toggle it. messy.
        $W.flip_horizontal();
      }
    } else {
      //flash context
      console.log('flash or something else')
    }
  },
  deviceError: function (error) {
    //console.log(error)
  },
  // options contains the configuration information for the shim
  // it allows us to specify the width and height of the video
  // output we're working with, the location of the fallback swf,
  // events that are triggered onCapture and onSave (for the fallback)
  // and so on.
  options: {

    "audio": false,
    "video": true,

    // the element (by id) you wish to apply
    el: "webcam",

    extern: null,
    append: true,

    // the recommended mode to be used is 'callback '
    // where a callback is executed once data
    // is available
    mode: "callback",

    // the flash fallback Url
    swffile: "/javascripts/webcam-fallback/jscam_canvas_only.swf",

    // quality of the fallback stream
    quality: 100,
    context: "",

    debug: function () {},

    // callback for capturing the fallback stream
    onCapture: function () {
      window.webcam.save();
    },
    onTick: function () {},

    // callback for saving the stream, useful for
    // relaying data further.
    onSave: function (data) {
      // in progress for Flash now
      // seems to execute 240 times... once for each column?
      var col = data.split(";"),
        img = $W.canvas.getContext('2d').getImageData(0, 0, this.width, this.height);
        tmp = null,
        w = this.width,
        h = this.height;

      for (var i = 0; i < w; i++) {
        tmp = parseInt(col[i], 10);
        img.data[$W.pos + 0] = (tmp >> 16) & 0xff;
        img.data[$W.pos + 1] = (tmp >> 8) & 0xff;
        img.data[$W.pos + 2] = tmp & 0xff;
        img.data[$W.pos + 3] = 0xff;
        $W.pos += 4;
      }

      if ($W.pos >= 4 * w * $W.sample_height) {
        $W.canvas.getContext('2d').putImageData(img, 0, 0);
        $W.ctx.drawImage(img, 0, 0);
        $W.pos = 0;
      }

    },
    onLoad: function () {}
  },

  // Draws the appropriate pixels onto the top row of the waterfall.
  // Override this if you want a non-linear cross section or somethine
  // else special! <video> is the video element
  getCrossSection: function(video) {
    // draw the new data on the top row of pixels of the canvas, overwriting what's there now
    if ($W.mobile) {
      // this is only for the deprecated mobile version
      $W.ctx.scale(3,1)
      $W.ctx.translate($('video').height()/2,0)
      if (!$W.rotated) $W.ctx.rotate(Math.PI/2)
      $W.ctx.drawImage(video, -$W.sample_start_row/4, -$W.height/2);
    } else {
      if ($W.flipped) {
        $W.ctx.translate($W.width,0)
        $W.ctx.scale(-1,1)
      }
      $W.ctx.scale($W.scale_h,$W.scale_w)
      if ($W.rotated) {

        // these lines may not be working properly for high-resolution cameras on mobile devices?
        // or maybe odd aspect ratios. Do we need to be accounting for the incoming video size?
        $W.ctx.scale($W.width/$W.height,$W.width/$('#canvas').height())
        $W.ctx.translate($W.height,-$W.sample_start_row)

        $W.ctx.rotate(Math.PI/2)
        $W.ctx.drawImage(video,0,0)
      } else {
        $W.ctx.drawImage(video,0,-$W.sample_start_row)
      }

      // testing line; go to //spectralworkbench.org/capture?debug=true
      if ($W.debug_tmp) $W.debug_log = "$W.height="+$W.height+" $W.width="+$W.width+" #canvas height="+$('#canvas').height()
    }
  },

  getRow: function(y) {
    $W.frame += 1
    if ($W.options.context === 'webrtc') {
      var video = $('video')[0];
      // Grab the existing canvas:
      var saved = $W.excerptCanvas(0,0,$W.width,$W.height,$W.ctx).getImageData(0,0,$W.width,$W.height)

      // manipulate the canvas to get the image to copy onto the canvas in the right orientation
      $W.ctx.save()
      $W.getCrossSection(video)
      $W.ctx.restore()

      // draw old data 1px below new row of data:
      $W.ctx.putImageData(saved,0,1)
    } else if($W.options.context === 'flash'){
      window.webcam.capture();
    } else {
      console.log('No context was supplied to getSnapshot()');
    }

    // populate the sidebar preview if there's a "preview" element:
    if ($('#preview').length > 0) {
      $W.preview_ctx.canvas.width = $('#preview').width()
      $W.preview_ctx.canvas.height = $('#preview').width()*0.75
      $('#preview').height($('#preview').width()*0.75)
      if ($W.flipped) {
        $W.preview_ctx.translate($('#preview').width(),0)
        $W.preview_ctx.scale(-1,1)
      }
      $W.preview_ctx.drawImage($('video')[0],0,0,$('#preview').width(),$('#preview').width()*0.75)
      if ($W.rotated != true) $("#heightIndicatorPrev").width($('#sidebar').width())
      $W.resetHeightIndicators(false)
    }

    // get the slice of data
    img = $W.ctx.getImageData(0,0,$W.canvas.width,$W.sample_height)

    // use it to generate a graph
    if ($W.mode == "average") {
      $W.data[0] = {label: "Webcam",data:[]}
    } else if ($W.mode == "rgb") {
      $W.data[0] = {label: "R",data:[]}
      $W.data[1] = {label: "G",data:[]}
      $W.data[2] = {label: "B",data:[]}
    } else if ($W.mode == "combined") {
      $W.data[0] = {label: "Combined",data:[]}
      $W.data[1] = {label: "R",data:[]}
      $W.data[2] = {label: "G",data:[]}
      $W.data[3] = {label: "B",data:[]}
      $W.data[4] = {label: "Overexposed",data:[]}
    }

    // store it in the "raw" data store too
    $W.full_data = []
    for (var col = 0; col < $W.canvas.width; col++) {
      var red = 0
      for (row=0;row<$W.sample_height;row++) {
         red += img.data[((row*(img.width*4)) + (col*4)) + 0]
      }
      red /= $W.sample_height
      var green = 0
      for (row=0;row<$W.sample_height;row++) {
         green += img.data[((row*(img.width*4)) + (col*4)) + 1]
      }
      green /= $W.sample_height
      var blue = 0
      for (row=0;row<$W.sample_height;row++) {
         blue += img.data[((row*(img.width*4)) + (col*4)) + 2]
      }
      blue /= $W.sample_height
      var intensity = (red+blue+green)/3
      $W.full_data.push([red,green,blue,intensity])
      if (!$W.calibrated) {
        if ($W.mode == "average") {
          $W.data[0].data.push([col,intensity/2.55])
        } else if ($W.mode == "rgb") {
          $W.data[0].data.push([col,red/2.55])
          $W.data[1].data.push([col,green/2.55])
          $W.data[2].data.push([col,blue/2.55])
        } else if ($W.mode == "combined") {
          $W.data[0].data.push([col,intensity/2.55])
          $W.data[1].data.push([col,red/2.55])
          $W.data[2].data.push([col,green/2.55])
          $W.data[3].data.push([col,blue/2.55])
          if (red == 255) $W.data[4].data.push([col,100])
          if (green == 255) $W.data[4].data.push([col,100])
          if (blue == 255) $W.data[4].data.push([col,100])
        }
      } else {
        if ($W.mode == "average") {
          if ($W.baseline != null) {
            var wavelength = parseInt($W.getWavelength(col))
            $W.data[0].data.push([wavelength,$W.baseline[wavelength]-intensity/2.55])
          } else $W.data[0].data.push([parseInt($W.getWavelength(col)),intensity/2.55])
        } else if ($W.mode == "rgb") {
          var w = $W.getWavelength(col)
          $W.data[0].data.push([w,red/2.55])
          $W.data[1].data.push([w,green/2.55])
          $W.data[2].data.push([w,blue/2.55])
        } else if ($W.mode == "combined") {
          if ($W.baseline != null) {
            var wavelength = parseInt($W.getWavelength(col))
            $W.data[0].data.push([wavelength,$W.baseline[wavelength]-intensity/2.55])
          } else $W.data[0].data.push([parseInt($W.getWavelength(col)),intensity/2.55])
          var w = $W.getWavelength(col)
          $W.data[1].data.push([w,red/2.55])
          $W.data[2].data.push([w,green/2.55])
          $W.data[3].data.push([w,blue/2.55])
          if (red == 255) $W.data[4].data.push([w,100])
          if (green == 255) $W.data[4].data.push([w,100])
          if (blue == 255) $W.data[4].data.push([w,100])
        }
      }
    }
    $W.plot = $.plot($("#graph"),$W.data,flotoptions);
    $.each($W.markers,function(i,m) {
      $('#graph').append('<div style="position:absolute;left:' + (m[2] + 4) + 'px;top:10px;color:#aaa;font-size:smaller">'+m[0]+': '+parseInt($W.getIntensity($W.data[0].data,m[1]))+'%</div>');
    })
    $W.unflipped_data = $W.full_data
    if ($W.flipped) $W.unflipped_data = $W.unflipped_data.reverse()
    if ($W.macro && $W.macro.draw) {
      try {
        $W.macro.draw()
      } catch(e) {
        console.log(e)
      }
    }
  },

  geolocate: function() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition($W.setGeolocation)
      return true
    }
  },
  setGeolocation: function(loc) {
    if (loc.coords) {
      $('#lat').val(loc.coords.latitude)
      $('#lon').val(loc.coords.longitude)
    }
    else {
      $('#lat').val(loc.latitude)
      $('#lon').val(loc.longitude)
    }
  },
  saveSpectrum: function() {
    var this_ = this;
    $('#dataurl').val($W.canvas.toDataURL())
    if ($('#spectrum-preview')) {
      $('#spectrum-preview')[0].src = $('#dataurl').val()
      $('#spectrum-preview').show()
    }
    $('#video_row').val($W.sample_start_row)
    if ($('#geotag-toggle').length > 0) $('#geotag').val($('#geotag-toggle')[0].checked)
    setTimeout(function() { if ($('#geotag').val() == "true") $W.geolocate() },500)
    this_.getRecentCalibrations("#calibration_id");
  },

  getRecentCalibrations: function(selector) {
    $.ajax({
      url: "/capture/recent_calibrations.json?calibration_id=" + $W.calibration_id,
      type: "GET",
      success: function(data) {
        var html = "<option value='calibration'>[+] New calibration/uncalibrated</option>"
        $.each(data, function(index, spectrum) {
          html += "<option "
          if ($W.calibration_id == spectrum.id) html += "selected "
          html += "value="+spectrum.id+">#"+spectrum.id+": "+spectrum.title+" (";
          if (spectrum.forked) html += "forked ";
          html += spectrum.created_at_in_words+" ago)</option>";
        });
        $(selector).html(html);
      }
    })
  },

  cancelSave: function() {
    $('#geotag').val('false')
    $('#lon').val('')
    $('#lat').val('')
  },

  auto_detect_sample_row: function() {
        
    // We need a separate canvas to draw the snapshot, whenever we try to auto detect the sample row.
    if ($('#autoDetectCanvas').length == 0) {
      $('body').append("<canvas style='display:none;' id='autoDetectCanvas'></canvas>")
    }

    var video = document.getElementsByTagName('video')[0]
    var canvas = document.getElementById('autoDetectCanvas')
    canvas.height = $W.height
    canvas.width = $W.width
    var context = canvas.getContext('2d')

    context.drawImage(video, 0, 0)

    img = context.getImageData(0,0,$W.width,$W.height)

    var detected = []
    var max_avg_intensity = 0
    var selected_row = -1

    for (var row = 0; row < $W.height; row++) {

      var red_vals = {"low":10000, "high": -10000}
      var green_vals = {"low":10000, "high": -10000}
      var blue_vals = {"low":10000, "high": -10000}
      var intensity_vals = {"low":10000, "high": -10000}

      var vals = [red_vals, green_vals, blue_vals, intensity_vals]
      var sum_intensity = 0
      var count_intensity = 0

      for (var col = 0; col < $W.width; col++) { 
        var red = img.data[((row*(img.width*4)) + (col*4)) + 0]
        var green = img.data[((row*(img.width*4)) + (col*4)) + 1]
        var blue = img.data[((row*(img.width*4)) + (col*4)) + 2]
        var intensity = (red+green+blue)/3

        var bands = [red, green, blue, intensity]

        $.each(vals, function(index, val){
          if (val["low"] > bands[index]) val["low"] = bands[index]
          if (val["high"] < bands[index]) val["high"] = bands[index]
        })
        
        sum_intensity += intensity
        count_intensity++
      }

      // If we need intensity diffs, 
      // diff = intensity_vals["high"] - intensity_vals["low"]
      
      diff = red_vals["high"] - red_vals["low"]
      
      //console.log(diff)
      if (diff > 20) {
        detected.push(row)
        var avg_intensity = parseInt(sum_intensity / count_intensity)
        if (avg_intensity < 255 && max_avg_intensity < avg_intensity){
            selected_row = row
            max_avg_intensity = avg_intensity
        }        
      }
    }
    
    // console.log(selected_row)
    
    //alert(detected)
    //if (detected.length > 0) {
    //    $W.setSampleRows(selected_row, selected_row+1);
    //}

    if (selected_row > -1) $W.setSampleRows(selected_row, selected_row+1);
    else console.log('AutoDetectSampleRow: Increase light intensity and try again!')
  },

  // deprecate in favor of setSampleRows, or wrap it with a +1
  setSampleRow: function(row) {
    $W.setSampleRows(parseInt(row),parseInt(row)+1,false)
  },
  setSampleRows: function(start,end,legacy) {
    $W.sample_start_row = start
    $W.sample_end_row = end
    localStorage.setItem('sw:samplestartrow',$W.sample_start_row)
    localStorage.setItem('sw:sampleendrow',$W.sample_end_row)
    $W.width_percent = start/$W.width
    $W.height_percent = start/$W.height
    $W.resetHeightIndicators(legacy)
    $('#video_row').val($W.sample_start_row);
  },
  resetHeightIndicators: function(legacy) {
    if ($W.rotated) {
      if (legacy != true) $('#heightIndicator')[0].style.marginLeft = parseInt($W.width_percent*320)+'px';
      if (legacy != true) $('#heightIndicatorPrev')[0].style.marginLeft = parseInt($W.width_percent*$('#preview').width())+'px';
    } else {
      if (legacy != true) $('#heightIndicator')[0].style.marginTop = parseInt($W.height_percent*240)+'px';
      if (legacy != true) $('#heightIndicatorPrev')[0].style.marginTop = parseInt($W.height_percent*$('#preview').height())+'px';
    }
  },

  setSampleRowClickListener: function() {
    $('#webcam').click(function(e){
      var offX, offY;
      if (!(e.offsetX || e.offsetY)) {
        offX = e.pageX - $(e.target).offset().left;
        offY = e.pageY - $(e.target).offset().top;
      } else {
        offX = e.offsetX;
        offY = e.offsetY;
      }
      var percent, row
      if ($W.rotated) {
        percent = offX/$('#webcam').width()
        if ($W.flipped) {
          row = $W.width-parseInt(percent*$W.width)
        } else {
          row = parseInt(percent*$W.width)
        }
      } else {
        percent = offY/$('#webcam').height()
        row = parseInt(percent*$W.height)
      }
      $W.setSampleRows(row,row);
    })
  },

  getWavelength: function(col) {
    return $W.start_wavelength+(col/$W.width)*($W.end_wavelength-$W.start_wavelength)
  },

  show_rgb: function() {
    this.mode = "rgb"
    $W.oldflotoptionscolors = flotoptions.colors
    flotoptions.colors = [ "#ff0000", "#00ff00", "#0000ff" ]
    $W.plot = $.plot($("#graph"),$W.data,flotoptions);
  },
  show_average: function() {
    this.mode = "average"
    $W.data = [{label: "webcam",data:[]}]
    flotoptions.colors = $W.oldflotoptionscolors
    $W.plot = $.plot($("#graph"),$W.data,flotoptions);
  },
  toggle_mode: function() {
    if (this.mode == "rgb") $W.show_average()
    else $W.show_rgb()
  },
  show_combined: function() {
    this.mode = "combined"
    flotoptions.colors = [ "#ffffff", "rgba(255,0,0,0.3)", "rgba(0,255,0,0.3)", "rgba(0,0,255,0.3)", "#ffff00"]
  },

  flip_horizontal: function() {
    $W.flipped = !$W.flipped
    if ($W.flipped == true) $('.btn-flip').addClass('active');
    else                    $('.btn-flip').removeClass('active');
    $('#spectrum_reversed').val($('#spectrum_reversed').val() == 'false')
    var style = $('#webcam video')[0].style
    if ($W.flipped) {
      style.webkitTransform = "scaleX(-1)"
      style.mozTransform = "scaleX(-1)"
      style.oTransform = "scaleX(-1)"
      style.transform = "scaleX(-1)"
      style.filter = "FlipH"
      style.msFilter = "FlipH"
    } else {
      style.webkitTransform = "scaleX(1)"
      style.mozTransform = "scaleX(1)"
      style.oTransform = "scaleX(1)"
      style.transform = "scaleX(1)"
      style.filter = "none"
      style.msFilter = "none"
    }
  },

  toggle_rotation: function() {
    $W.rotated = !$W.rotated
    if ($W.rotated == true) $('.btn-rotate').addClass('active');
    else                    $('.btn-rotate').removeClass('active');
    var style = $('#heightIndicator')[0].style
    var stylePrev = $('#heightIndicatorPrev')[0].style
    if ($W.rotated) {
      style.marginTop = '0px';
      style.borderBottomWidth = "0px"
      style.borderRightWidth = "2px"
      style.height = "240px"
      style.width = "0px"
      stylePrev.marginTop = '0px';
      stylePrev.borderBottomWidth = "0px"
      stylePrev.borderRightWidth = "2px"
      stylePrev.height = "100px"
      stylePrev.width = "0px"
      $('#heightIndicator .vertical').show();
      $('#heightIndicator .horizontal').hide();
      $('.spectrum-example-horizontal').hide();
      $('.spectrum-example-vertical').show();
    } else {
      style.marginLeft = '0px';
      style.borderBottomWidth = "2px"
      style.borderRightWidth = "0px"
      style.width = "320px"
      style.height = "0px"
      stylePrev.marginLeft = '0px';
      stylePrev.borderBottomWidth = "2px"
      stylePrev.borderRightWidth = "0px"
      stylePrev.width = "100%"
      stylePrev.height = "0px"
      $('#heightIndicator .vertical').hide();
      $('#heightIndicator .horizontal').show();
      $('.spectrum-example-horizontal').show();
      $('.spectrum-example-vertical').hide();
    }
    // reset the indicator to the correct sample row:
    $W.setSampleRows($W.sample_start_row,$W.sample_start_row)
  },

  is_data_ascending_in_nm: function() {
    var left_redness = 0, right_redness = 0
    // sum redness and unblueness for each half
    // REFACTOR to read from live video
    if ($W.unflipped_data.length > 0) {
      $.each($W.unflipped_data,function(index,col) {
        if (index > $W.unflipped_data.length/2) {
          left_redness += col[0]
          left_redness -= col[2]
        } else {
          right_redness += col[0]
          right_redness -= col[2]
        }
      })
      return (left_redness > right_redness)
    } else {
      return true
    }
  },

  markers: [],
  mark: function() {
    var nm = prompt("Enter a wavelength in nanometers","532")
    var label = prompt("Enter a label","Green laser")
    var o = $W.plot.pointOffset({ x: nm, y: 90})
    if (!flotoptions.grid.markings) flotoptions.grid.markings = []
    flotoptions.grid.markings.push({ color: '#ccc', lineWidth: 1, xaxis: { from: nm, to: nm } })
    $W.plot = $.plot($("#graph"),$W.data,flotoptions);

    $W.markers.push([label,nm,o.left])
  },

  add_spectrum: function(id) {
    $.ajax({
      url: "/spectra/show/"+id+".json",
      type: "GET",
      //context: document.body
      success: function(result) {
        var spectrum = JSON.parse(result.data) // probably need to convert from JSON
        if ($('#baseline-toggle')[0].checked) { // use for subtracting baseline
          //$('#spectrum_tags').val($('#spectrum_tags').val()+",absorption")
          $W.baseline = []
          $.each(spectrum.lines,function(index,line) {
            if (line.wavelength == null) line.wavelength = index
            // quite imprecise...
            $W.baseline[parseInt(line.wavelength)] = line.average/2.55
          })
        } else {
          var label = result.spectrum.title
          $W.data.push({label:label,data:[]})
          $.each(spectrum.lines,function(index,line) {
            if (line.wavelength == null) line.wavelength = index
            $W.data[$W.data.length-1].data.push([line.wavelength,line.average/2.55])
          })
          $W.plot = $.plot($("#graph"),$W.data,flotoptions);
        }
      }
    })
  },

  overexposure_threshold: 15, // how many pixels of consecutive 100% triggers an overexposure warning
  /* Inspects a given color channel recursively for sequential
   * pixels of 100%, which would indicate overexposure. Returns
   * whether it passed the threshold and the last inspected index.

  },

  overexposure_threshold: 20, // how many pixels of consecutive 100% triggers an overexposure warning
  /* Inspects a given color channel recursively for sequential
   * pixels of 100%, which would indicate overexposure. Returns
   * whether it passed the threshold and the last inspected index.
   */
  overexposure_recurse: function(data,i,count,color) {
    if (count > $W.overexposure_threshold) return [true,i]
    else {
      if (data[i][({r:0,g:1,b:2})[color]] >= 250) {
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
      while (i < $W.full_data.length) {
        var line = $W.full_data[i]
        var scan = $W.overexposure_recurse($W.full_data,i,0,color)
        if (scan[0]) {
          overexposed[color] = true
          i = $W.full_data.length
        } else i = scan[1]+10
      }
    })
    return overexposed
  },
  // checks overexposure and displays an alert if it is so, and what channel
  alert_overexposure: function() {
    console.log('Checking for overexposure');
    var oe = $W.detect_overexposure()
    if (oe.r || oe.g || oe.b) {
      var msg = "<b>Light source too strong</b>; clipping in channels: "
      var channels = []
      if (oe.r) channels.push("red")
      if (oe.g) channels.push("green")
      if (oe.b) channels.push("blue")
      $W.notify(msg+channels.join(', '),"warning")
      // notify is not working in capture, not sure why...
      $('.capture-navbar .capture-messages').html(msg + channels.join(', '));
      $('.capture-navbar').addClass('red');
    } else {
      $('.capture-navbar .capture-messages').html('');
      $('.capture-navbar').removeClass('red');
    }
  },

  //setTimeout($W.alert_overexposure,3000)
  notify: function(msg,type,expire) {
    if (expire == null) expire = true
    var id = parseInt(Math.random()*100000)
    $('#notify').html($('#notify').html()+"<div id='notify_"+id+"' class='notify'></div>")
    if (type == "warning") $('#notify_'+id).html("<b>Warning:</b> "+msg).addClass('warning')
    if (type == "error") $('#notify_'+id).html("<b>Error:</b> "+msg).addClass('error')
    if (expire) {
      setTimeout(function() {
        $('#notify_'+id).remove()
      },2000)
    }
  },

  getIntensity: function(data,x) {
    var i, j

    // find the nearest points, x-wise
    for (j = 0; j < data.length; ++j)
      if (data[j][0] > x)
        break;

    // now interpolate
    var y, p1 = data[j - 1], p2 = data[j];
    if (p1 == null)
      y = p2[1];
    else if (p2 == null)
      y = p1[1];
    else
      y = p1[1] + (p2[1] - p1[1]) * (x - p1[0]) / (p2[0] - p1[0]);

    return y
  },

  /**
    * Returns a canvas object of any rect from the offered canvas
    */
  excerptCanvas: function(x1,y1,x2,y2,source) {
    source = source || $W.canvas
    var width = x2-x1, height = y2-y1
    if ($('#excerptCanvas').length == 0) {
      $('body').append("<canvas style='display:none;' id='excerptCanvas'></canvas>")
    }
    var element = $('#excerptCanvas')[0]
    element.width = width
    element.height = height
    var excerptCanvasContext = element.getContext('2d')
    var sourcedata = source.getImageData(x1,y1,width,height)
    excerptCanvasContext.putImageData(sourcedata,0,0)
    return excerptCanvasContext
  }
}
