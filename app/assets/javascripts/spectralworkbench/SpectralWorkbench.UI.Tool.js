// NOT YET A CLASS
SpectralWorkbench.UI.Tool = {

  init: function(options, selector) {

    _tool = this;

    selector = selector || '.datum-tool-pane';

    var el              = $(selector),
        titleEl         = el.find('.title'),
        authorEl        = el.find('.attribution .author'),
        linkEl          = el.find('.attribution .link'),
        descriptionEl   = el.find('.description'),
        formEl          = el.find('form'),
        spectrumApplyEl = el.find('.btn-spectrum-apply'),
        applyEl         = el.find('.btn-apply'),
        closeEl         = el.find('.actions .cancel')
        spinner         = "<i class='disabled icon icon-spinner icon-spin'></i>";

    if (options.title) titleEl.html(options.title);
    if (options.description) descriptionEl.html(options.description);
    if (options.author) authorEl.attr('href', '/profile/' + options.author).html(options.author);
    if (options.link) linkEl.attr('href', options.link);

    options.url = options.url || '/spectrums/choose/calibrat*?own=true';

    $(el).find('.results').html(spinner);

    // hook up "apply" buttons in spectrum choice search results
    var connectResults = function(result) {

      if (options.onSpectrumApply) { 
        $(selector + ' .btn-spectrum-apply').click(function(e) {
          $(this).html(spinner);
          options.onSpectrumApply.bind(this)(e);
          // close the tool pane - usable as finish() in tool callback code
          $(selector).hide();
          $(selector).find('.btn-spectrum-apply').html("Apply");
          $(selector).find('.btn-apply').html("Apply");
          $('.macros-pane').show();
        });
      }
  
      if (options.apply) applyEl.show();
      else               applyEl.hide();

    }

    // fetch the spectrum choice list:
    $(el).find('.results').load(options.url, connectResults);

    // set up the search form
    $(formEl).on('submit',function() { 
      $(el).find('.results').html(spinner);
      $('.results').load(
        '/spectrums/choose/' + $(this).find('input.input-choose-spectrum').val(),
        connectResults
      );

      return false;
    });

    if (options.onApply) { 
      applyEl.click(function(e) {
        $(this).html(spinner);
        options.onApply(e);
      });
    }

    closeEl.click(close);

    // open the pane
    $(selector).show();
    $('.macros-pane').hide();

  }

}
