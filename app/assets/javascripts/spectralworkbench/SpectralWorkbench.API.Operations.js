/*
 * All Operations (PowerTags), each of which has a name (the tag key)
 * and description() and optional run() methods, which each accept parameter <tag>.
 * These are called from the PowerTag class.
 * Operations without a "run" method are passive and do not affect data.
 * 
 *  'subtract': {
 *
 *    description: function(tag) {
 * 
 *      return "foo";
 * 
 *    },
 * 
 *    run: function(tag) {
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

      return "Sets the row of pixels, counting from top row, used to generate the graph.";

    },

    run: function(tag) {

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

      var response = "Manually calibrated with two reference points.";
      if (tag.datum.powertags.indexOf(tag) != 0) response += " <span style='color:#900'>Only a crossSection operation should precede this.</span>";
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


  'calibrate': {

    description: function(tag) {

      response = "Copies calibration from <a href='/spectrums/" + tag.value + "'>Spectrum " + tag.value + "</a>";
      if (tag.has_reference) response += ", snapshot #" + tag.reference_id;
      else response += ", which has no snapshots -- this is not recommended.";
      return response;

    },

    run: function(tag) {

      // We only copy spectra if you refer to a snapshot of another spectrum; 
      // no copying from original data as it should not have a calibration:
      if (tag.has_reference) SpectralWorkbench.API.Core.copyCalibration(tag.datum, tag.value_with_snapshot);

    }

  }


}
