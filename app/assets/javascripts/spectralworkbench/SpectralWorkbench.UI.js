SpectralWorkbench.UI = {

  initTagForm: function(selector, spectrum_id) {

    $(selector).bind('submit', function(e){

      e.preventDefault();

      var tagname = $(selector + ' input.name').val();

      // callback handles only those 
      SpectralWorkbench.API.Core.addTag(spectrum_id, tagname, function(response) {

        $(selector + ' input.name').val("");
        $(selector + ' .control-group').removeClass('error');
        $(selector + ' .control-group .help-inline').remove();

        if (response['errors'].length > 0) {

          $(selector + ' .control-group').addClass('error');
          $(selector + ' .control-group .help-inline').remove();
          $(selector + ' .control-group').append('<span class="help-inline">'+response['errors']+'</span>');

        }

        $(selector + ' input.name').prop('disabled',false);

      });

    });

    $(selector).bind('ajax:beforeSend', function(){

      $(selector + ' input.name').prop('disabled',true)

    });

  }

}
