// NOT YET A CLASS
SpectralWorkbench.UI.Tool = {

  init: function(options, selector) {

    selector = selector || '.datum-tool-pane';

    var el              = $(selector),
        titleEl         = $(selector + ' .title'),
        descriptionEl   = $(selector + ' .description'),
        applyEl         = $(selector + ' .btn-apply'),
        spectrumApplyEl = $(selector + ' .btn-spectrum-apply'),
        authorEl        = $(selector + ' .attribution .author'),
        linkEl          = $(selector + ' .attribution .link'),
        closeEl          = $(selector + ' .actions .cancel');

    if (options.title) titleEl.html(options.title);
    if (options.description) descriptionEl.html(options.description);
    if (options.author) authorEl.attr('href', '/profile/' + options.author).html(options.author);
    if (options.link) linkEl.attr('href', options.link);

    if (options.onSpectrumApply) spectrumApplyEl.click(options.onSpectrumApply);
    if (options.onApply)         applyEl.click(options.onApply);

    if (options.apply) applyEl.show()
    if (!options.apply) applyEl.hide()

    var close = function() {
      $(selector).toggle();
      $('.macros-pane').toggle();
    }

    closeEl.click(close)
    close();

  }

}
