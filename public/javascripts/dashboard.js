var url = document.location.toString();
if (url.match('#')) {
  $('#main_tabs a[href=#'+url.split('#')[1]+']').tab('show') ;
}
