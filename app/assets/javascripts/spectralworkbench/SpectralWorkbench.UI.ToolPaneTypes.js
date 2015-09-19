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
    author: "warren",
    apply: false,
    formData: { own: true },
    url: '/spectrums/choose/calibrat*', // default spectra to show, can use * and ?author=warren
    onSpectrumApply: function(form, _graph) {
      // provide better API for own-id:
      _graph.datum.addTag('subtract:' + $(this).attr('data-id'), function() {
      });
    }
  },


  copyCalibration: {
    title: "Copy Calibration",
    dataType: "spectrum",
    description: "Use a calibrated spectrum to calibrate this one.",
    author: "warren",
    apply: false,
    url: '/spectrums/choose/calibration', // default spectra to show, can use * and ?author=warren
    onSpectrumApply: function(form, _graph) {

      // provide better API for own-id:
      SpectralWorkbench.API.Core.copyCalibration($(this).attr('data-id'), _graph.datum, function(response){ 

        // fetch tags from server -- cloning calibration and associated tagging happens on the server side
        _graph.datum.fetchTags();
     
        SpectralWorkbench.API.Core.notify('Spectrum calibration copied from spectrum #' + response.id);
     
      } );
    }
  },


  transform: {
    title: "Transform",
    dataType: "any",
    description: "Apply a JavaScript math expression (such as 'R*G+B') to each point in the spectrum, using variables R for red, G, B, and A for average..",
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
    onApply: function(form) {
      form.graph.datum.addTag('transform:'+form.el.find('.expression input').val())
      form.formEl.show();
    }
  },


  range: {
    title: "Range",
    dataType: "any",
    description: "Select a wavelength range; subsequent operations will only use this range.",
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
      form.graph.datum.addTag('range:'+ start + '-' + end);
    }
  },


  smooth: {
    title: "Smoothing",
    dataType: "any",
    description: "Enter a number of points ahead and behind of a given point to average, in order to smooth the graph. Note that this is <b>not</b> time-averaging, and can suppress small spectral features.",
    apply: true,
    author: "warren",
    setup: function(form) {

      form.formEl.hide();
      $(form.el).find('.results').html('');
      form.customFormEl.html("<p>Enter a distance in points to average ahead and behind:</p><input class='distance' type='text' value='3' />");

    },
    onApply: function(form) {

      form.graph.datum.addTag('smooth:' + form.el.find('.distance').val());

      form.graph.reload();
      form.graph.refresh();

    }
  },


  crossSection: {
    title: "Choose cross section",
    dataType: "spectrum",
    description: "Click the image to choose which row of pixels from the source image is used to generate your graph line.",
    apply: true,
    author: "warren",
    setup: function(form) {

      // shouldnt be necessary in new API, but double check:
      form.formEl.hide();
      form.el.find('.results').html('');

      form.customFormEl.html("<p>Click the spectrum image or enter a row number:</p><input class='cross-section' type='text' />");

      form.graph.image.click(function(x, y) {

        form.el.find('.cross-section').val(y);

      });
    },
    onApply: function(form) {

      form.graph.datum.imgToJSON(+$('.cross-section').val());
      form.graph.datum.load();
      form.graph.reload();
      form.graph.refresh();
      alert('Now, calibrate your spectrum to save this cross section.');

    }
  },


  calibrate2: {
    title: "Wavelength calibration",
    dataType: "spectrum",
    description: "Follow the prompts to wavelength calibrate a fluorescent spectrum.",
    author: "warren",
    apply: true,
    setup: function(form) {

      var pane = "";

      pane += "<p class='prompt form-inline' style='padding-bottom:20px;'>";
      pane +=   "<b>Calibrate:</b> ";
      pane +=   "Adjust sliders &amp; align the reference spectrum to yours. ";
      pane +=   "<a href='//publiclab.org/wiki/spectral-workbench-calibration'>Learn more &raquo;</a> ";
      pane +=   "<span class='calibration-form pull-right'> ";
      pane +=     "<input type='checkbox' class='checkbox-snap' /> <label for='checkbox-snap'>Snap</label> ";
      pane +=     "<input type='text' class='input-wavelength-1 input-mini' /> ";
      pane +=     "<input type='text' class='input-wavelength-2 input-mini' /> ";
      pane +=     "<a class='btn btn-primary btn-save-calibrate-2'>Save</a>";
      pane +=   "</span>";
      pane += "</p>";
      pane += "<div class='fit'></div>"; // to show how good the fit is
      pane += "<div class='reference'><span class='btn btn-mini disabled slider slider-1'>B2</span><span class='btn btn-mini disabled slider slider-2'>G2</span></div>";
      pane += "<div class='example' style='background:black;overflow:hidden;height:20px;'><img style='max-width:none;display:block;height:20px;' src='/images/snowsky.jpg' /></div>";

      $('.spectrum-img-container').prepend('<div class="calibration-pane"></div>');
      $('.calibration-pane').html(pane);

      $('.calibration-pane .slider').css('margin-top', -24);
      $('.slider').css('position', 'absolute');

      // resize image;
      // example snowsky.jpg is: (redo these at high resolution)
      // 1818 total width
      // 586 to blue from left
      // 1102 to first green
      // 1123 to second green
      // 538 between blue and second green
      // blue to 2nd green is 0.29593 of total

      // use autocalibration for first pass, 
      // or, for now, existing calibration:
      var _graph = form.graph,
          extent = form.graph.extent;

      /*

        Mostly, we get pixel x,y data, and move the sliders and image accordingly,
          then generate wavelengths for the inputs. 

        Sometimes, we get wavelength inputs, find the pixel locations, and move the 
          sliders and image accordingly, then display the wavelengths in the inputs. 

        We should store the wavelength extents of the graph just once 
         (although we could change this on resize) - in the Graph object. 

      */
      // x1 and x2 are displace space pixel values
      var calibrationResize = function(x1, x2) {

        // snap to nearest
        if ($('.calibration-pane input.checkbox-snap').prop('checked')) {

          // calculate their wavelength values 
          // (fallback to data-space pixels, if uncalibrated)
          var w1 = _graph.displayPxToNm(x1),
              w2 = _graph.displayPxToNm(x2);

          // may return data-space pixel values instead of wavelengths, if not calibrated:
          x1 = _graph.nmToDisplayPx(_graph.datum.getNearbyPeak(w1, 10));
          x2 = _graph.nmToDisplayPx(_graph.datum.getNearbyPeak(w2, 10));

        }

        var margin = _graph.margin.left, 
            // distance between blue2 and green2 in example spectrum image:
            exampleImgWidth = parseInt((x2 - x1) / (538 / 1818)), // in display pixels
            leftPad = (-parseInt((586 / 1818) * exampleImgWidth) + x1); // in display pixels

        $('.calibration-pane .example img').css('margin-left', leftPad);
        $('.calibration-pane .example img').css('width', exampleImgWidth);

        $('.slider-1').css('left', parseInt(x1) + margin);
        $('.slider-2').css('left', parseInt(x2) + margin);

        // get source image pixel location, round to 2 decimal places:
        ix1 = Math.round(_graph.displayPxToImagePx(x1) * 100) / 100;
        ix2 = Math.round(_graph.displayPxToImagePx(x2) * 100) / 100;
console.log(x1, x2)

        // no, need to display image space pixel positions here
        $('.input-wavelength-1').val(ix1);
        $('.input-wavelength-2').val(ix2);

      }

      // https://en.wikipedia.org/wiki/File:Fluorescent_lighting_spectrum_peaks_labelled.gif
      var blue2 = 436.6,
          green2 = 546.5;

      $('.btn-save-calibrate-2').click(function() {

        _graph.datum.calibrateAndUpload(
          blue2, 
          green2, 
          $('.input-wavelength-1').val(), 
          $('.input-wavelength-2').val()
        ); 

      });

      // if these are outside the currently
      // displayed range, limit them:
      var limitRange = function(x) {
        if (x > _graph.imgContainer.width()) x = _graph.imgContainer.width();
        if (x < 0) x = 0;
        return x;
      }

      calibrationResize(limitRange(_graph.nmToDisplayPx(blue2)),
                        limitRange(_graph.nmToDisplayPx(green2)));

      var drag = d3.behavior.drag();

      drag.on('drag', function() { 

        var margin = _graph.margin.left
            x = limitRange(d3.event.x);

        // if these are outside the currently
        // displayed range, limit them:
        if (x > _graph.imgContainer.width()) x = _graph.imgContainer.width();
        if (x < 0) x = 0;

        $(this).css('left', x + margin);
        $(this).attr('data-pos', x);

        calibrationResize(+$('.slider-1').attr('data-pos'), 
                          +$('.slider-2').attr('data-pos'));

      });

      d3.selectAll('.slider').call(drag)

    }
  },


  calibrate: {
    title: "Wavelength calibration",
    dataType: "spectrum",
    description: "Follow the prompts to wavelength calibrate a fluorescent spectrum.",
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
    author: "warren",
    apply: false,
    url: '/spectrums/choose/all', // default spectra to show, can use * and ?author=warren
    setup: function() {

      //$(form.el).find('.results').html('');
      

    },
    onSpectrumApply: function(form, _graph) {

      // provide better API for own-id:
      var id =     $(this).attr('data-id'),
          author = $(this).attr('data-author'),
          title =  $(this).attr('data-title');

      $('li.comparisons').show();

      $('table.comparisons').append('<tr class="spectrum spectrum-comparison-' + id + '"></tr>');

      var compareEl = $('table.comparisons tr.spectrum-comparison-' + id);
      compareEl.append('<td class="title"><a href="/spectrums/' + id + '">' + title + '</a></td>');
      compareEl.append('<td class="author"><a href="/profile/' + author + '">' + author + '</a></td>');
      compareEl.append('<td class="comparison-tools"></td>');

      compareEl.find('td.comparison-tools').append('<a data-id="' + id + '" class="remove"><i class="icon icon-remove"></i></a>');
      compareEl.find('.comparison-tools .remove').click(function(){

        compareEl.remove();

        var combined = _graph.datum.d3();

        // get rid of self
        _graph.comparisons.forEach(function(datum){
          if (datum.id != +$(this).attr('data-id')) _graph.comparisons.splice(_graph.comparisons.indexOf(datum), 1);
        });

        // re-assemble display data
        _graph.comparisons.forEach(function(comparison) {
       
          comparison = comparison.d3()[0];
          comparison.color = "red";
          combined.push(comparison);
       
        });

        _graph.data.datum(combined, _graph.idKey);
        _graph.refresh();

        $('li.comparisons a').tab('show');

      });

      SpectralWorkbench.API.Core.fetch(_graph, id, function(_graph, data) {

        SpectralWorkbench.API.Core.compare(_graph, data);

      });

    }

  },


  similar: {
    title: "Find Similar",
    dataType: "spectrum",
    description: "Search the database for similar spectra.",
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

      $('li.comparisons').show();

      $('table.comparisons').append('<tr class="spectrum spectrum-comparison-' + id + '"></tr>');

      var compareEl = $('table.comparisons tr.spectrum-comparison-' + id);
      compareEl.append('<td class="title"><a href="/spectrums/' + id + '">' + title + '</a></td>');
      compareEl.append('<td class="author"><a href="/profile/' + author + '">' + author + '</a></td>');
      compareEl.append('<td class="comparison-tools"></td>');

      compareEl.find('td.comparison-tools').append('<a data-id="' + id + '" class="remove"><i class="icon icon-remove"></i></a>');
      compareEl.find('.comparison-tools .remove').click(function(){

        compareEl.remove();

        var combined = _graph.datum.d3();

        // get rid of self
        _graph.comparisons.forEach(function(datum){
          if (datum.id != +$(this).attr('data-id')) _graph.comparisons.splice(_graph.comparisons.indexOf(datum), 1);
        });

        // re-assemble display data
        _graph.comparisons.forEach(function(comparison) {
       
          comparison = comparison.d3()[0];
          comparison.color = "red";
          combined.push(comparison);
       
        });

        _graph.data.datum(combined, _graph.idKey);
        _graph.refresh();

        $('li.comparisons a').tab('show');

      });

      SpectralWorkbench.API.Core.fetch(_graph, id, function(_graph, data) {

        SpectralWorkbench.API.Core.compare(_graph, data);

      });

    }

  }


}
