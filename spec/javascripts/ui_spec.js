
    // actually insert DOM elements into the page
    //_tag.render = function() {


// test interface at:
// table.operations --
//    <tr id="tag_144860"><td class="title"><span class="label purple">cloneOf:59688</span></td><td class="date">Oct 19th 2015 11:54 am</td><td class="description"><a href="//publiclab.org/wiki/spectral-workbench-tags#cloneOf">Spectrum is a copy of </a><a href="/spectrums/59688">Spectrum #59688</a>.</td><td class="operations-tools"><a class="tagdelete" data-id="144860" data-remote="true" data-method="delete" href="/tags/144860" data-confirm="Are you sure? This tag contains functional data used in the display and analysis of the spectrum."><i class="icon icon-remove"></i></a></td></tr>

describe("UI", function() {

  var graph, ajaxSpy;

  beforeEach(function() {

    fixture = loadFixtures('graph.html');

    jasmine.Ajax.install();

    ajaxSpy = spyOn($, "ajax").and.callFake(function(object) {

      var response;

      if      (object.url == '/spectrums/9.json') response = object.success(TestResponses.spectrum.success.responseText);
      else if (object.url == '/spectrums/9/tags') response = object.success(TestResponses.tags.success.responseText);
      else if (object.url == '/tags') response = object.success({"errors":[],"saved":[["tagtest",145165]]});
      else response = 'none';

      // check this if you have trouble faking a server response: 
      if (response != 'none') console.log('Faked response to:', object.url)
      else console.log('Failed to fake response to:', object.url)

    });

  });


  afterEach(function() {

    jasmine.Ajax.uninstall();

  });


  it("sets up a Graph first", function(done) {

    graph = new SpectralWorkbench.Graph({
      spectrum_id: 9,
      calibrated: true,
      onImageComplete: function() { done(); } // fires when graph.image is loaded, so that later tests can run
    });

    expect(graph).toBeDefined();
    expect(graph.datum).toBeDefined();

  });


  // test tag creation
  it("should generate a TagForm", function(done) {

    var tagForm = new SpectralWorkbench.UI.TagForm(graph, function() {

      // this is called by **each** tag added, if there are more than one
      console.log('tag returned success');

      // tagForm input should not be disabled anymore
      expect(tagForm.input.prop('disabled')).toBe(false);

      // ajax:beforeSend is not fired, so these don't happen:

      /*
      // should've removed loading indicator
      expect($('.tags .list span.loading').length).toBe(0);

      // look for displayed tag in the tags element: 
      expect($('.tags .list span').length).toBe(1); 
      */

      expect($('.tags .list span:last a:first').html()).toBe('myTag');

      done();

    });

    expect($("#tag-form-" + graph.datum.id).length).toBe(1);

    expect(tagForm.el).toBeDefined();

    tagForm.input.val('myTag');
    expect(tagForm.input.val()).toBe('myTag');

    // we can't do this unless we ajaxSpy fake the ajax:afterSend event
    //tagForm.el.bind('ajax:afterSend', function(){});
    // but it'd be nice to test if the tag input is disabled

    // tagform is submitted, string is split by ',' and each tag is sent to addTag
    tagForm.el.on('submit', function() {

      // then it'll run addTag

      // after submitting, disabled should be true, but maybe it doesn't happen until later?
      expect(tagForm.input.prop('disabled')).toBe(false);

    });

    tagForm.el.trigger('submit');

    // test errors, eventually:

    /*
      tagForm.el.find('.control-group').addClass('error');
      tagForm.el.find('.control-group .help-inline').remove();
      tagForm.el.find('.control-group').append('<span class="help-inline">'+msg+'</span>');
      
      tagForm.el.find('input.name').prop('disabled',false);
    */

  });


  // try spaces in tags, etc
  // tagForm.el.find('input.name').val('my tag');


  // test asynch tag deletion too:
  //$('#tags .tagdelete').bind('ajax:success', function(){


  it("should generate a transform ToolPane", function() {

    var toolPane = new SpectralWorkbench.UI.ToolPane('transform', graph);

    expect($('.datum-tool-pane').is(':visible')).toBe(true);
    expect(toolPane).toBeDefined();
    expect(toolPane.options).toBeDefined();

    // required ToolPane attributes
    expect(toolPane.options.title).toBeDefined();
    expect(toolPane.options.description).toBeDefined();
    expect(toolPane.options.author).toBeDefined();
    expect(toolPane.options.link).toBeDefined();

    expect(toolPane.form).toBeDefined();

    expect(toolPane.form.titleEl.length).toBe(1);
    expect(toolPane.form.authorEl.length).toBe(1);
    expect(toolPane.form.linkEl.length).toBe(1);
    expect(toolPane.form.descriptionEl.length).toBe(1);
    expect(toolPane.form.formEl.length).toBe(1);
    expect(toolPane.form.searchEl.length).toBe(1);
    expect(toolPane.form.authorSelectEl.length).toBe(1);
    expect(toolPane.form.customFormEl.length).toBe(1);
    // expect(toolPane.form.spectrumApplyEl.length).toBe(1); // only in SpectraPane
    expect(toolPane.form.applyEl.length).toBe(1);
    expect(toolPane.form.closeEl.length).toBe(1);

  });


  it("should run transform when ToolPane apply button is pressed", function() {

    var toolPane = new SpectralWorkbench.UI.ToolPane('transform', graph);

    expect(toolPane).toBeDefined();

    // can we attach a second onClick callback? 
    //form.applyEl.click(function(e) {
    //});

    // click Apply:
    // toolPane.form.applyEl.click();
    // toolPane.form.close(); should be called


  });


/*
    form.cleanUp = function() {
    form.close = function() {


    $('.tool-transform').click(        function() { new SpectralWorkbench.UI.ToolPane('transform', _graph); });
    $('.tool-range').click(            function() { new SpectralWorkbench.UI.ToolPane('range', _graph); });
    $('.tool-calibrate').click(        function() { new SpectralWorkbench.UI.ToolPane('calibrate2', _graph); });
    $('.tool-cross-section').click(    function() { new SpectralWorkbench.UI.ToolPane('crossSection', _graph); });
    $('.tool-smooth').click(           function() { new SpectralWorkbench.UI.ToolPane('smooth', _graph); });
    $('.tool-similar').click(          function() { new SpectralWorkbench.UI.ToolPane('similar', _graph); });

    // Tool panes that display a list of spectra
    $('.tool-subtraction').click(      function() { new SpectralWorkbench.UI.SpectraPane('subtraction', _graph); });
    $('.tool-copy-calibration').click( function() { new SpectralWorkbench.UI.SpectraPane('copyCalibration', _graph); });
    $('.tool-compare').click(          function() { new SpectralWorkbench.UI.SpectraPane('compare', _graph); });
*/


});
