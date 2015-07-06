/* Generic class inheritance methods */
Class = function(methods) {   
  var klass = function() {    
    this.initialize.apply(this, arguments);          
  };  
  
  for (var property in methods) { 
    klass.prototype[property] = methods[property];
  }
        
  if (!klass.prototype.initialize) klass.prototype.initialize = function(){};      
  
  return klass;    
};


SpectralWorkbench = Class({

  height: 300,
  width: 600,
  margin: { top: 20, right: 30, bottom: 10, left: 70 },
  graphData: [],

  initialize: function(args) {

    this.args = args;
    if (this.args.hasOwnProperty('spectrum_id')) this.dataType = "spectrum" 
    if (this.args.hasOwnProperty('set_id'))      this.dataType = "set" 

    // update size 
    this.height = this.height - this.margin.top  - this.margin.bottom;
    this.update(); // height only gets updated once, above, but width can change
 
    var svg = d3.select("#graph").append("svg")
      .attr("width",  this.width  + this.margin.left + this.margin.right)
      .attr("height", this.height + this.margin.top  + this.margin.bottom)
 
    nv.addGraph(this.graphSetup());

    // Update the chart when window updates.
    $(window).on('resize', this.update.apply(this));
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

    var dataUrl;

    if      ( this.dataType == "spectrum" ) dataUrl = "/spectrums/" + this.args.spectrum_id + ".json"
    else if ( this.dataType == "set" )      dataUrl = "/sets/"      + this.args.set_id      + ".json"

    // preserve scope
    var that = this;
 
    /* Fetch data */ 
    d3.json(dataUrl, function(error, data) {

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

        that.graphData = that.graphData.concat([
          {
            values: average,
            key: data.title+" (average)",
            color: '#444'
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

          that.graphData = that.graphData.concat([
            {
              values: average,
              key: spectrum.title
            }
          ]);

        });

      }

      /* Enter data into the graph */
      d3.select('#graph svg')    //Select the <svg> element you want to render the chart in.   
          .datum(that.graphData) //Populate the <svg> element with chart data...
          .call(chart)           //Finally, render the chart!
//        .on("mouseover",this.onmouseover)

    });

    // is this necessary? we immediately add it 
    // with nv.addGraph(...)
    this.chart = chart;

    return chart;
  },

  update: function() {
    var that = this;
    return (function() { 
      that.width  = getUrlParameter('width')  || $(window).width() || that.width;
      that.height = getUrlParameter('height') || that.height;
  
      that.width  = that.width  - that.margin.left - that.margin.right;
  
      $('#graph').height(that.height)
      $('img.spectrum').width(that.width)
                       .height(100)
                       .css('margin-left',that.margin.left);
 
      // update only if we're past initialization
      if (that.chart) {
        that.chart.update();
      }
    })
  },

  /* for lines */
  onmouseover: function() {
    // highlight this datum in the list
  }
 
});
