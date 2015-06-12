var SpectralWorkbench = {

  height: 300,
  width: 600,
  margin: { top: 20, right: 30, bottom: 10, left: 70 },

  graphData: [],

  initialize: function(args) {

    this.args = args;
    if (this.args.hasOwnProperty('spectrum_id')) this.dataType = "spectrum" 
    if (this.args.hasOwnProperty('set_id'))      this.dataType = "set" 

    // update size 
    SpectralWorkbench.height = SpectralWorkbench.height - SpectralWorkbench.margin.top  - SpectralWorkbench.margin.bottom;
    this.update(); // height only gets updated once, above, but width can change
 
    var svg = d3.select("#graph").append("svg")
      .attr("width",  this.width  + this.margin.left + this.margin.right)
      .attr("height", this.height + this.margin.top  + this.margin.bottom)
 
    nv.addGraph(function() {

      SpectralWorkbench.chart = nv.models.lineChart()
                       .height(SpectralWorkbench.height-SpectralWorkbench.margin.top-SpectralWorkbench.margin.bottom)
                       .margin(SpectralWorkbench.margin)
                       .useInteractiveGuideline(true)  //We want nice looking tooltips and a guideline!
//                     .transitionDuration(350)  //how fast do you want the lines to transition?
                       .showLegend(false)       //Show the legend, allowing users to turn on/off line series.
                       .showYAxis(true)        //Show the y-axis
                       .showXAxis(true)        //Show the x-axis
      ;
  
      SpectralWorkbench.chart.xAxis     //Chart x-axis settings
                .axisLabel('Wavelength (nanometers)')
                .tickFormat(d3.format('1d'));
  
      SpectralWorkbench.chart.yAxis     //Chart y-axis settings
                .axisLabel('Intensity (%)')
                .tickFormat(d3.format('%'));
 
      var dataUrl;
      if      ( SpectralWorkbench.dataType == "spectrum" ) dataUrl = "/spectrums/" + SpectralWorkbench.args.spectrum_id + ".json"
      else if ( SpectralWorkbench.dataType == "set" )      dataUrl = "/sets/"      + SpectralWorkbench.args.set_id      + ".json"
      
      /* Fetch data */ 
      d3.json(dataUrl, function(error, data) {

        if (SpectralWorkbench.dataType == "spectrum") {

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
         
            average.push({ y: data.average / 255, x: x })
            red.push(    { y: data.r / 255,       x: x })
            green.push(  { y: data.g / 255,       x: x })
            blue.push(   { y: data.b / 255,       x: x })

          });

          SpectralWorkbench.graphData = SpectralWorkbench.graphData.concat([
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

        } else if (SpectralWorkbench.dataType == "set") {

          var spectra = data.spectra,
              average = [];

          $.each(spectra, function(i,spectrum) {

            // Set up x and y properties like data.x and data.y
            $.each(spectrum.data.lines, function(i,data) {
              if (data.wavelength == null) {
 
                var x = data.pixel;
                // change graph labels
 
              } else var x = data.wavelength;
           
              average.push({ y: data.average / 255, x: x })
 
            });

          });

          SpectralWorkbench.graphData = SpectralWorkbench.graphData.concat([
            {
              values: average,
              key: data.title,
              color: 'rgba(200,0,0,0.5)' // use d3 color generator here
            }
          ]);

        }

        /* Enter data into the graph */
        d3.select('#graph svg')    //Select the <svg> element you want to render the chart in.   
            .datum(SpectralWorkbench.graphData)     //Populate the <svg> element with chart data...
            .call(SpectralWorkbench.chart)          //Finally, render the chart!
  //          .on("mouseover",this.onmouseover)
 
        })
  
      //Update the chart when window updates.
      //nv.utils.windowResize(function() {
      $(window).on('resize',function() {
        SpectralWorkbench.update();
        SpectralWorkbench.chart.update();
      });
      return this.chart;
    });
  },

  update: function() {
 
    SpectralWorkbench.width  = getUrlParameter('width')  || $(window).width() || SpectralWorkbench.width;
    SpectralWorkbench.height = getUrlParameter('height') || SpectralWorkbench.height;
 
    SpectralWorkbench.width  = SpectralWorkbench.width  - SpectralWorkbench.margin.left - SpectralWorkbench.margin.right,
 
    $('#graph').height(SpectralWorkbench.height)
    $('img.spectrum').width(SpectralWorkbench.width)
                     .height(100)
                     .css('margin-left',SpectralWorkbench.margin.left);
 
  },

  /* for lines */
  onmouseover: function() {
    // highlight this datum in the list
  }
 
}

