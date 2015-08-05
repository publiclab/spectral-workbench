SpectralWorkbench.Graph = Class.extend({

  init: function(args) {

    var graph = this;

    this.args = args;
    this.width = 600;
    this.embed = args['embed'] || false;
    this.embedmargin = 10;
    this.margin = { top: 10, right: 30, bottom: 20, left: 70 };

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
 
    /* key function for d3 data binding, used in graph.load */
    var idKey = function(d) {
      return d.id;
    }

    /* once actual JSON is available and processed, 
     * <data> is is created; either SW.Set or SW.Spectrum
     */
    this.load = function(data,chart) {

      graph.datum = data;

      /* Enter data into the graph */
      graph.data = d3.select('#graph svg')  //Select the <svg> element you want to render the chart in.   
          .datum(data.d3,idKey)   //Populate the <svg> element with chart data and provide a binding key
          .call(chart)         //Finally, render the chart!
          .attr('id',idKey)

console.log('rendered!'); 

      d3.selectAll('g.nv-scatterWrap g.nv-groups g') // ONLY the lines, not the scatterplot-based hover circles
          .on("mouseover", onmouseover)
          .on("mouseout", onmouseout)
 
      d3.selectAll('g.nv-line > g > g.nv-groups g') // ONLY the lines, not the scatterplot-based hover circles
          .attr("id", function() {
            var sel = d3.select(this),
                data  = sel.data()[0];
 
            // color corresponding table entry
            $('tr.spectrum-'+data.id+' div.key').css('background',sel.style('stroke'));
 
            // highlight corresponding line when hovering on table row
            $('tr.spectrum-'+data.id).mouseover(function() {
              d3.selectAll('g.nv-line > g > g.nv-groups > g').classed('dimmed', true );
              d3.selectAll('g#spectrum-line-'+data.id).classed(       'dimmed', false);
              d3.selectAll('g#spectrum-line-'+data.id).classed(    'highlight', true );
            });
            $('tr.spectrum-'+data.id).mouseout(function() {
              d3.selectAll('g.nv-line > g > .nv-groups *').classed( 'dimmed', false);
              d3.selectAll('g#spectrum-line-'+data.id).classed(  'highlight', false);
            });
            // apparently HTML id has to begin with a string? 
            // http://stackoverflow.com/questions/70579/what-are-valid-values-for-the-id-attribute-in-html
            return 'spectrum-line-'+data.id;
          });
 
      // actually add it to the display
      nv.addGraph(chart);
 
    }

    this.graphSetup();
    this.eventSetup();

    // Update the chart when window updates.
    $(window).on('resize', graph.updateSize.bind(graph));
    // nv.utils.windowResize( this.updateSize.apply(this)); // this one didn't work - maybe it's only on resize of the svg element?

  },

  graphSetup: function() {
 
    var graph = this;
    graph.chart = nv.models.lineChart()
                     .height(graph.height-graph.margin.top-graph.margin.bottom)
                     .margin(graph.margin)
                     .useInteractiveGuideline(true)  //We want nice looking tooltips and a guideline!
//                   .transitionDuration(350)  //how fast do you want the lines to transition?
                     .showLegend(false)       //Show the legend, allowing users to turn on/off line series.
                     .showYAxis(true)        //Show the y-axis
                     .showXAxis(true)        //Show the x-axis
    ;
 
    graph.chart.xAxis     //Chart x-axis settings
              .axisLabel('Wavelength ('+graph.xUnit+')')
              .tickFormat(d3.format('1d'));
 
    graph.chart.yAxis     //Chart y-axis settings
              .axisLabel('Intensity (%)')
              .tickFormat(d3.format('%'));
 
    /* Line event handlers */
    /* ...move into SW.Graph.Event? */
    var onmouseover = function() {
      var el = this;
      var id = d3.select(el).data()[0].id;
      $('tr.spectrum-'+id).addClass('highlight');
      d3.select(el).classed('highlight',true);
      // scroll to the spectrum in the table below:
      if (graph.embed) window.location = (window.location+'').split('#')[0]+'#s'+id;
    }
    var onmouseout = function() {
      var el = this;
      var id = d3.select(el).data()[0].id;
      $('tr.spectrum-'+id).removeClass('highlight');
      d3.select(el).classed('highlight',false);
    }
 
    if (graph.dataType == "spectrum") {
      new SpectralWorkbench.Importer( "/spectrums/" 
                      + graph.args.spectrum_id 
                      + ".json", 
                        graph.chart, 
                        graph.dataType, 
                        graph.load);
    } else if (graph.dataType == "set") {
      new SpectralWorkbench.Importer( "/sets/calibrated/" 
                      + graph.args.set_id 
                      + ".json", 
                        graph.chart, 
                        graph.dataType, 
                        graph.load);
    }
  },

  eventSetup: function() {

    var graph = this;

    // Set up graph/table mouse events.
    // ...break this up into two subclasses, 
    // set and spectrum, with their own init sequences 
    if (graph.dataType == "set") {

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

    var graph = this;
 
    return (function() { 
 
      graph.width  = getUrlParameter('width')  || $(window).width() || graph.width;
 
      if (getUrlParameter('height')) {
 
        graph.height = getUrlParameter('height');
 
      } else {
 
        if (($(window).height() < 450 && graph.dataType == 'set') || 
            ($(window).height() < 350 && graph.dataType == 'spectrum')) { 
          // compact
          graph.height = 180;
          $('#embed').addClass('compact');
 
        } else {
 
          // full size
          graph.height = 200;
          $('#embed').removeClass('compact');
 
        }
 
        graph.height = graph.height - graph.margin.top  - graph.margin.bottom;
 
      }
 
      graph.width  = graph.width  
                  - graph.margin.left 
                  - graph.margin.right 
                  - (graph.embedmargin * 2);
 
      $('#graph').height(graph.height)
      $('img.spectrum').width(graph.width)
                       .height(100)
                       .css('margin-left', graph.margin.left)
                       .css('margin-right',graph.margin.right);
 
      // update only if we're past initialization
      if (graph.chart) {
        graph.chart.update();
      }
 
      // hide loading grey background
      $('#graphing #graph').css('background','white');
      $('#graphing #graph .icon-spinner').hide();
 
    });
  }

});
