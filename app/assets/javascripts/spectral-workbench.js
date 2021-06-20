var SpectralWorkbench = {
  UI: {}
};

(function(exports){

   exports.SpectralWorkbench = SpectralWorkbench;

})(typeof exports === 'undefined'? this['spectralworkbench']={}: exports);

/* From http://ejohn.org/blog/simple-javascript-inheritance/ */

/* Simple JavaScript Inheritance
 * By John Resig http://ejohn.org/
 * MIT Licensed.
 */
// Inspired by base2 and Prototype
(function(){
  var initializing = false, fnTest = /xyz/.test(function(){xyz;}) ? /\b_super\b/ : /.*/;
 
  // The base Class implementation (does nothing)
  this.Class = function(){};
 
  // Create a new Class that inherits from this class
  Class.extend = function(prop) {
    var _super = this.prototype;
   
    // Instantiate a base class (but only create the instance,
    // don't run the init constructor)
    initializing = true;
    var prototype = new this();
    initializing = false;
   
    // Copy the properties over onto the new prototype
    for (var name in prop) {
      // Check if we're overwriting an existing function
      prototype[name] = typeof prop[name] == "function" &&
        typeof _super[name] == "function" && fnTest.test(prop[name]) ?
        (function(name, fn){
          return function() {
            var tmp = this._super;
           
            // Add a new ._super() method that is the same method
            // but on the super-class
            this._super = _super[name];
           
            // The method only need to be bound temporarily, so we
            // remove it when we're done executing
            var ret = fn.apply(this, arguments);        
            this._super = tmp;
           
            return ret;
          };
        })(name, prop[name]) :
        prop[name];
    }
   
    // The dummy class constructor
    function Class() {
      // All construction is actually done in the init method
      if ( !initializing && this.init )
        this.init.apply(this, arguments);
    }
   
    // Populate our constructed prototype object
    Class.prototype = prototype;
   
    // Enforce the constructor to be what we expect
    Class.prototype.constructor = Class;
 
    // And make this class extendable
    Class.extend = arguments.callee;
   
    return Class;
  };
})();

function getUrlHashParameter(sParam) {
  var sPageURL = window.location.hash;
  if (sPageURL) sPageURL = sPageURL.split('#')[1];
  var sURLVariables = sPageURL.split('&');
  for (var i = 0; i < sURLVariables.length; i++) 
  {
    var sParameterName = sURLVariables[i].split('=');
    if (sParameterName[0] == sParam) 
    {
      return sParameterName[1];
    }
  }
}

function getUrlParameter(sParam) {
  var sPageURL = window.location.search.substring(1);
  var sURLVariables = sPageURL.split('&');
  for (var i = 0; i < sURLVariables.length; i++) 
  {
    var sParameterName = sURLVariables[i].split('=');
    if (sParameterName[0] == sParam) 
    {
      return sParameterName[1];
    }
  }
}

SpectralWorkbench.Importer = Class.extend({

  init: function(url, graph, callback) {

    var importer = this;
    /* Fetch data */ 
    $.ajax({
      url: url,
      type: "GET",
      dataType: "json",
      success: function(data) {
 
        if (graph.dataType == "spectrum") {
 
          var datum = new SpectralWorkbench.Spectrum(data, graph);
  
        } else if (graph.dataType == "set") {
  
          var datum = new SpectralWorkbench.Set(data, graph);
  
        }

        callback(datum);
 
        // fetch and apply tags here -- i.e. only if they're the graph's primary data:
        datum.fetchTags(); 

      }
 
    });

  }

});

SpectralWorkbench.Image = Class.extend({

  init: function(_graph, options) {

    var image = this;

    image.options = options || {};
    image.options.selector = image.options.selector || 'div.swb-spectrum-img-container';

    // test if we're inside a require()
    // http://www.timetler.com/2012/10/13/environment-detection-in-javascript/
    var nodejs = typeof exports !== 'undefined' && this.exports !== exports;

    if (nodejs) {
      var Canvas = require('canvas');
      image.obj    = new Canvas.Image();
    } else {
      image.obj    = new Image();
    }


    if (!nodejs) {

      image.container = $(image.options.selector);
      image.el = image.container.find('img');

    }

    image.lineEl = false; // the line indicating the cross-section

    image.obj.onload = function() {

      image.graph = _graph;
      image.width = image.obj.width;
      image.height = image.obj.height;

      if (nodejs) {

        var Canvas = require('canvas'),
             Image = Canvas.Image,
             canvas = new Canvas(image.width, image.height);

        image.ctx = canvas.getContext('2d');

      } else {

        // We're in a browser; build a canvas element, but hide it.
        $('body').append('<canvas id="spectral-workbench-canvas" style="display:none;"></canvas>;');
        image.canvasEl = $('canvas#spectral-workbench-canvas:last');
        image.canvasEl.width(image.width);
        image.canvasEl.height(image.height);
        image.ctx = image.canvasEl[0].getContext("2d");

      }

      image.ctx.canvas.width = image.width;
      image.ctx.canvas.height = image.height;
      image.ctx.drawImage(image.obj, 0, 0, image.width, image.height);

      if (image.options.sample_row) image.setLine(image.options.sample_row);

      if (image.options.onLoad) image.options.onLoad(image); // since image loading is asynchronous

    }

    var src = image.options.url || image.el.attr('src');

    if (src) image.obj.src = src;
    else {

      // If there's no image, whether grabbed from the element
      // or supplied, just trigger onLoad callback already
      if (image.options.hasOwnProperty('onLoad')) image.options.onLoad(image);

    }

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

      if (_graph) {

        image.el.before($('<div class="section-line-container"><div class="section-line"></div></div>'));
        image.lineContainerEl = image.container.find('.section-line-container');
        image.lineContainerEl.css('position', 'relative');
        image.lineEl = image.container.find('.section-line');
        image.lineEl.css('position', 'absolute')
                    .css('width', '100%')
                    .css('top', 0)
                    .css('border-bottom', '1px solid rgba(255,255,255,0.5)')
                    .css('font-size', '9px')
                    .css('color', 'rgba(255,255,255,0.5)')
                    .css('text-align', 'right')
                    .css('padding-right', '6px')

      }

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

      image.el.click(function(e){

        var x = Math.round((e.offsetX / image.el.width())  * image.width),
            y = Math.round((e.offsetY / image.el.height()) * image.height);

        callback(x, y, e);

      });

    }


    /* ======================================
     * Deletes click listeners
     */
    image.clickOff = function() {

      image.el.off('click');

    }


    /* ======================================
     * Resizes image elements; called in Graph.updateSize()
     */
    image.updateSize = function() {

      // OK, due to issue https://github.com/publiclab/spectral-workbench/issues/240, 
      // we are getting aggressively empirical here and adding "_graph.extraPadding" to fix things
      // but essentially it seems there's a difference between reported d3 chart display width and actual 
      // measurable DOM width, so we adjust the displayed image with extraPadding.
      image.container.width(_graph.width)
                            .height(100);

      if (!_graph.embed) image.container.css('margin-left',  _graph.margin.left);
      else               image.container.css('margin-left',  _graph.margin.left);
                         // .css('margin-right', _graph.margin.right); // margin not required on image, for some reason


      if (_graph.range && _graph.datum) {

        if (_graph.datum.isCalibrated()) {

          // amount to mask out of image if there's a range tag;
          // this is measured in nanometers:
          _graph.leftCrop =   _graph.extent[0] - _graph.datum.json.data.lines[0].wavelength;
          _graph.rightCrop = -_graph.extent[1] + _graph.datum.json.data.lines[_graph.datum.json.data.lines.length - 1].wavelength;
          // note, we must use extent here instead of range, as range may extend beyond limit of data;
          // although we could alternately set the chart extent to include empty space

          _graph.pxPerNm = (_graph.width) / (_graph.extent[1] - _graph.extent[0]);
         
          _graph.leftCrop  *= _graph.pxPerNm;
          _graph.rightCrop *= _graph.pxPerNm;

        } else {

          // for uncalibrated, we still allow range, in case someone's doing purely comparative work:
          _graph.leftCrop =   _graph.extent[0] - _graph.datum.json.data.lines[0].pixel;
          _graph.rightCrop = -_graph.extent[1] + _graph.datum.json.data.lines[_graph.datum.json.data.lines.length - 1].pixel;
         
          _graph.pxPerNm = 1; // a lie, but as there are no nanometers in an uncalibrated spectrum, i guess it's OK.

        }

        image.el.width(_graph.width + _graph.leftCrop + _graph.rightCrop) // left and rightCrop are masked out range
                       .css('max-width', 'none')
                       .css('margin-left', -_graph.leftCrop);

      } else {

        image.el.width(_graph.width)
                       .height(100)
                       .css('max-width', 'none')
                       .css('margin-left', 0);

      }

    }


  }

});

SpectralWorkbench.Datum = Class.extend({

  init: function(args, _graph) {

    var _datum = this;

    _datum.args = args;
  
    if (_datum.args.data || _datum.args.spectra) _datum.json  = args;
    _datum.title = args.title;
    _datum.id    = args.id;
    _datum.graph = _graph;
    _datum.tags  = [];
    _datum.powertags = [];


    /* ======================================
     * Turns <a> link with specified selector into a download
     * link for the currently viewed data, as a JSON file
     */
    _datum.downloadJSON = function(selector) {

      $(selector).click(function() {

        $(this).attr('download','spectralwb-' + _datum.id + '.json')
               .attr('href','data:application/json;utf8,'+JSON.stringify(_datum.toJSON()));

      });

    }


    /* ======================================
     * Returns simple JSON array of pixels, in format:
     * { r: 0, g: 0, b: 0, average: 0, wavelength: 0 }
     */
    _datum.getJSON = function() {

      return _datum.json.data.lines;

    }


    /* ======================================
     * Create a new Tag or PowerTag depending on name,
     * upload it (if Tag), and run a callback. See addAndParseTag() and
     * addAndUploadTag() for PowerTag options.
     */
    _datum.addTag = function(name, callback, json) {

      json = json || false;

      // is it possible to have Tag constructor simply return a PowerTag if it matches?
      // i.e. move this code into Tag?

      var type = SpectralWorkbench.Tag;

      if (name.match(/[\w\.]+:[\w0-9\-#\*\+\[\]\(\)]+/)) type = SpectralWorkbench.PowerTag;

      return new type(_datum, name, json, callback);

    }


    /* ======================================
     * Create a new Tag or PowerTag, parse it (if PowerTag), 
     * then refresh and reload the graph (if PowerTag). This
     * does not upload PowerTags; see addAndUploadTag().
     */
    _datum.addAndParseTag = function(name, callback, json) {

      var parseCallback = function(tag) {

        tag.parse(function(tag) { 

          if (callback) callback(tag);

          if (_datum.graph) _datum.graph.reload_and_refresh();

        });

      }

      return _datum.addTag(name, parseCallback, json);

    }


    /* ======================================
     * Create a new Tag or PowerTag, parse it (if PowerTag), 
     * upload it, then refresh and reload the graph (if PowerTag). 
     * This is more commonly used than addAndParseTag(), as it
     * manages the required parsing before uploading, in order
     * to generate an up-to-date snapshot on the server side.
     */
    _datum.addAndUploadTag = function(name, callback, json) {

      var parseCallback = function(tag) {

        if (tag instanceof SpectralWorkbench.PowerTag) {

          tag.parse(function(tag) { 
 
            tag.upload(function(tag) {
 
              if (callback) callback(tag);
 
              if (tag.passive && _datum.graph) _datum.graph.undim();
              else if (_datum.graph) _datum.graph.reload_and_refresh();
 
            });
 
          });

        } else {

          tag.upload(callback);

        }

      }

      return _datum.addTag(name, parseCallback, json);

    }


    /* ======================================
     * Create a new Tag or PowerTag, fetch latest 
     * reference snapshot, then parse it (if PowerTag), 
     * upload it, then refresh and reload the graph (if PowerTag). 
     * This is more commonly used than addAndParseTag(), as it
     * manages the required parsing before uploading, in order
     * to generate an up-to-date snapshot on the server side.
     */
    _datum.addAndUploadTagWithReference = function(name, callback, json) {

      var parseCallback = function(tag) {

        if (tag instanceof SpectralWorkbench.PowerTag) {

          // here we do something different from addAndUploadTag;
          // we first fetch the latest reference (if any):
          tag.fetchReference(function() {

            tag.parse(function(tag) { 
  
              tag.upload(function(tag) {
  
                if (callback) callback(tag);
  
                if (tag.passive && _datum.graph) _datum.graph.undim();
                else if (_datum.graph) _datum.graph.reload_and_refresh();
  
              });

            });
 
          });

        } else {

          tag.upload(callback);

        }

      }

      return _datum.addTag(name, parseCallback, json);

    }


    /* ======================================
     * Return array of tags with given name, run 
     * callback(tag), if provided, on each.
     * Supplying no reference snapshot returns
     * snapshotted tags; i.e. getTag('calibrate:1') 
     * will return tag 'calibrate:1#2', but getTag('calibrate:1#2')
     * will not return 'calibrate:1' or 'calibrate:1#3'.
     */
    _datum.getTags = function(name, callback) {

      var response = [];

      _datum.tags.forEach(function(tag) {

        // test against snapshot-referencing tags too:
        if (tag.name == name || (tag.key + ':' + tag.value) == name) {

          if (callback) callback(tag);
          response.push(tag);

        }

      });

      return response;

    }


    /* ======================================
     * Return first tag with given name, run 
     * callback(tag) on the result.
     * Supplying no reference snapshot returns
     * snapshotted tags; i.e. getTag('calibrate:1') 
     * will return tag 'calibrate:1#2', but getTag('calibrate:1#2')
     * will not return 'calibrate:1' or 'calibrate:1#3'.
     */
    _datum.getTag = function(name, callback) {

      var response = false;

      _datum.tags.forEach(function(tag) {

        // test against snapshot-referencing tags too:
        if (tag.name == name || (tag.key + ':' + tag.value) == name) {

          response = tag;

        }

      });

      if (callback) callback(response);

      return response;

    }


    /* ======================================
     * Return first powertag with given key, run 
     * callback(tag) on the result.
     */
    _datum.getPowerTag = function(key, callback) {

      var response = false;

      _datum.tags.forEach(function(tag) {

        if (tag.key == key) {

          response = tag;

        }

      });

      if (callback) callback(response);

      return response;

    }


    /* ======================================
     * Find powertags by key, run callback(tag) on each if provided
     */
    _datum.getPowerTag = function(key, callback) {

      var powertags = [];
      _datum.tags.forEach(function(tag) {
        if (tag instanceof SpectralWorkbench.PowerTag && tag.key == key) {

          powertags.push(tag);
          if (callback) callback(tag);

        }
      });

      return powertags;

    }


    /* ======================================
     * Get tags from server, populate datum.tags, run them
     */
    _datum.fetchTags = function() {

      // flush existing displayed tag elements if any
      _datum.tags.forEach(function(tag) {

        // this only removes those by the TagForm, not in the Operations table
        if (tag.el) tag.el.remove();

        // also remove them from the Operations table:
        if (tag.operationEl) tag.operationEl.remove();

      });

      // flush local tag objects
      _datum.tags = [];

      $('#tags .loading').remove();

      // don't split here; specialize via inheritance
      if (_datum instanceof SpectralWorkbench.Spectrum) {

        if (_datum.graph) _datum.graph.dim();

        console.log("fetching tags for spectrum", _datum.id);

        $.ajax({

          url: "/spectrums/" + _datum.id + "/tags",
          type: "GET",
          dataType: "json",
       
          success: function(response) {

            response.sort(function(a, b) {
              if (a.created_at && a.created_at < b.created_at) return -1;
              else return 1;
            });

            // just add, don't parse:
            response.forEach(function(json, i) {

              _datum.addTag(json.name, false, json);

            });

            // now rely on parseTags to chain them and parse
            _datum.parseTags(function() {

              // Check the URL hash for directives, such
              // as `calibrate:foo` from the original page load;
              // these should clear out the first time they're checked.
              if (_datum.graph) _datum.graph.readHashDirectives();

            });

          }

        });

      } else {

        console.log('datum.fetchTags() only works on spectrums for now.');

      }

    }


    /* ======================================
     * Parses tags sequentially; this may involve
     * asynchronous calls, so we queue them. 
     * We use jQuery $.Deferred to wait for each to
     * to complete its asynchronous requests before 
     * proceeding to the next:
     * http://stackoverflow.com/questions/7743952/how-to-use-jquerys-deferred-object-with-custom-javascript-objects
     */
    _datum.parseTags = function(callback) {

      _datum.tagQueue = new Array();

      if (_datum.powertags.length === 0) {

        _datum.graph.reload_and_refresh();
        if (callback) callback();
        

      } else {

        _datum.powertags.forEach(function(tag, index) {
 
          _datum.tagQueue.push(tag.deferredParse(_datum.tagQueue)
            .done(function() {
 
               if (index == _datum.powertags.length - 1) {
 
                 if (_datum.graph) _datum.graph.reload_and_refresh();
                 if (callback) callback();
 
               }
 
            })
            .fail(function() {
 
               console.log('failed to parse' + tag.name);
 
            })
          );
 
        });

      }

    }

  }

});

SpectralWorkbench.Spectrum = SpectralWorkbench.Datum.extend({

  sigFigWavelength: 4, // currently used in calibrate() for wavelength
  sigFigIntensity: 4, // since image channel data is 0-255, or 000.4-100.0
  channels: ["average", "red", "green", "blue"],

  /* ======================================
   * <data> is a JSON object as it arrives from the server at SpectralWorkbench.org
   * Alternative constructors are available: 
   * 1. an array of [wavelength, intensity] using decodeArray()
   * 2. a string (in comma-separated value/CSV format) using decodeCSV()
   * 3. an image object using constructFromImage()
   */
  init: function(data, _graph, options) {

    // _super is Datum; this stashes <data> in this.json
    this._super(data, _graph);

    var _spectrum = this;


    // test if we're inside a require()
    // http://www.timetler.com/2012/10/13/environment-detection-in-javascript/
    var nodejs = typeof exports !== 'undefined' && this.exports !== exports;

    _spectrum.load = function() {

      if      (_spectrum.args instanceof Array)                    _spectrum.decodeArray(_spectrum.args);
      else if (typeof _spectrum.args == 'string')                  _spectrum.decodeCSV(_spectrum.args);
      else if (_spectrum.args instanceof SpectralWorkbench.Image)  _spectrum.constructFromImage(_spectrum.args, options);
      else if (typeof Image === 'function' && _spectrum.args instanceof Image)                    _spectrum.constructFromImage(_spectrum.args, options);
      else if (_spectrum.json && 
             (_spectrum.json.lines || _spectrum.json.data.lines)) _spectrum.decodeJSON(_spectrum.json); // snapshot or spectrum format

    }

    /* ======================================
     * Decodes and saves a [wavelength, intensity] array of 
     * data into spectrum.average/red/green/blue
     */
    _spectrum.decodeCSV = function(string) {

        var points = string.split('\n'),
            cleanPoints = [];

        points.forEach(function(point, i) { 
          if (point.length > 0 && point[0] != "#") cleanPoints.push([ +point.split(/,|\t/)[0], +point.split(/,|\t/)[1] ]);
        });

        _spectrum.decodeArray(cleanPoints);

    }

    /* ======================================
     * Decodes and saves a [wavelength, intensity] array of 
     * data into spectrum.average/red/green/blue expressed as
     * percentages. Wavelength may be pixel number if uncalibrated.
     */
    _spectrum.decodeArray = function(array) {

      _spectrum.average = [];
      _spectrum.red     = [];
      _spectrum.green   = [];
      _spectrum.blue    = [];

      // Set up x and y properties like data.x and data.y for d3
      array.forEach(function(line, i) {
     
        var x = line[0];

        // Only actually add it if it's in specified wavelength range ([start, end]), if any;
        // or, if there's no graph at all, add it. Perhaps range should be stored in spectrum?
        // But we need range in the graph to calculate viewport sizes.
        // Tortured:
        if (!_spectrum.graph || (!_spectrum.graph.range || (x >= _spectrum.graph.range[0] && x <= _spectrum.graph.range[1]))) {

          _spectrum.average.push({ y: parseInt(line[1] / 2.55)/100, x: x })
          _spectrum.red.push(    { y: parseInt(line[1] / 2.55)/100, x: x })
          _spectrum.green.push(  { y: parseInt(line[1] / 2.55)/100, x: x })
          _spectrum.blue.push(   { y: parseInt(line[1] / 2.55)/100, x: x })

        }

      });

      _spectrum.json = {};
      _spectrum.json.data = { 'lines': [] };
      _spectrum.json.data.lines = _spectrum.encodeJSON();

    }


    /* ======================================
     * Decodes and saves a SpectralWorkbench.org-style JSON object of 
     * data into spectrum.average/red/green/blue
     * UNTESTED IN JASMINE
     */
    _spectrum.decodeJSON = function(json) {

      _spectrum.average = [];
      _spectrum.red     = [];
      _spectrum.green   = [];
      _spectrum.blue    = [];

      // Rearrange in case we got a Snapshot response (which is more minimal) instead of a Spectrum response
      if (json.lines) _spectrum.json.data = { 'lines': json.lines };

      // Set up x and y properties like data.x and data.y for d3
      json.data.lines.forEach(function(line, i) {
     
        if (line.wavelength == null) var x = line.pixel; // change graph labels
        else                         var x = line.wavelength;

        // Only actually add it if it's in specified wavelength range ([start, end]), if any;
        // or, if there's no graph at all, add it. Perhaps range should be stored in spectrum?
        // But we need range in the graph to calculate viewport sizes.
        // Tortured:
        if (!_spectrum.graph || (!_spectrum.graph.range || (x >= _spectrum.graph.range[0] && x <= _spectrum.graph.range[1]))) {

          _spectrum.average.push({ y: parseInt(line.average / 2.55)/100, x: x })
 
          if (line.r != null) _spectrum.red.push(  { y: parseInt(line.r / 2.55)/100, x: x })
          if (line.g != null) _spectrum.green.push({ y: parseInt(line.g / 2.55)/100, x: x })
          if (line.b != null) _spectrum.blue.push( { y: parseInt(line.b / 2.55)/100, x: x })

        }

      });

    }


    /* ======================================
     * Prepares a CSV formatted data in range
     * based on spectrum.average
     */
    _spectrum.encodeCSV = function() {

      var lines = [];

      _spectrum.average.forEach(function(line, i) {

        if (_spectrum.isCalibrated()) lines.push(_spectrum.average[i].x);
        else                          lines.push(i);

        lines[lines.length - 1] += ',' + +(_spectrum.average[i].y * 255).toPrecision(_spectrum.sigFigIntensity);
        
      }); 

      return lines.join('\n');

    }


    /* ======================================
     * Prepares a server-ready formatted JSON object of 
     * currently displayed data based on spectrum.average/red/green/blue
     */
    _spectrum.encodeJSON = function() {

      var lines = [];

      _spectrum.average.forEach(function(line, i) {

        lines.push({
          average:    +(_spectrum.average[i].y * 255).toPrecision(_spectrum.sigFigIntensity),
          r:          +(_spectrum.red[i].y     * 255).toPrecision(_spectrum.sigFigIntensity),
          g:          +(_spectrum.green[i].y   * 255).toPrecision(_spectrum.sigFigIntensity),
          b:          +(_spectrum.blue[i].y    * 255).toPrecision(_spectrum.sigFigIntensity)
        });

        if (_spectrum.isCalibrated()) lines[lines.length-1].wavelength = _spectrum.average[i].x;
        else                          lines[lines.length-1].pixel      = _spectrum.average[i].x;
        
      }); 

      return lines;

    }


    /* ======================================
     * Constructs spectrum from an image object,
     * which must already be loaded and ready.
     * If it's a plain image, will wrap it in SpectralWorkbench.Image.
     */
    _spectrum.constructFromImage = function(image, options) {

      options = options || {};
      options.y = options.y || 0;
      // this is likely a new image, so we don't keep calibration by default:
      options.keepCalibrated = options.keepCalibrated || false;

      if (image instanceof Image) image = new SpectralWorkbench.Image(image);

      _spectrum.image = image;

      _spectrum.imgToJSON(options.y, options.keepCalibrated);

    }


    /* ======================================
     * Returns closest intensity for a given wavelength,
     * from available wavelength/intensity pairs
     */
    _spectrum.getIntensity = function(wavelength, channel) {

      channel = channel || "average";

      channel = _spectrum[channel];

      // reverse it if need be
      if (channel[0].x > channel[channel.length - 1].x) channel.reverse();

      var stepsize        = (channel[channel.length-1].x - channel[0].x) / channel.length,
          startWavelength = channel[0].x,
          wavelengthIndex = parseInt((wavelength - startWavelength) / stepsize);

      // must consider data of different lengths!

      if (wavelengthIndex > 0 && wavelengthIndex < channel.length) {

        return channel[wavelengthIndex].y;

      } else return 0;

    }


    /* ======================================
     * Returns [min, max] x-axis extent of displayed data
     * without wavelength range limiting
     * in nanometers (or pixels if uncalibrated)
     */
    _spectrum.getFullExtentX = function() {

      if (_spectrum.isCalibrated()) {

        var start =  _spectrum.json.data.lines[0].wavelength;
        var end =  _spectrum.json.data.lines[_spectrum.json.data.lines.length-1].wavelength;

      } else {

        var start =  _spectrum.json.data.lines[0].pixel;
        var end =  _spectrum.json.data.lines[_spectrum.json.data.lines.length-1].pixel;

      }

      return [start, end];

    }


    /* ======================================
     * Returns [min, max] x-axis extent of displayed data
     * after any wavelength range limiting
     * in nanometers (or pixels if uncalibrated)
     */
    _spectrum.getExtentX = function() {

      var start =  _spectrum.average[0].x;
      var end =  _spectrum.average[_spectrum.average.length - 1].x;

      return [start, end];

//      return d3.extent(_spectrum.d3()[0].values, function(d){ return d.x; }); // previous version, probably slower?

    }


    /* ======================================
     * Returns [min, max] y-axis extent of displayed data
     */
    _spectrum.getExtentY = function() {

      return d3.extent(_spectrum.d3()[0].values, function(d){ return d.y; });

    }


    /* ======================================
     * Returns nearest point to <x> in data space
     * in given <channel>; default channel is 'average'.
     */
    _spectrum.getNearestPoint = function(x, channel) {

      channel = channel || "average";

      var closest = null;

      channel = _spectrum[channel].forEach(function(pixel) {

        if (closest == null || Math.abs(pixel.x - x) < closest.dist) {

          closest = pixel;
          closest.dist = Math.abs(pixel.x - x);

        }

      });

      return closest;

    }


    /* ======================================
     * Returns highest intensity wavelength (or pixel if uncalibrated) 
     * within <distance> pixels of <x>
     * in given <channel>; default channel is 'average'.
     */
    _spectrum.getNearbyPeak = function(x, distance, channel) {

      channel = channel || "average";

      var max = null,
          compared = 0; // # of pixels compared
          plateau = []; // list of equally high points in case there are multiple; 
                        // we return the center of the plateau; even 
                        // if the plateau is not continuous

      channel = _spectrum[channel].forEach(function(pixel, i) {

        if (pixel.x > x - distance && pixel.x < x + distance) {

          compared += 1;

          if (max == null) max = pixel;

          if (pixel.y > max.y) {

            max = pixel;
            plateau = [];

          } else if (pixel.y == max.y) {

            plateau.push(pixel);

          }

        }

      });

      if (compared > 0) {

        // don't allow plateaus at <3%
        if (plateau.length > 0 && max.y > 0.03) {

          console.log('Found plateau ' + plateau.length + ' wide in given range; returned center.');
          return plateau[~~(plateau.length/2)].x; // the middle of the plateau

        } else return max.x;

      } else {

        console.log('No data fell within ' + distance + ' of ' + x + '.');
        return x; // fallback to original position

      }

    }


    /* ======================================
     * Returns true if the spectrum is calibrated (client-side)
     */
    _spectrum.isCalibrated = function() {

      //return _spectrum.json.data.lines[0].hasOwnProperty('wavelength');
      // rewritten as above was not accounting for unsaved 
      // calibration; below can be wrong but it's very unlikely
      return _spectrum.average[0] && _spectrum.average[0].x != 0;

    }


    /* ======================================
     * Linear calibrates on the client side; then uploads and tags
     * w1 and w2 are nanometer wavelength values, and x1 and x2 are 
     * corresponding pixel positions, measured from left
     */
    _spectrum.calibrateAndUpload = function(w1, w2, x1, x2) {

      _spectrum.json.data.lines = _spectrum.calibrate(w1, w2, x1, x2);

      _spectrum.graph.datum.load()
      _spectrum.graph.reload()
      _spectrum.graph.refresh()

      _spectrum.upload(false, function() {

        _spectrum.getPowerTag('calibration').forEach(function(tag) {

          tag.destroy();

        });

        if (_spectrum.getTag('calibration') == false) _spectrum.addTag('calibration');

        _spectrum.graph.UI.notify("Your new calibration has been saved.", "success");

      });

    }


    /* ======================================
     * Linear calibrates on the client side, but doesn't save;
     * returns a new set of lines which can be used to overwrite
     * spectrum.json.data.lines.
     * w1 and w2 are nanometer wavelength values, and x1 and x2 are 
     * corresponding pixel positions, measured from left.
     */
    _spectrum.calibrate = function(w1, w2, x1, x2, flipping) {

      var stepsize = (w2 - w1) / (x2 - x1),
          startwavelength = w1 - (stepsize * x1),
          output = [],
          lines = _spectrum.json.data.lines;

      if (typeof flipping == "undefined") flipping = true; // deal with flipped images by default

      // account for reversed data:
      if (flipping && _spectrum.graph) {

        if (x1 > x2) {
 
          console.log('flipping data and image due to x1/x2 reversal');

          // I don't believe we *ever* want to actually reverse the data's order!
          // lines = lines.reverse();
          if (_spectrum.image.el) _spectrum.image.el.addClass('flipped');
 
        } else {
 
          if (_spectrum.image.el) _spectrum.image.el.removeClass('flipped');
 
        }

      }

      lines.forEach(function(line, i) {

        output.push({
          'average': line.average,
          'r': line.r,
          'g': line.g,
          'b': line.b,
          'wavelength': +(startwavelength + (i * stepsize)).toPrecision(_spectrum.sigFigWavelength)
        });

      });

      return output;

    }


    /* ======================================
     * Converts a nanometer value to a pixel x-value in the original image
     * from raw JSON data, disregarding range, assuming that each
     * spectrum.json.data.lines corresponds to a pixel in the original image,
     * (counting from left) if the current spectrum is calibrated
     */
    _spectrum.nmToPx = function(nm) {

      if (_spectrum.isCalibrated()) {

        var lines = _spectrum.json.data.lines,
            w1 = lines[0].wavelength,
            w2 = lines[lines.length-1].wavelength,
            stepsize = lines.length / (w2 - w1);

        // keep 4 significant digits
        return 0 + (nm * stepsize);

      } else {

        return false;

      }

    }


    /* ======================================
     * Converts a pixel value (counting from left) 
     * from raw JSON data, disregarding range, to a nanometer 
     * value if the current spectrum is calibrated.
     * Result may not correspond to a specific point of data, but use
     * spectrum.getNearestPoint() if needed.
     * Returns false if not calibrated.
     */
    _spectrum.pxToNm = function(px) {

      if (_spectrum.isCalibrated()) {

        var lines = _spectrum.json.data.lines,
            w1 = lines[0].wavelength,
            w2 = lines[lines.length-1].wavelength,
            stepsize = (w2 - w1) / lines.length;

        // keep 4 significant digits
        return w1 + (px * stepsize);

      } else {

        return false;

      }

    }


    /* ======================================
     * Output server-style JSON of the spectrum
     * with all active powertags/operations applied -- 
     * exactly as currently seen in the graph.
     */
    _spectrum.toJSON = function() {

      var json = [];

      _spectrum.average.forEach(function(pixel, index) {

        json.push({
          'average': +pixel.y,
          'r': +_spectrum.red[index].y,
          'g': +_spectrum.green[index].y,
          'b': +_spectrum.blue[index].y,
          'pixel': index
        });

      });

      return json;

    }


    /* ======================================
     * Overwrite spectrum.json.data.lines, the raw JSON of the spectrum
     * <y> is the y-position of the cross section of pixels, where 0 is the top row
     * <keepCalibrated> is a boolean which indicates whether to keep or flush the calibration
     * <image> is a SpectralWorkbench.Image object, defaulting to spectrum.image
     */
    _spectrum.imgToJSON = function(y, keepCalibrated, image) {

      var lines = [];

      image = image || _spectrum.image;

      image.getLine(y).forEach(function(pixel, index) {

        lines.push({
          'average': +((pixel[0] + pixel[1] + pixel[2]) / 3).toPrecision(_spectrum.sigFigIntensity),
          'r': pixel[0],
          'g': pixel[1],
          'b': pixel[2],
          'pixel': index
        });

        if (keepCalibrated) lines[lines.length - 1].wavelength = _spectrum.pxToNm(index);

      });

      // dislike:
      _spectrum.json = _spectrum.json || {};
      _spectrum.json.data = _spectrum.json.data || {};
      _spectrum.json.data.lines = lines;

      return _spectrum.json.data.lines;

    }


    /* ======================================
     * Iterate through channel data and set precision of 
     * each entry to sigFigures>, but defaulting to
     * _spectrum.sigFigIntensity which is 3.
     */
    _spectrum.setSigFigures = function(sigFigures) {

       sigFigures = sigFigures || _spectrum.sigFigIntensity;

       _spectrum.channels.forEach(function(channel, i) {

         _spectrum[channel].forEach(function(point, i) {

           if (point.y && (point.y + '').length > sigFigures) point.y = +(point.y).toPrecision(sigFigures);
           if (point.x && (point.x + '').length > _spectrum.sigFigWavelength) point.x = +(point.x).toPrecision(_spectrum.sigFigWavelength);

         });

       });

    }


    /* ======================================
     * Upload a new json string to the server, overwriting the original. 
     * Not recommended without cloning! But recoverable from original image.
     * Most uses of this function will be deprecated with the Snapshots system:
     * https://publiclab.org/wiki/spectral-workbench-snapshots
     */
    _spectrum.upload = function(url, callback, formData) {

      url = url || '/spectrums/' + _spectrum.id;
      callback = callback || function callback(err, httpResponse, body) { console.log(body) };
      formData = formData || {};

      var data = {
        spectrum: {
          title: _spectrum.json.title,
          notes: _spectrum.json.notes,
          data_type: 'json',
          // we stringify manually here since it was not flattening 
          // spectrum.json.data.lines into an array, but an object
          data: JSON.stringify(_spectrum.json.data.lines)
          //data: JSON.stringify(_spectrum.json.data) // <= this was previous version... was it used?
        }
      }

      // overwrite default form data with passed options object
      Object.keys(formData).forEach(function(key, i) {
        data[key] = formData[key];
      });

      if (nodejs) {

        var request = require('request');
 
        // untested... mock this
        request.post({
                  url: url,
                  form: data 
                }, callback)
                .on('error', function(err) {
                  console.log(err)
                });

      } else {

        $.ajax({
 
          url: url,
          type: "PUT",
          dataType: "json",
          data: data

        }).done(function(response) {

          callback(response);
 
        }).fail(function(response) {
 
          _spectrum.graph.UI.notify(response['errors'], "error");
 
        });

      }
      
    }


    /* ======================================
     * Fetch data to populate self, from server, using spectrum.id.
     * Overwrites spectrum.json and runs spectrum.load().
     */
    _spectrum.fetch = function(url, callback) {

      url = url || '/spectrums/' + _spectrum.id + '.json';

      $.ajax({

        url: url,
        type: "GET",
        dataType: "json",
        success: function(response) {

          _spectrum.json  = response;
          _spectrum.load();

          if (callback) callback();

        },
        error: function(response) {

          _spectrum.graph.UI.notify(response['errors'], "error");

        }
      });
      
    }

 
    /* ======================================
     * Inspects all channels recursively for sequential
     * pixels of 100%, which would indicate overexposure. Returns
     * whether it passed the threshold and the last inspected index.
     * <threshold> is how bright a pixel must be to trigger an overexposure warning (0-255)
     * <consecutive> is how many pixels of consecutive 100% triggers an overexposure warning
     */
    _spectrum.getOverexposure = function(threshold, consecutive) {

      var overexposure_recurse = function(data, i, count, color, threshold, consecutive) {
     
        if (count > consecutive) return [true, i]
        else {
     
          if (data[i][color] >= threshold) {
            return overexposure_recurse(data, i+2, count+2, color, threshold, consecutive)
          } else return [false,i]
     
        }
     
      }

      var _overexposed = {r: false, g: false, b: false}
          _colors = ["r","g","b"],
          _lines = _spectrum.json.data.lines;

      threshold = threshold || 250;
      consecutive = consecutive || 20;

      // check each channel for plateaus at 100%:
      _colors.forEach(function(color) {

        var spectrumIndex = 0;

        while (spectrumIndex < _lines.length) {

          var line = _lines[spectrumIndex];
          var scan = overexposure_recurse(_lines, spectrumIndex, 0, color, threshold, consecutive);

          if (scan[0]) {

            _overexposed[color] = true;
            spectrumIndex = _lines.length; // skip to end

          } else spectrumIndex = scan[1] + 10;

        }

      });

      return _overexposed;

    }

 
    /* ======================================
     * Determines if a spectrum is too dark and makes a recommendation to fix this
     * <threshold> is a percent brightness cutoff; returns a boolean
     */
    _spectrum.getTooDark = function(threshold) {

      var _tooDark = true;

      // by percent!
      threshold = threshold || 0.05;

      // check each channel for plateaus at 100%:
      _spectrum.channels.forEach(function(_channel) {

        for (var i = 0; i < _spectrum[_channel].length; i += 1) {

          if (_spectrum[_channel][i].y > threshold) _tooDark = false;

        }

      });

      return _tooDark;

    }


    /* ======================================
     * Returns a set of graph line datasets formatted for 
     * display in a d3 chart, based on spectrum.average
     */
    _spectrum.d3 = function() {

      return [
        {
          values: _spectrum.average,
          key:    _spectrum.title+" (average)",
          color:  '#444',
          id:     _spectrum.id
        },
        {
          values: _spectrum.red,
          key:    _spectrum.title+" (R)",
          color:  'rgba(255,0,0,0.2)'
        },
        {
          values: _spectrum.green,
          key:    _spectrum.title+" (G)",
          color:  'rgba(0,255,0,0.2)'
        },
        {
          values: _spectrum.blue,
          key:    _spectrum.title+" (B)",
          color:  'rgba(0,0,255,0.2)'
        }
      ];

    }


    _spectrum.load();

  }

});

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
            key:    '#' + spectrum.id + ': ' + spectrum.title,
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


    this.load();

  }

});

SpectralWorkbench.Tag = Class.extend({

  // <json> is a JSON obj of the tag as received from the server; 
  // if this doesn't exist, it's a new tag
  // <callback> will be called as callback(tag, ajaxResponse)
  init: function(datum, name, json, callback) {

    var _tag = this;

    _tag.name = name;
    _tag.datum = datum;


    if (json) { 

      // it's an existing tag; don't upload
      _tag.json = json;
      _tag.id = json.id;
      _tag.uploadable = false;
      _tag.created_at = new Date(json.created_at);

    } else {

      // it's a new tag; upload when done constructing
      _tag.uploadable = true;
      _tag.json = {};

    }

    _tag.startSpinner = function() {

      $('#swb-tag-form-' + _tag.datum.id + ' .add-on i').removeClass('fa-tag')
                                                        .addClass('fa-spin')
                                                        .addClass('fa-spinner');

    }

    _tag.stopSpinner = function() {

      $('#swb-tag-form-' + _tag.datum.id + ' .add-on i').addClass('fa-tag')
                                                        .removeClass('fa-spin')
                                                        .removeClass('fa-spinner');

    }


    // if new, send tag to server
    _tag.upload = function(callback) {

      // this gets messy, but whatever
      _tag.startSpinner();

      // grey out graph during load
      if (_tag.datum.graph) _tag.datum.graph.dim();

      var name = _tag.name;

      // we add reference_id in case it's a PowerTag with one:
      if (_tag.reference_id) name += "#" + _tag.reference_id;

      var data = {
        authenticity_token: $('meta[name=csrf-token]').attr('content'),
        tag: {
          spectrum_id: _tag.datum.id,
          name: name
        }
      };

      // for PowerTags: this will have to be adapted as we add tags to sets
      if (_tag.data) data.tag.data = _tag.data;

      $.ajax({
 
        url: "/tags",
        type: "POST",
        dataType: "json",
        data: data,
        success: function(response) {

          _tag.uploadSuccess(response, callback);

        },
        error: _tag.uploadError
 
      });

    }


    // used on failed tag upload
    _tag.notify_and_offer_clear = function() {

      if (_tag.datum.graph) {

        var notice = _tag.datum.graph.UI.notify("The tag you've applied couldn't be saved, but it's been run locally. <a class='tag-clear-" + _tag.id + "'>Clear it now</a>.");
       
        $('.tag-clear-' + _tag.id).click(function() {
       
          _tag.destroy();
          notice.remove();
       
        });

      }

    }


    _tag.uploadSuccess = function(response, callback) {

      _tag.stopSpinner();
      if (_tag.datum.graph) _tag.datum.graph.tagForm.clearError();

      // remove grey out of graph after load
      if (_tag.datum.graph) _tag.datum.graph.undim();

      if (response['saved']) {

        // response is a JSON object whose keys are tagnames
        if (response['saved'][_tag.name] || _tag.reference_id && response['saved'][_tag.name_with_reference]) {

          if (_tag.reference_id && response['saved'][_tag.name_with_reference]) var tag_response = response['saved'][_tag.name_with_reference];
          else var tag_response = response['saved'][_tag.name];

          // this will typically copy in .id, .snapshot_id, .created_at, 
          // and .has_dependent_spectra (some for powertags)
          Object.keys(tag_response).forEach(function(key) {

            _tag[key] = tag_response[key];

            if (key == 'created_at') _tag.created_at = new Date(tag_response.created_at);

          });

        }

        // render them!
        _tag.render();

        // from init() call
        if (callback) callback(_tag, response);

      }

      if (response['errors'] && response['errors'].length > 0) {

        if (_tag.datum.graph) _tag.datum.graph.tagForm.error(response['errors']);
        _tag.notify_and_offer_clear();
        console.log(response.responseText);

      }

    }


    _tag.uploadError = function(response) {

      if (_tag.datum.graph) _tag.datum.graph.tagForm.error('There was an error.');
      _tag.notify_and_offer_clear();
      console.log(response.responseText);

    }


    // Delete it from the server, then from the DOM;
    _tag.destroy = function(callback) {

      $('span#tag_' + _tag.id).css('background', '#bbb')
                                                             .html(_tag.el.html() + " <i class='fa fa-spinner fa-spin fa-white'></i>");

      $.ajax({
        url: "/tags/" + _tag.id,
        type: "DELETE",

        success: function(response) {

          _tag.cleanUp(callback);
 
        }

      });
 
    }


    // scrubs local tag data; for use after deletion
    _tag.cleanUp = function(callback) {

        if (_tag.datum.graph) _tag.datum.graph.dim();

        // if it failed to initialize, the element may not exist
        if (_tag.el) _tag.el.remove();

        // remove it from datum.tags:
        _tag.datum.tags.splice(_tag.datum.tags.indexOf(_tag), 1);

        if (callback) callback(_tag);

    }


    // actually insert DOM elements into the page
    _tag.render = function() {

      var container = $('.swb-tags span.list');
 
      _tag.el = $("<span id='tag_" + _tag.id + "'></span>");

      container.append(_tag.el);

      _tag.el.attr('rel', 'tooltip')
             .addClass('label label-info')
             .append("<a href='/tags/" + _tag.name + "'>" + _tag.name+"</a> ")

        // this is for regular tag display, to the left:
        _tag.el.append("<a class='tag-delete'>x</a>");
        _tag.deleteEl = $('#tag_' + _tag.id + ' .tag-delete');
        _tag.deleteEl.attr('data-id', _tag.id)
                     .click(function() { _tag.destroy(); });

      // deletion listener
      _tag.deleteEl.bind('ajax:success', function(){

        _tag.cleanUp();

      });
 
    }

    if (!(_tag instanceof SpectralWorkbench.PowerTag)) { // note: this section overridden in PowerTag

      if (callback) callback(_tag);

      if (_tag.uploadable && callback) {
 
        // render called after upload, in uploadSuccess, triggered by above callback
 
      } else {

        _tag.render();
 
      }

    }

    _tag.datum.tags.push(_tag);

    return _tag;
 
  }

});

/* 

PowerTags are Operations, a specialized type of tag which are used to 
edit the spectrum data. They are reversible, atomic, ordered by created_at,
and have strict rules for deletability, which are enforced on the server 
side, but also indicated to the user in the interface.

*/
SpectralWorkbench.PowerTag = SpectralWorkbench.Tag.extend({

  has_reference: false, // if we refer to a snapshot_id of another spectrum
  needs_snapshot: false, // if we should send snapshotted data, based on the snapshot_tagnames list

  // these tagnames will trigger a snapshot to be saved to the server:
  // this list must be kept consistent with that in /app/models/tag.rb
  snapshot_tagnames: [

    "calibrate",
    "linearCalibration",
    "subtract",
    "transform",
    "blend",
    "range",
    "crossSection",
    "smooth",
    "flip"

  ],

  reference_tagnames: [

    "calibration", // maybe not
    "calibrate",
    "subtract",
    "forked",
    "blend"

  ],

  /* ======================================
   * <json> is a JSON obj of the tag as received from the server; 
   * if this doesn't exist, it's a new tag
   * <callback> will be called as callback(tag, ajaxResponse)
   */
  init: function(datum, name, json, callback) {

    // OH MY GOD, FORGETTING VAR HERE COST ME 3 HOURS:
    var _tag = this;

    // basic Tag initialization
    _tag._super(datum, name, json, false);

    _tag.datum.powertags.push(_tag);

    _tag.key = _tag.name.split(':')[0];
    _tag.value = _tag.name.split(':')[1];

    // scan for tags that require snapshots, but this isn't the right place to save it -- we need to parse it!
    if (_tag.snapshot_tagnames.indexOf(_tag.key) != -1)  _tag.needs_snapshot  = true;
    if (_tag.reference_tagnames.indexOf(_tag.key) != -1) _tag.needs_reference = true; // only that this tagname typically does need it, not whether it's been made yet

    _tag.description = function() {

      if (SpectralWorkbench.API.Operations.hasOwnProperty(_tag.key)) return SpectralWorkbench.API.Operations[_tag.key].description(_tag);
      else                                                           return "No description yet.";

    }


    /* ======================================
     * In a new tag, we rely on parent class's tag.upload() to copy 
     * these over, but for existing tags, we have to do it manually:
     */
    _tag.parseSnapshotResponse = function(json) {

      // has it generated a snapshot?
      // note that this won't have happened yet for new tags, until after parsing;
      // however, we check response from tag.upload() for a snapshot id and set it there too
      if (json.hasOwnProperty('snapshot_id'))                          _tag.snapshot_id                          = json.snapshot_id;
      if (json.hasOwnProperty('has_dependent_spectra'))                _tag.has_dependent_spectra                = json.has_dependent_spectra;
      if (json.hasOwnProperty('dependent_spectra'))                    _tag.dependent_spectra                    = json.dependent_spectra;
      if (json.hasOwnProperty('has_subsequent_depended_on_snapshots')) _tag.has_subsequent_depended_on_snapshots = json.has_subsequent_depended_on_snapshots;
      if (json.hasOwnProperty('refers_to_latest_snapshot'))            _tag.refers_to_latest_snapshot            = json.refers_to_latest_snapshot;
      if (json.hasOwnProperty('reference_spectrum_snapshots'))         _tag.reference_spectrum_snapshots         = json.reference_spectrum_snapshots;

    }

    _tag.parseSnapshotResponse(_tag.json);


    /* ======================================
     * Intercept and deal with the appended key:value#<snapshot_id>.
     * This can be run multiple times to extract snapshot id,
     * for example if the tag reference is updated from 
     * the server and has changed.
     */
    _tag.filterReferenceId = function(name) {

      // ensure we're not overwriting anything
      if (!_tag.has_reference) {

        _tag.name_with_reference = name;
        _tag.value_with_snapshot = name.split(':')[1]; // include snapshot syntax if exists; this should really be _with_reference

      }

      if (name.match("#")) {

        _tag.name_with_reference = name;

        _tag.value = name.split(':')[1];
        _tag.value_with_snapshot = _tag.value; // include snapshot syntax if exists; this should really be _with_reference

        _tag.has_reference = true;
        _tag.reference_id = parseInt(name.split('#')[1]);
        _tag.name = name.split('#')[0];
        _tag.value = _tag.name.split(':')[1];

      }

    }

    _tag.filterReferenceId(_tag.name);


    _tag.labelEl = function() {

      return $('tr#tag_' + _tag.id + ' .label');

    }


    /* ======================================
     * Delete it from the server, then from the DOM;
     */
    _tag.destroy = function(callback) {

      _tag.labelEl().css('background', '#bbb')
                    .append(" <i class='fa fa-spinner fa-spin fa-white'></i>");

      $('tr#tag_' + _tag.id + ' .operation-tag-delete .fa').removeClass('fa-trash')
                                                           .addClass('fa-spinner fa-spin disabled');
      $('tr#tag_' + _tag.id).css('color', '#bbb');

      $.ajax({
        url: "/tags/" + _tag.id,
        type: "DELETE",
        dataType: "json",

        success: function(response) {

          if (SpectralWorkbench.API.Operations.hasOwnProperty(_tag.key) && SpectralWorkbench.API.Operations[_tag.key].clear) {
       
            console.log("cleaning up after tag", _tag.name);
            SpectralWorkbench.API.Operations[_tag.key].clear(_tag);

          }

          _tag.cleanUp(callback);
 
        },

        error: function(response) {

          _tag.labelEl().css('background', '#b00');
          _tag.labelEl().find('i.fa').removeClass('fa-spinner fa-spin')
                                     .addClass('fa-exclamation-circle');

          $('tr#tag_' + _tag.id + ' .operation-tag-delete .fa').removeClass('fa-spinner fa-spin')
                                                               .addClass('fa-exclamation-circle')
                                                               .css('color', '#600');
          $('tr#tag_' + _tag.id).css('color', '#600');

          _tag.has_dependent_spectra = response.responseJSON.has_dependent_spectra;
          _tag.dependent_spectra = response.responseJSON.dependent_spectra;
          _tag.has_subsequent_depended_on_snapshots = response.responseJSON.has_subsequent_depended_on_snapshots;
          _tag.is_latest = response.responseJSON.is_latest;

          console.log('deletion of tag ' + _tag.id + ' rejected', response, _tag)

          if (_tag.has_dependent_spectra == true) {

            _tag.notice("Operation could not be deleted because other operations rely on it. Try cloning this spectrum to make changes without disrupting dependent data.", "error");

          } else if (_tag.is_latest != true) {

            _tag.notice("Operation could not be deleted because it is not the most recent operation to this spectrum. Deletions must occur most-recent-first.", "error");

          } else {

            _tag.notice("There was an error.", "error");

          }

          if (callback) callback(response, _tag); // for testing, at least

        }

      });
 
    }


    /* ======================================
     * Scrubs local tag data; for use after deletion.
     * We dump everything, re-fetch spectrum remote data, 
     * and re-run datum.parseTags() from scratch.
     * Note: overriding superclass
     */
    _tag.cleanUp = function(callback) {

        if (_tag.datum.graph) _tag.datum.graph.dim();

        // if it failed to initialize, the element may not exist
        if (_tag.el) _tag.el.remove();
        if (_tag.operationEl) _tag.operationEl.remove();

        // remove it from datum.tags:
        _tag.datum.tags.splice(_tag.datum.tags.indexOf(_tag), 1);

        // remove it from datum.powertags:
        _tag.datum.powertags.splice(_tag.datum.powertags.indexOf(_tag), 1);

        // do this after removing
        _tag.showLastOperationDeleteButtonOnly();

        // flush the graph range so the image gets resized:
        if (_tag.datum.graph) _tag.datum.graph.range = false;

        // re-fetch spectrum data, as it may have been overwritten by various tags:
        _tag.datum.fetch(false, function() {

          _tag.datum.parseTags();

          if (callback) callback(_tag);

        });

    }


    /* ======================================
     * Write DOM elements into Operations table
     */
    _tag.render = function() {

      // Do additional snapshot_id processing again 
      // in case this is freshly uploaded:
      _tag.filterReferenceId(_tag.name);

      // display in Operations table;
      var operationTable = $('table.operations');

      _tag.operationEl = $("<tr class='operation-tag' data-id='" + _tag.id + "' id='tag_" + _tag.id + "'></tr>");


      if (_tag.snapshot_id) {


        // indicate snapshot
        _tag.operationEl.append("<td class='snapshot'><a href='https://publiclab.org/wiki/spectral-workbench-snapshots'><i rel='tooltip' title='This operation generated a data snapshot with id " + _tag.snapshot_id + ". Click to learn more.' class='fa fa-thumb-tack'></i></a></td>");


        // display referring spectra in a popover
        if (_tag.dependent_spectra) {

          _tag.operationEl.find(".snapshot").append(' <i style="color:#999;" class="fa fa-chevron-circle-down" rel="popover" data-placement="bottom" data-html="true" data-title="Dependent spectra" data-content=""></i>');

          var string = '<p><small>This <a href="https://publiclab.org/wiki/spectral-workbench-snapshots" target="_blank">snapshot</a> (ID #' + _tag.snapshot_id + ') is used by ' + _tag.dependent_spectra.length + ' other operations, listed below. You therefore cannot delete it, but you can fork this spectrum and revert this operation on the copy.</small></p><p>';
          _tag.dependent_spectra.forEach(function(id) {
            string = string + '<a href="/spectrums/' + id + '">Spectrum ' + id + '</a> <i class="fa fa-external-link"></i><br />';
          });
          string = string + '</p>';
 
          _tag.operationEl.find(".snapshot i").attr('data-content', string);
          _tag.operationEl.find(".snapshot i").popover();

        }


        // display if not pointing at latest snapshot, in popover
        if (_tag.reference_spectrum_snapshots) {


          // indicate that there is no reference, which is unusual
          if (_tag.needs_reference && _tag.has_reference != true) {
  
            _tag.operationEl.find(".snapshot").append(' <i style="color:#ed0;" class="fa fa-exclamation-triangle" rel="popover" data-placement="bottom" data-html="true" data-title="No snapshot" data-content=""></i>');
            var string = "<p>The spectrum this operation refers to does not have any snapshots, which means it may be uncalibrated, and/or be created using Spectral Workbench 1.0, an old version. Be aware that this may affect your use of this spectrum.</p>";
            _tag.operationEl.find(".snapshot i").attr('data-content', string);
            _tag.operationEl.find(".snapshot i").popover();

          // there IS a reference, but it's not the only one:
          } else {
 
            var string = "";

            if (_tag.refers_to_latest_snapshot) {

              _tag.operationEl.find(".snapshot").append(' <i style="color:#999;" class="fa fa-chevron-down" rel="popover" data-placement="bottom" data-html="true" data-title="Updates" data-content=""></i>');
              string += "<p>The spectrum this operation refers to has other snapshots which you can refer to instead.</p>";

            } else {

              _tag.operationEl.find(".snapshot").append(' <i style="color:#ed0;" class="fa fa-exclamation-triangle" rel="popover" data-placement="bottom" data-html="true" data-title="Updates" data-content=""></i>');
              string += "<p>The spectrum this operation refers to has been edited since the reference was made, and this operation no longer refers to the most recent snapshot of the spectrum.</p>";

            }

            if (_tag.has_dependent_spectra || _tag.has_subsequent_depended_on_snapshots) {

              string += "<p>You cannot change this reference, as other data depend on it. Fork this spectrum to make changes on a copy.</p>";
  
              // alternative is to display this menu in the description field
              _tag.operationEl.find(".snapshot i").attr('data-content', string);
  
              _tag.operationEl.find(".snapshot i").popover()

            } else {

              string += "<p><small>Choose a reference:</small></p>";
              string += "<select class='reference-snapshots-available' class='span5'>";
  
              _tag.reference_spectrum_snapshots.forEach(function(snapshot) {
  
                string += "<option value='" + snapshot + "'";
                if (snapshot == _tag.reference_id) string += " selected";
                string += ">" + snapshot;
                if (snapshot == _tag.reference_id) string += " (current)";
                string += "</option>";
  
              });
  
              string += "</select>";
              string += "<a class='btn btn-small btn-primary btn-update-reference'>Change reference</a>"
  
              // alternative is to display this menu in the description field
              _tag.operationEl.find(".snapshot i").attr('data-content', string);
  
              _tag.operationEl.find(".snapshot i").popover()
                                                  .click(function() {
                _tag.operationEl.find(".snapshot .btn-update-reference").click(function() {
                  
                  _tag.changeReference(_tag.operationEl.find(".snapshot .reference-snapshots-available").val());
    
                });
  
              });

            }

          }

        }


      } else {

        _tag.operationEl.append("<td class='snapshot'></td>");

      }


      _tag.operationEl.append("<td class='title'><span class='label purple'>" + _tag.name + "</span></td>");
      if (_tag.has_reference) _tag.operationEl.find('.label').append("#" + _tag.reference_id);
      _tag.operationEl.append("<td class='date'><small>" + moment(_tag.json.created_at).format("MM-DD-YY HH:mm a") + "</small></td>");
      _tag.operationEl.append("<td class='description'><small>" + _tag.description() + " <a href='//publiclab.org/wiki/spectral-workbench-operations#" + _tag.key + "'>Read more</a></small></td>");
      _tag.operationEl.append("<td class='operations-tools'></td>");
      _tag.operationEl.find("td.operations-tools").append("<a class='operation-tag-delete'><i class='fa fa-trash btn btn-link'></i></a>");

      if (!_tag.deletable()) _tag.operationEl.find("td.operations-tools").append("<i rel='tooltip' title='Other data depends on this snapshot. Clone the spectrum to work without affecting downstream use.' class='operation-tag-delete-disabled fa fa-lock btn btn-link disabled' style='color:#00a;'></i>");
      else _tag.operationEl.find("td.operations-tools").append("<i rel='tooltip' title='Subsequent operations depend on this snapshot.' class='operation-tag-delete-disabled fa fa-lock btn btn-link disabled'></i>");

      operationTable.append(_tag.operationEl);

      if (_tag.created_at) {

        // only final operation should have deletion button
        _tag.showLastOperationDeleteButtonOnly();
 
      }

      // initialize tooltips after hiding/showing is complete
      _tag.operationEl.find("[rel=tooltip]").tooltip();

      _tag.deleteEl = $('#tag_' + _tag.id + ' .operation-tag-delete');

      // these will only be clickable if the button is shown:
      _tag.deleteEl.attr('data-id', _tag.id)
                   .click(function() { 
                      if (confirm('Are you sure? This tag contains functional data used in the display and analysis of the spectrum.')) {
                        _tag.destroy();
                      }
                   });

      // deletion listener
      _tag.deleteEl.bind('ajax:success', function() {

        _tag.cleanUp();

      });

    }


    /* ======================================
     * Only final operation should have deletion button
     */
    _tag.showLastOperationDeleteButtonOnly = function() {

      var operationTable = $('table.operations');
      operationTable.find('tr.operation-tag .operations-tools .operation-tag-delete-disabled').show();
      operationTable.find('tr.operation-tag .operations-tools .operation-tag-delete').hide();
      operationTable.find('tr.operation-tag .date .last-indicator').remove();

      // need to check for *datum's last tag's* deletability
      if (_tag.datum.powertags.length > 0 && _tag.datum.powertags[_tag.datum.powertags.length - 1].deletable()) {

        operationTable.find('tr.operation-tag:last .operations-tools .operation-tag-delete-disabled').hide();
        operationTable.find('tr.operation-tag:last .operations-tools .operation-tag-delete').show();
        operationTable.find('tr.operation-tag:last .date').append(' <p class="last-indicator"><small><i>most recent</i></small></p>');

      }

    }


    /* ======================================
     * Parsing wrapper function which can be queued with jQuery's 
     * Deferred object API; returns a deferred. Used by Datum.parseTags; see:
     * http://stackoverflow.com/questions/7743952/how-to-use-jquerys-deferred-object-with-custom-javascript-objects
     */
    _tag.deferredParse = function(queue) {

      var deferred = $.Deferred();

      //only execute this when everything else in the queue has finished and succeeded
      $.when.apply(jQuery, queue).done(function() { 

        _tag.parse(function() {
          deferred.resolve();
          // deferred.reject(); // can accommodate parse failures too
        }); 

      });

      return deferred;

    }


    /* ======================================
     * References a listing from API.Operations, 
     * each of which has a run() method which accepts a _tag 
     * and optional callback, and a description() method 
     * which returns description; see there for complete spec.
     */
    _tag.parse = function(callback) {

      console.log('parsing', _tag.name_with_reference);

      if (SpectralWorkbench.API.Operations.hasOwnProperty(_tag.key) && SpectralWorkbench.API.Operations[_tag.key].run) {

        var parseCallback = function() {
 
          // save the parsed tag data when we're going to upload
          // this should run after parse but before upload
          if (_tag.needs_snapshot && _tag.uploadable) {
         
            // here we have to parse back from datum.average/red/green/blue into 
            //_tag.datum.json.data.lines = _tag.datum.encodeJSON(); // this would be irreversible... unless we save and undo it on destroy
            //_tag.data = JSON.stringify(_tag.datum.json.data);
         
            // so instead we do this:
            _tag.data = JSON.stringify({'lines': _tag.datum.encodeJSON()});
         
          }

          if (callback) callback(_tag);
 
        }

        SpectralWorkbench.API.Operations[_tag.key].run(_tag, parseCallback);

      } else {

        // passive; no effect on data
        _tag.passive = true;
        _tag.labelEl().removeClass('purple');
        _tag.labelEl().css('background', 'grey');
        if (callback) callback(_tag); // allow next tag to run

      }

    }


    /* ======================================
     * Send request to server to get the tag's 
     * latest reference and update it, unless
     * the tag already has a reference, in which 
     * case just execute the callback.
     */
    _tag.fetchReference = function(callback) {

      console.log('querying latest snapshot of', _tag.value, 'for tag.reference_id')

      // we can't rely on tag.has_reference, as this 
      // may not have been called yet in datum.addAndUploadTagWithReference()
      if (_tag.name.match("#") || !_tag.needs_reference) {

        if (callback) callback(_tag);

      } else {

        $.ajax({
       
          url: "/spectrums/latest_snapshot_id/" + _tag.value,
       
          success: function(response) {

            if (response != "false") {
       
              _tag.filterReferenceId(_tag.name + '#' + parseInt(response));
       
            }
       
            if (callback) callback(_tag);
       
          }
       
        });

      }

    }


    /* ======================================
     * Send request to server to change the tag's reference
     */
    _tag.changeReference = function(reference_id) {

      $.ajax({
        url: "/tags/change_reference/" + _tag.id,
        type: "POST",
        dataType: "json",
        data: {

          'snapshot_id': reference_id,

        },

        success: function(response) {

          _tag.name = response.name;
          _tag.key = _tag.name.split(':')[0];
          _tag.value = _tag.name.split(':')[1];
          _tag.filterReferenceId(_tag.name);

          _tag.labelEl().css('background', false);
          $('tr#tag_' + _tag.id + ' .description .alert-change-reference').remove();
          _tag.labelEl().html(_tag.name + "#" + _tag.reference_id);
          $('.snapshot i').popover('hide');

          if (_tag.datum.graph) _tag.datum.graph.dim();

          // re-fetch spectrum data, re-parseTags
          _tag.datum.fetch(false, function() {
 
            _tag.datum.parseTags();
 
          });
 
        },

        error: function(response) {

          console.log('Reference change of tag ' + _tag.id + ' rejected.', response)

          _tag.labelEl().css('background', '#b00');
          _tag.labelEl().find('i.fa').removeClass('fa-spinner fa-spin')
                                     .addClass('fa-exclamation-circle');

          _tag.notice("Referenced snapshot could not be changed due to an error.", "error .alert-change-reference");

        }

      });

    }


    _tag.notice = function(msg, type) {

      type = type || 'warning';
      $('tr#tag_' + _tag.id + ' .description').append("<p class='alert alert-" + type + "'><small>" + msg + "</small></p>");

    }


    _tag.deletable = function() {

      return (!_tag.hasOwnProperty('snapshot_id') || (_tag.has_dependent_spectra != true && _tag.has_subsequent_depended_on_snapshots != true));

    }


    // uploadable is if it's just been created and has to be uploaded; 
    // based on if it was initialied with a json options object:
    if (!_tag.uploadable) {

      // For uploadable powertags, render is called in tag.uploadSuccess() callback;
      // non-powertags manage their own rendering
      _tag.render();
 

    // decide to request a snapshot_id if there's a reference
    // but only if uploadable and only if it doesn't already have one
    } else if (_tag.needs_reference && !_tag.has_reference) {

      _tag.fetchReference(callback);

    } else if (callback) callback(_tag);

    return _tag;

  }

});

SpectralWorkbench.API = Class.extend({

  version: '2.0',
  init: function(_graph) {

    var api = this;

    SpectralWorkbench.API.Legacy.override(_graph);

  }

});

if (!this.hasOwnProperty('$W')) $W = false;

SpectralWorkbench.API.Legacy = {

  load: function(json, dataType) {
    // provide backward compatability for API v1
    if ($W && $W.data) {

      // formatting of $W.data in API v1 is not same as vanilla JSON
      $W.data = [];

      if (dataType == "set") { 

        $.each(json.spectra,function(i,spectrum) {

          var lines = [];

          $.each(spectrum.data.lines,function(i,line) {
            lines.push([line.wavelength,line.average]);
          });

          $W.data.push({data: lines});

        });

      } else if (dataType == "spectrum") {

        $W.data = json;

      }

    }

  },

  override: function(_graph) {

    // override flot graphing
    $.plot = function(el,data,options) {

      // do this differently for sets and spectra
      if (_graph.dataType == 'set') {

        // we have to re-load each .data into each datum.spectra
        // -- we could/should do this via a spectrum.load call?
        $.each(_graph.datum.spectra,function(i,spectrum) {
          spectrum.json.data.lines = [];
          spectrum.average = [];

          var max = 0;
          data[i].data.map(function(i) { if (this > max) max = this; });
          
          $.each(data[i].data,function(i,line) {

            var average = line[1];
            if (max <= 1) average *= 100;    // if max is too low, auto-recognize that it's a percentage? This is not great, but better than before. 
            if (max <= 0.01) average *= 100; // repeat for some operations which divide by 100 again :-( 

            spectrum.json.data.lines.push({
              wavelength: line[0],
              average: average
            });

          });

          // and then reload that into its native data store, too, 
          // in spectrum.average = {y: 0, x: 0}
          spectrum.load(spectrum.json.data.lines);

        });

      } else if (_graph.dataType == 'spectrum') {

        _graph.datum.json.data.lines = [];
        _graph.datum.average = [];
        
        $.each(_graph.datum.json.data,function(i,line) {

          var average = line[1];
          if (average <= 1) average *= 100; // if it's too low, auto-recognize that it's a percentage? This is not great. 

          _graph.datum.json.data.lines.push({
            wavelength: line[0],
            average: average 
          });

          // and then reload that into its native data store, too, 
          // in spectrum.average = {y: 0, x: 0}
          _graph.datum.load(_graph.datum.json.data.lines);

        });

      }

      // then display it in d3:
      _graph.load(_graph.datum, _graph.chart);

    }

  }

}

/*
 * General API methods.
 */

SpectralWorkbench.API.Core = {


  fetchSpectrum: function(id, callback) {

    // coerce into string:
    if (("" + id).match(/\#/)) {
      snapshot_id = parseInt(("" + id).split('#')[1]);
      url = "/snapshots/" + snapshot_id + ".json";
      is_snapshot = true;
    } else {
      url = "/spectrums/" + id + ".json";
      is_snapshot = false;
    }

    /* Fetch data */ 
    $.ajax({
      url: url,
      type: "GET",
      dataType: "json",

      success: function(data) {

        if (is_snapshot) data.data = { lines: data.lines }; // doesn't receive a full Spectrum model, just the data, so we rearrange to match

        var spectrum = new SpectralWorkbench.Spectrum(data);

        spectrum.snapshot = is_snapshot;

        if (callback) callback(spectrum);

      }
 
    });

  },


  /* Will return a snapshot or spectrum depending on if snapshots exist. */
  fetchLatestSnapshot: function(id, callback) {

    // coerce into string:
    url = "/spectrums/latest/" + id + ".json";

    /* Fetch data */ 
    $.ajax({
      url: url,
      type: "GET",
      dataType: "json",

      success: function(data) {

        // this is messy, but fetchLatestSnapshot returns snapshots, not spectra. 
        // SpectralWorkbench.Spectrum doesn't know.
        data.snapshot_id = data.id;
        data.id = id;

        var spectrum = new SpectralWorkbench.Spectrum(data);

        if (callback) callback(spectrum);

      }
 
    });

  },


  /* let's put it in Spectrum?: */
  exportSVG: function(name) {

    var dataUrl = "data:image/svg+xml;utf8,"+$('#graph').html();
    $('.export .svg').attr('download', name+'.svg');
    $('.export .svg').attr('href', dataUrl);

    return $('.export .svg');

  },


  // clone calibration from spectrum of id <from_id> to <spectrum>
  copyCalibration: function(spectrum, from_id, callback) {

// this needs to be compatible with snapshot responses
    SpectralWorkbench.API.Core.fetchSpectrum(from_id, function(source) {

        // what if the image sizes don't match? 
        // well, they should, if they're from the same device.
        spectrum.json.data.lines.forEach(function(line, i) {
          line.wavelength = source.json.data.lines[i].wavelength;
        });
 
        // reload the spectrum data:
        spectrum.load();

        if (callback) callback(spectrum);

    });

  },


  // apply a provided expression on every pixel of <spectrum>
  transform: function(spectrum, expression) {

    var red     = spectrum.red,
        green   = spectrum.green,
        blue    = spectrum.blue,
        average = spectrum.average,
        r       = red.map(function(d){ return d.y }),
        g       = green.map(function(d){ return d.y }),
        b       = blue.map(function(d){ return d.y }),
        a       = average.map(function(d){ return d.y });

    // we could parse this, actually...
    eval('var transform = function(R,G,B,A,X,Y,I,P,a,r,g,b) { return ' + expression + '; }');

    average.forEach(function(P, i) { 

      P.y = transform(
        +red[i].y,     //R
        +green[i].y,   //G
        +blue[i].y,    //B
        +average[i].y, //A
        +average[i].x, //X
        +average[i].y, //Y
        i,             //I
        P,             //P
        a,             //a
        r,             //r
        g,             //g
        b              //b
      );

    });

    // some issue here on indexing...
    spectrum.graph.refresh();

  },


  // Clip out a given subset of wavelengths from this spectrum.
  // Works for spectra, not sets.
  // Untested for multiple successive use on one Spectrum.
  // Sets graph.range, which is used in Spectrum.load to change 
  // spectrum.average, .red, .blue, .green, 
  // but doesn't affect original spectrum.json.data.lines.
  range: function(datum, start, end) {

    // ensure start < end
    if (start > end) {
      var tmp = end;
      end = start;
      start = tmp;
    }

    datum.channels.forEach(function(_channel, i) {

      var startIndex = 0, endIndex = datum[_channel].length - 1;

      // count up to first in-range index
      while (true) {
        if (datum[_channel][startIndex].x > start) break;
        startIndex += 1;
      }

      // count down to first in-range index
      while (true) {
        if (datum[_channel][endIndex].x < end) break;
        endIndex -= 1;
      } 

      datum[_channel] = datum[_channel].slice(startIndex, endIndex);

    });

    // adjust the Graph range directly;
    // this is used in graph and image DOM sizing and conversions
    datum.graph.range = [start, end];
 
  },


  // fetch data from a URL
  // this is redundant ish with jQuery:
  // $.get('/spectrums/show2/47.json',function(r) { console.log(r); }); // => {}
  // $.get('/spectrums/show2/47.csv',function(r) { console.log(r); });  // => String
  // replace with blendURL(spectrum, url), based on blend, below?
  fetchUrl: function(url, callback) {

    $.ajax({
      url: url,
      dataType: "json",
      //data: {},
      success: function(response) {

        if (callback) callback(response);

      }

    });
    
  },


  // fetch another spectrum, blend it with this one according to expression
  blend: function(datum, spectrum_id, expression, callback) {

    var red     = datum.red,
        green   = datum.green,
        blue    = datum.blue,
        average = datum.average,
        blender;

    SpectralWorkbench.API.Core.fetchSpectrum(spectrum_id, function(blender) {

      // we could parse this, actually...
      eval('var blend = function(R1,G1,B1,A1,R2,G2,B2,A2,X,Y,P) { return ' + expression + '; }');
    
      average.forEach(function(P, i) { 
    
        if (red[i])   var R1 = +red[i].y;
        else          var R1 = 0;
        if (green[i]) var G1 = +green[i].y;
        else          var G1 = 0;
        if (blue[i])  var B1 = +blue[i].y;
        else          var B1 = 0;
    
        var A1 = +average[i].y,
            X = +average[i].x,
            Y = +average[i].y;

        var R2 = +blender.getIntensity(X, 'red');
            G2 = +blender.getIntensity(X, 'green');
            B2 = +blender.getIntensity(X, 'blue');
            A2 = +blender.getIntensity(X, 'average');
     
        P.y = +blend(R1,G1,B1,A1,R2,G2,B2,A2,X,Y,P).toPrecision(datum.sigDigits);
    
      });
     
      if (callback) callback(blender);

    });

  },


  // fetch another spectrum, subtract the given 
  // channel (default 'average') from this one
  subtract: function(datum, spectrum_id, callback, channel) {

    channel = channel || "average";

    SpectralWorkbench.API.Core.fetchSpectrum(spectrum_id, function(subtractor) {

      datum[channel] = datum[channel].map(function(point) { 

        point.y -= +subtractor.getIntensity(point.x, channel);
        return point;

      });
       
      if (callback) callback();
 
    });
    
  },


  // use a rolling average to smooth data: not time-averaging!
  smooth: function(datum, distance) {

    var average = [];

    datum.average.forEach(function(p, i) {

      average.push(p);

      for (var offset = -distance; offset <= distance; offset += 1) {

        if (offset != 0 && (i + offset) > 0 && (i + offset) < datum.average.length) {

          average[i].y += datum.average[i + offset].y;

        }

      }

      average[i].y /= (distance * 2 + 1);

    });

    datum.average = average;

  },


  /* 
   * Display a spectrum by given id and store in an array graph.comparisons.
   * Counterpart to API.Core.addComparison(), which adds a comparison to 
   * the Comparisons table.
   */
  compare: function(graph, datum, callback) {

    // standardize this! and reuse it in similar()
    graph.comparisons = graph.comparisons || [];
    graph.comparisons.push(datum);

    var combined = graph.datum.d3();

    graph.comparisons.forEach(function(comparison) {

      comparison = comparison.d3()[0];

      // switch to use default color array
      comparison.color = "red";
      combined.push(comparison);

    });

    graph.data.datum(combined, graph.idKey);

    // refresh the graph:
    graph.refresh();

    if (callback) callback();

  },


  // display a spectrum by given id (and store in an array graph.comparisons)
  similar: function(graph, id, fit, callback) {

    callback = callback || SpectralWorkbench.API.Core.compare;

    fit = fit || 20;

    $.ajax({
      url: "/match/search/" + id + ".json",
      type: "GET",
      dataType: "json",

      data: {
        fit: fit,
      },

      success: function(response) {

        if (callback) {

          response.forEach(function(spectrum) {

            // rewrite compare() to accept an array

            callback(graph, spectrum);

          });

        }

      }

    });
    
  },


  // find highest peak in given channel "r", "g", "b", 
  // in given range (if any), with a min. 
  // required intensity of 5
  // <data> is an instance of spectrum.json.data.lines, like:
  // SpectralWorkbench.API.Core.findMax(graph.datum.json.data.lines, 'b');
  // returns { index: <int>, value: <int> } -- index is a pixel position
  findMax: function(data, channel, startIndex, endIndex) {

    var max = { index: 0, 
                value: 0 },
        min_required_intensity = 5;

    startIndex = startIndex || 0;
    endIndex = endIndex || data.length-1;

    data.slice(startIndex, endIndex).forEach(function(line, index){

      if (line[channel] > max.value && line[channel] > min_required_intensity) {
        max.index = index + startIndex;
        max.value = line[channel];
      }

    });

    return max;

  },


  // Attempts to autodetect calibration,
  // adapted from https://gist.github.com/Sreyanth/8dcb8343e4770cd9d301
  // returns [r, g, b] as original image pixel positions from stored json data
  // -- a gotcha is that sometimes stored json pixel data is not full-width;
  // we are transitioning to using native image widths instead of downscaled
  attemptCalibration: function(graph) {

    var green = SpectralWorkbench.API.Core.findMax(graph.datum.json.data.lines, 'g');
    var red   = SpectralWorkbench.API.Core.findMax(graph.datum.json.data.lines, 'r', green.index + 50);

      var estimated_blue_peak = green.index - 1.707 * (red.index - green.index);
      var blueSearchDistance = 5;

    var blue  = SpectralWorkbench.API.Core.findMax(graph.datum.json.data.lines, 'b', estimated_blue_peak - blueSearchDistance, estimated_blue_peak + blueSearchDistance);

    return [ red.index,
             green.index,
             blue.index ];

  },


  // We compare the ratios of peak distances to 
  // see if it is a good fit based on what they *should* be
  // Accepts any unit, as it works on ratios
  calibrationFit: function(r,g,b) {

    var gb_diff = g - b;
    var rg_diff = r - g;
    var rb_diff = r - b;

    /*
    The ratio of peaks should be as follows:

    |-------B-----------G-------R---------|
                1.707   :   1
    */
    
    var gbrg = gb_diff / rg_diff;
    var diff = gbrg - 1.707; // diff should therefore = 0
    
    console.log("GB/RG ratio:" + gbrg);
    console.log("Expected ratio: 1.707");
    console.log("Diff in these ratios:" + diff);
    
    var percentageError = diff * 100 / 1.707; // percentage away from expected
    
    console.log("percentage error in GB/RG ratio: " + percentageError + " %");
  
    var allowedError = 5;

    console.log("Allowed percentage is: " + allowedError + " %");
    console.log("Expected to be a CFL?: " + (percentageError < allowedError && percentageError > -1 * allowedError));

    return percentageError;

  },


  /* 
   * Given a blue 2 and green 2 peak source image pixel position,
   * and a spectrum to compare against, look 
   * for an expected red peak and reply with a "score"
   * for how good the calibration is based on the expected 
   * ratio of (G-B):(R-G) = 1.707:1
   * <g> and <b> are x-coordinates in data space.
   * Returns distance in nanometer wavelength using provided b + g,
   * where 0 indicates a perfect fit. 
   * The ratio of peaks should be as follows:
   * 
   *  |-------B-----------G-------R---------|
   *              1.707   :   1
   * 
   * But, we should recalculate the 1.707 using a really good spectrum from NIST.
   */
  calibrationFitGB: function(b, g, spectrum) {

    var bg2gr = 1.707, // expected ratio
        gb_diff = g - b,
        expected_r = g + (gb_diff / bg2gr), // estimate where the r peak should be
        found_r = spectrum.getNearbyPeak(expected_r, 5); // look around nearby for an actual peak

    return found_r - expected_r;

  },


  /* 
   * Assesses calibration accuracy by comparison to a well-established reference.
   * Essentially, we're asking: with this spectrum, 
   * if it were calibrated with w1, w2, x1, x2, 
   * would it match our best known CFL spectrum?
   * 
   * Using the method:
   * 1. find all major troughs and peaks in ref,
   *    where troughs are midpoints of troughs 
   *    (since they should have flat floors)
   *    find corresponding ones for spectrum, 
   * 2. measure heights of peaks above the average of their neighboring troughs (local heights)
   * 3. do same for reference,
   * 3. scale to max global heights of spectrum and reference, respectively,
   * 4. RMSE the local heights & return error
   * 
   * Wavelengths sourced from NIST & Wikipedia's Ocean Optics reference: 
   * http://publiclab.org/notes/warren/09-30-2015/new-wavelength-calibration-procedure-preview-for-spectral-workbench-2-0#c12626
   * Intensities sourced from reference spectrum: 
   * http://publiclab.org/notes/warren/09-30-2015/new-wavelength-calibration-procedure-preview-for-spectral-workbench-2-0#c12620
   */
  rmseCalibration: function(spectrum, w1, w2, x1, x2) {

    // points as [wavelength, intensity], where intensity is out of 255
    // 
    // values are stretched such that they have the same range of intensities, 0-1.00
    // Indented values are troughs -- midpoint between the known peaks
    var points = [
          [404.66,   4],
          [435.83,  86],
          [487.70,  64],
          [543.50, 117],
          [546.07,  93],
          [577.00,   6],
          [579.10,  15],
          [587.60,  58],
          [593.00,  50],
          [598.00,  23],
          [611.60, 155],
          [630.00,  41],
          [650.00,  16],
          [661.00,   7]
        ],
        troughs = [
          [420.245,  0],
          [461.765,  0],
          [515.6,    0],
          [544.785, 87],
          [561.535,  8],
          [578.05,  75],
          [583.35,  48],
          [590.3,   29],
          [595.5,   31],
          [604.8,   17],
          [620.8,   24],
          [640,      3],
          [655.5,    1]
        ],
        max = 155 - (17+24)/2, // local max
        max2 = 0,
        error = 0;


    // PROBLEM: we would Spectrum.getIntensity, but we want
    // only a temp calibration, so we can evaluate it before
    // committing. So we build our own little tools:

    var tempCalibration = spectrum.calibrate(w1, w2, x1, x2, false); // returns a temp spectrum.json.data.lines, without flipping data or image (false)

    // create a custom intensity getter for not-yet-saved calibrations.
    var getIntensity = function(wavelength) {

      var nmPerPx         = (tempCalibration[tempCalibration.length-1].wavelength - tempCalibration[0].wavelength) / tempCalibration.length,
          startWavelength = tempCalibration[0].wavelength,
          index = parseInt((wavelength - startWavelength) / nmPerPx); // each index should be contents of 1 pixel

      if (tempCalibration[index]) return tempCalibration[index].average; // if this index exists
      else return 0; // or it doesn't

    }

    var localBaseline;

    // calculate local baseline, store in points[3], save max2
    points.forEach(function(point, index) {

      // add it as a third array index
      point.push(getIntensity(point[0]));

      if (index > 0 && troughs[index]) { 
        localBaseline = (troughs[index - 1][1] + troughs[index][1]) / 2;
        var localBaseline2 = (getIntensity(troughs[index - 1][0]) + getIntensity(troughs[index][0])) / 2;
      } else if (index > 0) {
        localBaseline = (0 + troughs[index - 1][1]) / 2;
        var localBaseline2 = (0 + getIntensity(troughs[index - 1][0])) / 2;
      } else {
        localBaseline = (0 + troughs[index][1]) / 2;
        var localBaseline2 = (0 + getIntensity(troughs[index][0])) / 2;
      }

      point.push(localBaseline2);

      if (max2 < (point[2] - localBaseline2)) max2 = point[2] - localBaseline2;

    });

    points.forEach(function(point, index) {


      // adjust for max intensity of each spectrum; compare to average of 2 neighboring troughs
      error += Math.pow(   10 * ((point[2] - point[3]) / max2)
                         - 10 * ((point[1] - localBaseline) / max), 2); // percentages greater than 1 so squaring exaggerates rather than minimizes error

    });

    return Math.sqrt(error);

  },


  /*
   * Adds a comparison to the Comparisons table; counterpart to API.Core.compare(),
   * which actually adds it to the graph and displayed chart.
   */
  addComparison: function(_graph, id, author, title) {

    $('li.comparisons').show();

    $('table.comparisons').append('<tr class="spectrum spectrum-comparison-' + id + '"></tr>');

    var compareEl = $('table.comparisons tr.spectrum-comparison-' + id);
    compareEl.append('<td class="title"><a href="/spectrums/' + id + '">' + title + '</a></td>');
    compareEl.append('<td class="author"><a href="/profile/' + author + '">' + author + '</a></td>');
    compareEl.append('<td class="comparison-tools"></td>');

    compareEl.find('td.comparison-tools').append('<a data-id="' + id + '" class="remove"><i class="fa fa-remove"></i></a>');
    compareEl.find('.comparison-tools .remove').click(function(){

      compareEl.remove();

      var combined = _graph.datum.d3();

      // get rid of self
      _graph.comparisons.forEach(function(datum){
        if (datum.id != +$(this).attr('data-id')) _graph.comparisons.splice(_graph.comparisons.indexOf(datum), 1);
      });

      // re-assemble display data
      _graph.comparisons.forEach(function(comparison) {
     
        comparison = comparison.d3()[0];
        comparison.color = "red";
        combined.push(comparison);
     
      });

      _graph.data.datum(combined, _graph.idKey);
      _graph.refresh();

      // this isn't working...
      $('li.comparisons a').tab('show');

    });

  },


  // temporary name; we'll want to generalize this method
  useReference: function(url, spectrum, callback) {

    url = url || "/references/solux-4700K-stoft.csv";

    $.get(url, function(response) {

      var reference = []; 

      response.split('\n').forEach(function(line, i) {

        line = line.split(',');
        reference.push([parseFloat(line[0]),parseFloat(line[1])]);

      });

      var closest = 0;

      var getRefIntensity = function(nm) {

        reference.forEach(function(line, i) {

          if (Math.abs(nm - line[0]) < Math.abs(nm - reference[closest][0])) closest = i;

        });

        return reference[closest][1];

      }

      spectrum.average.forEach(function(line, i) {

        // subtract the reference
        line.y = line.y * getRefIntensity(line.x);

      });

      if (callback) callback(reference);

    });

  }


}

/*
 * All Operations (PowerTags), each of which has a name (the tag key)
 * and description() and optional run() methods, which each accept parameter <tag>.
 * These are called from the PowerTag class.
 * Operations without a "run" method are passive and do not affect data.
 * Operations with a "clean" method execute it when deleted. These need only be those which wouldn't be cleared by re-running all tags de novo.
 * Code to parse and execute all this is in the PowerTag class. 
 * 
 * Operations should take in data from spectrum.average and write it back in. 
 * They should, in general, not need to update spectrum.json.data.lines, which
 * should only have been modified by a crossSection, copyCalibration, or linearCalibration 
 * operation. 
 * 
 *  'subtract': {
 *
 *    description: function(tag) {
 * 
 *      return "foo";
 * 
 *    },
 *
 *    run: function(tag, callback) {
 * 
 *      callback(tag); // required upon completion
 *
 *    },
 * 
 *    clean: function(tag) {
 * 
 *    }
 *
 *  }
 */

SpectralWorkbench.API.Operations = {


  'smooth': {

    description: function(tag) {

      return "Rolling average smoothing by given # of pixels.";

    },

    run: function(tag, callback) {

      SpectralWorkbench.API.Core.smooth(tag.datum, tag.value);

      if (callback) callback(tag);

    }

  },


  'range': {

    description: function(tag) {

      return "Limits wavelength range to specified <b>min-max</b>.";

    },

    run: function(tag, callback) {

      SpectralWorkbench.API.Core.range(tag.datum, +tag.value.split('-')[0], +tag.value.split('-')[1]);

      if (callback) callback(tag);

    }

  },


  'forked': {

    description: function(tag) {

      var response = "Spectrum is a forked copy of <a href='/spectrums/" + tag.value + "'>Spectrum " + tag.value + "</a>";
      if (tag.has_reference) response += ", snapshot #" + tag.reference_id;
      return response;

    },

    run: function(tag, callback) {

      if (callback) callback(tag);

    }

  },


  'error': {

    description: function(tag) {

      return "Scores a calibration 'fit' by comparison to a known reference; lower is better, zero is perfect.";

    }

  },


  'calibrationQuality': {

    description: function(tag) {

      return "Roughly indicates how good a calibration 'fit' is, with <i>good, medium, or poor</i>.";

    }

  },


  'crossSection': {

    description: function(tag) {

      var response = "Sets the row of pixels, counting from top row, used to generate the graph.";

      if (tag.datum.powertags.indexOf(tag) != 0) response += " <span style='color:#900'>Do not use this after a <b>range</b> tag.</span>";

      return response;

    },

    run: function(tag, callback) {

      tag.datum.imgToJSON(tag.value);
      tag.datum.load(); // reparse graph-format data

      tag.datum.graph.args.sample_row = tag.value;
      tag.datum.image.setLine(tag.value);

      if (callback) callback(tag);

    }

  },


  'flip': {

    description: function(tag) {

      return "Indicates that the spectrum image has been flipped horizontally.";

    },

    run: function(tag, callback) {

      SpectralWorkbench.API.Core.flip(tag); // default 'horizontal'

      if (callback) callback(tag);

    }

  },


  'transform': {

    description: function(tag) {

      return "Filters this spectrum with a math expression.";

    },

    run: function(tag, callback) {

      SpectralWorkbench.API.Core.transform(tag.datum, tag.value_with_snapshot);

      if (callback) callback(tag);

    }

  },


  'linearCalibration': {

    description: function(tag) {

      var response = "Manually calibrated with two reference points.",
          x1 = +tag.value.split('-')[0],
          x2 = +tag.value.split('-')[1];

      if (tag.datum.powertags.indexOf(tag) != 0) response += " <span style='color:#900'>Only a <i>crossSection</i> or <i>forked</i> operation should precede this.</span>";

      if (x1 > x2) response += " This spectrum was recorded flipped horizontally; the image has been flipped back to place blue at left and red at right.";

      return response;

    },

    run: function(tag, callback) {

      var blue2 = 435.83,
          green2 = 546.07,
          x1 = +tag.value.split('-')[0],
          x2 = +tag.value.split('-')[1];

      tag.datum.json.data.lines = tag.datum.calibrate(blue2, green2, x1, x2);
 
      // reload the spectrum data:
      tag.datum.load();

      if (callback) callback(tag);

    },

    clear: function(tag) {

      var x1 = +tag.value.split('-')[0],
          x2 = +tag.value.split('-')[1];

      if (x1 > x2) {

        if (tag.datum.image.el) tag.datum.image.el.removeClass('flipped');

      }

    }

  },


  'blend': {

    description: function(tag) {

      var response = "Filters this spectrum with a math expression, in combination with data from <a href='/spectrums/" + tag.value + "'>Spectrum " + tag.value + "</a>";
      if (tag.has_reference) response += ", snapshot #" + tag.reference_id;
      return response;

    },

    run: function(tag, callback) {

      // ugly, but we snip out the expression from the <id>#<snapshot_id>:
      var blend_id = tag.value_with_snapshot.split('$')[0],
          expression = tag.value_with_snapshot.split('$')[1].split('#')[0];

      if (tag.has_reference) blend_id += "#" + tag.reference_id;

      SpectralWorkbench.API.Core.blend(tag.datum, blend_id, expression, callback);

    }

  },


  'subtract': {

    description: function(tag) {

      var response = "Subtracts <a href='/spectrums/" + tag.value + "'>Spectrum " + tag.value + "</a>";
      if (tag.has_reference) response += ", snapshot #" + tag.reference_id;
      response += " from this spectrum.";
      return response;

    },

    run: function(tag, callback) {

      SpectralWorkbench.API.Core.subtract(tag.datum, tag.value_with_snapshot, callback);

    }

  },


  'video_row': {

    description: function(tag) {

      return "The row of pixels from the webcam capture used to generate a graph line; used in setting up captures based on this data.";

    }

  },


  'calibration': {

    description: function(tag) {

      return "Calibrated from the Capture interface using data from <a href='/spectrums/" + tag.value + "'>Spectrum " + tag.value + "</a>; but no snapshot generated. Re-calibrate to migrate to full v2 functionality, using the Copy Calibration tool.";

    }

  },


  'calibrate': {

    description: function(tag) {

      response = "Copies calibration from <a href='/spectrums/" + tag.value + "'>Spectrum " + tag.value + "</a>";
      if (tag.has_reference) response += ", snapshot #" + tag.reference_id;
      else response += ", which has no snapshots -- this is not recommended as the source may change!";
      return response;

    },

    run: function(tag, callback) {

      // Consider only copying spectra if you refer to a snapshot of another spectrum; 
      // and disallowing copying from original data as it should not have a calibration?
      // But do calibrations done from capture interface have calibration? So then it would be allowed?

      // anyways, for now, warn that it's not a good idea:
      // if (tag.has_reference) {
      SpectralWorkbench.API.Core.copyCalibration(tag.datum, tag.value_with_snapshot, callback);
      // }

    }

  }


}

SpectralWorkbench.UI.Spectrum = Class.extend({

  init: function(_graph) {

    var _ui = this;

    // Initialize tools buttons
    $('.tool-calibrate').click(        function() { new SpectralWorkbench.UI.ToolPane('calibrate2',         _graph); });
    $('.tool-range').click(            function() { new SpectralWorkbench.UI.ToolPane('range',              _graph); });
    $('.tool-smooth').click(           function() { new SpectralWorkbench.UI.ToolPane('smooth',             _graph); });
    $('.tool-transform').click(        function() { new SpectralWorkbench.UI.ToolPane('transform',          _graph); });
    $('.tool-blend').click(            function() { new SpectralWorkbench.UI.ToolPane('blend',              _graph); });

    $('.tool-cross-section').click(    function() { new SpectralWorkbench.UI.ToolPane('crossSection',       _graph); });

    // Tool panes that display a list of spectra
    $('.tool-copy-calibration').click( function() { new SpectralWorkbench.UI.SpectraPane('copyCalibration', _graph); });
    $('.tool-subtraction').click(      function() { new SpectralWorkbench.UI.SpectraPane('subtraction',     _graph); });

    $('.tool-compare').click(          function() { new SpectralWorkbench.UI.SpectraPane('compare',         _graph); });
    $('.tool-similar').click(          function() { new SpectralWorkbench.UI.SpectraPane('similar',         _graph); });

    // Set up JSON download

    _graph.datum.downloadJSON('.btn-download-json');

    $('.btn-save-as-set').click(function() {
      $(this).attr('href', "/sets/new/" + graph.datum.id + ',' + graph.comparisons.map(function(spectrum) { return spectrum.id; }).join(','));
    });

  },

  // initiate a notification on the page, which fades after <expire> seconds, or doesn't if <expire> is not supplied
  // also returns the notification element
  notify: function(message, type, expire) {

    expire = expire || false;

    if (type) {
      title = "<b>"+type[0].toUpperCase() + type.substr(1, type.length-1) + ":</b> ";
    } else title = "";

    if (expire == null) expire = true

    var id = parseInt(Math.random()*100000)

    $('.notifications-container').append("<p id='notify-" + id + "' class='alert'></p>")

    $('#notify-' + id).html(title + message).addClass('alert-' + type)

    $('#notification-count').html($('.notifications-container p').length);
    $('.notification-count-icon').show();

    if (expire) {

      setTimeout(function() {

        $('#notify-'+id).remove()

        $('#notification-count').html($('.notifications-container p').length);
        if ($('.notifications-container p').length == 0) $('.notification-count-icon').hide();
        else $('.notification-count-icon').show();

      }, expire * 1000);

    }

    return $('#notify-' + id);

  },


  // still needed?
/*
  initNotifications: function() {

    $('#notification-count').html(+$('.notifications-container').html());
    if (+$('#notification-count').html() > 0) $('#notifications').show();
    
  },
*/


  // checks overexposure and displays an alert if it is so
  // we might just want a class of alert filters separate from the API, or
  // in a special zone
  alertOverexposure: function(datum) {

    var overexposure = datum.getOverexposure();

    if (datum instanceof SpectralWorkbench.Spectrum) {

      if (overexposure['r'] || overexposure['g'] || overexposure['b']) {

        var msg = "This spectrum looks overexposed. <a href='//publiclab.org/wiki/spectral-workbench-usage#Overexposure'>Learn how to fix this</a>."

        datum.graph.UI.notify(msg, "warning");

      }

    } else {

      // what? WHAT?

    }

  },


  // checks overexposure and displays an alert if it is so
  // we might just want a class of alert filters separate from the API, or
  // in a special zone
  alertTooDark: function(datum) {

    if (datum.getTooDark()) {

      var msg = "This spectrum seems very dim. You may need to choose a new image cross section that intersects your spectrum data. <a href='//publiclab.org/wiki/spectral-workbench-calibration#Cross+section'>Learn how to fix this</a>."

      datum.graph.UI.notify(msg, "warning")

    }

  }

});

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

// move these somewhere that makes sense, like into the API
// they are not the tag operators themselves, nor the tags, but the *tool panes*
// -- rename them as such!
/*

You may use local variable form, with properties:

    form.el
    form.titleEl
    form.authorEl
    form.linkEl
    form.descriptionEl

    form.applyEl
    form.closeEl

    form.close()
    form.cleanUp()

    // for CustomPane:
    form.customFormEl

    // for SpectraPane:
    form.formEl
    form.searchEl
    form.spectrumApplyEl
    form.authorSelectEl

    // for StepsPane (not yet implemented):
    form.steps
    form.currentStep

*/

SpectralWorkbench.UI.ToolPaneTypes = {

 
  subtraction: {

    title: "Subtraction",
    dataType: "spectrum",
    description: "Subtract another calibrated spectrum from this one.",
    link: "//publiclab.org/wiki/spectral-workbench-operations#subtract",
    author: "warren",
    apply: false,
    formData: { own: true },
    url: '/spectrums/choose/', // default spectra to show, can use * and ?author=warren
    onSpectrumApply: function(form, _graph) {

      // provide better API for own-id:
      _graph.dim();
      _graph.datum.addAndUploadTag('subtract:' + $(this).attr('data-id'));

    }

  },


  copyCalibration: {

    title: "Copy Calibration",
    dataType: "spectrum",
    description: "Use data from an earlier calibrated spectrum to calibrate this one.",
    link: "//publiclab.org/wiki/spectral-workbench-operations#calibrate",
    author: "warren",
    apply: false,
    formData: { own: true },
    url: '/spectrums/choose/calibration', // default spectra to show, can use * and ?author=warren
    onSpectrumApply: function(form, _graph) {

      // provide better API for own-id:
      var id = $(this).attr('data-id');

      if ($(this).attr('data-snapshot')) id = id + "#" + $(this).attr('data-snapshot');

      _graph.dim();
      _graph.datum.addAndUploadTag('calibrate:' + id, function() {

        _graph.UI.notify('Spectrum calibration copied from <a href="/spectrums/' + id + '">Spectrum ' + id + '</a>');

      });

    }

  },


  transform: {

    title: "Transform",
    dataType: "any",
    description: "Apply a JavaScript math expression (such as 'R*G+B') to each point in the spectrum, using variables R for red, G, B, and A for average..",
    link: "//publiclab.org/wiki/spectral-workbench-operations#transform",
    author: "warren",
    apply: true,
    setup: function(form) {

      form.formEl.hide();
      $(form.el).find('.results').html('');
      // create custom form
      form.customFormEl.html("<p>Enter an expression to apply to the spectrum:</p><form class='expression'><input type='text'></input></form><p><a href='//publiclab.org/wiki/spectral-workbench-tools#Transform'>Read about transforms &raquo;</a>");

      form.el.find('.expression').on('submit', function(e) {

        e.preventDefault();
        form.formEl.show();
        form.graph.dim();
        form.graph.datum.addAndUploadTag('transform:'+form.el.find('.expression input').val());
        form.close();

      });

      form.el.find('.expression input').focus();

    },
    onApply: function(form, callback) {

      form.formEl.show();
      form.graph.dim();
      form.graph.datum.addAndUploadTag('transform:'+form.el.find('.expression input').val());
      form.close();

    }

  },


  range: {

    title: "Range",
    dataType: "any",
    description: "Select a wavelength range; subsequent operations will only use this range.",
    link: "//publiclab.org/wiki/spectral-workbench-operations#range",
    author: "warren",
    apply: true,
    setup: function(form) {

      form.formEl.hide();
      $(form.el).find('.results').html('');
      // create custom form
      var inputs = "<p>Enter a start wavelength:</p>"
      inputs    += "<input type='text' class='start' value='400' />"
      inputs    += "<p>Enter an end wavelength:</p>"
      inputs    += "<input type='text' class='end' value='800' />"
      form.customFormEl.html(inputs);
      form.el.find('.start').focus();

    },
    onApply: function(form) {

      var start = +form.el.find('.start').val(),
          end   = +form.el.find('.end').val();

      if (start > end) {
        var tmp = end;
        end = start;
        start = tmp;
      }

      form.formEl.show();
      
      form.graph.dim();
      form.graph.datum.addAndUploadTag('range:'+ start + '-' + end);

    }
  },


  smooth: {

    title: "Smoothing",
    dataType: "any",
    description: "Enter a number of points ahead and behind of a given point to average, in order to smooth the graph. Note that this is <b>not</b> time-averaging, and can suppress small spectral features.",
    link: "//publiclab.org/wiki/spectral-workbench-operations#smooth",
    apply: true,
    author: "warren",
    setup: function(form) {

      form.formEl.hide();
      $(form.el).find('.results').html('');
      form.customFormEl.html("<p>Enter a distance in points to average ahead and behind:</p><input class='distance' type='text' value='3' />");

      form.el.find('.distance').keypress(function(e) {

        if (e.which == 13) {

          e.preventDefault();
          form.applyEl.focus(); // this isn't doing anything :-(
          form.applyEl.trigger('click');

        }

      });

    },
    onApply: function(form) {

      form.applyEl.html('<i class="fa fa-spinner fa-spin fa-white"></i>'); // this isn't doing anything :-(

      form.graph.dim();
      form.graph.datum.addAndUploadTag('smooth:' + form.el.find('.distance').val());

    }

  },


  // test this in jasmine!!!
  crossSection: {

    title: "Choose cross section",
    dataType: "spectrum",
    description: "Click the image to choose which row of pixels from the source image is used to generate your graph line. The default is 0, which is the line used if no crossSection operation is visible.",
    link: "//publiclab.org/wiki/spectral-workbench-operations#crossSection",
    apply: true,
    author: "warren",
    setup: function(form) {

      // shouldnt be necessary in new API, but double check:
      form.formEl.hide();
      form.el.find('.results').html('');

      form.customFormEl.html("<p>Click the spectrum image or enter a row number:</p><input class='cross-section' type='text' value='0' />");

      form.graph.datum.image.click(function(x, y, e) {

        form.el.find('.cross-section').val(y);

        form.graph.datum.image.setLine(y);

      });

      // restore the existing sample row indicator
      // test this in jasmine!!!
      form.closeEl.click(function() { form.graph.datum.image.setLine(form.graph.args.sample_row) });

      form.customFormEl.find('input').on('change', function() {

        form.graph.datum.image.setLine(form.customFormEl.find('input').val());

      });

    },
    onApply: function(form) {

      form.graph.dim();
      form.graph.datum.addAndUploadTag('crossSection:' + $('.cross-section').val(), function() {

        form.graph.datum.load();

      });

    }

  },


  calibrate2: {

    title: "Wavelength calibration",
    dataType: "spectrum",
    description: "Follow the prompts to wavelength calibrate a fluorescent spectrum. Align B2 and G2 with their corresponding peaks in your calibration. It's best to calibrate before any other operations, especially before range limiting. Before calibrating, the horizontal axis lists the pixel position along the spectrum. After you calibrate and save, the B2 and G2 lines should appear at ~435 and ~546 nanometers, respectively, if you're aligned well with the reference spectrum.",
    link: "//publiclab.org/wiki/spectral-workbench-calibration",
    author: "warren",
    apply: true,
    cleanUp: function(form) {

      $('.calibration-pane').remove();

      form.graph.datum.image.el.height(100); // return it to full height
      form.graph.datum.image.container.height(100);

    },
    setup: function(form) {

      var blue2 = 435.83,           // in nanometers
          green2 = 546.07,          // "
          left2blue = 211,          // in example image pixels
          right2green = 1390 - 743, // "
          blue2green = 743-211,     // "
          exampleImgWidth = 1390;   // "

      if (form.graph.datum.getPowerTag('linearCalibration').length > 0) {

        $('.swb-datum-tool-pane .description').append("<span style='color:#900'>You have already calibrated this spectrum. We recommend clearing your previous calibration before re-calibrating.</span>");

      }

      form.graph.datum.image.container.height(180); // we should move away from hard-coded height, but couldn't make the below work:
      //form.graph.datum.image.container.height(_graph.datum.image.container.height() + 80);

      // Using reference image from 
      // http://publiclab.org/notes/warren/09-30-2015/new-wavelength-calibration-procedure-preview-for-spectral-workbench-2-0
      // I read the blue ~436 peak at 211px from left, 
      // and the green ~546 peak at 742px from left

      var pane = "";

      pane += "<p class='prompt form-inline' style='padding-bottom:30px;'>";
      pane +=   "<b>Calibrate:</b> ";
      pane +=   "<span class='hidden-phone'>Adjust sliders &amp; align the reference spectrum to yours.</span> ";
      pane +=   "<a href='//publiclab.org/wiki/spectral-workbench-calibration'>Learn more &raquo;</a> ";
      pane +=   "<span class='calibration-form pull-right'> ";
      pane +=     "<input id='checkbox-snap' type='checkbox' class='checkbox-snap' checked='true' /> <label tooltip='Snap to nearest peak' for='checkbox-snap'>Snap</label> ";
      pane +=     "<input type='text' class='input-wavelength-1 input-mini' /> ";
      pane +=     "<input type='text' class='input-wavelength-2 input-mini' /> ";
      pane +=     "<a class='btn btn-auto-calibrate'>Auto-calibrate</a> ";
      pane +=     "<a class='btn btn-primary btn-save-calibrate-2'>Save</a>";
      pane +=   "</span>";
      pane += "</p>";
      pane += "<div class='fit-container'><div class='fit pull-right label label-success' style='margin-top:-23px'></div></div>"; // to show how good the fit is
      pane += "<div class='reference'>";
      pane +=   "<span class='btn btn-mini disabled slider slider-1' style='background:#00f;color:white;text-shadow: 0 -1px 0 rgba(0, 0, 0, 0.25);'>B2<div class='slider-marker' style='width: 1px; border-left-width: 1px; border-left-style: solid; border-left-color: red; height: 235px; position: absolute; margin-left: 3px;'></div></span>";
      pane +=   "<span class='btn btn-mini disabled slider slider-2' style='background:#0a0;color:white;text-shadow: 0 -1px 0 rgba(0, 0, 0, 0.25);'>G2<div class='slider-marker' style='width: 1px; border-left-width: 1px; border-left-style: solid; border-left-color: red; height: 235px; position: absolute; margin-left: 3px;'></div></span>";
      pane += "</div>";
      pane += "<div class='example' style='background:black;overflow:hidden;height:20px;'><img style='max-width:none;display:block;height:20px;' src='/images/snowsky-corrected.jpg' />";
      pane += " <p style='color: rgba(255, 255, 255, 0.701961); text-align: right; margin-top: -19px; font-size: 10px; padding: 1px 4px;'>REFERENCE</p>";
      pane += "</div>";

      $('.swb-spectrum-img-container').prepend('<div class="calibration-pane"></div>');
      $('.calibration-pane').html(pane);

      $('.calibration-pane .slider').css('margin-top', -24);
      $('.slider').css('position', 'absolute');

      // use autocalibration for first pass, 
      // or, for now, existing calibration:
      var _graph = form.graph,
          extent = form.graph.extent,
          error;

      var attemptCalibration = function() {

        var widthAsCalibrated = _graph.datum.json.data.lines.length; // sometimes calibration was run on a lower-res image; we are transitioning away from this
            auto_cal = SpectralWorkbench.API.Core.attemptCalibration(_graph), // [r,g,b] in terms of width of json stored image data
            // convert to display space from image space:
            blue2guess  = _graph.datum.image.container.width() * (auto_cal[2] / widthAsCalibrated),
            green2guess = _graph.datum.image.container.width() * (auto_cal[1] / widthAsCalibrated);

        calibrationResize(blue2guess, green2guess);

      }

      /*

        Mostly, we get pixel x,y data, and move the sliders and image accordingly,
          then generate wavelengths for the inputs. 

        Sometimes, we get wavelength inputs, find the pixel locations, and move the 
          sliders and image accordingly, then display the wavelengths in the inputs. 

        We should store the wavelength extents of the graph just once 
         (although we could change this on resize) - in the Graph object. 

      */

      // x1 and x2 are display space pixel values;
      // x1Lock and x2Lock are optional, default-off, for locking a slider you're not dragging
      var calibrationResize = function(x1, x2, x1Lock, x2Lock) {

        x1Lock = x1Lock || false;
        x2Lock = x2Lock || false;

        // calculate their wavelength values 
        // (fallback to data-space pixels, if uncalibrated)
        var w1 = _graph.displayPxToNm(x1),
            w2 = _graph.displayPxToNm(x2);

        // snap to nearest
        if ($('.calibration-pane input.checkbox-snap').prop('checked')) {

          // snap to nearest peak if not locked:
          if (!x1Lock) w1 = _graph.datum.getNearbyPeak(w1, 10);
          if (!x2Lock) w2 = _graph.datum.getNearbyPeak(w2, 10);

          // may return data-space pixel values instead of wavelengths, if not calibrated:
          x1 = _graph.nmToDisplayPx(w1);
          x2 = _graph.nmToDisplayPx(w2);

        }

        // distance between blue2 and green2 in example spectrum image as displayed:
        var exampleImgBlue2Green = parseInt(Math.abs(x2 - x1) / (blue2green / exampleImgWidth)); // in display pixels

        if (x1 <= x2) {

          var leftPad = (-parseInt((left2blue / exampleImgWidth) * exampleImgBlue2Green) + x1); // in display pixels
          $('.calibration-pane .example img').removeClass('flipped');

        } else {

          // the image must be flipped as the spectrum is backwards
          var leftPad = (-parseInt((right2green / exampleImgWidth) * exampleImgBlue2Green) + x2); // in display pixels
          $('.calibration-pane .example img').addClass('flipped');

        }

        $('.calibration-pane .example img').css('margin-left', leftPad);
        $('.calibration-pane .example img').css('width', exampleImgBlue2Green);

        $('.slider-1').css('left', parseInt(x1) + _graph.margin.left - 10);
        $('.slider-2').css('left', parseInt(x2) + _graph.margin.left - 10);

        $('.slider-1').attr('data-pos', x1); 
        $('.slider-2').attr('data-pos', x2);

        // compatibility with legacy systems where data extraction from image to json is not always 1:1
        var jsonPxPerImgPx = _graph.datum.json.data.lines.length/_graph.datum.image.width;

        // get source image pixel location, round to 2 decimal places:
        ix1 = Math.round(_graph.displayPxToImagePx(x1) * jsonPxPerImgPx * 100) / 100;
        ix2 = Math.round(_graph.displayPxToImagePx(x2) * jsonPxPerImgPx * 100) / 100;

        error = parseInt(SpectralWorkbench.API.Core.rmseCalibration(_graph.datum, blue2, green2, ix1, ix2));

        $('.calibration-pane .fit').html('Fit: ' + error)
                                   .removeClass('label-success')    // green
                                   .removeClass('label-warning')    // yellow
                                   .removeClass('label-important'); //red

        // color fitness indicator: 1 = green, 3 = yellow, worse = red
        if      (Math.abs(error) < 12) $('.calibration-pane .fit').addClass('label-success');
        else if (Math.abs(error) < 16) $('.calibration-pane .fit').addClass('label-warning');
        else                           $('.calibration-pane .fit').addClass('label-important');

        $('.input-wavelength-1').val(ix1);
        $('.input-wavelength-2').val(ix2);

      }

      $('.btn-auto-calibrate').click(function() {

        attemptCalibration();

      });

      var saveCalibration = function() {

        $('.btn-save-calibrate-2').html('<i class="fa fa-spinner fa-white fa-spin"></i>');

        if (_graph.datum.getTag('calibration') == false) _graph.datum.addTag('calibration');

        // clear the previous assessement tags
        _graph.datum.getPowerTag('error', function(tag) { tag.destroy() });
        _graph.datum.getPowerTag('calibrationQuality', function(tag) { tag.destroy() });
        _graph.datum.getPowerTag('linearCalibration', function(tag) { tag.destroy() });

        _graph.dim();
        _graph.datum.addAndUploadTag('linearCalibration:' + 
          $('.input-wavelength-1').val() + '-' + 
          $('.input-wavelength-2').val(),
          function() {

            _graph.datum.load();

            _graph.UI.notify("Your new calibration has been saved.", "success");

            // save the calculated error (from the rmse)
            _graph.datum.addTag('error:' + error);
  
            if      (Math.abs(error) < 12) _graph.datum.addTag('calibrationQuality:good');
            else if (Math.abs(error) < 16) _graph.datum.addTag('calibrationQuality:medium');
            else                           _graph.datum.addTag('calibrationQuality:poor');
  
            form.close();
            $('.calibration-pane').remove();
       
        });

      }

      form.applyEl.click(saveCalibration);
      $('.btn-save-calibrate-2').click(saveCalibration);

      // if these are outside the currently
      // displayed range, limit them:
      var limitRange = function(x) {

        if (x > _graph.datum.image.container.width()) x = _graph.datum.image.container.width();
        if (x < 0) x = 0;
        return x;

      }

      // note: isCalibrated() doesn't read current data, just saved data
      if (_graph.datum.isCalibrated()) {

        calibrationResize(limitRange(_graph.nmToDisplayPx(blue2)),
                          limitRange(_graph.nmToDisplayPx(green2)));

      } else {

        attemptCalibration();

      }

      $('.input-wavelength-1, .input-wavelength-2').change(function() {
        calibrationResize(
          _graph.imagePxToDisplayPx($('.input-wavelength-1').val()), 
          _graph.imagePxToDisplayPx($('.input-wavelength-2').val())
        );
      });

      var drag = d3.behavior.drag();

      drag.on('drag', function() { 

        var margin = _graph.margin.left,
            x      = limitRange(d3.event.x),
            isX1   = $(this).hasClass('slider-1') == 1,
            isX2   = $(this).hasClass('slider-2') == 1;

        $(this).css('left', x + margin);
        $(this).attr('data-pos', x);

        calibrationResize(+$('.slider-1').attr('data-pos'), 
                          +$('.slider-2').attr('data-pos'),
                          !isX1, // lock the slider you're not dragging
                          !isX2);

      });

      d3.selectAll('.slider').call(drag)

    }

  },


  // this is not used after calibration2 was added. Deprecate soon.
  calibrate: {

    title: "Wavelength calibration",
    dataType: "spectrum",
    description: "Follow the prompts to wavelength calibrate a fluorescent spectrum.",
    link: "//publiclab.org/wiki/spectral-workbench-calibration",
    author: "warren",
    apply: true,
    setup: function(form) {

      form.formEl.hide();
      $(form.el).find('.results').html('');
      form.customFormEl.html("<p>Click Begin to calibrate your spectrum.</p>");
      form.applyEl.html("Begin");

    },
    onApply: function(form) {

      var x1, x2,
          w1 = 435.833,
          w2 = 546.074;

      // if you haven't yet, consider selecting a cross section line (and tag)
      // Make less confusing: all subsequent spectra will use this line if you are uploading. Or mark this as live-capture.

      // need a simple way to reset the toolPane content, like alert();
      alert('Start by clicking the middle blue line.');

      form.graph.datum.image.click(function(_x1, _y1) {

        x1 = _x1;

        form.graph.datum.image.clickOff();
  
        alert('Now, click the bright green line.');
  
        form.graph.datum.image.click(function(_x2, _y2) {

          x2 = _x2;

          form.graph.datum.calibrateAndUpload(w1, w2, x1, x2);

          form.close();
  
        });
 
      });

    }

  },


  compare: {

    title: "Compare",
    dataType: "any",
    description: "Compare this spectrum to others in the graph above.",
    link: "//publiclab.org/wiki/spectral-workbench-operations#Compare",
    author: "warren",
    apply: false,
    url: '/spectrums/choose/?own=true', // default spectra to show, default yours and ?author=warren
    setup: function() {

      //$(form.el).find('.results').html('');

    },
    onSpectrumApply: function(form, _graph) {

      // provide better API for own-id:
      var id =     $(this).attr('data-id'),
          author = $(this).attr('data-author'),
          title =  $(this).attr('data-title');

      SpectralWorkbench.API.Core.addComparison(_graph, id, author, title);

      _graph.dim();

      SpectralWorkbench.API.Core.fetchLatestSnapshot(id, function(spectrum) {

        SpectralWorkbench.API.Core.compare(_graph, spectrum, function() {

          _graph.undim();

        });

      });

    }

  },


  similar: {

    title: "Find Similar",
    dataType: "spectrum",
    description: "Search the database for similar spectra.",
    link: "//publiclab.org/wiki/spectral-workbench-usage#Find+similar",
    author: "warren",
    apply: false,
    url: '/match/search/$ID?toolPane=true', // default spectra to show, can use * and ?author=warren
    setup: function() {

      //$(form.el).find('.results').html('');
      

    },
    onSpectrumApply: function(form, _graph) {

      // provide better API for own-id:
      var id =     $(this).attr('data-id'),
          author = $(this).attr('data-author'),
          title =  $(this).attr('data-title');

      SpectralWorkbench.API.Core.addComparison(_graph, id, author, title);

      _graph.dim();

      SpectralWorkbench.API.Core.fetchSpectrum(id, function(spectrum) {

        SpectralWorkbench.API.Core.compare(_graph, spectrum, function() {

          _graph.undim();

        });

      });

    }

  },


  // incomplete, works through tag form: 
  blend: {

    title: "Blend",
    dataType: "any",
    description: "Blends this spectrum with a second spectrum, using a JavaScript math expression (such as 'R*G+B') to each point in the two spectra, using the syntax described in the documentation",
    link: "//publiclab.org/wiki/spectral-workbench-operations#blend",
    author: "warren",
    apply: true,
    setup: function(form) {

      form.formEl.hide();
      $(form.el).find('.results').html('');
      // create custom form
      form.customFormEl.html("<p>Enter a spectrum id:</p><form class='blend-form'><input type='text' class='spectrum_id'></input><p>Enter an expression with which to blend it with this spectrum:</p><input type='text' class='expression'></input></form><p><a href='//publiclab.org/wiki/spectral-workbench-tools#Blend'>Read about blends &raquo;</a>");

      // is this not working? not submit... inputs need to submit
      form.el.find('.blend-form').on('submit', function(e) {

        e.preventDefault();
        form.graph.datum.addAndUploadTag('blend:' + form.el.find('.blend-form .spectrum_id').val() + '$' + form.el.find('.blend-form .expression').val());
        form.formEl.show();

      });

      form.el.find('.expression input').focus();

    },
    onApply: function(form, callback) {

      form.formEl.show();

      form.graph.dim();
      form.graph.datum.addAndUploadTag('blend:' + form.el.find('.blend-form .spectrum_id').val() + '$' + form.el.find('.blend-form .expression').val());

    }

  }

}

SpectralWorkbench.UI.ToolPane = Class.extend({

  form: {},
  spinner: "<i class='disabled fa fa-spinner fa-spin'></i>",

  init: function(toolType, _graph, selector, callback) {

    var _tool = this;
    var form = _tool.form;

    _tool.options = SpectralWorkbench.UI.ToolPaneTypes[toolType];
    _tool.selector = selector || '.swb-datum-tool-pane';

    _tool.options.formData = _tool.options.formData || {};
    _tool.options.formData['not'] = _graph.datum.id;

    // create basic toolpane in selector DOM el here:


    // some of these could be moved into SpectraPane subclass:
    form.graph           = _graph;
    form.el              = $(_tool.selector);
    form.titleEl         = form.el.find('.title');
    form.authorEl        = form.el.find('.attribution .author');
    form.linkEl          = form.el.find('.attribution .link');
    form.descriptionEl   = form.el.find('.description');
    form.formEl          = form.el.find('form');
    form.searchEl        = form.el.find('form input.input-choose-spectrum');
    form.authorSelectEl  = form.el.find('form select.select-author');
    form.customFormEl    = form.el.find('.custom');
    // spectrumApplyEl doesn't occur in every one
    form.spectrumApplyEl = form.el.find('.btn-spectrum-apply');
    form.applyEl         = form.el.find('.btn-apply');
    form.closeEl         = form.el.find('.actions .cancel');

    // hide and show things to return to default state
    form.cleanUp = function() {
      $(_tool.selector).find('.btn-spectrum-apply').html("Apply");
      form.applyEl.html("Apply");
      $(form.el).find('.custom').html('');
      form.formEl.show();
      form.spectrumApplyEl.off('click');
      form.applyEl.off('click');
      if (_tool.options.cleanUp) _tool.options.cleanUp(form);
      // clean up the search form listener from SpectraPane:
      if (form.formEl) $(form.formEl).off('submit');
    }

    // close the tool pane AND clean up. runs on "cancel"
    form.close = function() {
      form.cleanUp();
      $(_tool.selector).hide();
      $('.macros-pane').show();
    }

    // flush previous if any:
    form.cleanUp();
    form.searchEl.focus(); // this may be overridden in _tool.options.setup()... how?

    // these should be required
    if (_tool.options.title) form.titleEl.html(_tool.options.title);
    if (_tool.options.description) form.descriptionEl.html(_tool.options.description);
    if (_tool.options.author) form.authorEl.attr('href', '/profile/' + _tool.options.author).html(_tool.options.author);
    if (_tool.options.link) form.linkEl.attr('href', _tool.options.link);

    $(form.el).find('.results').html(_tool.spinner);
    if (_tool.options.setup) _tool.options.setup.bind(this)(form, _graph); // give it access to this scope

    if (_tool.options.apply) form.applyEl.show();
    else               form.applyEl.hide();

    if (_tool.options.onApply) { 
      form.applyEl.click(function(e) {
        form.applyEl.html("<i class='fa fa-spinner fa-spin fa-white'></i>");
        _tool.options.onApply.bind(this)(form);
        form.close();
      });
    }

    form.closeEl.click(form.close);

    // open the pane
    $(_tool.selector).show();
    $('.macros-pane').hide();

    return _tool;

  }

});

/*
 * A ToolPane type that displays a list of spectra and a spectrum search interface
 */
SpectralWorkbench.UI.SpectraPane = SpectralWorkbench.UI.ToolPane.extend({

  init: function(toolType, _graph, selector) {

    var _tool = this;

    this._super(toolType, _graph, selector);

    var form = _tool.form;

    // unhide the SpectraPane related stuff. 
    // We should just construct it here.

    //$('.swb-datum-tool-pane .search, .swb-datum-tool-pane .results').show()
    form.searchEl.show();//        = form.el.find('form input.input-choose-spectrum');
    form.el.find('.search').show();//        = form.el.find('form input.input-choose-spectrum');
    form.el.find('.results').show();//        = form.el.find('form input.input-choose-spectrum');

    // hook up "apply" buttons in spectrum choice search results
    var connectResults = function(result) {

      if (_tool.options.onSpectrumApply) { 

        // delegate, so that they get hooked up even to elements added by ajax later:
        // http://stackoverflow.com/questions/18414695/attaching-events-after-dom-manipulation-using-jquery-ajax
        $(_tool.selector).off('click'); // clear first
        $(_tool.selector).on('click', '.btn-spectrum-apply', function(e) {
          $(this).html(_tool.spinner);
          _tool.options.onSpectrumApply.bind(this)(form, _graph);
          form.close();
        });

      }
  
      if (_tool.options.apply) form.applyEl.show();
      else                     form.applyEl.hide();

    }

    // fetch the spectrum choice list:
    if (_tool.options.url) {
      _tool.options.url = _tool.options.url.replace('$ID', _graph.datum.id);
      $(form.el).find('.results').load(_tool.options.url, _tool.options.formData, connectResults);
    }

    // set up the search form
    $(form.formEl).on('submit',function() { 

      // update formData with Your vs. All spectra select
      _tool.options.formData.own = $('select.select-author').val();

      $(form.el).find('.results').html(_tool.spinner);

      $('.results').load(
        '/spectrums/choose/' + $(this).find('input.input-choose-spectrum').val(),
        _tool.options.formData,
        connectResults
      );

      return false;
    });

  }

});

/*
 * A ToolPane type that displays a list of spectra and a spectrum search interface
 */
SpectralWorkbench.UI.StepsPane = SpectralWorkbench.UI.ToolPane.extend({

  init: function(toolType, _graph, selector) {

    var _tool = this;

    this._super(toolType, _graph, selector);

    var form = _tool.form;
    var lastStep = null;

    _tool.options.steps.forEach(function(step, i) {

      var nextStep = _tool.options.steps[i+1];

      step.begin = function() {
        // foo.html(step.instructions);
        step.setup();
        // register event listener for completion
        if (nextStep) step.on('finish', nextStep.begin);
      }

    });

    _tool.options.steps[0].begin();

  }

});

/*

{
  instruction: "Now, click blablabla.",
  setup: function(args) {

    // create the interfaces -- provide template standards

  },
  onComplete: function() {

    // clean up the interfaces

    // then call the next step, passing on args:
    next(args);
    // use a closure to assign next()? 

  }
}

*/

SpectralWorkbench.UI.TagForm = Class.extend({

  init: function(_graph, callback) {

    var tagForm = this;

    tagForm.selector = "#swb-tag-form-" + _graph.datum.id;
    tagForm.el = $(tagForm.selector);
    tagForm.input = tagForm.el.find('input.name');

    tagForm.el.bind('submit', function(e){

      e.preventDefault();

      _graph.dim();

      tagForm.input.val().split(',').forEach(function(tagname) {

        tagForm.input.val('');

        _graph.datum.addAndUploadTagWithReference(tagname, function() {

          if (callback) callback();

        });

      });

    });

    tagForm.el.bind('ajax:beforeSend', function(){

      tagForm.input.prop('disabled',true)
      $('.swb-tags .loading').remove();

    });

    tagForm.clearError = function() {

      tagForm.el.find('.control-group').removeClass('error');
      tagForm.el.find('.control-group .help-inline').remove();

    };

    tagForm.error = function(msg) {

      $('.swb-tag-input').prop('disabled',false);
      
      tagForm.el.find('input.name').val("");
      tagForm.clearError();
      
      tagForm.el.find('.control-group').addClass('error');
      tagForm.el.find('.control-group .help-inline').remove();
      tagForm.el.find('.control-group').append('<span class="help-inline">'+msg+'</span>');
      
      tagForm.el.find('input.name').prop('disabled',false);

    }

    return tagForm;

  }

});

///////////////////LEGACY////////////////

SpectralWorkbench.UI.initTagForm = function(selector, spectrum_id) {

  $(selector).bind('submit', function(e){

    e.preventDefault();

    var tagname = $(selector + ' input.name').val();

    // callback handles only those 
    SpectralWorkbench.UI.LegacyAddTag(spectrum_id, tagname, function(response) {

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

  // setup deletion behavior for existing tags in legacy v1.x:
  $('.tagdelete').bind('ajax:success', function(e, response){

     if (response == "success") $('#tag_' + $(this).attr('data-id')).remove();

   });

}



SpectralWorkbench.UI.LegacyAddTag = function(spectrum_id, names, callback) {

  names.split(',').forEach(function(name) {

    $.ajax({
      url: "/tags",
      type: "POST",
 
      data: {
        authenticity_token: $('meta[name=csrf-token]').attr('content'),
        tag: {
          spectrum_id: spectrum_id,
          name: name
        }
      },
 
      success: function(response) {
 
        $.each(response['saved'],function(key, tag) {

          var color    = "";
 
          // we use CSS classnames to identify tag types
          if (key.match(/[a-zA-Z-]+:[a-zA-Z0-9-]+/)) color = " purple";
 
          $('.swb-tags').append(" <span id='tag_"+tag.id+"' rel='tooltip' title='This is a powertag.' class='label label-info" + color + "'><a href='/tags/"+key+"'>"+key+"</a> <a class='tagdelete' data-method='delete' href='/tags/"+tag.id+"'>x</a></span> ");

          // deletion listener
          $('#tag_'+tag.id).bind('ajax:success', function(e, tagid){
            $('#tag_'+tag.id).remove();
          });
 
        });
 
        $('#taginput').prop('disabled',false);
 
        callback(response);
 
      },
 
    });


  });


}

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

SpectralWorkbench.Graph = Class.extend({

  extent: [0,0],

  init: function(args, callback) {

    var _graph = this;

    _graph.args = args;
    _graph.callback = callback;
    _graph.loaded = false; // measure initial load completion
    _graph.onImageComplete = args['onImageComplete'] || function() { console.log('image load complete'); };
    _graph.onComplete = args['onComplete'] || function() { console.log('graph load complete'); };
    _graph.width = 600; // what this is is unclear :-(
    _graph.zooming = false;
    _graph.embed = args['embed'] || false;
    _graph.embedmargin = 10;
    _graph.margin = { top: 10, right: 30, bottom: 20, left: 70 }; // this is used both for the d3 svg and for the image.container
    _graph.range = _graph.args.range || false;
    _graph.selector = _graph.args.selector || '#graph';
    _graph.el = $(_graph.selector);

    _graph.API = new SpectralWorkbench.API(this);

    // set/spectrum breakout
    if (_graph.args.hasOwnProperty('spectrum_id')) {

      _graph.dataType = "spectrum";

    } else if (_graph.args.hasOwnProperty('set_id')) {

      _graph.dataType = "set";

    } 

    _graph.updateSize()();
 
    _graph.svg = d3.select(_graph.selector).append("svg")
                                           .attr("width",  _graph.width  + _graph.margin.left + _graph.margin.right)
                                           .attr("height", _graph.height + _graph.margin.top  + _graph.margin.bottom);

    /* ======================================
     * Refresh datum into DOM in d3 syntax
     */
    _graph.reload = function() {

      if (_graph.datum instanceof SpectralWorkbench.Spectrum) _graph.datum.setSigFigures();
      // populate the <svg> element with chart data 
      // and provide a binding key
      _graph.data.datum(_graph.datum.d3);

    }


    /* ======================================
     * Refresh graph element in d3 syntax, 
     * then resize image
     */
    _graph.refresh = function() {

      _graph.setUnits();
      _graph.data.call(_graph.chart);
      _graph.updateSize()();
      console.log('graph refreshed');

    }


    /* ======================================
     * One-line "graph is ready" function;
     * should change to camel case in next API
     */
    _graph.reload_and_refresh = function() {

      _graph.reload();
      _graph.refresh();
      _graph.undim(); // for good measure

    }


    /* ======================================
     * Reads URL hash (after '#') for addTag 
     * directives, then clears hash so it's not
     * copied into URLs by user.
     */
    _graph.readHashDirectives = function() {

      var tagname = getUrlHashParameter('addTag');

      // this cannot be run before datum.tags is populated.
      if (tagname) {

        console.log('found addTag URL directive, adding', tagname);

        _graph.datum.addAndUploadTagWithReference(tagname, function() {

          // clear the directive
          window.location.hash = '';

        });

      }

    }


    /* ======================================
     * Converts an x-coordinate pixel value from image space 
     * to a display space pixel value
     */
    _graph.imagePxToDisplayPx = function(x) {

      // what proportion of the full image is being displayed?
      var proportion = x / _graph.datum.image.width, // x position as a percent of original image
          scaledX = proportion * _graph.datum.image.el.width(), // that proportion of the displayed DOM image element;
          displayPxPerNm = _graph.datum.image.el.width() / (_graph.fullExtent[1] - _graph.fullExtent[0]), 
          leftXOffsetInDisplayPx = (_graph.extent[0] - _graph.fullExtent[0]) * displayPxPerNm;

      return scaledX - leftXOffsetInDisplayPx;

    }


    /* ======================================
     * Converts an x-coordinate pixel value from display space 
     * to an image space pixel value
     */
    _graph.displayPxToImagePx = function(x) {

      // what proportion of the full image is being displayed?
      var displayPxPerNm = _graph.datum.image.el.width() / (_graph.fullExtent[1] - _graph.fullExtent[0]), 
          leftXOffsetInDisplayPx = (_graph.extent[0] - _graph.fullExtent[0]) * displayPxPerNm,
          fullX = x + leftXOffsetInDisplayPx, // starting from true image DOM element zero
          proportion = fullX / _graph.datum.image.el.width(), // x position as a percent of DOM image
          scaledX = proportion * _graph.datum.image.width; // that proportion of the original image

      return scaledX;

    }


    /* ======================================
     * Accepts x-coordinate in display space as shown 
     * on page & returns wavelength in nanometers.
     * Unlike datum.pxToNm, does not rely on an image or its dimensions.
     */
    _graph.displayPxToNm = function(x) {

      var proportion  = x / _graph.width,
          extentWidth = _graph.extent[1] - _graph.extent[0]; // as displayed after range limiting, not fullExtent

      return _graph.extent[0] + (proportion * extentWidth);

    }


    /* ======================================
     * Accepts wavelength in nanometers & returns
     * x-coordinate in display space as shown on page.
     */
    _graph.nmToDisplayPx = function(nm) {

      var extentWidth = _graph.extent[1] - _graph.extent[0],
          proportion  = ((nm - _graph.extent[0]) / extentWidth);


      return proportion * _graph.width;

    }


    /* ======================================
     * Sets units for graph element in d3
     */
    _graph.setUnits = function() {

      if (!_graph.datum) {

        if (_graph.args.calibrated) _graph.xUnit = 'nanometers';
        else _graph.xUnit = "uncalibrated pixels";

      } else if (_graph.dataType == 'spectrum' && _graph.datum.isCalibrated()) {

        _graph.xUnit = 'nanometers';

      } else _graph.xUnit = "uncalibrated pixels";
 
      _graph.chart.xAxis     //Chart x-axis settings
                  .axisLabel('Wavelength ('+_graph.xUnit+')')
                  .tickFormat(d3.format('1r'));
 
      _graph.chart.yAxis     //Chart y-axis settings
                  .axisLabel('Intensity (%)')
                  .tickFormat(d3.format('%'));
      // we should link to:
                  //.axisLabel('<a href="https://publiclab.org/wiki/spectral-workbench-usage#Axes">Intensity</a> (%)')

    }


    /* ======================================
     * once actual JSON is available and processed, 
     * <datum> is created; either SW.Set or SW.Spectrum
     * <chart> is the nvd3 chart
     * <data> is the raw JSON data from the server
     */
    _graph.load = function(datum) {

      _graph.datum = datum;

      // APIv1 backwards-compatibility
      SpectralWorkbench.API.Legacy.load(datum.json, _graph.dataType);

      _graph.tagForm = new SpectralWorkbench.UI.TagForm(_graph); 

      /* Enter data into the graph */
      _graph.data = d3.select(_graph.selector + ' svg')  //Select the <svg> element you want to render the chart in.   
                      .datum(datum.d3)   //Populate the <svg> element with chart data
                      .call(_graph.chart)         //Finally, render the chart!

      // create DOM <id> attributes for our lines:

      // This would be for *all* lines, or lines if this were not a zoomable graph:
      // d3.selectAll('g.nv-line > g > g.nv-groups g') 

      // apparently HTML id has to begin with a string? 
      // http://stackoverflow.com/questions/70579/what-are-valid-values-for-the-id-attribute-in-html

      // main graph lines
      d3.selectAll('g.nv-focus g.nv-line > g > g.nv-groups g') 
        //.addClass('main-line') // we should do this (or the d3 equiv.) for later selections. Or if nvd3 offers a ready-made selection
        .attr("id", function(datum, index) {
          var id = d3.select('svg').data()[0][index].id; // this is the real d3 DOM-stored data
          return 'spectrum-line-' + id;
        });

      // zoom graph lines
      d3.selectAll('g.nv-context g.nv-line > g > g.nv-groups g') 
        .attr("id", function(datum, index) {
          var id = d3.select('svg').data()[0][index].id; // this is the real d3 DOM-stored data
          return 'spectrum-line-' + id;
        });

      // graph line hover circles for main graph lines
      d3.selectAll('g.nv-focus g.nv-scatterWrap g.nv-groups g') 
        .attr("id", function(datum, index) {
          var id = d3.select('svg').data()[0][index].id; // this is the real d3 DOM-stored data
          return 'spectrum-hover-' + id;
        });

      // graph line hover circles for zoom graph lines
      d3.selectAll('g.nv-context g.nv-scatterWrap g.nv-groups g') 
        .attr("id", function(datum, index) {
          var id = d3.select('svg').data()[0][index].id; // this is the real d3 DOM-stored data
          return 'spectrum-hover-' + id;
         });

      if (_graph.dataType == "spectrum") {

        // Create an image and canvas element to display and manipulate image data. 
        _graph.datum.image = new SpectralWorkbench.Image(_graph, {
          onLoad:   _graph.onImageComplete,
          selector:   _graph.args.imageSelector,
          // plus optionals:
          url:        _graph.args.imgSrc,
          sample_row: _graph.args.sample_row
        });

        _graph.UI = new SpectralWorkbench.UI.Spectrum(_graph);

        // scan for helper tips

        _graph.UI.alertOverexposure(_graph.datum);

        _graph.UI.alertTooDark(_graph.datum);

      } else if (_graph.dataType == "set") {

        if (_graph.datum) _graph.UI = new SpectralWorkbench.UI.Set(_graph, _graph.args.set_id, _graph.datum.spectra);

      }


      // update graph size now that we have data and esp. range data
      _graph.updateSize()();
 
      // actually add it to the display
      nv.addGraph(function() { return _graph.chart; });

      _graph.loaded = true;
      _graph.onComplete(_graph); // older than callback; DRY this up!
      if (_graph.callback) _graph.callback();
 
      // hide loading spinner
      _graph.el.find('.fa-spinner').remove();

    }


    /* ======================================
     * Toggle zooming and panning, via a "brushing" interface
     */
    _graph.zoom = function() {

      _graph.zooming = !_graph.zooming;
      $('.nv-context').toggle();
      _graph.updateSize()();

    }


    /* ======================================
     * Dim graph, such as while it's loading
     */
    _graph.dim = function() {
      _graph.svg.style('opacity', 0.5);
    }


    /* ======================================
     * Un-dim graph, such as while it's loading
     */
    _graph.undim = function() {
      _graph.svg.style('opacity', 1);
    }


    /* ======================================
     * Switch to eV as units (not well-implemented; should be 
     * done as display, not actually overwriting data)
     */
    _graph.toggleUnits = function() {

      if (_graph.dataType == "spectrum") {
        var datasets = [ _graph.datum.average,
                         _graph.datum.red,
                         _graph.datum.green,
                         _graph.datum.blue ];
      } else {
        var datasets = [];
        _graph.datum.spectra.map(function(spectrum) {
          datasets.push(spectrum.average);
        });
      }

      if (d3.select('.nv-axislabel').html() == "Wavelength (eV)") {

        _graph.chart.xAxis.axisLabel('Wavelength (nanometers)');
        var unitChange = function(d) { d.x = 1239.82/d.x; return d; }

      } else if (d3.select('.nv-axislabel').html() == "Wavelength (nanometers)") {

        _graph.chart.xAxis.axisLabel('Wavelength (eV)');
        var unitChange = function(d) { d.x = 1239.82/d.x; return d; }

      }
 
      datasets.map(function(dataset) { 
     
        dataset = dataset.map(unitChange);
     
      });
      
      _graph.data = d3.select(_graph.selector + ' svg')  //Select the <svg> element you want to render the chart in.   
            .datum(_graph.datum.d3)   //Populate the <svg> element with chart data and provide a binding key (removing idKey has no effect?)

      _graph.updateSize()();
 
    }


    /* ======================================
     * Gets a spectrum object by its <id> if it exists in this graph.
     * Maybe we should have a fetchSpectrum which can get them remotely, too?
     */
    _graph.getSpectrumById = function(id) {

      if (_graph.dataType == "spectrum") {

        console.log('This only works on sets');

      } else {

        var response = false;

        _graph.datum.spectra.forEach(function(spectrum) {

          if (spectrum.id == id) response = spectrum;

        });

      }

      return response;

    }


    /* ======================================
     * Everything else left to do to get this graph started
     */

    _graph.graphSetup();
    _graph.eventSetup();

    
    if (_graph.embed) $(_graph.selector).on('resize', _graph.updateSize()); // if embed, update the chart when DOM element resizes
    else $(window).on('resize', _graph.updateSize()); // else resize when window resizes

    return _graph;

  },


  /* ======================================
   * set up initial d3 graph using nvd3 template
   */
  graphSetup: function() {
 
    var _graph = this;

    _graph.chart = nv.models.lineWithFocusChart() // this sets up zooming behavior
                     .options({ useVoronoi: false })
                     .height(_graph.height - _graph.margin.top - _graph.margin.bottom + 100) // 100 for zoom brush pane, hidden by default
                     .margin(_graph.margin)
                     .showLegend(false)       //Show the legend, allowing users to turn on/off line series.
    ;

    _graph.margin.left += 10; // correction after chart init

    _graph.setUnits();
 
    if (_graph.dataType == "spectrum") {

      new SpectralWorkbench.Importer( "/spectrums/" 
                      + _graph.args.spectrum_id 
                      + ".json",
                        _graph, 
                        _graph.load);

    } else if (_graph.dataType == "set") {

      new SpectralWorkbench.Importer( "/sets/calibrated/" 
                      + _graph.args.set_id 
                      + ".json?t=" + parseInt(Math.random()*10000), // prevent caching set data 
                        _graph, 
                        _graph.load);

    }

  },


  /* ======================================
   * connect up set table checkboxes/visibility;
   * for hover behaviors, see Set.setupUI();
   */
  eventSetup: function() {

    var _graph = this;

    // Set up graph/table mouse events.
    // Move this into Set, or Set UI
    if (_graph.dataType == "set") {

      // setup sets list of spectra
      $('table.spectra input.visible').change(function(e) {
        var el = this;
        var id      = $(el).attr('data-id'),
            checked = $(el).is(':checked');
        if (checked) {
          d3.selectAll('#spectrum-line-'+id).style('display','block');
        } else {
          d3.selectAll('#spectrum-line-'+id).style('display','none');
          $('table.spectra input.visible-all').attr('checked',false);
        }
      })

      $('table.spectra input.visible-all').change(function(e) {
        var el = this;
        var checked = $(el).is(':checked');
        if (checked) {
          $('table.spectra input.visible').prop('checked',true);
          $('table.spectra input.visible').trigger('change');
          $('table.spectra input.visible-all').prop('checked',true);
        } else {
          $('table.spectra input.visible').prop('checked',false);
          $('table.spectra input.visible').trigger('change');
        }
      })
    }

  },


  /* ======================================
   * Resize image and reset padding based on range and viewport width.
   * Note: accepts optional <newWidth> which is used in our Jasmine tests
   * since this is based on assumption that the element we're calling .width() on is visible,
   * which may not last in future jQuery versions: http://api.jquery.com/width/,
   * and is not true during Jasmine testing.
   */
  updateSize: function(newWidth) {

    // tests frequency of occurences
    //console.log('updateSize');
    var _graph = this;
 
    return (function() { 

      if (_graph.datum) {

        _graph.fullExtent = _graph.datum.getFullExtentX(); // store min/max of graph without range limits
        _graph.extent = _graph.datum.getExtentX(); // store min/max of graph

      }

      _graph.width  = newWidth || getUrlParameter('width')  || $(_graph.selector).width() || _graph.width;
 
      if (getUrlParameter('height')) {
 
        _graph.height = getUrlParameter('height');
 
      } else {
 
        if (($(_graph.selector).height() < 450 && _graph.dataType == 'set') || 
            ($(_graph.selector).height() < 350 && _graph.dataType == 'spectrum')) { 

          // compact
          _graph.height = 180;
          $('#embed').addClass('compact'); // hides image
 
        } else {
 
          // full size
          _graph.height = 200;
          $('#embed').removeClass('compact');
 
        }
 
        _graph.height = _graph.height - _graph.margin.top  - _graph.margin.bottom;
 
      }

      // make space for the zoom brushing pane
      if (_graph.zooming) _graph.height += 100;

      $(_graph.selector).height(_graph.height)

      _graph.width  = _graph.width  
                    - _graph.margin.left 
                    //- _graph.margin.right // right margin not required on image, for some reason
                    - (_graph.embedmargin * 2); // this is 10 * 2

      _graph.el.height(120); // this isn't done later because we mess w/ height, in, for example, calibration

      if (_graph.datum && _graph.datum.image) _graph.datum.image.updateSize(); // adjust image element and image.container element

      if (_graph.datum) {

        _graph.fullExtent = _graph.datum.getFullExtentX(); // store min/max of graph without range limits
        _graph.extent = _graph.datum.getExtentX(); // store min/max of graph

      }
 
      // update only if we're past initialization
      if (_graph.chart) {
        _graph.chart.update();
      }

    });
  }

});
