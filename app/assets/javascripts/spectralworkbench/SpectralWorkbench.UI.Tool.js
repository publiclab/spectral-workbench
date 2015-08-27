// NOT YET A CLASS
SpectralWorkbench.UI.Tool = {

  init: function(options, selector) {

    selector = selector || '.datum-tool-pane';

    var el              = $(selector),
        titleEl         = $(selector + ' h5'),
        descriptionEl   = $(selector + ' .description'),
        applyEl         = $(selector + ' .btn-apply'),
        spectrumApplyEl = $(selector + ' .btn-spectrum-apply');

    if (options.onSpectrumApply) spectrumApplyEl.click(options.onSpectrumApply);
    if (options.onApply)         applyEl.click(options.onApply);

    if (options.apply) applyEl.show()
    if (!options.apply) applyEl.hide()

    var close = function() {
      $(selector).toggle();
      $('.macros-pane').toggle();
    }

    close();

  }

}
