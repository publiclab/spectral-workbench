/*
 * All Operations (PowerTags), each of which has a name (the tag key)
 * and description() and optional run() methods, which each accept parameter <tag>.
 * These are called from the PowerTag class.
 * Operations without a "run" method are passive and do not affect data.
 * Operations with a "clean" method execute it when deleted. These need only be those which wouldn't be cleared by re-running all tags de novo.
 * Code to parse and execute all this is in the PowerTag class. 
 * 
 *  'subtract': {
 *
 *    description: function(tag) {
 * 
 *      return "foo";
 * 
 *    },
 *
 *    // callback optional:
 *    run: function(tag, callback) {
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

    run: function(tag) {

      SpectralWorkbench.API.Core.smooth(tag.datum, tag.value);

    }

  },


  'range': {

    description: function(tag) {

      return "Limits wavelength range to specified <b>min-max</b>.";

    },

    run: function(tag) {

      SpectralWorkbench.API.Core.range(tag.datum, +tag.value.split('-')[0], +tag.value.split('-')[1]);

    }

  },


  'forked': {

    description: function(tag) {

      var response = "Spectrum is a forked copy of <a href='/spectrums/" + tag.value + "'>Spectrum " + tag.value + "</a>";
      if (tag.has_reference) response += ", snapshot #" + tag.reference_id;
      return response;

    },

    run: function(tag) {

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

    run: function(tag) {

      tag.datum.imgToJSON(tag.value);
      tag.datum.load(); // reparse graph-format data

      tag.datum.graph.args.sample_row = tag.value;
      tag.datum.graph.image.setLine(tag.value);

    }

  },


  'flip': {

    description: function(tag) {

      return "Indicates that the spectrum image has been flipped horizontally.";

    },

    run: function(tag) {

      SpectralWorkbench.API.Core.flip(tag); // default 'horizontal'

    }

  },


  'transform': {

    description: function(tag) {

      return "Filters this spectrum with a math expression.";

    },

    run: function(tag) {

      SpectralWorkbench.API.Core.transform(tag.datum, tag.value_with_snapshot);

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

    run: function(tag) {

      var blue2 = 435.83,
          green2 = 546.07,
          x1 = +tag.value.split('-')[0],
          x2 = +tag.value.split('-')[1];

      tag.datum.json.data.lines = tag.datum.calibrate(blue2, green2, x1, x2);
 
      // reload the spectrum data:
      tag.datum.load();

    },

    clear: function(tag) {

      var x1 = +tag.value.split('-')[0],
          x2 = +tag.value.split('-')[1];

      if (x1 > x2) {

        tag.datum.graph.imgEl.removeClass('flipped');

      }

    }

  },


  'blend': {

    description: function(tag) {

      var response = "Filters this spectrum with a math expression, in combination with data from <a href='/spectrums/" + tag.value + "'>Spectrum " + tag.value + "</a>";
      if (tag.has_reference) response += ", snapshot #" + tag.reference_id;
      return response;

    },

    run: function(tag) {

      var blend_id = tag.value_with_snapshot.split('$')[0],
          expression = tag.value_with_snapshot.split('$')[1];

      SpectralWorkbench.API.Core.blend(tag.datum, blend_id, expression);

    }

  },


  'subtract': {

    description: function(tag) {

      var response = "Subtracts <a href='/spectrums/" + tag.value + "'>Spectrum " + tag.value + "</a>";
      if (tag.has_reference) response += ", snapshot #" + tag.reference_id;
      response += " from this spectrum.";
      return response;

    },

    run: function(tag) {

      SpectralWorkbench.API.Core.subtract(tag.datum, tag.value_with_snapshot);

    }

  },


  'calibrated': {

    description: function(tag) {

      return "Calibrated from the Capture interface using data from <a href='/spectrums/" + tag.value + "'>Spectrum " + tag.value + "</a>; but no snapshot generated. Re-calibrate to generate a snapshot; this will be resolved in an upcoming release.";

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
