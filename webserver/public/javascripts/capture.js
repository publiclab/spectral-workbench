// window.webcam.getCameraList()
//$.ajaxSetup ({ cache: false }); 
var ajax_load = "<img src='/images/spinner-small.gif' alt='loading...' />";

var $W

$W = {
	data: null,
	baseline: null,
	full_data: [],
	unflipped_data: [],
	detect_flip: true,
	flipped: false,
	mode: "average",
	pos: 0,
	sample_start_row: 240,
	sample_end_row: 280,
        // height and width of the output stream
        // container
	width: 640,
	height: 480,
	waterfall_height: 150,
        //width: 1280,
        //height: 720,
	frame: 0,

	initialize: function(args) {
		this.mobile = args['mobile'] || false
		this.calibrated = args['calibrated'] || false
		if (args['height']) {
			this.options.height = args['height'] 
			this.options.width = args['width']
		}
		if (this.mobile) {
        		this.width = 1280
        		this.height = 720
			this.sample_start_row = this.width/2
			this.sample_end_row = this.width/2 + 10
		} else {
			this.sample_start_row = this.height/2
			this.sample_end_row = this.height/2 + 10
		}
		$('#samplerow-slider').max = this.options.height // this doesn't work!!!
		$('#samplerow-slider').value = this.sample_start_row

		getUserMedia(this.options, this.success, this.deviceError)

		window.webcam = this.options
		this.canvas = document.getElementById("canvas")
		$('canvas').width = this.width+"px"
		this.canvas.width = this.width
		this.canvas.height = this.waterfall_height
		this.ctx = this.canvas.getContext("2d")
		this.image = this.ctx.getImageData(0, 0, this.width, this.height);
		if (localStorage.getItem('sw:sample_start_row')) this.sample_start_row = localStorage.getItem('sw:sample_start_row')
		if (localStorage.getItem('sw:sample_end_row')) this.sample_end_row = localStorage.getItem('sw:sample_end_row')
		this.sample_height = this.sample_end_row - this.sample_start_row // how many pixels to sample
		setInterval($W.alert_overexposure,3000)
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
			//console.log('webrtc')
                        var video = $W.options.videoEl,
                                vendorURL = window.URL || window.webkitURL;
                        if (navigator.mozGetUserMedia) video.src = stream;
			else video.src = vendorURL ? vendorURL.createObjectURL(stream) : stream;
                        video.onerror = function (e) {
				console.log(e);
                                stream.stop();
                        	streamError();
                	};
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

	getRow: function(y) {
		$W.frame += 1
		if ($W.options.context === 'webrtc') {
			var video = document.getElementsByTagName('video')[0]; 
			var startrow = $W.sample_start_row//parseInt($W.options.height/2)
			// Grab the existing canvas:
			var saved = $W.excerptCanvas(0,0,$W.width,$W.height,$W.ctx).getImageData(0,0,$W.width,$W.height)
			// check for flipped spectrum every 10th frame... hmmm
			if ($W.detect_flip && ($W.frame/10 - parseInt($W.frame/10) == 0)) $W.autodetect_flipness()
			$W.ctx.save()
			if ($W.mobile) {
				// mobile will never need to flip, can't be installed "upside down"
				//$W.ctx.save()
				//$W.ctx.scale($('#canvas').width()/$('video').height(),1)
				$W.ctx.scale(3,1)
				$W.ctx.translate($('video').height()/2,0)
				$W.ctx.rotate(Math.PI/2)
				$W.ctx.drawImage(video, -startrow/4, -$W.height/2);
				//$W.ctx.drawImage(video, 0,0)
				//$W.ctx.restore()
			} else {
				if ($W.flipped) {
					$W.ctx.translate($W.width,0)
					$W.ctx.scale(-1,1)
				}
				$W.ctx.drawImage(video, 0, -startrow);
			}
			$W.ctx.restore()
			// Draw old data below new row of data:
			$W.ctx.putImageData(saved,0,1)
		} else if($W.options.context === 'flash'){
			window.webcam.capture();
		} else {
			console.log('No context was supplied to getSnapshot()');
		}
		img = $W.ctx.getImageData(0,0,$W.canvas.width,$W.sample_height)
		if ($W.mode == "average") {
			$W.data[0] = {label: "webcam",data:[]}
		} else if ($W.mode == "rgb") {
			$W.data[0] = {label: "r",data:[]}
			$W.data[1] = {label: "g",data:[]}
			$W.data[2] = {label: "b",data:[]}
		}

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
		$('#dataurl').val($W.canvas.toDataURL())
		$('#geotag').val($('#geotag-toggle')[0].checked)
		setTimeout(function() { if ($('#geotag-toggle')[0].checked) $W.geolocate() },500)
	},
	cancelSave: function() {
		$('#geotag').val('false')
		$('#lon').val('')
		$('#lat').val('')
	},

	calibrate: function(id,x1,w1,x2,w2) {
		$.ajax({
			url: "/spectra/calibrate/"+$W.spectrum_id+"?x1="+x1+"&w1="+w1+"&x2="+x2+"&w2="+w2,
			type: "POST",
			success: function(result) {
				$W.notify('The spectrum with id '+id+' was calibrated successfully.')
			}
		})
	},

	match: function() {
		cols = []
		$.each($W.full_data,function(i,datum) {
			cols.push(i+":"+datum[3])
		})
		$("#match").html("<p><img src='/images/spinner-green.gif' /></p>");
		$.ajax({
			url: "/sets/find_match/"+$W.set+"?calibration="+$W.calibration_id,
			type: "POST",
			data: {data: cols.join(',')},
			//context: document.body
			success: function(result) {
				$("#match").html("<p>"+result+"</p>");
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

	toggle_flip: function() {
		$W.detect_flip = !$W.detect_flip
	},
	// Changes $W.flipped based on detecting where the red end of the spectrum is
	autodetect_flipness: function() {
		if (!$W.mobile) $W.flipped = !$W.is_data_ascending_in_nm()
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
				var spectrum = JSON.parse(result.spectrum.data) // probably need to convert from JSON
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

	overexposure_threshold: 20, // how many pixels of consecutive 100% triggers an overexposure warning
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
			if (data[i][({r:0,g:1,b:2})[color]] >= 255) {
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
		var oe = $W.detect_overexposure()
		if (oe.r || oe.g || oe.b) {
			var msg = "Light source is too strong; overexposure in channels: "
			var channels = []
			if (oe.r) channels.push("red")
			if (oe.g) channels.push("green")
			if (oe.b) channels.push("blue")
			$W.notify(msg+channels.join(','),"warning")
		} 
	},

	//setTimeout($W.alert_overexposure,3000)
	notify: function(msg,type,expire) {
		expire = expire || true
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
                source = source || $C
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
