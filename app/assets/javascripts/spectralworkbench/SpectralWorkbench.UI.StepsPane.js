/*
 * A ToolPane type that displays a list of spectra and a spectrum search interface
 */
SpectralWorkbench.UI.StepsPane = SpectralWorkbench.UI.ToolPane.extend({

  init: function(toolType, _graph, selector) {

    var _tool = this;

    this._super(toolType, _graph, selector);

    var form = _tool.form;
    var lastStep = null;

    _tool.options.steps.forEach(function(step, i) {

      var nextStep = _tool.options.steps[i+1];

      step.begin = function() {
        // foo.html(step.instructions);
        step.setup();
        // register event listener for completion
        if (nextStep) step.on('finish', nextStep.begin);
      }

    });

    _tool.options.steps[0].begin();

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
