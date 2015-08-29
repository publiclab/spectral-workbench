// NOT YET A CLASS
SpectralWorkbench.UI.Tool = {

  init: function(options, selector) {

    _tool = this;

    selector = selector || '.datum-tool-pane';

    var form = {};
    form.el              = $(selector);
    form.titleEl         = form.el.find('.title');
    form.authorEl        = form.el.find('.attribution .author');
    form.linkEl          = form.el.find('.attribution .link');
    form.descriptionEl   = form.el.find('.description');
    form.formEl          = form.el.find('form');
    form.searchEl        = form.el.find('form input.input-choose-spectrum');
    form.authorSelectEl  = form.el.find('form select.select-author');
    form.customFormEl    = form.el.find('.custom');
    form.spectrumApplyEl = form.el.find('.btn-spectrum-apply');
    form.applyEl         = form.el.find('.btn-apply');
    form.closeEl         = form.el.find('.actions .cancel');
    var spinner          = "<i class='disabled icon icon-spinner icon-spin'></i>";

    var cleanUp = function() {
      // close the tool pane, clean up -- make this run on "cancel" too
      $(selector).find('.btn-spectrum-apply').html("Apply");
      $(selector).find('.btn-apply').html("Apply");
      $(form.el).find('.custom').html('');
    }

    var close = function() {
      cleanUp();
      $(selector).hide();
      $('.macros-pane').show();
    }

    // flush previous if any:
    cleanUp();

    if (options.title) form.titleEl.html(options.title);
    if (options.description) form.descriptionEl.html(options.description);
    if (options.author) form.authorEl.attr('href', '/profile/' + options.author).html(options.author);
    if (options.link) form.linkEl.attr('href', options.link);

    $(form.el).find('.results').html(spinner);
    if (options.setup) options.setup(form);

    // hook up "apply" buttons in spectrum choice search results
    var connectResults = function(result) {

      if (options.onSpectrumApply) { 
        $(selector + ' .btn-spectrum-apply').click(function(e) {
          $(this).html(spinner);
          options.onSpectrumApply.bind(this)(form);
          close();
        });
      }
  
      if (options.apply) form.applyEl.show();
      else               form.applyEl.hide();

    }

    // fetch the spectrum choice list:
    if (options.url) $(form.el).find('.results').load(options.url, connectResults);

    // set up the search form
    $(form.formEl).on('submit',function() { 
      $(form.el).find('.results').html(spinner);
      $('.results').load(
        '/spectrums/choose/' + $(this).find('input.input-choose-spectrum').val(),
        connectResults
      );

      return false;
    });

    if (options.onApply) { 
      form.applyEl.click(function(e) {
        $(this).html(spinner);
        options.onApply(form);
      });
    }

    form.closeEl.click(close);

    // open the pane
    $(selector).show();
    $('.macros-pane').hide();

  }

}
