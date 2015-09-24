SpectralWorkbench.UI.Util = Class.extend({

  init: function(_graph) {

    var _ui = this;

    // Initialize tools buttons
    $('.tool-transform').click(        function() { new SpectralWorkbench.UI.ToolPane('transform', _graph); });
    $('.tool-range').click(            function() { new SpectralWorkbench.UI.ToolPane('range', _graph); });
    $('.tool-calibrate').click(        function() { new SpectralWorkbench.UI.ToolPane('calibrate2', _graph); });
    $('.tool-cross-section').click(    function() { new SpectralWorkbench.UI.ToolPane('crossSection', _graph); });
    $('.tool-smooth').click(           function() { new SpectralWorkbench.UI.ToolPane('smooth', _graph); });
    $('.tool-similar').click(          function() { new SpectralWorkbench.UI.ToolPane('similar', _graph); });

    // Tool panes that display a list of spectra
    $('.tool-subtraction').click(      function() { new SpectralWorkbench.UI.SpectraPane('subtraction', _graph); });
    $('.tool-copy-calibration').click( function() { new SpectralWorkbench.UI.SpectraPane('copyCalibration', _graph); });
    $('.tool-compare').click(          function() { new SpectralWorkbench.UI.SpectraPane('compare', _graph); });

    // Set up JSON download

    _graph.datum.downloadJSON('.btn-download-json');

    $('.btn-save-as-set').click(function() {
      $(this).attr('href', "/sets/new/" + graph.datum.id + ',' + graph.comparisons.map(function(spectrum) { return spectrum.id; }).join(','));
    });

  }

});
