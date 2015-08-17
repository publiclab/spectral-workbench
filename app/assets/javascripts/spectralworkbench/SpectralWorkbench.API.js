SpectralWorkbench.API = Class.extend({

  version: '2.0',
  init: function(_graph) {

    var api = this;

    SpectralWorkbench.API.Legacy.override(_graph);

  }

});
