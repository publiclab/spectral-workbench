
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

  it("is not undefined when initialized with range", function() {

    graph = new SpectralWorkbench.Graph({
      spectrum_id: 9,
      calibrated: true,
      range: [400, 800]
    });

    expect(graph).toBeDefined();
    expect(graph.datum).toBeDefined();

  });

  it("fires onComplete event when done initializing", function() {

    var callback = jasmine.createSpy('success');

    graph = new SpectralWorkbench.Graph({
      spectrum_id: 9,
      calibrated: true,
      onComplete: callback 
    });

    expect(callback).toHaveBeenCalled();
    expect(callback).toHaveBeenCalledWith(true);
    expect(callback).not.toHaveBeenCalledWith(false);

  });

  it("is has basic initialized attributes and methods", function() {

    graph = new SpectralWorkbench.Graph({ spectrum_id: 9 });

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

      //graph.tagForm instanceof SpectralWorkbench.UI.TagForm); 
      //graph.chart

    /* ======================================
     * Refresh datum into DOM in d3 syntax
     */
//    graph.reload = function() {


    /* ======================================
     * Refresh graph element in d3 syntax, 
     * then resize image
     */
//    graph.refresh = function() {
    
    /* ======================================
     * Converts an x-coordinate pixel value from image space 
     * to a display space pixel value
     */
//    graph.imagePxToDisplayPx = function(x) {

    /* ======================================
     * Converts an x-coordinate pixel value from display space 
     * to an image space pixel value
     */
//    graph.displayPxToImagePx = function(x) {

    /* ======================================
     * Accepts x-coordinate in display space as shown 
     * on page & returns wavelength in nanometers.
     * Unlike datum.pxToNm, does not rely on an image or its dimensions.
     */
//    graph.displayPxToNm = function(x) {

    /* ======================================
     * Accepts wavelength in nanometers & returns
     * x-coordinate in display space as shown on page.
     */
//    graph.nmToDisplayPx = function(nm) {

    /* ======================================
     * Accepts x,y in graph UI pixel space, returns
     * {x: x, y: y} in data space in nanometers
     * (or pixels if uncalibrated) -- note that
     * that point may not exist in datum, but you can use
     * datum.getNearestPoint(x) to find something close.
     * Pass false for x or y to convert only one coordinate.
     */
//    graph.pxToNm = function(x, y) {

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
     * Gets a spectrum object by its <id> if it exists in this graph.
     * Maybe we should have a fetchSpectrum which can get them remotely, too?
     */
//    graph.getSpectrumById = function(id) {

    /* ======================================
     * set up initial d3 graph using nvd3 template
     */
//    graph.graphSetup: function() {


  });


});

