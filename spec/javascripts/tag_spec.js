// this is a tough one to test, with lots of asynchronicity :-/
// however, many errors can be avoided by testing pre-existing tags
// to avoid needing to deal with asynchronicity.

// for further refinement, we might begin nesting asynchronous calls as in https://github.com/jasmine/jasmine/issues/526
// and nesting describe() and it() calls to break up long nested runs
describe("Tag", function() {

  var graph, tag, ajaxSpy;


  beforeEach(function() {

    loadFixtures('graph.html');

    jasmine.Ajax.install();

    ajaxSpy = spyOn($, "ajax").and.callFake(function(object) {

      var response;

      if      (object.url == '/spectrums/9.json') response = object.success(TestResponses.spectrum.success.responseText);
      else if (object.url == '/spectrums/9/tags') response = object.success(TestResponses.tags.success.responseText);
      // the following is only faked properly for the 'sodium' tag, of course:
      else if (object.url == '/tags')             response = object.success({'saved':{'sodium': {'id': 1}}}); // && object.method == "PUT" // method doesn't work and isn't necessary as of yet
      else if (object.url == '/tags/1' || object.url == '/tags/42') response = object.success('success'); // && object.method == "DELETE"
      else response = 'none';

      // check this if you have trouble faking a server response: 
      if (response != 'none') console.log('Faked response to:', object.url)
      else console.log('Failed to fake response to:', object.url)

    });

  });


  afterEach(function() {

    jasmine.Ajax.uninstall();

  });


  var initCallbackSpy;

  it("spectrum is initialized", function(done) {

    initCallbackSpy = jasmine.createSpy('success');

    graph = new SpectralWorkbench.Graph({
      spectrum_id: 9,
      calibrated: true,
      onComplete: initCallbackSpy,
      onImageComplete: function() { done(); } // fires when graph.image is loaded, so that later tests can run

    });

    expect(graph).toBeDefined();
    expect(graph.datum).toBeDefined();

  });


  it("spectrum init callback is called", function() {

    expect(initCallbackSpy).toHaveBeenCalled();

  });


  var addTagCallbackSpy = jasmine.createSpy('success');

  it("creates properly for simple tagname like 'sodium', and returns with datum.getTag()", function(done) {

    tag = graph.datum.addTag('sodium', function(tag, ajaxResponse) {

      // beware; these can fail silently if this callback is not called; add a toHaveBeenCalled() test

      expect(tag.json).toBeDefined();
      expect(tag.id).toBeDefined(); // not defined because we're not uploading it?
      expect(tag.id).toBe(1);

      addTagCallbackSpy();

      // if this completes before the remainder of the tests in this spec, those can fail silently
      done();

    });

    // tag should then be parsed

    expect(tag).toBeDefined();
    expect(tag.uploadable).toBe(true);
    expect(tag.json).toEqual({});

    // Why would this already be accessible? Shouldn't this all be run in the callback?
    // Actually, we don't wait for the callback to instantiate the tag; we cheat and just add it.
    // (see Datum.addTag()) However, the tag most likely won't yet have an id, 
    // unless the async call beats it to completion:
    var gottenTag = graph.datum.getTag('sodium');

    expect(gottenTag).toBeDefined();
    expect(gottenTag).not.toBe(false);

    // confirm it's not a powertag
    expect(gottenTag.key).not.toBeDefined();
    expect(gottenTag.value).not.toBeDefined();
    expect(gottenTag.powertag).toEqual(false);

  });


  it("datum.addTag callback is called", function() {

    expect(addTagCallbackSpy).toHaveBeenCalled();

  });


  var deletionCallbackSpy = jasmine.createSpy('success');

  it("deletes pre-existing tag 'upload' with datum.removeTag()", function(done) {

    graph.datum.removeTag('upload', function(tag) {

      expect(tag).toBeDefined(); // the removed tag is returned

      expect(graph.datum.getTag('upload')).toBe(false);

      deletionCallbackSpy();

      done(); // complete asynchronous call

    });

  });


  it("deletion callback is called", function() {

    expect(deletionCallbackSpy).toHaveBeenCalled();

  });


  it("creates powertag 'range' and applies effect in graph data, then removes effect upon tag deletion", function(done) {

    // test that the graph is not range-limited
    tag = graph.datum.addTag('range:400-700', function(tag) {

      // not to be a powertag:
      expect(tag.key).toBeDefined();
      expect(tag.key).toBe('range');
      expect(tag.value).toBeDefined();
      expect(tag.value).toBe('400-700');
      expect(tag.powertag).toEqual(true);

      // apply the powertag! It may have been parsed already but we try again to be sure. 
      graph.datum.parseTag(tag);

      expect(graph.datum.getExtentX()[0]).toBeGreaterThan(400); // only within 400-700 range
      expect(graph.datum.getExtentX()[1]).toBeLessThan(700); // only within 400-700 range
      expect(graph.datum.getExtentX()).toEqual([400.245, 698.798]); // only within 400-700 range

      // in normal async in production, tag would've been added to graph.datum.tags, 
      // but fake async is too fast and it's not there yet

      // so we can't run removeTag without a slight delay: 
      setTimeout(function() {

        tag.id = 1; // fake the id because normally this'd be added but we're doing things too fast;
        graph.datum.removeTag('range:400-700', function() {
 
          // test that the graph is not range-limited:
    
          expect(graph.datum.getTag('range:400-700')).toBe(false);
          expect(graph.datum.getExtentX()).not.toEqual([400.245, 697.935]); // only within 400-700 range
          expect(graph.datum.getExtentX()[0]).not.toBeGreaterThan(400); // only within 400-700 range
          expect(graph.datum.getExtentX()[1]).not.toBeLessThan(700); // only within 400-700 range
          expect(graph.datum.getExtentX()).toEqual([269.089, 958.521]);
  
          done();
    
        });
      }, 2000);

    });

    expect(tag).toBeDefined();

  }, 10000); // extra wait for this mega nested spec

});
