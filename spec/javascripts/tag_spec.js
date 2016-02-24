// this is a tough one to test, with lots of asynchronicity :-/
// however, many errors can be avoided by testing pre-existing tags
// to avoid needing to deal with asynchronicity.

// for further refinement, we might begin nesting asynchronous calls as in https://github.com/jasmine/jasmine/issues/526
// and nesting describe() and it() calls to break up long nested runs
describe("Tag", function() {

  var graph, tag, ajaxSpy, request;


  beforeEach(function() {

    loadFixtures('graph.html');

    jasmine.Ajax.install();

    ajaxSpy = spyOn($, "ajax").and.callFake(function(object) {

      var response;

      // object.method == "PUT" // object.method doesn't work :-/
      if      (object.url == '/spectrums/9.json') response = object.success(TestResponses.spectrum.success.responseText);
      else if (object.url == '/spectrums/latest_snapshot_id/3') response = object.success('4'); // duplicate for id=3
      else if (object.url == '/spectrums/3.json') response = object.success(TestResponses.spectrum.success.responseText); // duplicate for id=3
      else if (object.url == '/spectrums/9/tags') response = object.success(TestResponses.tags.success.responseText);
      // the following faked response is shared among several specs:
      else if (object.url == '/tags')             response = object.success({'saved':{'sodium':        {'id': 1}, 
                                                                                      'subtract:3':    {'id': 2, 'snapshot_id': 5, 'name': 'subtract:3#4'},
                                                                                      'smooth:3':      {'id': 2, 'snapshot_id': 5},
                                                                                      'range:400-700': {'id': 3, 'snapshot_id': 6}
                                                             }}); 
      else if (object.url == '/snapshots/4.json') response = object.success(TestResponses.snapshot.success.responseText);
      else if (object.url == '/tags/1' || object.url == '/tags/42') response = object.success('success'); // && object.method == "DELETE"
      else if (object.url == '/tags/99') response = object.error({ responseJSON: { 'has_dependent_spectra': true } }); // && object.method == "DELETE"
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


  it("creates properly for simple tagname like 'sodium', and returns with datum.getTag()", function() {

    // as of Snapshots, this is synchronous:
    tag = graph.datum.addTag('sodium');

    expect(tag.json).toBeDefined();
    expect(tag.id).not.toBeDefined(); // not defined (yet) because we're not waiting for it to be uploaded

    // tag should then be parsed

    expect(tag).toBeDefined();
    expect(tag.uploadable).toBe(true);
    expect(tag.json).toEqual({});

    expect(graph.datum.tags.length).not.toBe(0);

    var gottenTag = graph.datum.getTag('sodium');

    expect(gottenTag).toBeDefined();
    expect(gottenTag).not.toBe(false);

    // confirm it's not a powertag
    expect(gottenTag.key).not.toBeDefined();
    expect(gottenTag.value).not.toBeDefined();
    expect(gottenTag instanceof SpectralWorkbench.PowerTag).toEqual(false);
    expect(gottenTag.snapshot_id).not.toBeDefined();

  });


  var deletionCallbackSpy = jasmine.createSpy('success');

  it("deletes pre-existing tag 'sodium' with datum.getTag().remove()", function(done) {

    var taglength = graph.datum.tags.length;

    graph.datum.getTags('sodium', function(tag) {

      tag.id = 1; // fake the id because normally this'd have been added upon creation response from server;

      tag.destroy(function(deletedTag) {

        expect(deletedTag).toBeDefined(); // the removed tag is returned
 
        expect(taglength - graph.datum.tags.length).toBe(1);
        expect(graph.datum.getTag('sodium')).toBe(false); // this won't work if there's more than 1 'upload' tag

        // explicitly check that this exact tag is no longer listed; 
        // not just a tag with the same name:
        expect(graph.datum.tags.indexOf(deletedTag)).toBe(-1); 

        deletionCallbackSpy();

        done(); // complete asynchronous call

      });

    });

  });


  it("deletion callback is called", function() {

    expect(deletionCallbackSpy).toHaveBeenCalled();

  });


  var errorDeletionCallbackSpy = jasmine.createSpy('success');

  it("indicates deletion failure of powertag 'smooth:3' due to server's finding that tag.has_dependent_spectra is true; another spectrum relies on it", function(done) {

    // first create the tag:
    graph.datum.addAndUploadTag('smooth:3', function() {

      var taglength = graph.datum.tags.length;

      graph.datum.getTags('smooth:3', function(tag) {
 
        tag.id = 99; // fake the id to trigger rejected deletion

        expect(tag.has_dependent_spectra).not.toBe(true); // this should not yet be set

        var index = graph.datum.tags.indexOf(tag);
 
        tag.destroy(function(response, deletedTag) {

          expect(deletedTag).toBeDefined(); // the removed tag is returned
          expect(deletedTag.has_dependent_spectra).toBe(true); // this should have blocked deletability
          expect(taglength - graph.datum.tags.length).toBe(0); // no change
          expect(graph.datum.getTag('smooth:3')).not.toBe(false); // should still be there
 
          // explicitly check that this exact tag is still listed; 
          expect(graph.datum.tags.indexOf(deletedTag)).toBe(index); 
          expect(graph.datum.tags.indexOf(deletedTag)).not.toBe(-1); 

          // check interface for spinner; 
          // we can't do this because we've changed tag.id! 
          /* 
          expect($('tr#tag_' + tag.id + ' .label i.fa').length).not.toBe(0);
          expect($('tr#tag_' + tag.id + ' .label i.fa').hasClass('fa-spinner')).toBe(false);
          expect($('tr#tag_' + tag.id + ' .label i.fa').hasClass('fa-alert')).toBe(true);
          */
 
          errorDeletionCallbackSpy();
 
          done(); // complete asynchronous call
 
        });
 
      });

    });

  });


  it("errored deletion callback is called", function() {

    expect(errorDeletionCallbackSpy).toHaveBeenCalled();

  });


  it("creates powertag.data after creation, and preps correct version for upload", function() {

    var data = JSON.stringify({'lines': graph.datum.encodeJSON()});

    tag = graph.datum.addAndUploadTag('subtract:3', function(tag) {

      // _tag.data = JSON.stringify({'lines': _tag.datum.encodeJSON()});
      expect(tag.data).not.toBeUndefined();
      expect(tag.data).not.toEqual(data); // it should've changed from the subtraction

    });

  });


  var creationCallbackSpy = jasmine.createSpy('success');

  it("creates powertag 'subtract' and is aware of specified snapshot reference #4", function() {

    tag = graph.datum.addAndUploadTag('subtract:3', function(tag) {

      var request = $.ajax.calls.mostRecent().args[0];
 
      // check the outgoing request
      expect(request.url).toEqual('/tags');
      expect(request.type).toBe('POST');
      // check for tag.data to be populated, so a snapshot can be made:
      expect(request.data.tag.data).toBeDefined();
      // data should be a string, actually, for the server:
      var json = JSON.parse(request.data.tag.data);
      expect(json.lines.length).toBeGreaterThan(1);
      expect(json.lines[0].average).toEqual(36.44);

      expect(tag.key).toBeDefined();
      expect(tag.key).toBe('subtract');
      expect(tag.value).toBeDefined();
      expect(tag.value).toBe('3');
      expect(tag.has_reference).toBe(true);
      expect(tag.reference_id).toBe(4);
      expect(tag instanceof SpectralWorkbench.PowerTag).toEqual(true);
      expect(tag.needs_snapshot).toBe(true);
      expect(tag.snapshot_id).toBeDefined();
      expect(tag.snapshot_id).toEqual(5);
      // apply the powertag! It may have been parsed already but we try again to be sure. 
//      tag.parse();
      expect(tag.data).not.toBeUndefined();

      // should have cached a data snapshot locally:
      expect(typeof tag.data).toBe('string');
      expect(JSON.parse(tag.data)['lines'][0]['wavelength']).toEqual(graph.datum.average[0].x);
      expect(JSON.parse(tag.data)['lines'][0]['wavelength']).not.toEqual(graph.datum.average[0].x + 1);
      expect(JSON.parse(tag.data)['lines'][0]['r']).toEqual(+(graph.datum.red[0].y * 255).toPrecision(4));
      expect(JSON.parse(tag.data)['lines'][0]['r']).not.toEqual(graph.datum.red[0].y + 1);
      expect(JSON.parse(tag.data)['lines'][0]['r']).not.toEqual(graph.datum.json.data.lines[0].r);

      creationCallbackSpy();

    });

  });


  it("creation callback is called", function() {

    expect(creationCallbackSpy).toHaveBeenCalled();

  });


  it("creates powertag 'range' and applies effect in graph data, then removes effect upon tag deletion", function(done) {

    var operationTable = $('table.operations');

    expect(operationTable.find('tr.operation-tag .operations-tools .operation-tag-delete').length).toBe(0);

    // test that the graph is not range-limited
    tag = graph.datum.addAndUploadTag('range:400-700', function(tag) {

      // not to be a powertag:
      expect(tag.key).toBeDefined();
      expect(tag.key).toBe('range');
      expect(tag.value).toBeDefined();
      expect(tag.value).toBe('400-700');
      expect(tag instanceof SpectralWorkbench.PowerTag).toEqual(true);
      expect(tag.needs_snapshot).toEqual(true);
      expect(tag.snapshot_id).toBeDefined();
      expect(tag.snapshot_id).toEqual(6);

      // apply the powertag! It may have been parsed already but we try again to be sure. 
      tag.parse();

      // should have cached a data snapshot locally:
      expect(tag.data).not.toBeUndefined();
      expect(typeof tag.data).toBe('string');
      expect(tag.has_dependent_spectra).not.toBe(true); // because we set this in the faked response, to test

      expect(graph.datum.getExtentX()[0]).toBeGreaterThan(400); // only within 400-700 range
      expect(graph.datum.getExtentX()[1]).toBeLessThan(700); // only within 400-700 range
      expect(graph.datum.getExtentX()).toEqual([400.2, 697.9]); // only within 400-700 range, and 4 sig figs

      expect(operationTable.find('tr.operation-tag .operations-tools .operation-tag-delete').length).toBe(1);
      expect(operationTable.find('tr.operation-tag:last .operations-tools .operation-tag-delete').css('display')).toBe('inline');

      // in normal async in production, tag would've been added to graph.datum.tags, 
      // but fake async is too fast and it's not there yet

      // so we can't run removeTag without a slight delay: 
      setTimeout(function() {

        tag.id = 1; // fake the id because normally this'd be added but we're doing things too fast;
        tag.destroy(function(tag) {
 
          // test that the graph is not range-limited:
    
          expect(graph.datum.getTag('range:400-700')).toBe(false);
          expect(graph.datum.getExtentX()).not.toEqual([400.245, 697.935]); // only within 400-700 range
          expect(graph.datum.getExtentX()[0]).not.toBeGreaterThan(400); // only within 400-700 range
          expect(graph.datum.getExtentX()[1]).not.toBeLessThan(700); // only within 400-700 range
          expect(graph.datum.getExtentX()).toEqual([269.1, 958.5]);

          expect(operationTable.find('tr.operation-tag .operations-tools .operation-tag-delete').length).toBe(0);
  
          done();
    
        });
      }, 2000);

    });

    expect(tag).toBeDefined();

  }, 10000); // extra wait for this mega nested spec

});
