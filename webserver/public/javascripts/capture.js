// window.webcam.getCameraList()
$.ajaxSetup ({ cache: false }); 
var ajax_load = "<img src='/images/spinner-small.gif' alt='loading...' />";

var $W

$W = {
	data: null,
	pos: 0,
	sample_start_row: 240,
	sample_end_row: 280,
        // height and width of the output stream
        // container
	//width: 640,
	//height: 480,
        width: 1280,
        height: 720,
	initialize: function(args) {
		this.mobile = args['mobile'] || false
		this.calibrated = args['calibrated'] || false
		if (args['height']) {
			this.options.height = args['height'] 
			this.options.width = args['width']
		}
		if (this.mobile) {
			this.sample_start_row = this.width/2
			this.sample_end_row = this.width/2 + 10
		} else {
			this.sample_start_row = this.height/2
			this.sample_end_row = this.height/2 + 10
		}
		getUserMedia(this.options, this.success, this.deviceError)
		window.webcam = this.options
		this.canvas = document.getElementById("canvas")
		$('canvas').width = this.width+"px"
		this.ctx = this.canvas.getContext("2d")
		this.image = this.ctx.getImageData(0, 0, this.width, this.height);
		if (localStorage.getItem('sw:sample_start_row')) this.sample_start_row = localStorage.getItem('sw:sample_start_row')
		if (localStorage.getItem('sw:sample_end_row')) this.sample_end_row = localStorage.getItem('sw:sample_end_row')
		this.sample_height = this.sample_end_row - this.sample_start_row // how many pixels to sample
	},
        success: function (stream) {
		//console.log('success')
                if ($W.options.context === 'webrtc') {
			//console.log('webrtc')
                        var video = $W.options.videoEl,
                                vendorURL = window.URL || window.webkitURL;
                        video.src = vendorURL ? vendorURL.createObjectURL(stream) : stream;
                        video.onerror = function () {
                                stream.stop();
                        	streamError();
                	};
                } else {
                //flash context
			console.log('flash or something else')
        	}
        },
	deviceError: function (error) {
		console.log(error)
	},
	// options contains the configuration information for the shim
	// it allows us to specify the width and height of the video
	// output we're working with, the location of the fallback swf,
	// events that are triggered onCapture and onSave (for the fallback)
	// and so on.
	options: {

            "audio": true,
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

	getRow: function(y) {
		if ($W.options.context === 'webrtc') {
			var video = document.getElementsByTagName('video')[0]; 
			var startrow = $W.sample_start_row//parseInt($W.options.height/2)
			if ($W.mobile) {
				$W.ctx.save()
					$W.ctx.rotate(Math.PI/2)
					$W.ctx.drawImage(video, -startrow/4, -$W.height/2);
				$W.ctx.restore()
			} else {
				$W.ctx.drawImage(video, 0, -startrow);
			}
		} else if($W.options.context === 'flash'){
			window.webcam.capture();
		} else {
			console.log('No context was supplied to getSnapshot()');
		}
		img = $W.ctx.getImageData(0,0,$W.canvas.width,$W.sample_height)
		$W.data = [{label: "webcam",data:[]}]
		$W.full_data = []
		var data = ''

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
			data += red+','+green+','+blue+','+intensity
			if (col != $W.width-1) data += '/'
			$W.full_data.push([red,green,blue,intensity])
			if (!$W.calibrated) $W.data[0].data.push([col,intensity/2.55])
			else $W.data[0].data.push([parseInt($W.getWavelength(col)),intensity/2.55])
		}
		plot = $.plot($("#graph"),$W.data,flotoptions);

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
		is_c = $('#is_calibration')
		if (is_c.checked) {
			$('#choose_calibration').hide()
			is_c.val(true) 
		} else {
			$('#choose_calibration').show()
			is_c.val(false)
			$('#calibration_id').val($W.calibration_id)
		}
		$('#dataurl').val($W.canvas.toDataURL())
		$('#geotag').val($('#geotag-toggle').val() == "on")
		$('#save').show()
		$('#capture').hide()
		setTimeout(function() { if ($('#geotag-toggle').val() == "on") $W.geolocate() },500)
	},
	cancelSave: function() {
		$('#geotag').val('false')
		$('#lon').val('')
		$('#lat').val('')
	},
	match: function() {
		cols = []
		$.each($W.full_data,function(i,datum) {
			cols.push(i+":"+datum[3])
		})
		$("#match").html("<img src='/images/spinner-small.gif' />");
		$.ajax({
			url: "/sets/find_match/"+$W.set+"?calibration="+$W.calibration_id,
			type: "POST",
			data: {data: cols.join(',')},
			//context: document.body
			success: function(result) {
				$("#match").html(result);
			}
		})
	},
	setSampleRows: function(start,end) {
		$W.sample_start_row = start
		$W.sample_end_row = end
		localStorage.setItem('sw:samplestartrow',$W.sample_start_row)
		localStorage.setItem('sw:sampleendrow',$W.sample_end_row)
	},
	getWavelength: function(col) {
		return $W.start_wavelength+(col/$W.width)*($W.end_wavelength-$W.start_wavelength)
	},
}
