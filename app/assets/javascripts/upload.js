var $W = {};

(function(){

  $(".nav-upload-types a").click(function() {

    $('#spectrum_upload_type').val($(this).attr('data-upload-type'));

  });

  if (navigator.geolocation) {
    $('#geotagInput').show();
  }

  var setGeolocation = function(loc) {

    if (loc.coords) {

      $('#lat').val(loc.coords.latitude)
      $('#lon').val(loc.coords.longitude)

    } else {

      $('#lat').val(loc.latitude)
      $('#lon').val(loc.longitude)

    }

    $('#geotag').val($('#geotagInput').is(":checked"))

    $('#upload').submit()

  }

  var error = function() {

    if (confirm('There was an error with geocoding; upload proceeding without ')) {

      $('#upload').submit()

    } else {

      $('#uploadBtn').button('default').html('Upload');
      $('#uploadUncalibrated').button('default').html('Upload &amp; calibrate later');
      $('#geotagInput').prop('checked',false);

    }

  }

  var geotag_or_submit = function() {

    if (navigator.geolocation && $('#geotagInput').is(':checked')) {

      navigator.geolocation.getCurrentPosition(
        setGeolocation,
        error
      );

    } else {

      $('#upload').submit();

    } 

  } 

  $W.save = function(calibration) {

    if (!calibration) {

      $("#calibration_id").val("calibration"); // calibrate later
      $('#uploadUncalibrated').button('loading');
      $('#uploadUncalibrated').prepend('<i class="fa fa-circle-o-notch fa-spin"></i> ')

    } else {

      $('#uploadBtn').button('loading');

    }

    if ($('#inputTitle').val() == '') {

      $('#title').addClass('error');
      $('#title .help-inline').html('You must enter a title, using only letters, numbers, and spaces.');

    } else {

      if ($('#spectrum_upload_type').val() == "json") {
 
        geotag_or_submit();
 
      } else if ($('#spectrum_upload_type').val() == "csv") {
 
        // SWB.js will convert CSV to JSON:
        var spectrum = new SpectralWorkbench.Spectrum($('.spectrum-csv').val());
 
        $('.spectrum-json').val(JSON.stringify(spectrum.encodeJSON()));
 
        geotag_or_submit();
 
      } else {
 
        if ($('#inputPhoto').val() == '') {
 
          $('#photo').addClass('error');
          $('#photo .help-inline').html('You must select an image.');

        } else {

          geotag_or_submit();

        }
 
      }

    } 

  }

})()
