describe("Operation", function() {

  var graph, tag, ajaxSpy;

  beforeEach(function() {

    loadFixtures('graph.html');

    jasmine.Ajax.install();

    ajaxSpy = spyOn($, "ajax").and.callFake(function(object) {

      var response;

      if      (object.url == '/spectrums/9.json') response = object.success(TestResponses.spectrum.success.responseText);
      else if (object.url == '/spectrums/9/tags') response = object.success(TestResponses.powertags.success.responseText);
      else if (object.url == '/snapshots/4.json') response = object.success(TestResponses.snapshot.success.responseText);
      else if (object.url == '/tags')             response = object.success({ 'saved': { 'sodium': { 'id': 1 } } });
      else response = 'none';

      // check this if you have trouble faking a server response: 
      if (response != 'none') console.log('Faked response to:', object.url)
      else console.log('Failed to fake response to:', object.url)

    });

  });


  afterEach(function() {

    jasmine.Ajax.uninstall();

  });


  var operationInitCallbackSpy;

  it("spectrum is initialized", function(done) {

    operationInitCallbackSpy = jasmine.createSpy('success');

    graph = new SpectralWorkbench.Graph({
      spectrum_id: 9,
      calibrated: true,
      onComplete: function(_graph) {

        expect(_graph.svg.style('opacity')).toBe('1');

        operationInitCallbackSpy(); // ensure this was run all the way to the end

      },
      onImageComplete: function() { done(); } // fires when graph.image is loaded, so that later tests can run

    });

    expect(graph).toBeDefined();
    expect(graph.datum).toBeDefined();

    graph.dim();
    expect(graph.svg.style('opacity')).toBe('0.5'); // dimmed

  });


  it("spectrum init callback is called", function() {

    expect(operationInitCallbackSpy).toHaveBeenCalled();

  });


  it("calls back for passive powertags that are uploadable", function(done) {

    graph = new SpectralWorkbench.Graph({
      spectrum_id: 9,
      calibrated: true,
      onComplete: function(_graph) {

        expect(_graph.svg.style('opacity')).toBe('1'); // undimmed
 
        tag = _graph.datum.addTag('error:1', function(tag) {

          done();

        });

      }

    });

  });


  it("calls back for passive powertags that aren't uploadable", function(done) {

    graph = new SpectralWorkbench.Graph({
      spectrum_id: 9,
      calibrated: true,
      onComplete: function(_graph) {

        expect(_graph.svg.style('opacity')).toBe('1'); // undimmed
  
        tag = _graph.datum.addTag('error:1', false, {}); // add empty object as third arg to mark this as not-uploadable

        // since this is ad-hoc, we must parse it and send the 
        tag.parse(function(tag) {

          done();

        });

      }

    });

  });


  //var crossSectionCallbackSpy = jasmine.createSpy('success');

  // To do this properly, we'd have to test spectrum.imgToJSON(),
  // which requires an actual image and canvas, which our 
  // test setup lacks. 
  xit("properly parses crossSection operation", function(done) {

    // check that it's calibrated
    expect(graph.datum.json.data.lines[0].wavelength).toBeDefined();

    // check spectrum.average vs. spectrum.json.data.lines
    expect(graph.datum.json.data.lines[0].wavelength).toBe(269.089);
    expect(graph.datum.average[0].x).toBe(269.089);
    // set initial amplitude expectation
    expect(graph.datum.json.data.lines[0].average).toBe(64.3333);

    // override the default crossSection for the 2nd row of pixels (example image should be 2px high)
    tag = graph.datum.addAndUploadTag('crossSection:1', function(tag) {

      // check that it's uncalibrated
      expect(graph.datum.average[0].x).not.toBe(269.089);
      expect(graph.datum.average[0].x).toBe(0);

      // check the json against the older json
      expect(graph.datum.json.data.lines[0].wavelength).not.toBe(269.089);
      expect(graph.datum.json.data.lines[0].wavelength).toBeUndefined();
      expect(graph.datum.json.data.lines[0].pixel).toBe(0);
      expect(graph.datum.json.data.lines[0].average).not.toBe(64.3333);

      crossSectionCallbackSpy();

      done(); // complete asynchronous call

    });

  });


  xit("crossSection parse() callback is called", function() {

    expect(crossSectionCallbackSpy).toHaveBeenCalled();

  });


  var calibrateCallbackSpy = jasmine.createSpy('success');

  it("properly parses calibrate operation", function(done) {

    // manually uncalibrate it:
    graph.datum.json.data.lines.forEach(function(line, i) {

      line.wavelength = null;
      line.pixel = i;

    });

    graph.datum.load();

    // confirm that that worked:
    expect(graph.datum.json.data.lines[0].wavelength).toBe(null);
    expect(graph.datum.average[0].x).toBe(0);
    // check graph extents
    expect(graph.datum.getFullExtentX()[0]).toBe(0);
    expect(graph.datum.getFullExtentX()[1]).toBe(799);

    // If we switch to disallowing copying calibrations from un-snapshotted-spectra, 
    // we'll have to test the case where there's no snapshot on the copied in calibration.
    tag = graph.datum.addAndUploadTag('calibrate:9#4', function(tag) {

      // test that addTags fetches a snapshot
      expect(tag.value_with_snapshot).toEqual("9#4");
      expect(tag.name_with_reference).toEqual("calibrate:9#4");
      expect(tag.value).toEqual("9");

      // check that the calibration was applied
      // check datum.average
      expect(graph.datum.average[0].x).not.toEqual(0);
      // check datum.json
      expect(graph.datum.json.data.lines[0].wavelength).toBe(269.089);
      expect(graph.datum.json.data.lines[0].wavelength).not.toBe(null);
      expect(graph.datum.json.data.lines[0].pixel).toBe(0); // pixel positions will still be there after adding wavelengths
      // check graph extents
      expect(graph.datum.getFullExtentX()[0]).toBe(269.089);
      expect(graph.datum.getFullExtentX()[1]).toBe(958.521);

      calibrateCallbackSpy();

      done(); // complete asynchronous call

    });

  });


  it("calibrate parse() callback is called", function() {

    expect(calibrateCallbackSpy).toHaveBeenCalled();

  });


  xit("properly parses linearCalibration operation", function(done) {
  });


  xit("properly clears after destroying crossSection operation", function(done) {
  });


});
