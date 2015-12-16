SpectralWorkbench.Graph = Class.extend({

  extent: [0,0],

  init: function(args) {

    var _graph = this;

    this.args = args;
    this.loaded = false; // measure initial load completion
    this.onComplete = args['onComplete'] || function() { console.log('graph load complete'); };
    this.onImageComplete = args['onImageComplete'] || function() { console.log('image load complete'); };
    this.width = 600;
    this.zooming = false;
    this.embed = args['embed'] || false;
    this.embedmargin = 10;
    this.margin = { top: 10, right: 30, bottom: 20, left: 70 };
    this.range = this.args.range || false;
    this.selector = this.args.selector || '#graph';
    this.el = $(this.selector);

    // this could be moved into the graph.image Image object:
    this.imgSelector = this.args.imageSelector || 'div.spectrum-img-container';
    this.imgContainer = $(this.imgSelector);
    this.imgEl = this.imgContainer.find('img');

    this.API = new SpectralWorkbench.API(this);

    // set/spectrum breakout
    if (this.args.hasOwnProperty('spectrum_id')) {

      this.dataType = "spectrum";

      // Create a canvas element to manipulate image data. 
      // We could have this non-initialized at boot, and only create it if asked to.
      this.image = new SpectralWorkbench.Image(this.imgEl, this, this.onImageComplete);

    } else if (this.args.hasOwnProperty('set_id')) {

      this.dataType = "set";

    } 

    this.updateSize()();
 
    this.svg = d3.select(_graph.selector).append("svg")
                                  .attr("width",  this.width  + this.margin.left + this.margin.right)
                                  .attr("height", this.height + this.margin.top  + this.margin.bottom)


    /* ======================================
     * Refresh datum into DOM in d3 syntax
     */
    _graph.reload = function() {

      // populate the <svg> element with chart data 
      // and provide a binding key
      _graph.data.datum(_graph.datum.d3);

    }


    /* ======================================
     * Refresh graph element in d3 syntax, 
     * then resize image
     */
    _graph.refresh = function() {

      _graph.setUnits();
      _graph.data.call(_graph.chart);
      _graph.updateSize()();
      console.log('graph refreshed');

    }


    /* ======================================
     * Converts an x-coordinate pixel value from image space 
     * to a display space pixel value
     */
    _graph.imagePxToDisplayPx = function(x) {

      // what proportion of the full image is being displayed?
      var proportion = x / _graph.image.width, // x position as a percent of original image
          proportionDisplayed = (_graph.extent[1] -_graph.extent[0]) / (_graph.fullExtent[1] - _graph.fullExtent[0]); // account for out-of-range parts of image

      return proportion * (_graph.width / proportionDisplayed);

    }


    /* ======================================
     * Converts an x-coordinate pixel value from display space 
     * to an image space pixel value
     */
    _graph.displayPxToImagePx = function(x) {

      // what proportion of the full image is being displayed?
      var proportion = x / _graph.width, // x position as a percent of displayed graph
          proportionDisplayed = (_graph.extent[1] -_graph.extent[0]) / (_graph.fullExtent[1] - _graph.fullExtent[0]); // account for out-of-range parts of image

      return proportion / proportionDisplayed * _graph.image.width;

    }


    /* ======================================
     * Accepts x-coordinate in display space as shown 
     * on page & returns wavelength in nanometers.
     * Unlike datum.pxToNm, does not rely on an image or its dimensions.
     */
    _graph.displayPxToNm = function(x) {

      var proportion = x / _graph.width,
          extentWidth = _graph.extent[1] - _graph.extent[0];

      return _graph.extent[0] + (proportion * extentWidth);

    }


    /* ======================================
     * Accepts wavelength in nanometers & returns
     * x-coordinate in display space as shown on page.
     */
    _graph.nmToDisplayPx = function(nm) {

      var extentWidth = _graph.extent[1] - _graph.extent[0],
          proportion = ((nm - _graph.extent[0]) / extentWidth);

      return proportion * _graph.width;

    }


    /* ======================================
     * Accepts x,y in graph UI pixel space, returns
     * {x: x, y: y} in data space in nanometers
     * (or pixels if uncalibrated) -- note that
     * that point may not exist in datum, but you can use
     * datum.getNearestPoint(x) to find something close.
     * Pass false for x or y to convert only one coordinate.
     */
    _graph.pxToNm = function(x, y) {

      if (x) {
        var percentX = x / _graph.width,
            extentX = _graph.extent, // accounts for range limiting
            dx      = percentX * (extentX[1] - extentX[0]) + extentX[0];
      } else var dx = false;

      if (y) {
        var percentY = y / _graph.height,
            extentY = _graph.extent, // accounts for range limiting
            dy      = percentY * (extentY[1] - extentY[0]) + extentY[0];
      } else var dy = false;

      return { x: dx, y: dy };

    }


    /* ======================================
     * Sets units for graph element in d3
     */
    _graph.setUnits = function() {
      if (!_graph.datum) {

        if (_graph.args.calibrated) _graph.xUnit = 'nanometers';
        else _graph.xUnit = "uncalibrated pixels";

      } else if (_graph.dataType == 'spectrum' && _graph.datum.isCalibrated()) {

        _graph.xUnit = 'nanometers';

      } else _graph.xUnit = "uncalibrated pixels";
 
      _graph.chart.xAxis     //Chart x-axis settings
                  .axisLabel('Wavelength ('+_graph.xUnit+')')
                  .tickFormat(d3.format('1r'));
 
      _graph.chart.yAxis     //Chart y-axis settings
                  .axisLabel('Intensity (%)')
                  .tickFormat(d3.format('%'));

    }


    /* ======================================
     * once actual JSON is available and processed, 
     * <datum> is created; either SW.Set or SW.Spectrum
     * <chart> is the nvd3 chart
     * <data> is the raw JSON data from the server
     */
    _graph.load = function(datum) {

      _graph.datum = datum;

      // APIv1 backwards-compatibility
      SpectralWorkbench.API.Legacy.load(datum.json, _graph.dataType);

      _graph.tagForm = new SpectralWorkbench.UI.TagForm(_graph); 

      /* Enter data into the graph */
      _graph.data = d3.select('#graph svg')  //Select the <svg> element you want to render the chart in.   
          .datum(datum.d3)   //Populate the <svg> element with chart data
          .call(_graph.chart)         //Finally, render the chart!

      // create DOM <id> attributes for our lines:

      // This would be for *all* lines, or lines if this were not a zoomable graph:
      // d3.selectAll('g.nv-line > g > g.nv-groups g') 

      // apparently HTML id has to begin with a string? 
      // http://stackoverflow.com/questions/70579/what-are-valid-values-for-the-id-attribute-in-html

      // main graph lines
      d3.selectAll('g.nv-focus g.nv-line > g > g.nv-groups g') 
        //.addClass('main-line') // we should do this (or the d3 equiv.) for later selections. Or if nvd3 offers a ready-made selection
        .attr("id", function(datum, index) {
          var id = d3.select('svg').data()[0][index].id; // this is the real d3 DOM-stored data
          return 'spectrum-line-' + id;
        });

      // zoom graph lines
      d3.selectAll('g.nv-context g.nv-line > g > g.nv-groups g') 
        .attr("id", function(datum, index) {
          var id = d3.select('svg').data()[0][index].id; // this is the real d3 DOM-stored data
          return 'spectrum-line-' + id;
        });

      // graph line hover circles for main graph lines
      d3.selectAll('g.nv-focus g.nv-scatterWrap g.nv-groups g') 
        .attr("id", function(datum, index) {
          var id = d3.select('svg').data()[0][index].id; // this is the real d3 DOM-stored data
          return 'spectrum-hover-' + id;
        });

      // graph line hover circles for zoom graph lines
      d3.selectAll('g.nv-context g.nv-scatterWrap g.nv-groups g') 
        .attr("id", function(datum, index) {
          var id = d3.select('svg').data()[0][index].id; // this is the real d3 DOM-stored data
          return 'spectrum-hover-' + id;
        });


      if (_graph.dataType == "spectrum") {

        // scan for helper tips

        SpectralWorkbench.API.Core.alertOverexposure(_graph.datum);

        SpectralWorkbench.API.Core.alertTooDark(_graph.datum);

      } else if (_graph.dataType == "set") {

        // table and graph hovers etc.
        if (_graph.datum) _graph.datum.setupUI();

      }


      // update graph size now that we have data and esp. range data
      _graph.updateSize()();

      // set up all of UI -- tool panes, etc
      if (_graph.embed == false) _graph.UI = new SpectralWorkbench.UI.Util(_graph);
 
      // actually add it to the display
      nv.addGraph(_graph.chart);

      _graph.loaded = true;
      _graph.onComplete(_graph);
 
      // hide loading spinner
      _graph.el.find('.fa-spinner').remove();

    }


    /* ======================================
     * Toggle zooming and panning, via a "brushing" interface
     */
    _graph.zoom = function() {

      _graph.zooming = !_graph.zooming;
      $('.nv-context').toggle();
      _graph.updateSize()();

    }


    /* ======================================
     * Dim graph, such as while it's loading
     */
    _graph.dim = function() {
      _graph.svg.style('opacity', 0.5);
    }


    /* ======================================
     * Un-dim graph, such as while it's loading
     */
    _graph.undim = function() {
      _graph.svg.style('opacity', 1);
    }


    /* ======================================
     * Switch to eV as units (not well-implemented; should be 
     * done as display, not actually overwriting data)
     */
    _graph.toggleUnits = function() {

      if (_graph.dataType == "spectrum") {
        var datasets = [ _graph.datum.average,
                         _graph.datum.red,
                         _graph.datum.green,
                         _graph.datum.blue ];
      } else {
        var datasets = [];
        _graph.datum.spectra.map(function(spectrum) {
          datasets.push(spectrum.average);
        });
      }

      if (d3.select('.nv-axislabel').html() == "Wavelength (eV)") {

        _graph.chart.xAxis.axisLabel('Wavelength (nanometers)');
        var unitChange = function(d) { d.x = 1239.82/d.x; return d; }

      } else if (d3.select('.nv-axislabel').html() == "Wavelength (nanometers)") {

        _graph.chart.xAxis.axisLabel('Wavelength (eV)');
        var unitChange = function(d) { d.x = 1239.82/d.x; return d; }

      }
 
      datasets.map(function(dataset) { 
     
        dataset = dataset.map(unitChange);
     
      });
      
      _graph.data = d3.select('#graph svg')  //Select the <svg> element you want to render the chart in.   
            .datum(_graph.datum.d3)   //Populate the <svg> element with chart data and provide a binding key (removing idKey has no effect?)

      _graph.updateSize()();
 
    }


    /* ======================================
     * Gets a spectrum object by its <id> if it exists in this graph.
     * Maybe we should have a fetchSpectrum which can get them remotely, too?
     */
    _graph.getSpectrumById = function(id) {

      if (_graph.dataType == "spectrum") {

        console.log('This only works on sets');

      } else {

        var response = false;

        _graph.datum.spectra.forEach(function(spectrum) {

          if (spectrum.id == id) response = spectrum;

        });

      }

      return response;

    }


    /* ======================================
     * Everything else left to do to get this graph started
     */

    _graph.graphSetup();
    _graph.eventSetup();

    
    if (_graph.embed) $(_graph.selector).on('resize', _graph.updateSize()); // if embed, update the chart when DOM element resizes
    else $(window).on('resize', _graph.updateSize()); // else resize when window resizes
    

    return _graph;

  },


  /* ======================================
   * set up initial d3 graph using nvd3 template
   */
  graphSetup: function() {
 
    var _graph = this;

    _graph.chart = nv.models.lineWithFocusChart() // this sets up zooming behavior
                     .options({ useVoronoi: false })
                     .height(_graph.height-_graph.margin.top-_graph.margin.bottom + 100) // 100 for zoom brush pane, hidden by default
                     .margin(_graph.margin)
                     .showLegend(false)       //Show the legend, allowing users to turn on/off line series.
    ;

    _graph.setUnits();
 
    if (_graph.dataType == "spectrum") {
      new SpectralWorkbench.Importer( "/spectrums/" 
                      + _graph.args.spectrum_id 
                      + ".json", 
                        _graph, 
                        _graph.load);
    } else if (_graph.dataType == "set") {
      new SpectralWorkbench.Importer( "/sets/calibrated/" 
                      + _graph.args.set_id 
                      + ".json", 
                        _graph, 
                        _graph.load);
    }
  },


  /* ======================================
   * connect up set table checkboxes/visibility;
   * for hover behaviors, see Set.setupUI();
   */
  eventSetup: function() {

    var _graph = this;

    // Set up graph/table mouse events.
    // ...break this up into two subclasses, 
    // set and spectrum, with their own init sequences 
    if (_graph.dataType == "set") {

      // setup sets list of spectra
      $('table.spectra input.visible').change(function(e) {
        var el = this;
        var id      = $(el).attr('data-id'),
            checked = $(el).is(':checked');
        if (checked) {
          d3.selectAll('#spectrum-line-'+id).style('display','block');
        } else {
          d3.selectAll('#spectrum-line-'+id).style('display','none');
          $('table.spectra input.visible-all').attr('checked',false);
        }
      })

      $('table.spectra input.visible-all').change(function(e) {
        var el = this;
        var checked = $(el).is(':checked');
        if (checked) {
          $('table.spectra input.visible').prop('checked',true);
          $('table.spectra input.visible').trigger('change');
          $('table.spectra input.visible-all').prop('checked',true);
        } else {
          $('table.spectra input.visible').prop('checked',false);
          $('table.spectra input.visible').trigger('change');
        }
      })
    }

  },


  /* ======================================
   * Resize image and reset padding based on range and viewport width.
   * Note: accepts optional <newWidth> which is used in our Jasmine tests
   * since this is based on assumption that the element we're calling .width() on is visible,
   * which may not last in future jQuery versions: http://api.jquery.com/width/,
   * and is not true during Jasmine testing.
   */
  updateSize: function(newWidth) {

    var _graph = this;
 
    return (function() { 

      _graph.width  = newWidth || getUrlParameter('width')  || $(_graph.selector).width() || _graph.width;
 
      if (getUrlParameter('height')) {
 
        _graph.height = getUrlParameter('height');
 
      } else {
 
        if (($(_graph.selector).height() < 450 && _graph.dataType == 'set') || 
            ($(_graph.selector).height() < 350 && _graph.dataType == 'spectrum')) { 

          // compact
          _graph.height = 180;
          $('#embed').addClass('compact');
 
        } else {
 
          // full size
          _graph.height = 200;
          $('#embed').removeClass('compact');
 
        }
 
        _graph.height = _graph.height - _graph.margin.top  - _graph.margin.bottom;
 
      }
 
      _graph.width  = _graph.width  
                  - _graph.margin.left 
                  - _graph.margin.right 
                  - (_graph.embedmargin * 2);

      // smaller width style change
      if ($(_graph.selector).width() < 768) _graph.width -= 40;

      // make space for the zoom brushing pane
      if (_graph.zooming) _graph.height += 100;

      $(_graph.selector).height(_graph.height)

      var extra = 0;
      if (!_graph.embed) extra = 10;
      _graph.imgContainer.width(_graph.width)
                         .height(100)
                         .css('margin-left', _graph.margin.left + extra) // not sure but there seems to be some extra margin in the chart
                         .css('margin-right',_graph.margin.right);

      // Why would we even be running updateSize if datum is not yet loaded? Gah.
      if (_graph.datum) {
        _graph.extent = _graph.datum.getFullExtentX(); // store min/max of graph without range limits
        _graph.fullExtent = _graph.datum.getExtentX(); // store min/max of graph
      }

      if (_graph.range && _graph.datum) {

        if (_graph.datum.isCalibrated()) {

          // amount to mask out of image if there's a range tag
          // this is measured in nanometers:
          _graph.leftCrop =   _graph.range[0] - _graph.datum.json.data.lines[0].wavelength;
          _graph.rightCrop = -_graph.range[1] + _graph.datum.json.data.lines[_graph.datum.json.data.lines.length-1].wavelength;
         
          _graph.pxPerNm = _graph.width / (_graph.range[1]-_graph.range[0]);
         
          _graph.leftCrop  *= _graph.pxPerNm;
          _graph.rightCrop *= _graph.pxPerNm

        } else {

          // for uncalibrated, we still allow range, in case someone's doing purely comparative work:
          _graph.leftCrop =   _graph.range[0] - _graph.datum.json.data.lines[0].pixel;
          _graph.rightCrop = -_graph.range[1] + _graph.datum.json.data.lines[_graph.datum.json.data.lines.length-1].pixel;
         
          _graph.pxPerNm = 1; // a lie, but as there are no nanometers in an uncalibrated spectrum, i guess it's OK.

        }

        _graph.imgEl.width(_graph.width + _graph.leftCrop + _graph.rightCrop)
                    .height(100)
                    .css('max-width', 'none')
                    .css('margin-left', -_graph.leftCrop);

      } else {

        _graph.imgEl.width(_graph.width)
                    .height(100)
                    .css('max-width', 'none')
                    .css('margin-left', 0);

      }
 
      // update only if we're past initialization
      if (_graph.chart) {
        _graph.chart.update();
      }

    });
  }

});
