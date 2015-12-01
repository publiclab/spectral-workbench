SpectralWorkbench.Image = Class.extend({

  init: function(element, _graph, callback) {

    var image = this;

    image.imgEl = element;
    image.imgObj = new Image();
    image.lineEl = false; // the line indicating the cross-section

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

      if (_graph.args.hasOwnProperty('sample_row')) image.setLine(_graph.args.sample_row);

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
     * Display a horizontal line on the image, y pixels below the top edge
     * (used for showing the image cross section)
     */
    image.setupLine = function(y) {

      image.imgEl.before($('<div class="section-line-container"><div class="section-line"></div></div>'));
      image.lineContainerEl = _graph.imgContainer.find('.section-line-container');
      image.lineContainerEl.css('position', 'relative');
      image.lineEl = _graph.imgContainer.find('.section-line');
      image.lineEl.css('position', 'absolute')
                  .css('width', '100%')
                  .css('top', 0)
                  .css('border-bottom', '1px solid rgba(255,255,255,0.5)')
                  .css('font-size', '9px')
                  .css('color', 'rgba(255,255,255,0.5)')
                  .css('text-align', 'right')
                  .css('padding-right', '6px')

    }


    /* ======================================
     * Display a horizontal line on the image, y pixels below the top edge
     * in displace pixels. To use in image pixels, divide by image pixels and multiply
     * by display height of element in pixels -- 100 by default.
     * (used for showing the image cross section)
     */
    image.setLine = function(y) {

      if (!image.lineEl) image.setupLine();

      y -= 1; // off by one correction
      y = y / image.height * 100; // convert to display scale

      if (y > 20) {

        image.lineEl.html('GRAPHED CROSS SECTION &nbsp;');
        image.lineEl.css('margin-top', '-22px');

      } else {

        image.lineEl.html('');
        image.lineEl.css('margin-top', '0');

      }

      image.lineEl.css('top', y);

      return image.lineEl;

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
