// window.webcam.getCameraList()

var $W

$W = {
	data: null,
	pos: 0,
	initialize: function() {
		getUserMedia(this.options, this.success, this.deviceError)
		window.webcam = this.options
		this.canvas = document.getElementById("canvas")
		$('canvas').width = "640px"
		this.ctx = this.canvas.getContext("2d")
		this.image = this.ctx.getImageData(0, 0, this.options.width, this.options.height);
	},
        success: function (stream) {
		console.log('success')
                if ($W.options.context === 'webrtc') {
			console.log('webrtc')
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

            "audio": false,
            "video": true,

            // the element (by id) you wish to apply
            el: "webcam",

            extern: null,
            append: true,

            // height and width of the output stream
            // container

            width: 640,
            height: 480,
            //width: 1280,
            //height: 720,

            // the recommended mode to be used is 'callback '
            // where a callback is executed once data
            // is available
            mode: "callback",

            // the flash fallback Url
            swffile: "/javascripts/webcam-fallback/jscam_canvas_only.swf",

            // quality of the fallback stream
            quality: 85,
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
		
		var sample_height = 10 // how many pixels to sample
		if ($W.pos >= 4 * w * sample_height) { 
			console.log('putting image')
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
			var startrow = parseInt($W.options.height/2)
			$W.ctx.drawImage(video, 0, -startrow);
		} else if($W.options.context === 'flash'){
			window.webcam.capture();
		} else {
			console.log('No context was supplied to getSnapshot()');
		}
		//img = $W.image
		var sample_height = 30 // how many pixels to sample
		img = $W.ctx.getImageData(0,0,$W.canvas.width,sample_height)
		$W.data = [{label: "webcam",data:[]}]
		$W.full_data = []
		var data = ''
		for (var col = 0; col < $W.canvas.width; col++) {
			var red = 0
			for (row=0;row<sample_height;row++) {
				 red += img.data[((row*(img.width*4)) + (col*4)) + 0]
			}
			red /= sample_height
			var green = 0
			for (row=0;row<sample_height;row++) {
				 green += img.data[((row*(img.width*4)) + (col*4)) + 1]
			}
			green /= sample_height
			var blue = 0
			for (row=0;row<sample_height;row++) {
				 blue += img.data[((row*(img.width*4)) + (col*4)) + 2]
			}
			blue /= sample_height
			var intensity = (red+blue+green)/3
			data += red+','+green+','+blue+','+intensity
			if (col != $W.width-1) data += '/'
			$W.full_data.push([red,green,blue,intensity])
			$W.data[0].data.push([col,intensity/2.55])
		}
		plot = $.plot($("#graph"),$W.data,flotoptions);
	},
	saveSpectrum: function() {
		$('#dataurl').val($W.canvas.toDataURL())
		$('#save').show()
		$('#capture').hide()
	}
}
