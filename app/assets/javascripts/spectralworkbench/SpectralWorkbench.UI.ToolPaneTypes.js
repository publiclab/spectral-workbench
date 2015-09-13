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
    description: "Subtract another calibrated spectrum from this one.",
    author: "warren",
    apply: false,
    formData: { own: true },
    url: '/spectrums/choose/calibrat*', // default spectra to show, can use * and ?author=warren
    onSpectrumApply: function(form, graph) {
      // provide better API for own-id:
      graph.datum.addTag('subtract:' + $(this).attr('data-id'), function() {
      });
    }
  },


  copyCalibration: {
    title: "Copy Calibration",
    description: "Use a calibrated spectrum to calibrate this one.",
    author: "warren",
    apply: false,
    url: '/spectrums/choose/calibration', // default spectra to show, can use * and ?author=warren
    onSpectrumApply: function(form, graph) {

      // provide better API for own-id:
      SpectralWorkbench.API.Core.copyCalibration($(this).attr('data-id'), graph.datum, function(response){ 

        // fetch tags from server -- cloning calibration and associated tagging happens on the server side
        graph.datum.fetchTags();
     
        SpectralWorkbench.API.Core.notify('Spectrum calibration copied from spectrum #' + response.id);
     
      } );
    }
  },


  transform: {
    title: "Transform",
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
        graph.datum.addTag('transform:'+form.el.find('.expression input').val());
        form.formEl.show();
      });
      form.el.find('.expression input').focus();

    },
    onApply: function(form) {
      graph.datum.addTag('transform:'+form.el.find('.expression input').val())
      form.formEl.show();
    }
  },


  range: {
    title: "Range",
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
      graph.datum.addTag('range:'+ start + '-' + end);
    }
  },


  smooth: {
    title: "Smoothing",
    description: "Enter a number of points ahead and behind of a given point to average, in order to smooth the graph. Note that this is <b>not</b> time-averaging, and can suppress small spectral features.",
    apply: true,
    author: "warren",
    setup: function(form) {

      form.formEl.hide();
      $(form.el).find('.results').html('');
      form.customFormEl.html("<p>Enter a distance in points to average ahead and behind:</p><input class='distance' type='text' value='3' />");

    },
    onApply: function(form) {

      graph.datum.addTag('smooth:' + form.el.find('.distance').val());

      graph.reload();
      graph.refresh();

    }
  },


  crossSection: {
    title: "Choose cross section",
    description: "Click the image to choose which row of pixels from the source image is used to generate your graph line.",
    apply: true,
    author: "warren",
    setup: function(form) {

      form.formEl.hide();
      $(form.el).find('.results').html('');
      form.customFormEl.html("<p>Click the spectrum image or enter a row number:</p><input class='cross-section' type='text' />");

      graph.image.click(function(x, y) {

        form.find('.cross-section').val(y);

      });
    },
    onApply: function(form) {

      graph.datum.imgToJSON(+$('.cross-section').val());
      graph.datum.load();
      graph.reload();
      graph.refresh();
      alert('Now, calibrate your spectrum to save this cross section.');

    }
  },


  calibrate2: {
    title: "Wavelength calibration",
    description: "Follow the prompts to wavelength calibrate a fluorescent spectrum.",
    author: "warren",
    apply: true,
    setup: function(form) {

      var pane = "";

      pane += "<h5>Calibrate</h5>";
      pane += "<p>Adjust the sliders to align the reference spectrum to your own. <a href='//publiclab.org/wiki/spectral-workbench-calibration'>Learn more &raquo;</a></p>";
      pane += "<div class='fit'></div>";
      pane += "<div class='snapping'></div>";
      pane += "<div class='reference'><span class='btn btn-mini disabled slider slider-1'>A</span><span class='btn btn-mini disabled slider slider-2'>B</span></div>";

      $('#graph').prepend('<div class="calibrationPane"></div>');
      $('.calibrationPane').html(pane);

      $('.slider').css('position', 'absolute');

      $('.slider-1').css('left', 100);
      $('.slider-2').css('left', 300);

      var drag = d3.behavior.drag();

      drag.on('drag', function() { 
        $(this).css('left', d3.event.x);
      });

      d3.select('.slider').call(drag)

    }
  },


  calibrate: {
    title: "Wavelength calibration",
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

      graph.image.click(function(_x1, _y1) {

        x1 = _x1;

        graph.image.clickOff();
  
        alert('Now, click the bright green line.');
  
        graph.image.click(function(_x2, _y2) {

          x2 = _x2;

          graph.datum.calibrateAndUpload(w1, w2, x1, x2);

          form.close();
  
        });
 
      });

    }

  },


  compare: {
    title: "Compare",
    description: "Compare this spectrum to others in the graph above.",
    author: "warren",
    apply: false,
    url: '/spectrums/choose/all', // default spectra to show, can use * and ?author=warren
    setup: function() {

      //$(form.el).find('.results').html('');
      

    },
    onSpectrumApply: function(form, graph) {

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

        var combined = graph.datum.d3();

        // get rid of self
        graph.comparisons.forEach(function(datum){
          if (datum.id != +$(this).attr('data-id')) graph.comparisons.splice(graph.comparisons.indexOf(datum), 1);
        });

        // re-assemble display data
        graph.comparisons.forEach(function(comparison) {
       
          comparison = comparison.d3()[0];
          comparison.color = "red";
          combined.push(comparison);
       
        });

        graph.data.datum(combined, graph.idKey);
        graph.refresh();

        $('li.comparisons a').tab('show');

      });

      SpectralWorkbench.API.Core.fetch(graph, id, function(graph, data) {

        SpectralWorkbench.API.Core.compare(graph, data);

      });

    }

  },


  similar: {
    title: "Find Similar",
    description: "Search the database for similar spectra.",
    author: "warren",
    apply: false,
    url: '/match/search/$ID?toolPane=true', // default spectra to show, can use * and ?author=warren
    setup: function() {

      //$(form.el).find('.results').html('');
      

    },
    onSpectrumApply: function(form, graph) {

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

        var combined = graph.datum.d3();

        // get rid of self
        graph.comparisons.forEach(function(datum){
          if (datum.id != +$(this).attr('data-id')) graph.comparisons.splice(graph.comparisons.indexOf(datum), 1);
        });

        // re-assemble display data
        graph.comparisons.forEach(function(comparison) {
       
          comparison = comparison.d3()[0];
          comparison.color = "red";
          combined.push(comparison);
       
        });

        graph.data.datum(combined, graph.idKey);
        graph.refresh();

        $('li.comparisons a').tab('show');

      });

      SpectralWorkbench.API.Core.fetch(graph, id, function(graph, data) {

        SpectralWorkbench.API.Core.compare(graph, data);

      });

    }

  }


}
