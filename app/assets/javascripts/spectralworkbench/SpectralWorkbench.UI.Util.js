SpectralWorkbench.UI.Util = Class.extend({

  init: function(_graph) {

    var _ui = this;

    // Initialize tools buttons
    $('.tool-subtraction').click(      function() { new SpectralWorkbench.UI.ToolPane('subtraction', _graph); });
    $('.tool-copy-calibration').click( function() { new SpectralWorkbench.UI.ToolPane('copyCalibration', _graph); });
    $('.tool-transform').click(        function() { new SpectralWorkbench.UI.ToolPane('transform', _graph); });
    $('.tool-range').click(            function() { new SpectralWorkbench.UI.ToolPane('range', _graph); });

  }

});
