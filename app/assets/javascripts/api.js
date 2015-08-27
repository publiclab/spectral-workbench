jQuery(document).ready(function() {

/* create a modal dialog; buttons defined as a 
 * nested array of buttn names and code to be run: 
 *   [["Save",function(){}],["Cancel",$('.modal').hide()]]
 */
$W.dialog = function(title,body,options) {

  html = '<div class="modal"><div class="modal-header"><b>'+title
  html += '</b></div><div class="modal-body"><p>'+body
  html += '</p></div><div class="modal-footer">'

  $.each(options,function(i,btn) {
    html += '<a class="btn'
    // last option is highlighted
    if (i == options.length-1) {
      html += ' btn-primary'
    }
    html += '" onClick="'+btn[1]+'">'+btn[0]+'</a>'
  })

  html += '</div></div>'
  $('body').append(html)
}


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

// an abstract measure of a spectrum's local contrast, sampling every <res> pixels, and only counting measured slope >1; used as a metric to determine if it's likely to be a CFL. Needs testing against lots of spectra & CFLs
$W.contrast = function(res) {
  var sum = 0
  res = res || 10
  for (var i=res; i<$W.data[0].data.length; i+=res) {
    // added /res to make it about slope
    slope = Math.abs(parseInt($W.data[0].data[i-res][1])-parseInt($W.data[0].data[i][1]))/res
    // only add it if slope is greater than 1
    if (slope > 1) sum += slope
  }
  return (sum/($W.data[0].data.length))
}

// watch and alert if contrast is high enough to likely be a CFL
$W.observe_contrast = function(threshold,istrue,isfalse) {
  threshold = threshold || 0.04
  setInterval(function() {
    if ($W.contrast() > threshold) {
      istrue()
    } else {
      isfalse()
    }
  },500)
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

// Static macros storage
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
  },

  /* 
     Attempts to determine if the spectrum is of a CFL by checking if the 
     array <peaks> i.e. [1,1.4,1.68,1.45] is within <threshold> of array <reference>
  */
  is_cfl: {
    author: "warren",
    type: "analyze",
    link: "none",
    setup: function(threshold,reference) {
      threshold = threshold || 0.1 // 10%
      ratios = $W.macros.get_peak_pattern.setup()
      reference = reference || [1, 1.7692307692307692, 1.6923076923076923, 1.3846153846153846]
      var is_cfl = true
      for (i = 0; i < reference.length; i++) {
        if (Math.abs(1-ratios[i]/reference[i]) > threshold) is_cfl = false
      }
      // try looking for a CFL which is missing its first blue line
      var is_offset_cfl = true
      for (i = 0; i < reference.length-1; i++) {
        if (Math.abs(1-ratios[i]/reference[i+1]) > threshold) is_offset_cfl = false
      }
      // have to try backwards order too!

      return is_cfl || is_offset_cfl
    }
  },

  /* returns ratios of distance between peaks, starting with first gap = 1; beware of assuming linearity 
     Also be aware that order may be reversed
  */
  get_peak_pattern: {
    author: "warren",
    type: "analyze",
    link: "none",
    /* <search_dist> max width of peaks to search for, <wavelengths> whether to return only wavelengths */
    setup: function(min_width,min_height,min_slope,threshold,pixels,wavelengths) {
      peaks = $W.macros.detect_peaks.setup(min_width,min_height,min_slope,threshold,pixels,wavelengths) 
      var ratios = []
      var base = peaks[1]['index']-peaks[0]['index']
      for (var i = 0; i < peaks.length-1; i++) {
        ratios.push((peaks[i+1]['index']-peaks[i]['index'])/base)
      }
      return ratios
    }
  },

  /* 
    improved version of detect_peaks which iterates from the top down (tallest peaks first)
      instead of left to right, and can stop at a named # of peaks if needed
    <min> width of peaks to search for, <wavelengths> whether to return only wavelengths
    returns results to an arbitrary 2 decimal points
    an alternative might be to search for peaks based not on continuousness of slope (as here) but by *angle* of slope -- only 'sharp' peaks
  */
  detect_peaks: {
    author: "warren",
    type: "analyze",
    link: "https://gist.github.com/jywarren/6020668",
    setup: function(min_width,min_height,min_slope,threshold,pixels,wavelengths) {
      min_width = min_width || 7 // min peak width to search for
      min_height = min_height || 20 // min peak width to search for
      min_slope = 3 // minimum peak slope to search for, where 1 = 45 deg
      threshold = threshold || min_width // ignore peaks within <threshold> distance of each other
      pixels = pixels || $W.spectrum.lines
      wavelengths = wavelengths || false // return only an array of wavelengths

      var peaks = []
      var peak_wavelengths = []

      // recursively checks if slope is of consistent direction on each side of a given peak, recursing outwards until max/2
      // swap comparisons if you want to search for valleys instead of peaks
      var check_slope = function(dist,i) {
        if (dist > min_width/2) return true
        else if (i+dist >= pixels.length || i-dist <= 0) return false // if we hit the beginning or end of the image
        else return (check_slope(dist+1,i)) && pixels[i+dist]['average'] <= pixels[i]['average'] && pixels[i-dist]['average'] <= pixels[i]['average']
      }

      // checks if the peak is within <threshold> pixels of a known peak
      var is_near_existing_peak = function(target_peak) {
        var is_near = false
        $.each(peaks,function(i,peak) {
          if (Math.abs(peak['index']-target_peak) < threshold) is_near = true
        })
        return is_near
      }

      // scan entire graph for highest values, starting at top and scanning downwards
      // This is an opportunity to limit search to n total peaks
      // Also, due to a dumb rounding bug, average values can exceed 255; up to 257 i believe 
      for (var height = 259; height >= 0; height--) {
        for (var i = parseInt(min_width/2); i < pixels.length-parseInt(min_width/2); i++) {
          if (pixels[i]['average'] >= height && pixels[i]['average'] < height+1 && !is_near_existing_peak(i)) { 
            // determine how large a peak is and adds it to peaks array if it's wider than <min_width> and taller than <min_height>
            if (check_slope(1,i) && (i+min_width < pixels.length && i-min_width > 0) && Math.abs(pixels[i]['average']-pixels[i+min_width]['average'])/min_width >= min_slope && Math.abs(pixels[i]['average']-pixels[i-min_width]['average'])/min_width >= min_slope && pixels[i]['average']-pixels[i-min_width]['average'] > min_height && pixels[i]['average']-pixels[i+min_width]['average'] > min_height) { 
              // it's a peak pixel, add it to peak pixel list
              peaks.push(pixels[i]) // here, adding the entire pixel object, including separate rgb and wavelength values
              peaks[peaks.length-1]['index'] = i // save the pixel index too
              // be aware of non-calibrated spectra
              peak_wavelengths.push(parseFloat(pixels[i]['wavelength'].toFixed(2))) // here, adding just the rounded wavelength
              $W.plot.highlight(0,i) // highlight the peak on the graph
            } 
          }
        }
      }

      // sort left to right

      peaks = peaks.sort(function(a,b) { return a['index'] - b['index'] })      
      peak_wavelengths = peak_wavelengths.sort(function(a,b) { return a - b })      
 
      if (wavelengths) return peak_wavelengths
      else return peaks
    }
  }
}
})
