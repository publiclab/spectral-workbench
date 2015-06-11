var updateWidth;

jQuery(document).ready(function($) {

  var width, height, margin;

  updateWidth = function() {

    width  = getUrlParameter('width')  || $(window).width() || 600;
    height = getUrlParameter('height') || 300;
 
    margin = {top: 20, right: 30, bottom: 10, left: 70}
 
    width = width - margin.left - margin.right,
    height = height - margin.top - margin.bottom;

    $('#graph').height(height)
    $('img.spectrum').width(width)
                     .height(100)
                     .css('margin-left',margin.left);

  }
  updateWidth();

  var svg = d3.select("#graph").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)

  nv.addGraph(function() {
    chart = nv.models.lineChart()
                     .height(height-margin.top-margin.bottom)
                     .margin(margin)
                     .useInteractiveGuideline(true)  //We want nice looking tooltips and a guideline!
//                     .transitionDuration(350)  //how fast do you want the lines to transition?
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


    /* Fetch data */ 
    d3.json("/spectrums/"+spectrum_id+".json", function(error, data) {

      var average = []
          red     = [];
          green   = [];
          blue    = [];

      // Set up x and y properties like data.x and data.y
      $.each(data.data.lines,function(i,data) {
        if (data.wavelength == null) {
          var x = data.pixel
          // change graph labels
        } else var x = data.wavelength

        average.push({y:data.average/255,x:x})
        red.push(    {y:data.r/255,      x:x})
        green.push(  {y:data.g/255,      x:x})
        blue.push(   {y:data.b/255,      x:x})
      });

      /* Enter data into the graph */
      d3.select('#graph svg')    //Select the <svg> element you want to render the chart in.   
          .datum([{ 
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
          ])         //Populate the <svg> element with chart data...
          .call(chart);          //Finally, render the chart!
    })
 
    //Update the chart when window updates.
    nv.utils.windowResize(function() {
      updateWidth();
      chart.update();
    });
    return chart;
  });

});

