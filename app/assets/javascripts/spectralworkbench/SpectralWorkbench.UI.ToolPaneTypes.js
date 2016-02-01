// move these somewhere that makes sense, like into the API
// they are not the tag operators themselves, nor the tags, but the *tool panes*
// -- rename them as such!
/*

You may use local variable form, with properties:

    form.el
    form.titleEl
    form.authorEl
    form.linkEl
    form.descriptionEl

    form.applyEl
    form.closeEl

    form.close()
    form.cleanUp()

    // for CustomPane:
    form.customFormEl

    // for SpectraPane:
    form.formEl
    form.searchEl
    form.spectrumApplyEl
    form.authorSelectEl

    // for StepsPane (not yet implemented):
    form.steps
    form.currentStep

*/

SpectralWorkbench.UI.ToolPaneTypes = {

 
  subtraction: {

    title: "Subtraction",
    dataType: "spectrum",
    description: "Subtract another calibrated spectrum from this one.",
    link: "//publiclab.org/wiki/spectral-workbench-operations#subtract",
    author: "warren",
    apply: false,
    formData: { own: true },
    url: '/spectrums/choose/calibrat*', // default spectra to show, can use * and ?author=warren
    onSpectrumApply: function(form, _graph) {

      // provide better API for own-id:
      _graph.dim();
      _graph.datum.addTag('subtract:' + $(this).attr('data-id'), function() {

        _graph.reload_and_refresh();

      });

    }

  },


  copyCalibration: {

    title: "Copy Calibration",
    dataType: "spectrum",
    description: "Use data from an earlier calibrated spectrum to calibrate this one.",
    link: "//publiclab.org/wiki/spectral-workbench-operations#calibrate",
    author: "warren",
    apply: false,
    formData: { own: true },
    url: '/spectrums/choose/calibration', // default spectra to show, can use * and ?author=warren
    onSpectrumApply: function(form, _graph) {

      // provide better API for own-id:
      var id = $(this).attr('data-id');

      if ($(this).attr('data-snapshot')) id = id + "#" + $(this).attr('data-snapshot');

      _graph.dim();
      _graph.datum.addTag('calibrate:' + id, function() {

        _graph.reload_and_refresh();
        _graph.UI.notify('Spectrum calibration copied from <a href="/spectrums/' + id + '">Spectrum ' + id + '</a>');

      });

    }

  },


  transform: {

    title: "Transform",
    dataType: "any",
    description: "Apply a JavaScript math expression (such as 'R*G+B') to each point in the spectrum, using variables R for red, G, B, and A for average..",
    link: "//publiclab.org/wiki/spectral-workbench-operations#transform",
    author: "warren",
    apply: true,
    setup: function(form) {

      form.formEl.hide();
      $(form.el).find('.results').html('');
      // create custom form
      form.customFormEl.html("<p>Enter an expression to apply to the spectrum:</p><form class='expression'><input type='text'></input></form><p><a href='//publiclab.org/wiki/spectral-workbench-tools#Transform'>Read about transforms &raquo;</a>");

      form.el.find('.expression').on('submit', function(e) {

        e.preventDefault();
        form.graph.datum.addTag('transform:'+form.el.find('.expression input').val());
        form.formEl.show();

      });

      form.el.find('.expression input').focus();

    },
    onApply: function(form, callback) {

      form.formEl.show();

      form.graph.dim();
      form.graph.datum.addTag('transform:'+form.el.find('.expression input').val(), function() {

        form.graph.reload_and_refresh();
        if (callback) callback();

      });

    }

  },


  range: {

    title: "Range",
    dataType: "any",
    description: "Select a wavelength range; subsequent operations will only use this range.",
    link: "//publiclab.org/wiki/spectral-workbench-operations#range",
    author: "warren",
    apply: true,
    setup: function(form) {

      form.formEl.hide();
      $(form.el).find('.results').html('');
      // create custom form
      var inputs = "<p>Enter a start wavelength:</p>"
      inputs    += "<input type='text' class='start' value='400' />"
      inputs    += "<p>Enter an end wavelength:</p>"
      inputs    += "<input type='text' class='end' value='800' />"
      form.customFormEl.html(inputs);
      form.el.find('.start').focus();

    },
    onApply: function(form) {

      var start = +form.el.find('.start').val(),
          end   = +form.el.find('.end').val();

      if (start > end) {
        var tmp = end;
        end = start;
        start = tmp;
      }

      form.formEl.show();
      
      form.graph.dim();
      form.graph.datum.addTag('range:'+ start + '-' + end, function() {

        form.graph.reload_and_refresh();

      });

    }
  },


  smooth: {

    title: "Smoothing",
    dataType: "any",
    description: "Enter a number of points ahead and behind of a given point to average, in order to smooth the graph. Note that this is <b>not</b> time-averaging, and can suppress small spectral features.",
    link: "//publiclab.org/wiki/spectral-workbench-operations#smooth",
    apply: true,
    author: "warren",
    setup: function(form) {

      form.formEl.hide();
      $(form.el).find('.results').html('');
      form.customFormEl.html("<p>Enter a distance in points to average ahead and behind:</p><input class='distance' type='text' value='3' />");

      form.el.find('.distance').keypress(function(e) {

        if (e.which == 13) {

          e.preventDefault();
          form.applyEl.focus(); // this isn't doing anything :-(
          form.applyEl.trigger('click');

        }

      });

    },
    onApply: function(form) {

      form.applyEl.html('<i class="fa fa-spinner fa-spin fa-white"></i>'); // this isn't doing anything :-(

      form.graph.dim();
      form.graph.datum.addTag('smooth:' + form.el.find('.distance').val(), function() {

        form.graph.reload_and_refresh();

      });

    }

  },


  // test this in jasmine!!!
  crossSection: {

    title: "Choose cross section",
    dataType: "spectrum",
    description: "Click the image to choose which row of pixels from the source image is used to generate your graph line. The default is 0, which is the line used if no crossSection operation is visible.",
    link: "//publiclab.org/wiki/spectral-workbench-operations#crossSection",
    apply: true,
    author: "warren",
    setup: function(form) {

      // shouldnt be necessary in new API, but double check:
      form.formEl.hide();
      form.el.find('.results').html('');

      form.customFormEl.html("<p>Click the spectrum image or enter a row number:</p><input class='cross-section' type='text' value='0' />");

      form.graph.image.click(function(x, y, e) {

        form.el.find('.cross-section').val(y);

        form.graph.image.setLine(y);

      });

      // restore the existing sample row indicator
      // test this in jasmine!!!
      form.closeEl.click(function() { form.graph.image.setLine(form.graph.args.sample_row) });

      form.customFormEl.find('input').on('change', function() {

        form.graph.image.setLine(form.customFormEl.find('input').val());

      });

    },
    onApply: function(form) {

      form.graph.dim();
      form.graph.datum.addTag('crossSection:' + $('.cross-section').val(), function() {

        form.graph.datum.load();
        form.graph.reload_and_refresh();

      });

    }

  },


  /*

  To do:

  * spectrum reversal mgmnt
  * debug actual calibration to be sure
  * account for page resizing

  */
  calibrate2: {

    title: "Wavelength calibration",
    dataType: "spectrum",
    description: "Follow the prompts to wavelength calibrate a fluorescent spectrum. Align B2 and G2 with their corresponding peaks in your calibration. It's best to calibrate before any other operations, especially before range limiting. Before calibrating, the horizontal axis lists the pixel position along the spectrum. After you calibrate and save, the B2 and G2 lines should appear at ~435 and ~546 nanometers, respectively, if you're aligned well with the reference spectrum.",
    link: "//publiclab.org/wiki/spectral-workbench-calibration",
    author: "warren",
    apply: true,
    cleanUp: function(form) {

      $('.calibration-pane').remove();

      form.graph.imgEl.height(100); // return it to full height
      form.graph.imgContainer.height(100);

    },
    setup: function(form) {

      var blue2 = 435.83,           // in nanometers
          green2 = 546.07,          // "
          left2blue = 211,          // in example image pixels
          right2green = 1390 - 743, // "
          blue2green = 743-211,     // "
          exampleImgWidth = 1390;   // "

      if (form.graph.datum.getPowerTag('linearCalibration').length > 0) {

        $('.datum-tool-pane .description').append("<span style='color:#900'>You have already calibrated this spectrum. We recommend clearing your previous calibration before re-calibrating.</span>");

      }

      form.graph.imgContainer.height(180); // we should move away from hard-coded height, but couldn't make the below work:
      //form.graph.imgContainer.height(_graph.imgContainer.height() + 80);

      // Using reference image from 
      // http://publiclab.org/notes/warren/09-30-2015/new-wavelength-calibration-procedure-preview-for-spectral-workbench-2-0
      // I read the blue ~436 peak at 211px from left, 
      // and the green ~546 peak at 742px from left

      var pane = "";

      pane += "<p class='prompt form-inline' style='padding-bottom:30px;'>";
      pane +=   "<b>Calibrate:</b> ";
      pane +=   "<span class='hidden-phone'>Adjust sliders &amp; align the reference spectrum to yours.</span> ";
      pane +=   "<a href='//publiclab.org/wiki/spectral-workbench-calibration'>Learn more &raquo;</a> ";
      pane +=   "<span class='calibration-form pull-right'> ";
      pane +=     "<input id='checkbox-snap' type='checkbox' class='checkbox-snap' checked='true' /> <label tooltip='Snap to nearest peak' for='checkbox-snap'>Snap</label> ";
      pane +=     "<input type='text' class='input-wavelength-1 input-mini' /> ";
      pane +=     "<input type='text' class='input-wavelength-2 input-mini' /> ";
      pane +=     "<a class='btn btn-auto-calibrate'>Auto-calibrate</a> ";
      pane +=     "<a class='btn btn-primary btn-save-calibrate-2'>Save</a>";
      pane +=   "</span>";
      pane += "</p>";
      pane += "<div class='fit-container'><div class='fit pull-right label label-success' style='margin-top:-23px'></div></div>"; // to show how good the fit is
      pane += "<div class='reference'>";
      pane +=   "<span class='btn btn-mini disabled slider slider-1' style='background:#00f;color:white;text-shadow: 0 -1px 0 rgba(0, 0, 0, 0.25);'>B2<div class='slider-marker' style='width: 1px; border-left-width: 1px; border-left-style: solid; border-left-color: red; height: 235px; position: absolute; margin-left: 3px;'></div></span>";
      pane +=   "<span class='btn btn-mini disabled slider slider-2' style='background:#0a0;color:white;text-shadow: 0 -1px 0 rgba(0, 0, 0, 0.25);'>G2<div class='slider-marker' style='width: 1px; border-left-width: 1px; border-left-style: solid; border-left-color: red; height: 235px; position: absolute; margin-left: 3px;'></div></span>";
      pane += "</div>";
      pane += "<div class='example' style='background:black;overflow:hidden;height:20px;'><img style='max-width:none;display:block;height:20px;' src='/images/snowsky-corrected.jpg' />";
      pane += " <p style='color: rgba(255, 255, 255, 0.701961); text-align: right; margin-top: -19px; font-size: 10px; padding: 1px 4px;'>REFERENCE</p>";
      pane += "</div>";

      $('.spectrum-img-container').prepend('<div class="calibration-pane"></div>');
      $('.calibration-pane').html(pane);

      $('.calibration-pane .slider').css('margin-top', -24);
      $('.slider').css('position', 'absolute');

      // use autocalibration for first pass, 
      // or, for now, existing calibration:
      var _graph = form.graph,
          extent = form.graph.extent,
          error;

      var attemptCalibration = function() {

        var widthAsCalibrated = _graph.datum.json.data.lines.length; // sometimes calibration was run on a lower-res image; we are transitioning away from this
            auto_cal = SpectralWorkbench.API.Core.attemptCalibration(_graph), // [r,g,b] in terms of width of json stored image data
            // convert to display space from image space:
            blue2guess  = _graph.imgContainer.width() * (auto_cal[2] / widthAsCalibrated),
            green2guess = _graph.imgContainer.width() * (auto_cal[1] / widthAsCalibrated);

        calibrationResize(blue2guess, green2guess);

      }

      /*

        Mostly, we get pixel x,y data, and move the sliders and image accordingly,
          then generate wavelengths for the inputs. 

        Sometimes, we get wavelength inputs, find the pixel locations, and move the 
          sliders and image accordingly, then display the wavelengths in the inputs. 

        We should store the wavelength extents of the graph just once 
         (although we could change this on resize) - in the Graph object. 

      */

      // x1 and x2 are display space pixel values;
      // x1Lock and x2Lock are optional, default-off, for locking a slider you're not dragging
      var calibrationResize = function(x1, x2, x1Lock, x2Lock) {

        x1Lock = x1Lock || false;
        x2Lock = x2Lock || false;

        // calculate their wavelength values 
        // (fallback to data-space pixels, if uncalibrated)
        var w1 = _graph.displayPxToNm(x1),
            w2 = _graph.displayPxToNm(x2);

        // snap to nearest
        if ($('.calibration-pane input.checkbox-snap').prop('checked')) {

          // snap to nearest peak if not locked:
          if (!x1Lock) w1 = _graph.datum.getNearbyPeak(w1, 10);
          if (!x2Lock) w2 = _graph.datum.getNearbyPeak(w2, 10);

          // may return data-space pixel values instead of wavelengths, if not calibrated:
          x1 = _graph.nmToDisplayPx(w1);
          x2 = _graph.nmToDisplayPx(w2);

        }

        // distance between blue2 and green2 in example spectrum image as displayed:
        var exampleImgBlue2Green = parseInt(Math.abs(x2 - x1) / (blue2green / exampleImgWidth)); // in display pixels

        if (x1 <= x2) {

          var leftPad = (-parseInt((left2blue / exampleImgWidth) * exampleImgBlue2Green) + x1); // in display pixels
          $('.calibration-pane .example img').removeClass('flipped');

        } else {

          // the image must be flipped as the spectrum is backwards
          var leftPad = (-parseInt((right2green / exampleImgWidth) * exampleImgBlue2Green) + x2); // in display pixels
          $('.calibration-pane .example img').addClass('flipped');

        }

        $('.calibration-pane .example img').css('margin-left', leftPad);
        $('.calibration-pane .example img').css('width', exampleImgBlue2Green);

        $('.slider-1').css('left', parseInt(x1) + _graph.margin.left - 10);
        $('.slider-2').css('left', parseInt(x2) + _graph.margin.left - 10);

        $('.slider-1').attr('data-pos', x1); 
        $('.slider-2').attr('data-pos', x2);

        // compatibility with legacy systems where data extraction from image to json is not always 1:1
        var jsonPxPerImgPx = _graph.datum.json.data.lines.length/_graph.image.width;

        // get source image pixel location, round to 2 decimal places:
        ix1 = Math.round(_graph.displayPxToImagePx(x1) * jsonPxPerImgPx * 100) / 100;
        ix2 = Math.round(_graph.displayPxToImagePx(x2) * jsonPxPerImgPx * 100) / 100;

        error = parseInt(SpectralWorkbench.API.Core.rmseCalibration(_graph.datum, blue2, green2, ix1, ix2));

        $('.calibration-pane .fit').html('Fit: ' + error)
                                   .removeClass('label-success')    // green
                                   .removeClass('label-warning')    // yellow
                                   .removeClass('label-important'); //red

        // color fitness indicator: 1 = green, 3 = yellow, worse = red
        if      (Math.abs(error) < 12) $('.calibration-pane .fit').addClass('label-success');
        else if (Math.abs(error) < 16) $('.calibration-pane .fit').addClass('label-warning');
        else                           $('.calibration-pane .fit').addClass('label-important');

        $('.input-wavelength-1').val(ix1);
        $('.input-wavelength-2').val(ix2);

      }

      $('.btn-auto-calibrate').click(function() {

        attemptCalibration();

      });

      var saveCalibration = function() {

        $('.btn-save-calibrate-2').html('<i class="fa fa-spinner fa-white fa-spin"></i>');

        if (_graph.datum.getTag('calibration') == false) _graph.datum.addTag('calibration');

        // clear the previous assessement tags
        _graph.datum.getPowerTag('error', function(tag) { tag.destroy() });
        _graph.datum.getPowerTag('calibrationQuality', function(tag) { tag.destroy() });
        _graph.datum.getPowerTag('linearCalibration', function(tag) { tag.destroy() });

        _graph.dim();
        _graph.datum.addTag('linearCalibration:' + 
          $('.input-wavelength-1').val() + '-' + 
          $('.input-wavelength-2').val(),
          function() {

            _graph.datum.load();
            _graph.reload_and_refresh();

            _graph.UI.notify("Your new calibration has been saved.", "success");

            // save the calculated error (from the rmse)
            _graph.datum.addTag('error:' + error);
  
            if      (Math.abs(error) < 12) _graph.datum.addTag('calibrationQuality:good');
            else if (Math.abs(error) < 16) _graph.datum.addTag('calibrationQuality:medium');
            else                           _graph.datum.addTag('calibrationQuality:poor');
  
            form.close();
            $('.calibration-pane').remove();
       
        });

      }

      form.applyEl.click(saveCalibration);
      $('.btn-save-calibrate-2').click(saveCalibration);

      // if these are outside the currently
      // displayed range, limit them:
      var limitRange = function(x) {

        if (x > _graph.imgContainer.width()) x = _graph.imgContainer.width();
        if (x < 0) x = 0;
        return x;

      }

      // note: isCalibrated() doesn't read current data, just saved data
      if (_graph.datum.isCalibrated()) {

        calibrationResize(limitRange(_graph.nmToDisplayPx(blue2)),
                          limitRange(_graph.nmToDisplayPx(green2)));

      } else {

        attemptCalibration();

      }

      $('.input-wavelength-1, .input-wavelength-2').change(function() {
        calibrationResize(
          _graph.imagePxToDisplayPx($('.input-wavelength-1').val()), 
          _graph.imagePxToDisplayPx($('.input-wavelength-2').val())
        );
      });

      var drag = d3.behavior.drag();

      drag.on('drag', function() { 

        var margin = _graph.margin.left,
            x      = limitRange(d3.event.x),
            isX1   = $(this).hasClass('slider-1') == 1,
            isX2   = $(this).hasClass('slider-2') == 1;

        $(this).css('left', x + margin);
        $(this).attr('data-pos', x);

        calibrationResize(+$('.slider-1').attr('data-pos'), 
                          +$('.slider-2').attr('data-pos'),
                          !isX1, // lock the slider you're not dragging
                          !isX2);

      });

      d3.selectAll('.slider').call(drag)

    }

  },


  // this is not used after calibration2 was added. Deprecate soon.
  calibrate: {

    title: "Wavelength calibration",
    dataType: "spectrum",
    description: "Follow the prompts to wavelength calibrate a fluorescent spectrum.",
    link: "//publiclab.org/wiki/spectral-workbench-calibration",
    author: "warren",
    apply: true,
    setup: function(form) {

      form.formEl.hide();
      $(form.el).find('.results').html('');
      form.customFormEl.html("<p>Click Begin to calibrate your spectrum.</p>");
      form.applyEl.html("Begin");

    },
    onApply: function(form) {

      var x1, x2,
          w1 = 435.833,
          w2 = 546.074;

      // if you haven't yet, consider selecting a cross section line (and tag)
      // Make less confusing: all subsequent spectra will use this line if you are uploading. Or mark this as live-capture.

      // need a simple way to reset the toolPane content, like alert();
      alert('Start by clicking the middle blue line.');

      form.graph.image.click(function(_x1, _y1) {

        x1 = _x1;

        form.graph.image.clickOff();
  
        alert('Now, click the bright green line.');
  
        form.graph.image.click(function(_x2, _y2) {

          x2 = _x2;

          form.graph.datum.calibrateAndUpload(w1, w2, x1, x2);

          form.close();
  
        });
 
      });

    }

  },


  compare: {

    title: "Compare",
    dataType: "any",
    description: "Compare this spectrum to others in the graph above.",
    link: "//publiclab.org/wiki/spectral-workbench-operations#Compare",
    author: "warren",
    apply: false,
    url: '/spectrums/choose/?own=true', // default spectra to show, default yours and ?author=warren
    setup: function() {

      //$(form.el).find('.results').html('');

    },
    onSpectrumApply: function(form, _graph) {

      // provide better API for own-id:
      var id =     $(this).attr('data-id'),
          author = $(this).attr('data-author'),
          title =  $(this).attr('data-title');

      SpectralWorkbench.API.Core.addComparison(_graph, id, author, title);

      _graph.dim();

      SpectralWorkbench.API.Core.fetchLatestSnapshot(id, function(spectrum) {

        SpectralWorkbench.API.Core.compare(_graph, spectrum, function() {

          _graph.undim();

        });

      });

    }

  },


  similar: {

    title: "Find Similar",
    dataType: "spectrum",
    description: "Search the database for similar spectra.",
    link: "//publiclab.org/wiki/spectral-workbench-usage#Find+similar",
    author: "warren",
    apply: false,
    url: '/match/search/$ID?toolPane=true', // default spectra to show, can use * and ?author=warren
    setup: function() {

      //$(form.el).find('.results').html('');
      

    },
    onSpectrumApply: function(form, _graph) {

      // provide better API for own-id:
      var id =     $(this).attr('data-id'),
          author = $(this).attr('data-author'),
          title =  $(this).attr('data-title');

      SpectralWorkbench.API.Core.addComparison(_graph, id, author, title);

      _graph.dim();

      SpectralWorkbench.API.Core.fetchSpectrum(id, function(spectrum) {

        SpectralWorkbench.API.Core.compare(_graph, spectrum, function() {

          _graph.undim();

        });

      });

    }

  },


  /*
  // incomplete, works through tag form: 
  blend: {

    title: "Blend",
    dataType: "any",
    description: "Blends this spectrum with a second spectrum, using a JavaScript math expression (such as 'R*G+B') to each point in the two spectra, as described in the documentation",
    link: "//publiclab.org/wiki/spectral-workbench-operations#blend",
    author: "warren",
    apply: true,
    setup: function(form) {

      form.formEl.hide();
      $(form.el).find('.results').html('');
      // create custom form
      form.customFormEl.html("<p>Enter an expression to apply to the spectrum:</p><form class='expression'><input type='text'></input></form><p><a href='//publiclab.org/wiki/spectral-workbench-tools#Transform'>Read about transforms &raquo;</a>");

      form.el.find('.expression').on('submit', function(e) {

        e.preventDefault();
        form.graph.datum.addTag('transform:'+form.el.find('.expression input').val());
        form.formEl.show();

      });

      form.el.find('.expression input').focus();

    },
    onApply: function(form, callback) {

      form.formEl.show();

      form.graph.dim();
      form.graph.datum.addTag('transform:'+form.el.find('.expression input').val(), function() {

        form.graph.reload_and_refresh();
        if (callback) callback();

      });

    }

  },
  */

}
