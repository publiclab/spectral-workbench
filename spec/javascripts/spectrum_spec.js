
describe("Spectrum", function() {

  var data = getJSONFixture('spectrum.json')

  // max and min lines:
  // {"average":64.3333,"r":69,"g":46,"b":78,"wavelength":269.089},
  // {"average":31,"r":33,"g":19,"b":41,"wavelength":958.521}

  var spectrum = new SpectralWorkbench.Spectrum(data)

  it("is not undefined when initialized with spectrum data", function() {

    expect(spectrum).toBeDefined();

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


});



/*

Methods:

    /* ======================================
     * Returns nearest point to <x> in data space
     * in given <channel>; default channel is 'average'.
    _spectrum.getNearestPoint = function(x, channel) {

    /* ======================================
     * Returns highest intensity wavelength (or pixel if uncalibrated) 
     * within <distance> pixels of <x>
     * in given <channel>; default channel is 'average'.
    _spectrum.getNearbyPeak = function(x, distance, channel) {

    /* ======================================
     * Returns true if the spectrum is calibrated (client-side)
    _spectrum.isCalibrated = function() {

    /* ======================================
     * Linear calibrates on the client side; then uploads and tags
     * w1 and w2 are nanometer wavelength values, and x1 and x2 are 
     * corresponding pixel positions, measured from left
//reqs graph
    _spectrum.calibrateAndUpload = function(w1, w2, x1, x2) {
      _spectrum.graph.datum.load()
      _spectrum.graph.reload()
      _spectrum.graph.refresh()

    /* ======================================
     * Linear calibrates on the client side, but doesn't save;
     * returns a new set of lines which can be used to overwrite
     * spectrum.json.data.lines.
     * w1 and w2 are nanometer wavelength values, and x1 and x2 are 
     * corresponding pixel positions, measured from left.
    _spectrum.calibrate = function(w1, w2, x1, x2) {

    /* ======================================
     * Converts a nanometer value to a pixel x-value in the original image
     * from raw JSON data, disregarding range, assuming that each
     * spectrum.json.data.lines corresponds to a pixel in the original image,
     * (counting from left) if the current spectrum is calibrated
    _spectrum.nmToPx = function(nm) {

    /* ======================================
     * Converts a pixel value (counting from left) 
     * from raw JSON data, disregarding range, to a nanometer 
     * value if the current spectrum is calibrated.
     * Result may not correspond to a specific point of data, but use
     * spectrum.getNearestPoint() if needed.
     * Returns false if not calibrated.
    _spectrum.pxToNm = function(px) {

    /* ======================================
     * Output server-style JSON of the spectrum
     * with all active powertags/operations applied -- exactly as currently seen in the graph
    _spectrum.toJSON = function() {

    /* ======================================
     * Overwrite spectrum.json.data.lines, the raw JSON of the spectrum
     * <y> is the y-position of the cross section of pixels, where 0 is the top row
     * <keepCalibrated> is a boolean which indicates whether to keep or flush the calibration
    _spectrum.imgToJSON = function(y, keepCalibrated) {

    /* ======================================
     * Fetch data to populate self, from server, using spectrum.id.
     * Overwrites spectrum.json and runs spectrum.load().
    _spectrum.fetch = function(url, callback) {

    /* ======================================
     * Upload a new json string to the server, overwriting the original. 
     * Not recommended without cloning! But recoverable from original image.
    _spectrum.upload = function(url, callback) {

 
    /* ======================================
     * Inspects all channell recursively for sequential
     * pixels of 100%, which would indicate overexposure. Returns
     * whether it passed the threshold and the last inspected index.
     * <threshold> is how many pixels of consecutive 100% triggers an overexposure warning
     * <consecutive> is how many pixels of consecutive 100% triggers an overexposure warning
    _spectrum.getOverexposure = function(threshold, consecutive) {
 
    /* ======================================
     * Determines if a spectrum is too dark and makes a recommendation to fix this
     * <threshold> is a percent brightness cutoff; returns a boolean
    _spectrum.getTooDark = function(threshold) {

    /* ======================================
     * Returns a set of graph line datasets formatted for display in a d3 chart
    _spectrum.d3 = function() {

_datum.downloadJSON = function(selector) {
_datum.addTag = function(name, callback) {
_datum.removeTag = function(name, callback) {
_datum.getTag = function(name, callback) {
_datum.getPowerTag = function(key, callback) {
_datum.fetchTags = function() {
_datum.parseTags = function() {
_datum.parseTag = function(tag) {
*/
