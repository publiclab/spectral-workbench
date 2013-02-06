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
