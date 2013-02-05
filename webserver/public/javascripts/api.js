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

$W.like = function(id) {
	$.ajax({
			url: "/likes/create/"+id,
			type: "GET",
			success: function(result) {
				$W.notify('You liked this spectrum.')
			}
		})
}
