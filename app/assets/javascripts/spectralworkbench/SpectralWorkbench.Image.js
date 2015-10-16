SpectralWorkbench.Image = Class.extend({

  init: function(element, _graph, callback) {

    var image = this;

    image.imgEl = element;
    image.imgObj = new Image();

    image.callback = callback;

    image.imgObj.onload = function() {

      // build a canvas element, but hide it
      $('body').append('<canvas id="spectral-workbench-canvas" style="display:none;"></canvas>;');
      image.canvasEl = $('canvas#spectral-workbench-canvas');
      image.graph = _graph;
      image.width = image.imgObj.width;
      image.height = image.imgObj.height;
      image.canvasEl.width(image.width);
      image.canvasEl.height(image.height);
      image.ctx = image.canvasEl[0].getContext("2d");
      image.ctx.canvas.width = image.width;
      image.ctx.canvas.height = image.height;
      image.ctx.drawImage(image.imgObj, 0, 0, image.width, image.height);

      image.callback(); // since image loading is asynchronous

    }

    image.imgObj.src = image.imgEl.attr('src');

    /* ======================================
     * Returns a array of pixel brightnesses in [r,g,b,a] format, 
     * values from 0-255
     */
    image.getPoint = function(x,y) {

      return image.ctx.getImageData(x, y, 1, 1).data;

    }


    /* ======================================
     * Returns a nested array of pixels, each in the format of getPoint(), 
     * values from 0-255
     */
    image.getLine = function(y) {

      var output = [],
          input  = image.ctx.getImageData(0, y, image.width, 1).data;

      for (var i = 0; i < input.length; i += 4) {
        output.push([ input[i],
                      input[i+1],
                      input[i+2],
                      input[i+3] ]);
      }

      return output;

    }


    /* ======================================
     * Executes callback(x, y, e) when image is clicked
     * adjusted to actual pixels in original raw image
     */
    image.click = function(callback) {

      image.imgEl.click(function(e){

        var x = Math.round((e.offsetX / image.imgEl.width())  * image.width),
            y = Math.round((e.offsetY / image.imgEl.height()) * image.height);

        callback(x, y, e);

      });

    }


    /* ======================================
     * Deletes click listeners
     */
    image.clickOff = function() {

      image.imgEl.off('click');

    }


  }

});
