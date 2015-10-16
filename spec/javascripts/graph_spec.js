
describe("Graph", function() {

  var graph, ajaxSpy;

  beforeEach(function() {

    loadFixtures('graph.html');

    jasmine.Ajax.install();

    jasmine.Ajax.stubRequest('spectrums/9.json').andReturn(TestResponses.spectrum.success)
    jasmine.Ajax.stubRequest('spectrums/9/tags').andReturn(TestResponses.tags.success)

    ajaxSpy = spyOn($, "ajax").and.callFake(function(object) {

      if      (object.url == '/spectrums/9.json') object.success(TestResponses.spectrum.success.responseText);
      else if (object.url == '/spectrums/9/tags') object.success(TestResponses.tags.success.responseText);

      // uncomment the following if we're triggering on a .done() method 
      // instead of a success callback in jQuery ajax:
      /*
      this.done = function (callback) {
          callback({});
          wasSuccessful = true;
          return this;
      }
      */

    });


  });

  afterEach(function() {

    jasmine.Ajax.uninstall();

  });

  it("is not undefined when initialized with a spectrum_id", function() {

    graph = new SpectralWorkbench.Graph({ spectrum_id: 9 });

    expect(graph).toBeDefined();
    expect(graph.datum).toBeDefined();

    // we'd like to test the URL, but if it's wrong, it won't get the right faked data anyways:
    // and this doesn't work with the ajaxSpy method:
    /*
    var request = jasmine.Ajax.requests.mostRecent();

    expect(request.url).toBe('/spectrums/9.json');
    expect(request.method).toBe('GET');
    //expect(request.data()).toEqual({latLng: ['40.019461, -105.273296']});
    */

  });

  var callback;

  it("is not undefined when initialized with range", function(done) {

    callback = jasmine.createSpy('success');

    graph = new SpectralWorkbench.Graph({
      spectrum_id: 9,
      calibrated: true,
      range: [400, 800],
      onComplete: callback,
      onImageComplete: function() { done(); } // fires when graph.image is loaded, so that later tests can run

    });

    expect(graph).toBeDefined();
    expect(graph.datum).toBeDefined();

  });

  it("fires onComplete event when done initializing", function() {

    expect(callback).toHaveBeenCalled();
    expect(callback).toHaveBeenCalledWith(true);
    expect(callback).not.toHaveBeenCalledWith(false);

  });

  it("is has basic initialized attributes and methods", function() {

    expect(graph.dataType).toBe('spectrum');
    expect(graph.asdgasj).not.toBeDefined(); // counter test

    expect(graph.datum).toBeDefined();
    expect(graph.chart).toBeDefined();

    expect(graph.API).toBeDefined();

    // expect(graph.width).toBe(600); // this prob depends on the container
    expect(graph.zooming).toBe(false);
    expect(graph.el.html()).toBeDefined();
    expect(graph.imgEl.html()).toBeDefined();
    expect(graph.svg).toBeDefined();

    expect(graph.svg).toBeDefined();
    expect(graph.tagForm instanceof SpectralWorkbench.UI.TagForm).toBe(true); 

  });

  it("width and image not to be undefined", function() {

    expect(graph.width).toBeDefined();
    expect(graph.extent).toBeDefined();
    expect(graph.fullExtent).toBeDefined();
    expect(graph.image).toBeDefined();

    expect(graph.image.width).toBeDefined();

  });

  it("imagePxToDisplayPx() converts an x-coordinate pixel value from image space to a display space pixel value", function() {

    expect(graph.imagePxToDisplayPx(500)).toBe(551.25);

  });

  it("displayPxToImagePx() converts an x-coordinate pixel value from display space to an image space pixel value", function() {

    expect(graph.displayPxToImagePx(500)).toBe(453.51473922902494);

  });

  it("displayPxToNm() accepts x-coordinate in display space as shown on page & returns wavelength in nanometers", function() {

    // Unlike datum.pxToNm, does not rely on an image or its dimensions.
    expect(graph.displayPxToNm(500)).toBe(659.9234671201814);

  });

  it("nmToDisplayPx() accepts wavelength in nanometers & returns x-coordinate in display space as shown on page", function() {

    expect(graph.nmToDisplayPx(500)).toBe(295.4076718226018);

  });

  it("pxToNm() accepts x,y in graph UI pixel space, returns {x: x, y: y} in data space in nanometers", function() {

    /*
     * (or pixels if uncalibrated) -- note that
     * that point may not exist in datum, but you can use
     * datum.getNearestPoint(x) to find something close.
     * Pass false for x or y to convert only one coordinate.
     */
    expect(graph.pxToNm(500)).toEqual({ x: 659.9234671201814, y: false });

  });

  it("getSpectrumById() only works for sets", function() {

    expect(graph.getSpectrumById(9)).not.toBeDefined();

  });




    // test these too: 

    /* ======================================
     * Refresh datum into DOM in d3 syntax
     */
//    graph.reload = function() {


    /* ======================================
     * Refresh graph element in d3 syntax, 
     * then resize image
     */
//    graph.refresh = function() {
    

//    graph.updateSize()();

    /* ======================================
     * Toggle zooming and panning, via a "brushing" interface
     */
//    graph.zoom = function() {

    /* ======================================
     * Dim graph, such as while it's loading
     */
//    graph.opacity = function(amount) {

    // won't yet test:
    // graph.toggleUnits()

    /* ======================================
     * set up initial d3 graph using nvd3 template
     */
//    graph.graphSetup: function() {

});

