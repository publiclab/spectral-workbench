/*
-> This is a temp file generated due to issue #665 that stops the capture graph on safari with the default stepper styles.
-> Once #665 is resolved, we can look towards refactoring the view file to look like: 
    https://github.com/publiclab/spectral-workbench/blob/daa5b6a74cd77ce05066d41a45160d7a332f665c/app/views/capture/index2.html.erb#L51-L54
    https://github.com/publiclab/spectral-workbench/blob/daa5b6a74cd77ce05066d41a45160d7a332f665c/app/views/capture/index2.html.erb#L82
    https://github.com/publiclab/spectral-workbench/blob/daa5b6a74cd77ce05066d41a45160d7a332f665c/app/views/capture/index2.html.erb#L149
*/
function homePage() {
  if ($("#landing-page-content").hide()) {
      $('html').css('background', '#ffffff');
      $("#landing-page-content").show();

      $("div#capture-page-content").hide();
      $("div#capture-settings").hide();
      $("div#save-page").hide();
  }
}

function settingsPage() {
  $('html').css('background', '#272727');

  $("#heightIndicator").removeClass("capture-settings-hide");
  $("#heightIndicator").show();
  $("#webcam").css('pointer-events', '');
  $("#webcam").css('opacity', '1');

  $("#webcam-msg").css('pointer-events', '');
  $("#webcam-msg").css('opacity', '1');

  $("#capture-page-content").css('height','100vh');
  $("#capture-page-content").css('width','auto');

  if (($(window).width() < 391 && $(window).height() < 645) || ((window.matchMedia("(orientation: landscape)").matches) && ($(window).height() < 645)))
  $("#capture-page-content").css('height','auto');

  $("#spectrum-ex").show();
  $("#capture-option").show();

  $("#landing-page-content").hide();
  $("div#capture-page-content").show();
  $("div#capture-settings").hide();

  $("div#save-page").hide();

  window.onbeforeunload = function() { return ""; };
}


function capturePage() {
  $("html, .full-strecth-block").css('background', '#272727');
  $("#landing-page-content").hide();
  $("#capture-option").addClass("capture-settings-hide");
  $("#heightIndicator").addClass("capture-settings-hide");

  $("div#capture-page-content").show();
  $("div#capture-settings").show();

  $("#spectrum-ex").hide();
  $(".capture-settings-hide").hide();

  $("#capture-page-content").width(1).height(1);
  $("#webcam").css('pointer-events', 'none');
  $("#webcam").css('opacity', '0.0');

  $("#webcam-msg").css('pointer-events', 'none');
  $("#webcam-msg").css('opacity', '0.0');

  $("div#save-page").hide();
  window.onbeforeunload = function() { return ""; };
}

function savePage() {
  $("html, .full-strecth-block").css('background', '#272727');
  $W.saveSpectrum();
  $("#landing-page-content").hide();
  $("div#capture-page-content").hide();
  $("div#capture-settings").hide();
  $("div#save-page").show();

  window.onbeforeunload = function() { return ""; };
}


$(document).ready(function () {
  $('html').css('background', '#ffffff');

  $("div#capture-page-content").hide();
  $("div#capture-settings").hide();
  $("div#save-page").hide();

  $('#testnav .btn-group button').on('click', function () {
      $('#testnav .btn-group' ).find('button.active').removeClass('active');
      $(this).addClass('active');
  });

  $("button#landing-page-next").on('click', function () {
  $('#settingsbtn').trigger('click');
  });

  $("button#setting-page-next").on('click', function () {
  $('#capturebtn').trigger('click');
  });

  $("button#capture-page-next").on('click', function () {
  $('#savebtn').trigger('click');
  })

  var stepper = new Stepper($('.bs-stepper')[0], {
  linear: false,
  animation: true,
  selectors: {
      steps: '.step',
      trigger: '.step-trigger',
      stepper: '.bs-stepper'
  }
  });

  $("#homebtn").on('click', function (params) {
  stepper.to(1);
  });
  $("#landing-page-next").on('click', function (params) {
  stepper.to(2);
  });
  
  $("#settingsbtn").on('click', function (params) {
  stepper.to(2);
  });
  $("#setting-page-next").on('click', function (params) {
  stepper.to(3);
  });

  $("#capturebtn").on('click', function (params) {
  stepper.to(3);
  });  
})
