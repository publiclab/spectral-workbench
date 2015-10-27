SpectralWorkbench.Set = SpectralWorkbench.Datum.extend({

  // data as it arrives from server-side JSON
  init: function(data, _graph) {

    this._super(data, _graph);

    this.spectra = []; 

    var set = this;

    set.load = function() {

      $.each(set.json.spectra, function(i,spectrum) {

        set.spectra.push(new SpectralWorkbench.Spectrum(spectrum));
     
      });

    }

    set.d3 = function() {
 
      var data = [];
 
      $.each(set.spectra, function(i,spectrum) {

        data = data.concat([
          {
            values: spectrum.average,
            key:    spectrum.title,
            id:     spectrum.id
          }
        ]);

      });
 
      return data;
 
    }



    /* ======================================
     * Output server-style JSON of the spectrum
     * with all active powertags/operations applied -- exactly as currently seen in the graph
     * STUBBED FOR NOW; could aggreate 
     */
    set.toJSON = function() {

      var json = [];

      set.spectra.forEach(function(spectrum) {

        json.push({
          id: spectrum.id,
          title: spectrum.json.title,
          notes: spectrum.json.notes,
          author: spectrum.json.author,
          lines: spectrum.toJSON()
        });

      });

      return json;

    }


    /* ======================================
     * Returns [min, max] x-axis extent across all
     * member spectra in wavelength nanometers,
     * without applying wavelength range limits.
     * This only returns calibrated spectra (for now).
     */
    set.getFullExtentX = function() {

      return d3.extent(set.spectra.map(function(spectrum){ return spectrum.getFullExtentX(); }));

    }


    /* ======================================
     * Returns [min, max] x-axis extent across all member spectra
     * after applying wavelength range limits
     */
    set.getExtentX = function() {

      return d3.extent(set.spectra.map(function(spectrum){ return spectrum.getExtentX(); }));

    }


    /* ======================================
     * Returns [min, max] y-axis extent across all member spectra
     */
    set.getExtentY = function() {

      return d3.extent(set.spectra.map(function(spectrum){ return spectrum.getExtentY(); }));

    }


    /* ======================================
     * Returns array of overexposure assessments 
     * (boolean) of member spectra
     */
    set.getOverexposure = function() {

      var overexposure = [];
      set.spectra.map(function(spectrum) {

        overexposure.push(spectrum.getOverexposure());

      });

      return overexposure;
    }


    /* ======================================
     * Sets up event handlers for graph UI for sets,
     * especially set table of spectrum.
     */
    set.setupUI = function() {

 
      /* Line event handlers for Set table */
      var onmouseover = function() {

        var el = this;
        // this is silly, but not all of these are assigned <id> because of the zooming graph generator. d3.select(el).data()[0].id;
        var id = d3.select(this).attr('id').split('-')[2]; 
        $('tr.spectrum-'+id).addClass('highlight');
        d3.select(el).classed('highlight',true);
        // scroll to the spectrum in the table below:
        if (_graph.embed) window.location = (window.location+'').split('#')[0]+'#s'+id;
     
      }
     
      var onmouseout = function() {
     
        var el = this;
        // this is silly, but not all of these are assigned <id> because of the zooming graph generator. d3.select(el).data()[0].id;
        var id = d3.select(this).attr('id').split('-')[2]; 
        $('tr.spectrum-'+id).removeClass('highlight');
        d3.select(el).classed('highlight',false);
     
      }

      // the lines get covered by the scatterplot-based hover circles,
      // so we must listen to them instead:
      d3.selectAll('g.nv-scatterWrap g.nv-groups g') // hover circles
          .on("mouseover", onmouseover)
          .on("mouseout", onmouseout);


      set.spectra.forEach(function(datum, index) {

        // color corresponding table entry
        $('tr.spectrum-'+datum.id+' div.key').css('background', $('g#spectrum-line-' + datum.id).css('stroke'));
 
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

      });

    }


    this.load();

  }

});
