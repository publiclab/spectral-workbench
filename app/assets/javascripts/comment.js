jQuery(document).ready(function() {

  $('.comment-form').bind('submit', function(e){
    e.preventDefault()
    var post_data = $(this).serializeArray();
    var form_url = $(this).attr("action");

    $.ajax({
      url: form_url,
      type: "POST",
      data: post_data,
      dataType: "json",
      beforeSend: function() {
        $("#comment-body").prop('disabled',true);
        $("#comment-submit").prop('disabled',true);
        $('#comments .fa-spinner').show();
      },
      success: function(response) {
        $('#comment-list').append('<div class="comment"><div class="header"><a name="c'+response.id+'"></a><p class="pull-right"><small><a href="/comments/delete/'+response.id+'" onclick="return confirm(\'Are you sure?\');"><i class="fa fa-trash"></i></a></small></p>Just now, <a href="/profile/'+current_user.login+'">'+current_user.login+'</a> <a class="anchor" href="#c'+response.id+'">wrote</a>:</div><div class="body">'+response.body+'</div></div>');
        $('#comment-body').prop('disabled',false);
        $('#comments .fa-spinner').hide();
        $('#comment-body').val('');
        $("#comment-submit").prop('disabled',false);
      },
      error: function(response) {
        alert("There was an error, and your comment couldn't be posted.");
        $('#comments .fa-spinner').hide();
        console.log(response);
      }
    })
  });

});
