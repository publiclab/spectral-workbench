SpectralWorkbench.UI.Util = Class.extend({

  init: function(_graph) {

    var _ui = this;
    
    _ui.calibrateSpectrum = function(id) {

      if (_graph.datum instanceof SpectralWorkbench.Spectrum) {
 
        SpectralWorkbench.API.Core.copyCalibration(id, _graph.datum.id, function(response){ 

          // fetch tags from server -- cloning calibration and associated tagging happens on the server side
          _graph.datum.fetchTags();

          SpectralWorkbench.API.Core.notify('Spectrum calibration copied from spectrum #' + response.id);

        } );

      }
 
    }

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
        form.formEl
        form.searchEl
        form.authorSelectEl
        form.customFormEl
        form.spectrumApplyEl
        form.applyEl
        form.closeEl

    */
    _ui.tools = {
 
      subtraction: {
        title: "Subtraction",
        description: "Subtract another calibrated spectrum from this one.",
        author: "warren",
        apply: false,
        url: '/spectrums/choose/calibrat*?own=true', // default spectra to show, can use * and ?author=warren
        onSpectrumApply: function(form) {
          // provide better API for own-id:
          _graph.datum.addTag('subtract:' + $(this).attr('data-id'), function() {
          });
        }
      },

      copyCalibration: {
        title: "Copy Calibration",
        description: "Use a calibrated spectrum to calibrate this one.",
        author: "warren",
        apply: false,
        url: '/spectrums/choose/calibration', // default spectra to show, can use * and ?author=warren
        onSpectrumApply: function(form) {

          // provide better API for own-id:
          SpectralWorkbench.API.Core.copyCalibration($(this).attr('data-id'), _graph.datum.id, function(response){ 

            // fetch tags from server -- cloning calibration and associated tagging happens on the server side
            _graph.datum.fetchTags();
         
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
          form.customFormEl.html("<p>Enter an expression to apply to the spectrum:</p><input type='text' class='expression'></input><p><a href='//publiclab.org/wiki/spectral-workbench-tools#Transform'>Read about transforms &raquo;</a>");

        },
        onApply: function(form) {
          _graph.datum.addTag('transform:'+form.el.find('.expression').val())
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
          inputs    += "<p>The page will refresh once it's added (temporary).</p>"
          form.customFormEl.html(inputs);

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
          _graph.datum.addTag('range:'+ start + '-' + end, function() {
            window.location = window.location;
          });
        }
      }

    }
    // Initialize tools. Eventually have each tool specify its button appearance and class.
    $('.tool-subtraction').click(      function() { SpectralWorkbench.UI.Tool.init(_ui.tools.subtraction); });
    $('.tool-copy-calibration').click( function() { SpectralWorkbench.UI.Tool.init(_ui.tools.copyCalibration); });
    $('.tool-transform').click(        function() { SpectralWorkbench.UI.Tool.init(_ui.tools.transform); });
    $('.tool-range').click(            function() { SpectralWorkbench.UI.Tool.init(_ui.tools.range); });

  }

});
