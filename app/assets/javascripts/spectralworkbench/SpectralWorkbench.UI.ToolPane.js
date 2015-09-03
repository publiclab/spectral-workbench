SpectralWorkbench.UI.ToolPane = Class.extend({
  init: function(toolType, _graph, selector) {

    _tool = this;
    var options = _tool.tools[toolType];
    selector = selector || '.datum-tool-pane';

    options.formData = options.formData || {};
    options.formData['not'] = _graph.datum.id;

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

    // hide and show things to return to default state
    var cleanUp = function() {
      $(selector).find('.btn-spectrum-apply').html("Apply");
      $(selector).find('.btn-apply').html("Apply");
      $(form.el).find('.custom').html('');
      form.formEl.show();
    }

    // close the tool pane AND clean up. runs on "cancel"
    var close = function() {
      cleanUp();
      $(selector).hide();
      $('.macros-pane').show();
    }

    // flush previous if any:
    cleanUp();
    form.searchEl.focus(); // this may be overridden in options.setup()

    if (options.title) form.titleEl.html(options.title);
    if (options.description) form.descriptionEl.html(options.description);
    if (options.author) form.authorEl.attr('href', '/profile/' + options.author).html(options.author);
    if (options.link) form.linkEl.attr('href', options.link);

    $(form.el).find('.results').html(spinner);
    if (options.setup) options.setup(form, _graph);

    if (options.apply) form.applyEl.show();
    else               form.applyEl.hide();

    // hook up "apply" buttons in spectrum choice search results
    var connectResults = function(result) {

      if (options.onSpectrumApply) { 
        $(selector + ' .btn-spectrum-apply').click(function(e) {
          $(this).html(spinner);
          options.onSpectrumApply.bind(this)(form, _graph);
          close();
        });
      }
  
      if (options.apply) form.applyEl.show();
      else               form.applyEl.hide();

    }

    // fetch the spectrum choice list:
    if (options.url) $(form.el).find('.results').load(options.url, options.formData, connectResults);

    // set up the search form
    $(form.formEl).on('submit',function() { 
      $(form.el).find('.results').html(spinner);
      $('.results').load(
        '/spectrums/choose/' + $(this).find('input.input-choose-spectrum').val(),
        options.formData,
        connectResults
      );

      return false;
    });

    if (options.onApply) { 
      form.applyEl.click(function(e) {
        $(this).html(spinner);
        options.onApply(form);
        close();
      });
    }

    form.closeEl.click(close);

    // open the pane
    $(selector).show();
    $('.macros-pane').hide();

  },

  // move these somewhere that makes sense, like into the API
  // they are not the tag operators themselves, nor the tags, but the *tool panes*
  // -- rename them as such!
  /*

  You may use local variable form, with properties:

      form.el
      form.titleEl
      form.authorEl
      form.linkEl
      form.descriptionEl
      form.formEl
      form.searchEl
      form.authorSelectEl
      form.customFormEl
      form.spectrumApplyEl
      form.applyEl
      form.closeEl

  */
  tools: {
 
    subtraction: {
      title: "Subtraction",
      description: "Subtract another calibrated spectrum from this one.",
      author: "warren",
      apply: false,
      formData: { own: true },
      url: '/spectrums/choose/calibrat*', // default spectra to show, can use * and ?author=warren
      onSpectrumApply: function(form, graph) {
        // provide better API for own-id:
        graph.datum.addTag('subtract:' + $(this).attr('data-id'), function() {
        });
      }
    },

    copyCalibration: {
      title: "Copy Calibration",
      description: "Use a calibrated spectrum to calibrate this one.",
      author: "warren",
      apply: false,
      url: '/spectrums/choose/calibration', // default spectra to show, can use * and ?author=warren
      onSpectrumApply: function(form, graph) {

        // provide better API for own-id:
        SpectralWorkbench.API.Core.copyCalibration($(this).attr('data-id'), graph.datum.id, function(response){ 

          // fetch tags from server -- cloning calibration and associated tagging happens on the server side
          graph.datum.fetchTags();
       
          SpectralWorkbench.API.Core.notify('Spectrum calibration copied from spectrum #' + response.id);
       
        } );
      }
    },

    transform: {
      title: "Transform",
      description: "Apply a JavaScript math expression (such as 'R*G+B') to each point in the spectrum, using variables R for red, G, B, and A for average..",
      author: "warren",
      apply: true,
      setup: function(form) {

        form.formEl.hide();
        $(form.el).find('.results').html('');
        // create custom form
        form.customFormEl.html("<p>Enter an expression to apply to the spectrum:</p><form class='expression'><input type='text'></input></form><p><a href='//publiclab.org/wiki/spectral-workbench-tools#Transform'>Read about transforms &raquo;</a>");
        form.el.find('.expression').on('submit', function(e) {
          e.preventDefault();
          graph.datum.addTag('transform:'+form.el.find('.expression input').val());
          form.formEl.show();
        });
        form.el.find('.expression input').focus();

      },
      onApply: function(form) {
        graph.datum.addTag('transform:'+form.el.find('.expression input').val())
        form.formEl.show();
      }
    },
 
    range: {
      title: "Range",
      description: "Select a wavelength range; subsequent operations will only use this range.",
      author: "warren",
      apply: true,
      setup: function(form) {

        form.formEl.hide();
        $(form.el).find('.results').html('');
        // create custom form
        var inputs = "<p>Enter a start wavelength:</p>"
        inputs    += "<input type='text' class='start' value='400' />"
        inputs    += "<p>Enter an end wavelength:</p>"
        inputs    += "<input type='text' class='end' value='800' />"
        form.customFormEl.html(inputs);
        form.el.find('.start').focus();

      },
      onApply: function(form) {

        var start = +form.el.find('.start').val(),
            end   = +form.el.find('.end').val();
        if (start > end) {
          var tmp = end;
          end = start;
          start = tmp;
        }
        form.formEl.show();
        graph.datum.addTag('range:'+ start + '-' + end);
      }
    }

  }

});
