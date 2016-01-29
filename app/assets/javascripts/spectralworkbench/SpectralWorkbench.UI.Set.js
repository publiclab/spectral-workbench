SpectralWorkbench.UI.Set = Class.extend({

  init: function(_graph, set_id, spectra) {

    var _ui = this;


    /* ======================================
     * Initialize spectra search form
     */
    $('.btn-add-spectra').click(function() { 

      $('.spectra-search').show();

      var connectResults = function() {

        $('.spectra-search .results .btn-spectrum-apply').click(function(e) {
          
          $(this).html("<i class='fa fa-spin fa-spinner'></i>");
          window.location = "/sets/add/" + set_id + "?spectrum_id=" + $(this).attr('data-id');

        });

        // reset Apply buttons on pagination refresh, overriding any provided by response itself
        $('.pagination a').off('click');

        $('.pagination a').click(function () {
          $.get(this.href, function(response) {
 
            $('.results').html(response);
            connectResults();
 
          });
          return false;
        });

      }

      // fetch the spectrum choice list:
      $('.spectra-search .results').load("/spectrums/choose/", 
        { 
          own: true
        },
        connectResults
      );
 
      // set up the search form
      $('.spectra-search .form-search').on('submit',function() { 
 
        $('.spectra-search .results').html("<i class='fa fa-spin fa-spinner'></i>");
        $('.spectra-search .results').load(
          '/spectrums/choose/' + $('.spectra-search input.input-choose-spectrum').val(),
          { 
            // update formData with Your vs. All spectra select
            own: $('select.select-author').val()
          },
          connectResults
        );
 
        return false;
      });

    });


    /* ======================================
     * Sets up event handlers for graph UI for sets,
     * especially set table of spectrum.
     */
 
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


    spectra.forEach(function(datum, index) {

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

  },

});
