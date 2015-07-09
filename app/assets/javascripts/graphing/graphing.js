//= require core/Class.js 

SpectralWorkbench = Class({

  width: 600,
  embedmargin: 10,
  margin: { top: 10, right: 30, bottom: 20, left: 70 },

  initialize: function(args) {

    this.args = args;

    if (this.args.hasOwnProperty('spectrum_id')) this.dataType = "spectrum" 
    if (this.args.hasOwnProperty('set_id'))      this.dataType = "set" 

    // update size 
    this.updateSize()(); // height only gets updated once, above, but width can change
 
    var svg = d3.select("#graph").append("svg")
      .attr("width",  this.width  + this.margin.left + this.margin.right)
      .attr("height", this.height + this.margin.top  + this.margin.bottom)
 
    nv.addGraph(this.graphSetup());

    // toolbars etc
//    $('.dropdown-menu').dropdown();

    // break this up into two subclasses, set and spectrum, with their own init sequences 
    if (this.dataType == "set") {
      // setup sets list of spectra
      var that = this;
      $('table.spectra input.visible').change(function(e) {
        var id      = $(this).attr('data-id'),
            checked = $(this).is(':checked');
        if (checked) {
          // ok, use key, not raw ID, as that's 
          // not how this actually works;
          d3.selectAll('g.nv-series-'+id).style('display','none');
        } else {
          d3.selectAll('g.nv-series-'+id).style('display','block');
        }
      })
    }

    // Update the chart when window updates.
    $(window).on('resize', this.updateSize.apply(this));
  },

  graphSetup: function() {
    var chart = nv.models.lineChart()
                     .height(this.height-this.margin.top-this.margin.bottom)
                     .margin(this.margin)
                     .useInteractiveGuideline(true)  //We want nice looking tooltips and a guideline!
//                   .transitionDuration(350)  //how fast do you want the lines to transition?
                     .showLegend(false)       //Show the legend, allowing users to turn on/off line series.
                     .showYAxis(true)        //Show the y-axis
                     .showXAxis(true)        //Show the x-axis
    ;
  
    chart.xAxis     //Chart x-axis settings
              .axisLabel('Wavelength (nanometers)')
              .tickFormat(d3.format('1d'));
  
    chart.yAxis     //Chart y-axis settings
              .axisLabel('Intensity (%)')
              .tickFormat(d3.format('%'));

    /* for lines */
    var onmouseover = function() {
console.log('mouseover',this)
      // highlight this datum in the list
      // but use a class, not a style
      d3.selectAll('g.nv-group').classed('highlight',true);
    }
    var onmouseout = function() {
console.log('mouseout',this)
      // highlight this datum in the list
      d3.selectAll('g.nv-group').classed('highlight',false);
    }

    /* key function for d3 data binding */
    var idKey = function(d) {
      return d.id;
    }

    var that = this;
    var onImport = function(data,chart) {
      /* Enter data into the graph */
      that.data = d3.select('#graph svg')  //Select the <svg> element you want to render the chart in.   
          .datum(data,idKey)   //Populate the <svg> element with chart data and provide a binding key
          .call(chart)         //Finally, render the chart!
          .attr('data-id',idKey)
          .on("mouseover", onmouseover)
          .on("mouseout", onmouseout);
    }

    if (this.dataType == "spectrum") {
      this.importData( "/spectrums/" 
                      + this.args.spectrum_id 
                      + ".json", 
                        chart, 
                        onImport);
    } else if (this.dataType == "set") {
      this.importData( "/sets/" 
                      + this.args.set_id 
                      + ".json", 
                        chart, 
                        onImport);
    }

    return chart;
  },

  importData: function(url, chart, callback) {
    // preserve scope
    var that = this, _chart = chart;
 
    /* Fetch data */ 
    d3.json(url, function(error, data) {

      var processedData = [];

      if (that.dataType == "spectrum") {

        var lines   = data.data.lines,
            average = [],
            red     = [],
            green   = [],
            blue    = [];

        // Set up x and y properties like data.x and data.y
        $.each(lines,function(i,data) {

          if (data.wavelength == null) {

            var x = data.pixel;
            // change graph labels

          } else var x = data.wavelength;
       
          average.push({ y: parseInt(data.average / 2.55)/100, x: x })
          red.push(    { y: parseInt(data.r / 2.55)/100,       x: x })
          green.push(  { y: parseInt(data.g / 2.55)/100,       x: x })
          blue.push(   { y: parseInt(data.b / 2.55)/100,       x: x })

        });

        processedData = processedData.concat([
          {
            values: average,
            key: data.title+" (average)",
            color: '#444',
            id: data.id
          },
          {
            values: red,
            key: data.title+" (R)",
            color: 'rgba(255,0,0,0.2)'
          },
          {
            values: green,
            key: data.title+" (G)",
            color: 'rgba(0,255,0,0.2)'
          },
          {
            values: blue,
            key: data.title+" (B)",
            color: 'rgba(0,0,255,0.2)'
          }
        ]);

      } else if (that.dataType == "set") {

        var spectra = data.spectra;

        $.each(spectra, function(i,spectrum) {

          var average = [];

          // Set up x and y properties like data.x and data.y
          $.each(spectrum.data.lines, function(i,data) {
            if (data.wavelength == null) {

              var x = data.pixel;
              // change graph labels

            } else var x = data.wavelength;
         
            average.push({ y: data.average / 255, x: x })

          });

          processedData = processedData.concat([
            {
              values: average,
              key: spectrum.title,
              id: spectrum.id
            }
          ]);

        });

      }
      callback(processedData, chart);

    });
  },

  updateSize: function() {
    var that = this;

    return (function() { 
      that.width  = getUrlParameter('width')  || $(window).width() || that.width;
      if (getUrlParameter('height')) {
        that.height = getUrlParameter('height');
      } else {

        if (($(window).height() < 450 && that.dataType == 'set') || 
            ($(window).height() < 350 && that.dataType == 'spectrum')) {
          // compact
          that.height = 180;
          $('#embed').addClass('compact');
        } else {
          // full size
          that.height = 200;
          $('#embed').removeClass('compact');
        }
        that.height = that.height - that.margin.top  - that.margin.bottom;
      }
  
      that.width  = that.width  
                  - that.margin.left 
                  - that.margin.right 
                  - (that.embedmargin * 2);

      $('#graph').height(that.height)
      $('img.spectrum').width(that.width)
                       .height(100)
                       .css('margin-left',that.margin.left)
                       .css('margin-right',that.margin.right);
 
      // update only if we're past initialization
      if (that.chart) {
        that.chart.update();
      }

    })
  }
 
});
