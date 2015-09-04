SpectralWorkbench.UI.Util = Class.extend({

  init: function(_graph) {

    var _ui = this;

    // Initialize tools buttons
    $('.tool-subtraction').click(      function() { new SpectralWorkbench.UI.ToolPane('subtraction', _graph); });
    $('.tool-copy-calibration').click( function() { new SpectralWorkbench.UI.ToolPane('copyCalibration', _graph); });
    $('.tool-transform').click(        function() { new SpectralWorkbench.UI.ToolPane('transform', _graph); });
    $('.tool-range').click(            function() { new SpectralWorkbench.UI.ToolPane('range', _graph); });
    $('.tool-calibrate').click(        function() { new SpectralWorkbench.UI.ToolPane('calibrate', _graph); });
    $('.tool-cross-section').click(    function() { new SpectralWorkbench.UI.ToolPane('crossSection', _graph); });
    $('.tool-smooth').click(           function() { new SpectralWorkbench.UI.ToolPane('smooth', _graph); });

    // Set up JSON download

    _graph.datum.downloadJSON('.btn-download-json');

  }

});
