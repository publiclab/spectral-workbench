/*
 * A ToolPane type that displays a list of spectra and a spectrum search interface
 */
SpectralWorkbench.UI.SpectraPane = SpectralWorkbench.UI.ToolPane.extend({

  init: function(toolType, _graph, selector) {

    var _tool = this;

    this._super(toolType, _graph, selector);

    var form = _tool.form;

    _tool.options.steps.forEach(function(step) {

      // instruction
      // setup()
      // onComplete()
      // next
      // last

    });

  }

});

/*

{
  instruction: "Now, click blablabla.",
  setup: function(args) {

    // create the interfaces -- provide template standards

  },
  onComplete: function() {

    // clean up the interfaces

    // then call the next step, passing on args:
    next(args);
    // use a closure to assign next()? 

  }
}

*/
