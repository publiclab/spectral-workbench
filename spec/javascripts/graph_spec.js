describe("Graph", function() {

  var graph, ajaxSpy;


  beforeEach(function() {

    fixture = loadFixtures('graph.html');

    jasmine.Ajax.install();

    ajaxSpy = spyOn($, "ajax").and.callFake(function(object) {

      var response;

      if      (object.url == '/spectrums/9.json') response = object.success(TestResponses.spectrum.success.responseText);
      else if (object.url == '/spectrums/9/tags') response = object.success(TestResponses.tags.success.responseText);
      else response = 'none';

      // check this if you have trouble faking a server response: 
      if (response != 'none') console.log('Faked response to:', object.url)
      else console.log('Failed to fake response to:', object.url)

    });


  });

  afterEach(function() {

    jasmine.Ajax.uninstall();

  });


  it("is not undefined when initialized with a spectrum_id", function() {

    graph = new SpectralWorkbench.Graph({ spectrum_id: 9 });

    expect(graph).toBeDefined();
    expect(graph.datum).toBeDefined();
    expect(graph.dataType).toBe('spectrum');

    // we'd like to test the URL, but if it's wrong, it won't get the right faked data anyways:
    // and this doesn't work with the ajaxSpy method:
    /*
    var request = jasmine.Ajax.requests.mostRecent();

    expect(request.url).toBe('/spectrums/9.json');
    expect(request.method).toBe('GET');
    //expect(request.data()).toEqual({latLng: ['40.019461, -105.273296']});
    */

  });


  xit("makes imgContainer match width of graph bounds", function() {

     expect(d3.select('.nv-series-0')[0][0].getBBox().width).toBe(graph.width - 10); // 10 is the "extra"

  });


  var callback;


  // This should be deprecated once we move to purely tag-based ranges;
  // instead we can set the range after init? 
  it("is not undefined when initialized with range", function(done) {

    callback = jasmine.createSpy('success');

    graph = new SpectralWorkbench.Graph({
      spectrum_id: 9,
      calibrated: true, // 269.089 to 958.521
      range: [400, 800],
      onComplete: callback,
      onImageComplete: function() { done(); } // fires when graph.image is loaded, so that later tests can run

    });

    expect(graph).toBeDefined();
    expect(graph.datum).toBeDefined();

  });


  it("fires onComplete event when done initializing", function() {

    expect(callback).toHaveBeenCalled();
    expect(callback).not.toHaveBeenCalledWith(undefined);
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
    expect(graph.fullExtent[1] - graph.fullExtent[0]).toBeGreaterThan(graph.extent[1] - graph.extent[0]);
    expect(graph.image).toBeDefined();
    expect(graph.image.imgEl).toBeDefined();
    expect(graph.image.width).toBeDefined();

  });


  var originalPxPerNm;

  it("imagePxToDisplayPx() converts an x-coordinate pixel value from image space to a display space pixel value", function() {

    originalPxPerNm = originalPxPerNm = graph.image.width / (graph.fullExtent[1] - graph.fullExtent[0]);

    // image 800px wide (graph.image.width), normally displayed at 800px, 
    // but with 400-800 range limiting pushing it wider; 1189.27px
    // source spectrum goes from 269.089nm to 958.521nm, or a range of 689.432nm
    // so, 130.911nm between start and range start (400)
    // and 158.521nm between range end (800) and end
    // leaving 400.0nm displayed range
    // and pxPerNm should be 1.1603754975109946
    // margins make displayed image width more difficult to calculate:
    // default margin = { top: 10, right: 30, bottom: 20, left: 70 }; but right margin is not used in image display
    // but we can use graph.imgEl.width() for the final displayed width:

    // 130 nm in original image pixels; 
    expect(Math.round(graph.imagePxToDisplayPx(originalPxPerNm * 130.911))).toBeCloseTo(0);
    // graph.width is 690px, displayed image, cropped

    var rightEdgeNm = 689.432 - 158.521; // full range in nm minus hidden right side should be right edge in nm
    expect(Math.round(graph.imagePxToDisplayPx(originalPxPerNm * rightEdgeNm))).toBeCloseTo(Math.round(graph.imgContainer.width())); 

  });

  it("imagePxToDisplayPx() converts an x-coordinate pixel value from image space to a display space pixel value without range", function() {

    var range = graph.range;
    graph.range = false;
    graph.datum.load();
    graph.updateSize()();

    /*
      image should be 680px wide as seen by viewer,
      so 500/800 = 0.625, times 680 = 425
    */

    expect(graph.imgContainer.width()).toBe(680);
    expect(graph.imagePxToDisplayPx(500)).toBeCloseTo(425);

    graph.range = range;
    graph.datum.load();
    graph.updateSize()();

  });


  it("displayPxToImagePx() converts an x-coordinate pixel value from display space to an image space pixel value", function() {

    // toBeCloseTo(0, 1) syntax doesn't seem to work for precision?
    expect(Math.round(graph.displayPxToImagePx(0))).toBeCloseTo(Math.round(originalPxPerNm * 130.911));
    var rightEdgeNm = 689.432 - 158.521; // displayed range in nm (~400) minus hidden right side should be right edge in nm
    expect(Math.round(graph.displayPxToImagePx(graph.width))).toBeCloseTo(Math.round(originalPxPerNm * rightEdgeNm));
    //expect(graph.displayPxToImagePx(500)).toBeCloseTo(606.060606060606);

  });


  it("displayPxToNm() accepts x-coordinate in display space as shown on page & returns wavelength in nanometers", function() {

    // Unlike datum.pxToNm, does not rely on an image or its dimensions.
    expect(graph.displayPxToNm(0)).toBeCloseTo(graph.extent[0]);
    expect(graph.displayPxToNm(graph.width)).toBeCloseTo(graph.extent[1]);

  });


  it("nmToDisplayPx() accepts wavelength in nanometers & returns x-coordinate in display space as shown on page", function() {

    expect(graph.nmToDisplayPx(graph.extent[0])).toBeCloseTo(0);
    expect(graph.nmToDisplayPx(graph.extent[1])).toBeCloseTo(graph.width);

  });


  xit("makes imgContainer match width of graph bounds after a range is set", function() {

     expect(graph.range.length).toBe(2);
     expect(d3.select('.nv-series-0')[0][0].getBBox().width).toBe(graph.width - 10); // 10 is the "extra" space the d3 chart requires

  });


  it("gets resized when container is resized", function() {

    $('#graph').width(1000);

    // force resize; because the graph is hidden, it won't work automatically:
    graph.datum.load();
    graph.updateSize(1000)();

    // confirm all dimensions over again
    //expect(d3.select('.nv-series-0')[0][0].getBBox().width).toBe(graph.width - 10); // 10 is the "extra"

    expect(Math.round(graph.imagePxToDisplayPx(originalPxPerNm * 130.911))).toBeCloseTo(-1); // rounding error; toBeCloseTo(0, 1) syntax doesn't seem to work for precision?
    var rightEdgeNm = 689.432 - 158.521; // displayed range in nm (~400) minus hidden right side should be right edge in nm
    expect(Math.round(graph.imagePxToDisplayPx(originalPxPerNm * rightEdgeNm))).toBeCloseTo(graph.imgContainer.width() + 1); // rounding error
    expect(Math.round(graph.imagePxToDisplayPx(500))).toBeCloseTo(675);

    expect(graph.displayPxToNm(0)).toBeCloseTo(graph.extent[0]);
    expect(graph.displayPxToNm(graph.width)).toBeCloseTo(graph.extent[1]);
    expect(Math.round(graph.displayPxToNm(500))).toBeCloseTo(622);

    expect(graph.nmToDisplayPx(graph.extent[0])).toBeCloseTo(0);
    expect(graph.nmToDisplayPx(graph.extent[1])).toBeCloseTo(graph.width);
    expect(Math.round(graph.nmToDisplayPx(500))).toBeCloseTo(225);

    // measure width of graph element, but it seems to be 5px off, for some reason: 
    // d3.select('.nv-linesWrap')[0][0].getBBox().width

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

