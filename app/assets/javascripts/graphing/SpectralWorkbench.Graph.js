SpectralWorkbench.Graph = Class.extend({

  init: function(args) {
    this.args = args;
    this.width = 600;
    this.embedmargin = 10;
    this.margin = { top: 10, right: 30, bottom: 20, left: 70 };
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
 
    nv.addGraph(this.graphSetup());

    // break this up into two subclasses, 
    // set and spectrum, with their own init sequences 
    if (this.dataType == "set") {
      // setup sets list of spectra
      var that = this;
      $('table.spectra input.visible').change(function(e) {
        var id      = $(this).attr('data-id'),
            checked = $(this).is(':checked');
        if (checked) {
          d3.selectAll('#spectrum-line-'+id).style('display','block');
        } else {
          d3.selectAll('#spectrum-line-'+id).style('display','none');
          $('table.spectra input.visible-all').attr('checked',false);
        }
      })
      $('table.spectra input.visible-all').change(function(e) {
        var checked = $(this).is(':checked');
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

    // Update the chart when window updates.
    $(window).on('resize', this.updateSize.apply(this));
  }

});
