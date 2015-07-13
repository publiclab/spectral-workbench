SpectralWorkbench.Graph.prototype.graphSetup = function() {

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

  /* Line event handlers */
  var onmouseover = function() {
    var id = d3.select(this).data()[0].id;
    $('.spectrum-'+id).addClass('highlight');
    d3.select(this).classed('highlight',true);
  }
  var onmouseout = function() {
    var id = d3.select(this).data()[0].id;
    $('.spectrum-'+id).removeClass('highlight');
    d3.select(this).classed('highlight',false);
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
        .attr('id',idKey)

    d3.selectAll('g.nv-group')
        .on("mouseover", onmouseover)
        .on("mouseout", onmouseout)
        .attr("id", function() {
          var sel = d3.select(this)
              data  = sel.data()[0];
          // color corresponding table entry
          console.log(sel,'spectrum-'+data.id+' .key','background',sel.style('stroke'))
          $('.spectrum-'+data.id+' div.key').css('background',sel.style('stroke'));
          // highlight corresponding line
          $('.spectrum-'+data.id).mouseover(function() {
            d3.selectAll('#spectrum-line-'+data.id).classed('highlight',true);
          });
          $('.spectrum-'+data.id).mouseout(function() {
            d3.selectAll('#spectrum-line-'+data.id).classed('highlight',false);
          });
          // apparently HTML id has to begin with a string? 
          // http://stackoverflow.com/questions/70579/what-are-valid-values-for-the-id-attribute-in-html
          return 'spectrum-line-'+data.id;
        });

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
}

SpectralWorkbench.Graph.prototype.updateSize = function() {

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

    $('#graph').css('background','white');
    $('#embed #graph .icon-spinner').hide();

  });
}
