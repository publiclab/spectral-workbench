/*
  This suite of specs is quite messy, as we're testing both
  the data models and their in-DOM representations, and have only 
  limited callbacks and event handlers to rely upon for asynchronous sequences. Sorry!
*/

describe("UI", function() {

  var graph, ajaxSpy, tagForm;


  var cleanUp;

  // disable cleanUp() method to persist the fixture across specs
  persistFixture = function() {

    cleanUp = jasmine.getFixtures().cleanUp; // save the cleanUp function

    jasmine.getFixtures().cleanUp = function() {}; // replace it with a fake one

  }

  // restore non-persistent fixture behavior
  unPersistFixture = function() {

    jasmine.getFixtures().cleanUp = cleanUp;

  }


  beforeEach(function() {

    fixture = loadFixtures('graph.html');

    jasmine.Ajax.install();

    ajaxSpy = spyOn($, "ajax").and.callFake(function(object) {

      var response;

      if      (object.url == '/spectrums/9.json') response = object.success(TestResponses.spectrum.success.responseText);
      else if (object.url == '/spectrums/9/tags') response = object.success(TestResponses.tags.success.responseText);
      else if (object.url == '/tags') response = object.success({"errors":[],"saved":[["tagtest",145165]]});
      else if (object.url.substr(0,6) == '/tags/') response = object.success("success"); // deletion; includes id, which we wildcard
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
      onImageComplete: function() {

        expect(graph).toBeDefined();
        expect(graph.datum).toBeDefined();

        done(); 

      } // fires when graph.image is loaded, so that later tests can run
    });

  });


  it("can create notifications in the DOM", function() {

    var noticeEl = graph.UI.notify('Hello, world!', 'success');

    expect(noticeEl.html()).toBe('<b>Success:</b> Hello, world!');
    expect(noticeEl.html()).not.toBe('Goodbye, world!');
    expect(noticeEl.hasClass('alert-success')).toBe(true);

    var noticeEl = graph.UI.notify('Hello, world!', 'error');

    expect($('.notifications-container p').length).toBe(2);
    expect(noticeEl.hasClass('alert-error')).toBe(true);

  });


  // test tag creation
  it("should generate a TagForm", function(done) {

    tagForm = new SpectralWorkbench.UI.TagForm(graph, function() {

      // this is called by **each** tag added, if there are more than one

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

    console.log('be sure this runs');

    // we can't do this unless we ajaxSpy fake the ajax:afterSend event
    //tagForm.el.bind('ajax:afterSend', function(){});
    // but it'd be nice to test if the tag input is disabled

    // tagform is submitted, string is split by ',' and each tag is sent to addTag
    tagForm.el.on('submit', function(e) {

      // then it'll run addTag

      // after submitting, disabled should be true, but maybe it doesn't happen until later?
      expect(tagForm.input.prop('disabled')).toBe(false);

      e.preventDefault(); // stop actual request

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


  // spaces in tags are done on server side, so we can't test them here unless we move them to client side
  xit("should replace spaces in tags with dashes", function() {

    expect(tagForm.el).toBeDefined();

    tagForm.input.val('my tag with spaces');

    // tagform is submitted, string is split by ',' and each tag is sent to addTag
    tagForm.el.on('submit', function(e) {

      expect($('.tags .list span:last a:last').html()).toBe('my-tag-with-spaces');

      e.preventDefault(); // stop actual request

    });

    tagForm.el.trigger('submit');

  });


  // test asynch tag deletion too:
  //$('#tags .tagdelete').bind('ajax:success', function(){
  // and ensure tag display refresh/cleanup

  // i.e. add a range tag, check that range is now limited, then remove it and check again
  //  this is not yet working...

  it("should create tags and display them", function(done) {

    // test that the range is not yet limited
    expect(graph.datum.getExtentX()).toEqual([269.089, 958.521]);

    tagForm = new SpectralWorkbench.UI.TagForm(graph, function() {

      // be sure the tag is there now. 
      expect($('.operations tr:last .label').html()).toBe('range:500-550');

      // datum.tags.push is run **after** the callback :-/
      //expect(graph.datum.getTag('range:500-550')).not.toBe(false);

      // test that the range is actually limited
      // except that datum.parseTags is run **after** the callback :-/
      //expect(graph.datum.getExtentX()).toEqual([500, 550]);
      // ... therefore we have to test range limiting separately; in tag_spec.js

      done();

    });

    tagForm.input.val('range:500-550');
    expect(tagForm.input.val()).toBe('range:500-550');

    // tag submit form is not cleared because tagForm.el.bind('ajax:beforeSend'... is not triggered in jquery-ajax;
    // below attempt doesn't work; this also means "Loading..." is not cleared :-/
    //tagForm.el.trigger('ajax:beforeSend'); // fake this because jquery-ajax doesn't
    //expect(tagForm.input.val()).toBe('');

    tagForm.el.trigger('submit');

  });


  var tagDeletionCallbackSpy = jasmine.createSpy('success');

  it("should delete tags and remove them from display", function(done) {
 
    // this won't be intercepted by jasmine-ajax, boo: $('#tags .tagdelete').bind('ajax:success', function(){
    // so we need to be cleverer to delete via the interface:
    // $('.tags .list span:last .tagdelete').trigger('click');

    tag = graph.datum.addTag('range:520-530');

    // ensure it's there to be deleted:
    expect(graph.datum.getTag('range:520-530')).not.toBe(false);

    // anyways we can do it manually:
    graph.datum.getTag('range:520-530').destroy(function(tag) {

      expect(tag).toBeDefined(); // the response
    
      expect(graph.datum.getTag('range:520-530')).toBe(false);
    
      expect($('.tags .list span.label a:first').html()).not.toBe('range:520-530');

      var el = $("span#tag_" + tag.id);
      // display in Operations table;
      var operationEl = $("tr#tag_" + tag.id);

      expect(el.length).toBe(0); // the tag DOM element
      expect(operationEl.length).toBe(0); // the tag's DOM element in the Operations table
     
      tagDeletionCallbackSpy();
     
      done(); // complete asynchronous call

    });

  }); // takes a little longer, this one


  it("tag deletion callback is called", function() {

    expect(tagDeletionCallbackSpy).toHaveBeenCalled();

  });


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

    toolPane.form.close();
    expect($('.datum-tool-pane').is(':visible')).toBe(false);
    expect($(toolPane.form.el).find('.custom').html()).toBe('');
    expect(toolPane.form.formEl.is(':visible')).toBe(false);
    expect(toolPane.form.applyEl.html()).toBe('Apply');

    // only if it's a SpectraPane
    //expect(toolPane.form.spectrumApplyEl.html()).toBe('Apply');

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

    // figure out a callback to ensure the API call transform() has been called.

  });


  // test for toolPane teardown! 

  // Then a second toolPane, a spectraPane




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
