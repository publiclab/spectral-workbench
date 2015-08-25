SpectralWorkbench.UI.TagForm = Class.extend({

  init: function(_graph) {

    var selector = "#tag-form-" + _graph.datum.id;

    $(selector).bind('submit', function(e){

      e.preventDefault();

      $(selector + ' input.name').val().split(',').forEach(function(tagname) {

        _graph.datum.addTag(tagname);

      });

    });

    $(selector).bind('ajax:beforeSend', function(){

      $(selector + ' input.name').prop('disabled',true)

    });

    return $(selector);

  }

});
