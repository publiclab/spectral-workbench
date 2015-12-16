SpectralWorkbench.UI.Misc = {

  // Analyze only (depends on HTML elements):
  toggleLike: function(id) {
  
    var btn    = $('.like-container-' + id + ' .btn-like'),
        action = $('.like-container-' + id + ' .action'),
        icon   = $('.like-container-' + id + ' i.icon'),
        liked  = $('.like-container-' + id + ' .liked');
  
    btn.addClass("disabled");
  
    $.ajax({

      url: "/likes/toggle/"+id,
      type: "GET",

      success: function(result) {

        if (result == "unliked") {
          $W.notify('You unliked this spectrum.');
          action.html("Like");
          btn.removeClass("disabled");
          icon.addClass("fa fa-star-o");
          icon.removeClass("fa fa-star");
          liked.html(parseInt(liked.html())-1);

        } else {
          $W.notify('You liked this spectrum.');
          action.html("Unlike");
          btn.removeClass("disabled");
          icon.removeClass("fa fa-star-o");
          icon.addClass("fa fa-star");
          liked.html(parseInt(liked.html())+1);
        }

      }

    });

  }

}
