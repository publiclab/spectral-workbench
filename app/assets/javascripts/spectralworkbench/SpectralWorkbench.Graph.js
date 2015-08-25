SpectralWorkbench.Graph = Class.extend({

  init: function(args) {

    var _graph = this;

    this.args = args;
    this.width = 600;
    this.embed = args['embed'] || false;
    this.embedmargin = 10;
    this.margin = { top: 10, right: 30, bottom: 20, left: 70 };
    this.range = this.args.range || false;

    this.API = new SpectralWorkbench.API(this);

    if (this.args.calibrated) this.xUnit = 'nanometers';
    else this.xUnit = "uncalibrated pixels";

    // set/spectrum breakout
    if (this.args.hasOwnProperty('spectrum_id')) {
      this.dataType = "spectrum";
    } else if (this.args.hasOwnProperty('set_id')) {
      this.dataType = "set";
    } 

    this.updateSize()();

    // deletion listeners
    $('#tags .tagdelete').bind('ajax:success', function(){
      $('#tag_' + $(this).attr('data-id')).remove();
    });
 
    var svg = d3.select("#graph").append("svg")
      .attr("width",  this.width  + this.margin.left + this.margin.right)
      .attr("height", this.height + this.margin.top  + this.margin.bottom)
 
    /* key function for d3 data binding, used in _graph.load */
    _graph.idKey = function(d) {
      return d.id;
    }

    _graph.refresh = function() {

      _graph.data.call(_graph.chart);

    }

    /* once actual JSON is available and processed, 
     * <datum> is created; either SW.Set or SW.Spectrum
     * <chart> is the nvd3 chart
     * <data> is the raw JSON data from the server
     */
    _graph.load = function(datum, chart, data) {

      _graph.datum = datum;

      // use a closure to give graph access to refreshing:
      _graph.datum.refresh = function() {

        _graph.refresh();

      }

      // APIv1 backwards-compatibility
      SpectralWorkbench.API.Legacy.load(datum.json, _graph.dataType);

      SpectralWorkbench.API.Core.alertOverexposure(_graph);

      _graph.tagForm = new SpectralWorkbench.UI.TagForm(_graph); 

      // download tags
      _graph.datum.fetchTags();

      /* Enter data into the graph */
      _graph.data = d3.select('#graph svg')  //Select the <svg> element you want to render the chart in.   
          .datum(datum.d3, _graph.idKey)   //Populate the <svg> element with chart data and provide a binding key (removing idKey has no effect?)
          .call(chart)         //Finally, render the chart!
          .attr('id', _graph.idKey)
 
      /* Line event handlers */
      /* ...move into SW.Graph.Event? */
      var onmouseover = function() {
     
        var el = this;
        var id = d3.select(el).data()[0].id;
        $('tr.spectrum-'+id).addClass('highlight');
        d3.select(el).classed('highlight',true);
        // scroll to the spectrum in the table below:
        if (_graph.embed) window.location = (window.location+'').split('#')[0]+'#s'+id;
     
      }
     
      var onmouseout = function() {
     
        var el = this;
        var id = d3.select(el).data()[0].id;
        $('tr.spectrum-'+id).removeClass('highlight');
        d3.select(el).classed('highlight',false);
     
      }

      d3.selectAll('g.nv-scatterWrap g.nv-groups g') // ONLY the lines, not the scatterplot-based hover circles
          .on("mouseover", onmouseover)
          .on("mouseout", onmouseout)
 
      d3.selectAll('g.nv-line > g > g.nv-groups g') // ONLY the lines, not the scatterplot-based hover circles
          .attr("id", function(datum) {

            var sel = d3.select(this),
                data  = sel.data()[0];

            // color corresponding table entry
            $('tr.spectrum-'+datum.id+' div.key').css('background',sel.style('stroke'));
 
            // highlight corresponding line when hovering on table row
            $('tr.spectrum-'+datum.id).mouseover(function() {
              d3.selectAll('g.nv-line > g > g.nv-groups > g').classed('dimmed', true );
              d3.selectAll('g#spectrum-line-'+datum.id).classed(      'dimmed', false);
              d3.selectAll('g#spectrum-line-'+datum.id).classed(   'highlight', true );
            });

            $('tr.spectrum-'+datum.id).mouseout(function() {
              d3.selectAll('g.nv-line > g > .nv-groups *').classed( 'dimmed', false);
              d3.selectAll('g#spectrum-line-'+datum.id).classed( 'highlight', false);
            });

            // apparently HTML id has to begin with a string? 
            // http://stackoverflow.com/questions/70579/what-are-valid-values-for-the-id-attribute-in-html

            return 'spectrum-line-'+datum.id;

          });

      // update graph size now that we have data and esp. range data
      _graph.updateSize()();
      _graph.zoomSetup();
 
      // actually add it to the display
      nv.addGraph(chart);
 
    }

    /*
     * ======================================
     * Scroll wheel zooming and drag panning;
     * needs rewrite
     */
    _graph.zoomSetup = function() {

      zoomed = function() {

        _graph.data.select('g g').attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
        d3.selectAll('#graphing path').style('stroke-width', 2/d3.event.scale);

        if (!d3.select('.spectrum-img-container .alert-zooming')[0][0]) {

          d3.select('div.spectrum-img-container').insert("div", ":first-child")
                                                 .attr("class","alert-zooming")
                                                 .append("div")
                                                 .attr("class","alert alert-info")
                                                 .html("You are zooming on the graph data. <a class='zoom-reset'>Click here</a> to reset the graph display.")
          d3.select('a.zoom-reset').on("click",function() {

            d3.select('div.alert-zooming').remove();
            _graph.data.select('g g').attr("transform", "translate(0,0) scale(1)");
            d3.selectAll('#graphing path').style('stroke-width', 2);

          });

      }

      }

      var zoom = d3.behavior.zoom()
                            //.center([width / 2, height / 2]) can specify a zoom center if we like
                            .scaleExtent([1, 10])
                            .on("zoom", zoomed);

      _graph.data.call(zoom);

    }


    /*
     * ======================================
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

        _graph.chart.xAxis.axisLabel('Wavelength (nanometers)')
        var unitChange = function(d) { d.x = 1239.82/d.x; return d; }

      } else if (d3.select('.nv-axislabel').html() == "Wavelength (nanometers)") {

        _graph.chart.xAxis.axisLabel('Wavelength (eV)')
        var unitChange = function(d) { d.x = 1239.82/d.x; return d; }

      }
 
      datasets.map(function(dataset) { 
     
        dataset = dataset.map(unitChange);
     
      });
      
      _graph.data = d3.select('#graph svg')  //Select the <svg> element you want to render the chart in.   
            .datum(_graph.datum.d3, _graph.idKey)   //Populate the <svg> element with chart data and provide a binding key (removing idKey has no effect?)

      _graph.updateSize()();
 
    }


    /* 
     * ======================================
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

    _graph.UI = new SpectralWorkbench.UI.Util(_graph);

    _graph.graphSetup();
    _graph.eventSetup();

    // Update the chart when window updates.
    $(window).on('resize', _graph.updateSize());
    // nv.utils.windowResize( this.updateSize.apply(this)); // this one didn't work - maybe it's only on resize of the svg element?

  },

  graphSetup: function() {
 
    var _graph = this;
    _graph.chart = nv.models.lineChart()
                     .height(_graph.height-_graph.margin.top-_graph.margin.bottom)
                     .margin(_graph.margin)
                     .useInteractiveGuideline(true)  //We want nice looking tooltips and a guideline!
//                   .transitionDuration(350)  //how fast do you want the lines to transition?
                     .showLegend(false)       //Show the legend, allowing users to turn on/off line series.
                     .showYAxis(true)        //Show the y-axis
                     .showXAxis(true)        //Show the x-axis
    ;
 
    _graph.chart.xAxis     //Chart x-axis settings
              .axisLabel('Wavelength ('+_graph.xUnit+')')
              .tickFormat(d3.format('1r'));
 
    _graph.chart.yAxis     //Chart y-axis settings
              .axisLabel('Intensity (%)')
              .tickFormat(d3.format('%'));
 
    if (_graph.dataType == "spectrum") {
      new SpectralWorkbench.Importer( "/spectrums/" 
                      + _graph.args.spectrum_id 
                      + ".json", 
                        _graph.chart, 
                        _graph.dataType, 
                        _graph.load);
    } else if (_graph.dataType == "set") {
      new SpectralWorkbench.Importer( "/sets/calibrated/" 
                      + _graph.args.set_id 
                      + ".json", 
                        _graph.chart, 
                        _graph.dataType, 
                        _graph.load);
    }
  },

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

  updateSize: function() {

    var _graph = this;
 
    return (function() { 
 
      _graph.width  = getUrlParameter('width')  || $(window).width() || _graph.width;
 
      if (getUrlParameter('height')) {
 
        _graph.height = getUrlParameter('height');
 
      } else {
 
        if (($(window).height() < 450 && _graph.dataType == 'set') || 
            ($(window).height() < 350 && _graph.dataType == 'spectrum')) { 
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
 
      $('#graph').height(_graph.height)

      var extra = 0;
      if (!_graph.embed) extra = 10;
      $('div.spectrum-img-container').width(_graph.width)
                                     .height(100)
                                     .css('margin-left', _graph.margin.left + extra) // not sure but there seems to be some extra margin in the chart
                                     .css('margin-right',_graph.margin.right);

      if (_graph.range && _graph.datum) {

        // amount to mask out of image if there's a range tag
        // this is measured in nanometers:
        _graph.leftCrop =   _graph.range[0] - _graph.datum.json.data.lines[0].wavelength
        _graph.rightCrop = -_graph.range[1] + _graph.datum.json.data.lines[_graph.datum.json.data.lines.length-1].wavelength

        _graph.pxPerNm = _graph.width / (_graph.range[1]-_graph.range[0]);

        _graph.leftCrop  *= _graph.pxPerNm;
        _graph.rightCrop *= _graph.pxPerNm

        $('div.spectrum-img-container img').width(_graph.width + _graph.leftCrop + _graph.rightCrop)
                                           .height(100)
                                           .css('max-width', 'none')
                                           .css('margin-left', -_graph.leftCrop);

      } else {

        $('div.spectrum-img-container img').width(_graph.width)
                                           .height(100)

      }
 
      // update only if we're past initialization
      if (_graph.chart) {
        _graph.chart.update();
      }
 
      // hide loading grey background
      $('#graphing #graph').css('background','white');
      $('#graphing #graph .icon-spinner').remove();
 
    });
  }

});
