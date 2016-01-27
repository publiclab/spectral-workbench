SpectralWorkbench.UI.ToolPane = Class.extend({

  form: {},
  spinner: "<i class='disabled fa fa-spinner fa-spin'></i>",

  init: function(toolType, _graph, selector, callback) {

    var _tool = this;
    var form = _tool.form;

    _tool.options = SpectralWorkbench.UI.ToolPaneTypes[toolType];
    _tool.selector = selector || '.datum-tool-pane';

    _tool.options.formData = _tool.options.formData || {};
    _tool.options.formData['not'] = _graph.datum.id;

    // create basic toolpane in selector DOM el here:


    // some of these could be moved into SpectraPane subclass:
    form.graph           = _graph;
    form.el              = $(_tool.selector);
    form.titleEl         = form.el.find('.title');
    form.authorEl        = form.el.find('.attribution .author');
    form.linkEl          = form.el.find('.attribution .link');
    form.descriptionEl   = form.el.find('.description');
    form.formEl          = form.el.find('form');
    form.searchEl        = form.el.find('form input.input-choose-spectrum');
    form.authorSelectEl  = form.el.find('form select.select-author');
    form.customFormEl    = form.el.find('.custom');
    // spectrumApplyEl doesn't occur in every one
    form.spectrumApplyEl = form.el.find('.btn-spectrum-apply');
    form.applyEl         = form.el.find('.btn-apply');
    form.closeEl         = form.el.find('.actions .cancel');

    // hide and show things to return to default state
    form.cleanUp = function() {
      $(_tool.selector).find('.btn-spectrum-apply').html("Apply");
      form.applyEl.html("Apply");
      $(form.el).find('.custom').html('');
      form.formEl.show();
      form.spectrumApplyEl.off('click');
      form.applyEl.off('click');
      if (_tool.options.cleanUp) _tool.options.cleanUp(form);
      // clean up the search form listener from SpectraPane:
      if (form.formEl) $(form.formEl).off('submit');
    }

    // close the tool pane AND clean up. runs on "cancel"
    form.close = function() {
      form.cleanUp();
      $(_tool.selector).hide();
      $('.macros-pane').show();
    }

    // flush previous if any:
    form.cleanUp();
    form.searchEl.focus(); // this may be overridden in _tool.options.setup()... how?

    // these should be required
    if (_tool.options.title) form.titleEl.html(_tool.options.title);
    if (_tool.options.description) form.descriptionEl.html(_tool.options.description);
    if (_tool.options.author) form.authorEl.attr('href', '/profile/' + _tool.options.author).html(_tool.options.author);
    if (_tool.options.link) form.linkEl.attr('href', _tool.options.link);

    $(form.el).find('.results').html(_tool.spinner);
    if (_tool.options.setup) _tool.options.setup.bind(this)(form, _graph); // give it access to this scope

    if (_tool.options.apply) form.applyEl.show();
    else               form.applyEl.hide();

    if (_tool.options.onApply) { 
      form.applyEl.click(function(e) {
        form.applyEl.html("<i class='fa fa-spinner fa-spin fa-white'></i>");
        _tool.options.onApply.bind(this)(form);
        form.close();
      });
    }

    form.closeEl.click(form.close);

    // open the pane
    $(_tool.selector).show();
    $('.macros-pane').hide();

    return _tool;

  }

});
