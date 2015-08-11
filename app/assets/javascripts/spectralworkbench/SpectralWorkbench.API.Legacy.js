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

  }

}
