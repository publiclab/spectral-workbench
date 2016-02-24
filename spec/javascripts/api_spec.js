describe("API", function() {

  var graph, ajaxSpy;

  beforeEach(function() {

    fixture = loadFixtures('graph.html');

    jasmine.Ajax.install();

    ajaxSpy = spyOn($, "ajax").and.callFake(function(object) {

      var response;

      if      (object.url == '/spectrums/9.json') response = object.success(TestResponses.spectrum.success.responseText);
      else if (object.url == '/snapshots/1.json') response = object.success(TestResponses.snapshot.success.responseText);
      else if (object.url == '/spectrums/9/tags') response = object.success(TestResponses.tags.success.responseText);
      else if (object.url == '/spectrums/clone_calibration/9.json') response = object.success('success');
      else if (object.url == '/match/search/9.json') response = object.success([TestResponses.spectrum.success.responseText]); // return an array containing same spectrum
      else response = 'none';

      // check this if you have trouble faking a server response: 
      if (response != 'none') console.log('Faked response to:', object.url)
      else console.log('Failed to fake response to:', object.url)

    });

  });


  afterEach(function() {

    jasmine.Ajax.uninstall();

  });


  it("should be labelled version 2.0", function() {
    expect(new SpectralWorkbench.API().version).toBe('2.0');
  });


  var fetchSpectrumCallbackSpy;

  it("can fetch a spectrum with fetchSpectrum()", function(done) {

    fetchSpectrumCallbackSpy = jasmine.createSpy('success');

    SpectralWorkbench.API.Core.fetchSpectrum(9, function(spectrum) {

      expect(spectrum).toBeDefined();
      expect(spectrum.average).toBeDefined();
      expect(spectrum.average.length).toBe(spectrum.json.data.lines.length);
      expect(spectrum.snapshot).toBe(false);

      fetchSpectrumCallbackSpy();

      done();

    });

  });


  it("generates fetchSpectrum callback", function() {

    expect(fetchSpectrumCallbackSpy).toHaveBeenCalled();

  });


  var fetchSnapshotCallbackSpy;

  it("can fetch a snapshot with fetchSpectrum()", function(done) {

    fetchSnapshotCallbackSpy = jasmine.createSpy('success');

    SpectralWorkbench.API.Core.fetchSpectrum('9#1', function(spectrum) {

      expect(spectrum).toBeDefined();
      expect(spectrum.average).toBeDefined();
      expect(spectrum.average.length).toBe(spectrum.json.data.lines.length);

      fetchSnapshotCallbackSpy();

      done();

    });

  });


  it("generates fetchSpectrum callback for snapshots", function() {

    expect(fetchSpectrumCallbackSpy).toHaveBeenCalled();

  });


  // expensive to test this; also, let's put it in Spectrum?:
  it("can export SVG", function(done) {

    graph = new SpectralWorkbench.Graph({
      spectrum_id: 9,
      calibrated: true,
      onImageComplete: function() { done(); } // fires when graph.image is loaded, so that later tests can run
    });

    expect(graph).toBeDefined();
    expect(graph.datum).toBeDefined();
    expect(graph.datum instanceof SpectralWorkbench.Spectrum).toBe(true);

    var svgEl = SpectralWorkbench.API.Core.exportSVG('export');

    expect(svgEl).toBeDefined();
    expect(svgEl.attr('download')).toBeDefined();
    expect(svgEl.attr('href')).toBeDefined();

  });


  var copyCalibrationCallbackSpy;

  it("can copy calibrations with copyCalibration()", function(done) {

    copyCalibrationCallbackSpy = jasmine.createSpy('success');

    SpectralWorkbench.API.Core.copyCalibration(graph.datum, 9, function(response) {

      expect(response).toBeDefined();
      expect(response instanceof SpectralWorkbench.Spectrum).toBe(true);

      copyCalibrationCallbackSpy();

      done();

    });

    // graph should refresh with datum.fetch();

    // check extents
    expect(graph.datum.getFullExtentX()).toEqual([ 269.089, 958.521 ]);

  });


  it("generates copyCalibration callback", function() {

    expect(copyCalibrationCallbackSpy).toHaveBeenCalled();

  });


  it("can transform graph data", function() {

    expect(graph.datum.average[100]).toEqual({ y: 0.21, x: 355.376});

    // uses function(R,G,B,A,X,Y,I,P,a,r,g,b)
    SpectralWorkbench.API.Core.transform(graph.datum, 'R+G*X'); // random transform

    expect(graph.datum.average[100]).toEqual({ y: 53.526399999999995, x: 355.376 });

  });


  it("can limit graphed data to wavelength range", function() {

    expect(graph.datum.getFullExtentX()).toEqual([ 269.089, 958.521 ]);
    expect(graph.datum.getExtentX()).toEqual([ 269.089, 958.521 ]);

    SpectralWorkbench.API.Core.range(graph.datum, 500, 600);

    expect(graph.datum.getFullExtentX()).toEqual([ 269.089, 958.521 ]);
    expect(graph.datum.getExtentX()).not.toEqual([ 269.089, 958.521 ]);


  });


  var blendCallbackSpy;

  it("can blend graphed spectrum data with that of another spectrum", function(done) {

    blendCallbackSpy = jasmine.createSpy('success');

    expect(graph.datum.average[12].y).toEqual(245.37216); // we're actually looking after a bunch of operations above; transform, for example
    expect(graph.datum.average[12].x).toEqual(510.692); // look above 500nm, since we just range-limited above

    // uses function(R1,G1,B1,A1,R2,G2,B2,A2,X,Y,P)
    SpectralWorkbench.API.Core.blend(graph.datum, 9, 'R1+G2*100*X', function(blender) { // random transform

      blendCallbackSpy();

      expect(blender.average[280].y).toEqual(0.38);
      expect(blender.average[280].x).toEqual(510.692);

      expect(parseInt(graph.datum.average[12].y)).not.toEqual(245);
      expect(parseInt(graph.datum.average[12].y)).toEqual(24513);

      done();

    });

  });


  it("generates blendCalibration callback", function() {

    expect(blendCallbackSpy).toHaveBeenCalled();

  });


  var subtractCallbackSpy;

  it("can subtract indicated spectrum data from own data", function(done) {

    subtractCallbackSpy = jasmine.createSpy('success');

    expect(graph.datum.average[100].y).toEqual(40477.995);

    // uses function(R1,G1,B1,A1,R2,G2,B2,A2,X,Y,P)
    SpectralWorkbench.API.Core.subtract(graph.datum, 9, function() { // random transform

      subtractCallbackSpy();

      expect(graph.datum.average[100].y).toEqual(40477.315); // not quite zero, but close
      expect(graph.datum.average[100].y).not.toEqual(400);

      done();

    });

  });


  it("generates subtract callback", function() {

    expect(subtractCallbackSpy).toHaveBeenCalled();

  });


  it("can smooth graph data", function() {

    expect(graph.datum.average[100].y).toEqual(40477.315);

    SpectralWorkbench.API.Core.smooth(graph.datum, 20); // random transform

    expect(graph.datum.average[100].y).toEqual(28429.958321588158);

  });


  // fetch is already tested, in copyCalibration()
  // fetch: function(graph, id, callback) {


  it("can compare graph data from another spectrum", function() {

    SpectralWorkbench.API.Core.compare(graph, graph.datum); // just compare it to itself

    expect(graph.comparisons).toBeDefined();
    expect(graph.comparisons.length).toEqual(1);

    expect(graph.data.datum().length).toBe(5);

  });


  var similarCallbackSpy;

  it("can request list of similar spectra from server-side app", function(done) {

    similarCallbackSpy = jasmine.createSpy('success');

    // if we provide no callback, it'll run API.Core.compare
    SpectralWorkbench.API.Core.similar(graph, 9, 20, function(graph, spectrum) {

      similarCallbackSpy();

      expect(spectrum).toBeDefined();
      expect(spectrum.id).toBe(9);

      done();

    });

  });


  it("generates similar() callback", function() {

    expect(similarCallbackSpy).toHaveBeenCalled();

  });


  it("can find max peak in different channels with findMax()", function() {

    var max = SpectralWorkbench.API.Core.findMax(graph.datum.json.data.lines, 'red');
    expect(max.value).toBe(0);
    expect(max.index).toBe(0);

    var max2 = SpectralWorkbench.API.Core.findMax(graph.datum.json.data.lines, 'red', max.index + 1);
    expect(max2.value).toBe(0);
    expect(max2.index).toBe(0);

  });


  it("can attempt a calibration and return guessed peak positions with attemptCalibration()", function() {
    
    var peaks = SpectralWorkbench.API.Core.attemptCalibration(graph);
    expect(peaks.length).toBe(3);

  });


  it("can assess a calibration by comparing peak positions with calibrationFit()", function() {
    
    var error = SpectralWorkbench.API.Core.calibrationFit(100, 70, 10);
    expect(error).toBe(17.16461628588166);

  });


  it("can assess a calibration by using b and g peak positions to estimate an r position with calibrationFitGB()", function() {
    
    var error = SpectralWorkbench.API.Core.calibrationFitGB(545, 436, graph.datum);
    expect(error).toBe(0);

    // that isn't quite right. But it's possible there's no data given the wavelengths I provided.

  });


  it("can assess a calibration with RMSE using rmseCalibration()", function() {

    // very crappy, i.e. just guessed:     
    expect(parseInt(SpectralWorkbench.API.Core.rmseCalibration(graph.datum, 435.83, 546.07, 300, 500))).toBe(19);

    // derived from use of the interface itself: 
    expect(parseInt(SpectralWorkbench.API.Core.rmseCalibration(graph.datum, 435.83, 546.07, 193.24, 322.4))).toBe(12);
    expect(parseInt(SpectralWorkbench.API.Core.rmseCalibration(graph.datum, 435.83, 546.07, 193.24, 321.4))).toBe(7);
    expect(parseInt(SpectralWorkbench.API.Core.rmseCalibration(graph.datum, 435.83, 546.07, 193.24, 358.45))).toBe(25);
    expect(parseInt(SpectralWorkbench.API.Core.rmseCalibration(graph.datum, 435.83, 546.07, 183.23, 358.45))).toBe(27);
    expect(parseInt(SpectralWorkbench.API.Core.rmseCalibration(graph.datum, 435.83, 546.07, 193.24, 440.55))).toBe(30);
    expect(parseInt(SpectralWorkbench.API.Core.rmseCalibration(graph.datum, 435.83, 546.07, 102.13, 504.63))).toBe(147);

  });


  // don't test these yet:
  //alertOverexposure: function(datum) {
  //alertTooDark: function(datum) {


});
