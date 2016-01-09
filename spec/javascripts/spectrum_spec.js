describe("Spectrum", function() {

  var data = getJSONFixture('spectrum.json')

//  var toBeWithinPercent = function(number, percent)

  // max and min lines:
  // {"average":64.3333,"r":69,"g":46,"b":78,"wavelength":269.089},
  // {"average":31,"r":33,"g":19,"b":41,"wavelength":958.521}

  var spectrum = new SpectralWorkbench.Spectrum(data)

  it("is not undefined when initialized with spectrum data", function() {

    expect(spectrum).toBeDefined();

    // but not the graph, since we're loading this outside a graph
    expect(spectrum.graph).not.toBeDefined();

  });

  it("has .average, .red, .green, .blue arrays which contain the right amount of data", function() {

    expect(spectrum.average).toBeDefined();
    expect(spectrum.average.length).toBe(spectrum.json.data.lines.length);
    expect(spectrum.average.length).not.toBe(7);

    expect(spectrum.red).toBeDefined();
    expect(spectrum.red.length).toBe(spectrum.json.data.lines.length);

    expect(spectrum.green).toBeDefined();
    expect(spectrum.green.length).toBe(spectrum.json.data.lines.length);

    expect(spectrum.blue).toBeDefined();
    expect(spectrum.blue.length).toBe(spectrum.json.data.lines.length);

  });

  it("getIntensity() returns closest intensity for a given wavelength from available wavelength/intensity pairs", function() {

    expect(spectrum.getIntensity(400, 'average')).toBeDefined();
    expect(spectrum.getIntensity(400, 'average')).not.toBeGreaterThan(255);
    expect(spectrum.getIntensity(400, 'average')).not.toBeLessThan(0);

    expect(spectrum.getIntensity(270, 'average')).toBe(parseInt(64.3333/2.55)/100);
    expect(spectrum.getIntensity(958, 'average')).toBe(parseInt(31/2.55)/100);

  });

  it("getFullExtentX() returns [min, max] x-axis extent of displayed data, without wavelength range limiting, in nanometers (or pixels if uncalibrated)", function() {

    expect(spectrum.getFullExtentX()).toBeDefined();
    expect(spectrum.getFullExtentX()[0]).toBe(269.089);
    expect(spectrum.getFullExtentX()[1]).toBe(958.521);

  });

  it("getExtentY() returns [min, max] y-axis extent of displayed data", function() {

    expect(spectrum.getExtentY()).toBeDefined();

  });


  it("getNearestPoint() returns nearest point to <x> in data space in given <channel>; default channel is 'average'", function() {

    expect(spectrum.getNearestPoint(400)).toBeDefined();
    expect(spectrum.getNearestPoint(400).x).toBe(400.245);

  });


  it("getNearbyPeak() returns highest intensity wavelength (or pixel if uncalibrated) within <distance> pixels of <x> in given <channel>; default channel is 'average'", function() {

    var peak = spectrum.getNearbyPeak(405, 10, 'blue')
    expect(peak).toBeDefined();
    expect(peak).toBe(401.108); // not super great calibration, but OK

    // search for other peaks
    expect(spectrum.getNearbyPeak(436, 10, 'blue')).toBe(435.623);
    expect(spectrum.getNearbyPeak(546, 10, 'green')).toBe(545.207);

  });

  it("isCalibrated() returns true if the spectrum is calibrated (client-side)", function() {

    expect(spectrum.isCalibrated()).toBe(true);

  });

  it("nmToPx() converts a nanometer value to a pixel x-value in the original image from raw JSON data", function() {

    // ...disregarding range, assuming that each spectrum.json.data.lines corresponds 
    // to a pixel in the original image,(counting from left) if the current spectrum is calibrated

    expect(spectrum.nmToPx(400)).toBeDefined();
    expect(spectrum.nmToPx(270)).toBeDefined();
    expect(spectrum.nmToPx(958)).toBeDefined();

    expect(spectrum.nmToPx(400)).toBe(464.15019900439785);
    expect(spectrum.nmToPx(270)).toBe(313.30138432796855);
    expect(spectrum.nmToPx(958)).toBe(1111.6397266155327);

  });

  it("pxToNm() converts a pixel value (counting from left) from raw JSON data, disregarding range, to a nanometer value", function() {

    // if the current spectrum is calibrated.
    // Result may not correspond to a specific point of data, but use
    // spectrum.getNearestPoint() if needed.
    // Returns false if not calibrated.

    expect(spectrum.pxToNm(400)).toBeDefined();
    expect(spectrum.pxToNm(100)).toBeDefined();
    expect(spectrum.pxToNm(700)).toBeDefined();

    expect(spectrum.pxToNm(400)).toBe(613.8050000000001);
    expect(spectrum.pxToNm(100)).toBe(355.26800000000003);
    expect(spectrum.pxToNm(700)).toBe(872.3420000000001);

  });

  it("toJSON() outputs server-style JSON of the spectrum", function() {

    // with all active powertags/operations applied -- exactly as currently seen in the graph

    expect(spectrum.toJSON()).toBeDefined();

  });

  // test spectrum.image, which the following method uses; here, we don't have an image. 

  /* ======================================
   * Overwrite spectrum.json.data.lines, the raw JSON of the spectrum
   * <y> is the y-position of the cross section of pixels, where 0 is the top row
   * <keepCalibrated> is a boolean which indicates whether to keep or flush the calibration
   * spectrum.imgToJSON = function(y, keepCalibrated) {
   */

  // relies on server fetch of own data; we're basing on a static fixture, so we can skip this:

  /* ======================================
   * Fetch data to populate self, from server, using spectrum.id.
   * Overwrites spectrum.json and runs spectrum.load().
   * spectrum.fetch = function(url, callback) {
   */ 

  // relies on server push of own data; we're basing on a static fixture, so we can skip this:

  /* ======================================
   * Upload a new json string to the server, overwriting the original. 
   * Not recommended without cloning! But recoverable from original image.
   * spectrum.upload = function(url, callback) {
   */ 


  it("getOverexposure() inspects all channels recursively for sequential pixels of 100%", function() {

   /* which would indicate overexposure. Returns
   * whether it passed the threshold and the last inspected index.
   * <threshold> is how bright a pixel must be to trigger an overexposure warning (0-255)
   * <consecutive> is how many pixels of consecutive 100% triggers an overexposure warning
   */

    var overexposure = spectrum.getOverexposure(240, 5);

    expect(overexposure).toBeDefined();
    expect(overexposure.r).toBe(false);
    expect(overexposure.g).toBe(true);
    expect(overexposure.b).toBe(true);

    var overexposure = spectrum.getOverexposure(255, 25);

    expect(overexposure).toBeDefined();
    expect(overexposure.r).toBe(false);
    expect(overexposure.g).toBe(false);
    expect(overexposure.b).toBe(false);

  });

  it("getTooDark() determines if a spectrum is too dark and makes a recommendation to fix this", function() {

    expect(spectrum.getTooDark()).toBe(false);
    expect(spectrum.getTooDark(250)).toBe(true); // set the threshold too high

  });

  it("d3() returns a set of graph line datasets formatted for display in a d3 chart", function() {

    var d3 = spectrum.d3();

    expect(d3).toBeDefined();
    expect(d3[0].values[0]).toEqual({ y: 0.25, x: 269.089, dist: 130.911 });

  });




  /* Do this at the end and check the recalibration
   * w1 and w2 are nanometer wavelength values, and x1 and x2 
   * are corresponding pixel positions, measured from left.
   */
  it("calibrate() linear calibrates on the client side, but doesn't save; returns a new set of lines which can be used to overwrite spectrum.json.data.lines", function() {

    var recalibration = spectrum.calibrate(426, 543, 350, 450); // do it wrong

    expect(recalibration).toBeDefined();
    expect(recalibration[0]).toEqual({ average: 64.3333, r: 69, g: 46, b: 78, wavelength: 16.5 });

  });


  // we would test calibrateAndUpload, but it involves spectrum.graph, which we don't have here. 
  // We should test it in the graph spec, if possible.

  /* ======================================
   * Linear calibrates on the client side; then uploads and tags
   * w1 and w2 are nanometer wavelength values, and x1 and x2 are 
   * corresponding pixel positions, measured from left
   * spectrum.calibrateAndUpload = function(w1, w2, x1, x2) {
   */

});

