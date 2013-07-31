$W.calibrate = function(id,x1,w1,x2,w2) {
	if ($W.interface == "analyze") {
		window.location = "/spectra/calibrate/"+$W.spectrum_id+"?x1="+x1+"&w1="+w1+"&x2="+x2+"&w2="+w2
	} else {
		$.ajax({
			url: "/spectra/calibrate/"+$W.spectrum_id+"?x1="+x1+"&w1="+w1+"&x2="+x2+"&w2="+w2,
			type: "GET",
			success: function(result) {
				$W.notify('The spectrum with id '+id+' was calibrated successfully.')
			}
		})
	}
}

// Analyze only (depends on HTML elements):
$W.toggle_like = function(id) {
	$('#likebtn').addClass("disabled")
	$.ajax({
			url: "/likes/toggle/"+id,
			type: "GET",
			success: function(result) {
				if (result == "unliked") {
					$W.notify('You unliked this spectrum.')
					$('#likeaction').html("Like")
					$('#likebtn').removeClass("disabled")
					$('#liked').html(parseInt($('#liked').html())-1)

				} else {
					$W.notify('You liked this spectrum.')
					$('#likeaction').html("Unlike")
					$('#likebtn').removeClass("disabled")
					$('#liked').html(parseInt($('#liked').html())+1)
				}
			}
		})
}

$W.run_macro = function(author,macro) {
  $('body').append("<script type='text/javascript' src='/macro/"+author+"/"+macro+".js?run=true'></script>")
  $('#macrosmodal').modal('hide')
  $('a').popover('hide')
}

// These are not really useful anymore:

// Needs rewriting for multiple macros:
$W.load_macro = function(macro) {
    //eval("$W.macro = {"+$('#code').val()+"}")
    $W.macro = macro
    $W.macro.setup()
}
$W.macros = {
  download_image: {
    author: "warren",
    type: "capture", // or "analyze"
    link: "http://unterbahn.com",
    // code to run on startup
    setup: function() {
      window.open($W.canvas.toDataURL(),'_newtab').focus() // this may not work if popups are blocked
    },
    // code to run every frame
    draw: function() {
    }
  }
}

