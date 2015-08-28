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
    _ui.tools = {
 
      subtraction: {
        title: "Subtraction",
        description: "Subtract another calibrated spectrum from this one.",
        author: "warren",
        apply: false,
        url: '/spectrums/choose/calibrat*?own=true', // default spectra to show, can use * and ?author=warren
        onSpectrumApply: function() {
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
        onSpectrumApply: function() {

          // provide better API for own-id:
          SpectralWorkbench.API.Core.copyCalibration($(this).attr('data-id'), _graph.datum.id, function(response){ 

            // fetch tags from server -- cloning calibration and associated tagging happens on the server side
            _graph.datum.fetchTags();
         
            SpectralWorkbench.API.Core.notify('Spectrum calibration copied from spectrum #' + response.id);

         
          } );
        }
      }
 
    }

    // Initialize tools. Eventually have each tool specify its button appearance and class.
    $('.tool-subtraction').click(function() { SpectralWorkbench.UI.Tool.init(_ui.tools.subtraction); });
    $('.tool-copy-calibration').click(function() { SpectralWorkbench.UI.Tool.init(_ui.tools.copyCalibration); });

  }

});
