jQuery(document).ready(function() {
  $('#searchform').submit(function(e){
    e.preventDefault()
    window.location = '/search/'+$('#searchform_input').val()
  })
  // working off of http://stackoverflow.com/questions/9232748/twitter-bootstrap-typeahead-ajax-example
  $('#searchform_input').typeahead({
    source: function (typeahead, query) {
      return $.post('/search/typeahead/'+query, {}, function (data) {
        return typeahead.process(data)
      })
    },
    items: 15,
    // Autoselect is disabled so that users can enter new tags
    autoselect: false,
    autowidth: false
  })

  var url = document.location.toString();
  if (url.match('#')) {
    $('#main_tabs a[href=#'+url.split('#')[1]+']').tab('show') ;
  }


})
