SpectralWorkbench.UI.Util = Class.extend({

  init: function(_graph) {

    _ui = this;
    
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

  }

  // refreshTags

});
