SpectralWorkbench.UI.Util = Class.extend({

  init: function(_graph) {

    var _ui = this;
    
    _ui.calibrateSpectrum = function(id) {

      if (_graph.dataType == "spectrum") {
 
        SpectralWorkbench.API.Core.copyCalibration(id, _graph.datum.id, function(response){ 

          var spectrum =  _graph.getSpectrumById(response.id);

          // refreshTags!
          SpectralWorkbench.API.Core.refreshTags();

          SpectralWorkbench.API.Core.notify('Spectrum calibration copied from spectrum #' + response.id);

        } );

      }
 
    }

    _ui.tools = {
 
      subtraction: {
 
        title: "Subtraction",
        description: "Subtraction",
        author: "warren",
        apply: false,
        url: '/spectrums/choose/calibrat*?own=true', // default spectra to show, can use * and ?author=warren
        onSpectrumApply: function() {
          // provide better API for own-id:
          _graph.datum.addTag('subtract:' + $(this).attr('data-id'), function() {
            close(); // close the tool pane
          });
        }
 
      }
 
    }

    // initialize tools
    $('.tool-subtraction').click(function() { SpectralWorkbench.UI.Tool.init(_ui.tools.subtraction); });

  }

});
