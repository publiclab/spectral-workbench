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
 
    var svg = d3.select("#graph").append("svg")
      .attr("width",  this.width  + this.margin.left + this.margin.right)
      .attr("height", this.height + this.margin.top  + this.margin.bottom)
 
    /* key function for d3 data binding, used in _graph.load */
    var idKey = function(d) {
      return d.id;
    }

    /* once actual JSON is available and processed, 
     * <datum> is created; either SW.Set or SW.Spectrum
     * <chart> is the nvd3 chart
     * <data> is the raw JSON data from the server
     */
    this.load = function(datum, chart, data) {

      _graph.datum = datum;
      // APIv1 backwards-compatibility
      SpectralWorkbench.API.Legacy.load(datum.json, _graph.dataType);

      /* Enter data into the graph */
      _graph.data = d3.select('#graph svg')  //Select the <svg> element you want to render the chart in.   
          .datum(datum.d3, idKey)   //Populate the <svg> element with chart data and provide a binding key (removing idKey has no effect?)
          .call(chart)         //Finally, render the chart!
          .attr('id', idKey)
 
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
 
      // actually add it to the display
      nv.addGraph(chart);
 
    }

    this.graphSetup();
    this.eventSetup();

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
      $('#graphing #graph .icon-spinner').hide();
 
    });
  }

});
