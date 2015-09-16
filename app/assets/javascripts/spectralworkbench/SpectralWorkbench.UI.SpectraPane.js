/*
 * A ToolPane type that displays a list of spectra and a spectrum search interface
 */
SpectralWorkbench.UI.SpectraPane = SpectralWorkbench.UI.ToolPane.extend({

  init: function(toolType, _graph, selector) {

    var _tool = this;

    this._super(toolType, _graph, selector);

    var form = _tool.form;

    // unhide the SpectraPane related stuff. 
    // We should just construct it here.
    form.searchEl.show();//        = form.el.find('form input.input-choose-spectrum');
    form.el.find('results').show();//        = form.el.find('form input.input-choose-spectrum');

    // hook up "apply" buttons in spectrum choice search results
    var connectResults = function(result) {

      if (_tool.options.onSpectrumApply) { 
        $(_tool.selector + ' .btn-spectrum-apply').click(function(e) {
          $(this).html(_tool.spinner);
          _tool.options.onSpectrumApply.bind(this)(form, _graph);
          form.close();
        });
      }
  
      if (_tool.options.apply) form.applyEl.show();
      else                     form.applyEl.hide();

    }

    // fetch the spectrum choice list:
    if (_tool.options.url) {
      _tool.options.url = _tool.options.url.replace('$ID', _graph.datum.id);
      $(form.el).find('.results').load(_tool.options.url, _tool.options.formData, connectResults);
    }

    // set up the search form
    $(form.formEl).on('submit',function() { 
      $(form.el).find('.results').html(_tool.spinner);
      $('.results').load(
        '/spectrums/choose/' + $(this).find('input.input-choose-spectrum').val(),
        _tool.options.formData,
        connectResults
      );

      return false;
    });

  }

});
