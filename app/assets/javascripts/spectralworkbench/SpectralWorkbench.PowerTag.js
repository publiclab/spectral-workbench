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
    "range",
    "crossSection",
    "smooth",
    "flip"

  ],

  reference_tagnames: [

    "calibration",
    "subtract",
    "transform"

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


    _tag.key = _tag.name.split(':')[0];
    _tag.value = _tag.name.split(':')[1];

    // scan for tags that require snapshots, but this isn't the right place to save it -- we need to parse it!
    if (_tag.snapshot_tagnames.indexOf(_tag.key) != -1)  _tag.needs_snapshot  = true;
    if (_tag.reference_tagnames.indexOf(_tag.key) != -1) _tag.needs_reference = true;


    _tag.description = function() {

      if      (_tag.key == "smooth")            return "Rolling average smoothing.";
      else if (_tag.key == "range")             return "Limits wavelength range.";
      else if (_tag.key == "cloneOf")           return "Spectrum is a copy of <a href='/spectrums/" + _tag.value + "'>Spectrum " + _tag.value + "</a>.";
      else if (_tag.key == "linearCalibration") return "Manually calibrated with two reference points.";
      else if (_tag.key == "error")             return "Scores a calibration 'fit' by comparison to a known reference; lower is better, zero is perfect.";
      else if (_tag.key == "calibrationQuality")return "Roughly indicates how good a calibration 'fit' is.";
      else if (_tag.key == "crossSection")      return "Sets the row of pixels, counting from top row, used to generate the graph.";
      else if (_tag.key == "flip")              return "Indicates that the spectrum image has been flipped horizontally.";
      else if (_tag.key == "transform")         return "Filters this spectrum with a math expression.";
      else if (_tag.key == "blend") {

        response = "Filters this spectrum with a math expression, in combination with data from <a href='/spectrums/" + _tag.value + "'>Spectrum " + _tag.value + "</a>";
        if (_tag.has_reference) response += ", snapshot #" + _tag.reference_id;
        return response;

      } else if (_tag.key == "subtract") {

        response = "Subtracts <a href='/spectrums/" + _tag.value + "'>Spectrum " + _tag.value + "</a>";
        if (_tag.has_reference) response += ", snapshot #" + _tag.reference_id;
        response += " from this spectrum.";
        return response;

      } else if (_tag.key == "calibrate") {

        response = "Copies calibration from <a href='/spectrums/" + _tag.value + "'>Spectrum " + _tag.value + "</a>";
        if (_tag.has_reference) response += ", snapshot #" + _tag.reference_id;
        return response;

      } else return "No description yet.";

    }


    // in a new tag, we rely on parent class's tag.upload() to copy 
    // these over, but for existing tags, we have to do it manually:
    _tag.parseSnapshotResponse = function(json) {

      // has it generated a snapshot?
      // note that this won't have happened yet for new tags, until after parsing;
      // however, we check response from tag.upload() for a snapshot id and set it there too
      if (json.hasOwnProperty('snapshot_id'))                  _tag.snapshot_id                  = json.snapshot_id;
      if (json.hasOwnProperty('has_dependent_spectra'))        _tag.has_dependent_spectra        = json.has_dependent_spectra;
      if (json.hasOwnProperty('dependent_spectra'))            _tag.dependent_spectra            = json.dependent_spectra;
      if (json.hasOwnProperty('refers_to_latest_snapshot'))    _tag.refers_to_latest_snapshot    = json.refers_to_latest_snapshot;
      if (json.hasOwnProperty('reference_spectrum_snapshots')) _tag.reference_spectrum_snapshots = json.reference_spectrum_snapshots;

    }

    _tag.parseSnapshotResponse(_tag.json);


    // intercept and deal with the appended key:value#<snapshot_id>
    _tag.filterReferenceId = function(name) {

      _tag.value_with_snapshot = _tag.value; // include snapshot syntax if exists

      if (name.match("#")) {
 
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


    // Delete it from the server, then from the DOM;
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

          _tag.cleanUp(callback);
 
        },

        error: function(response) {

          console.log('Deletion of tag ' + _tag.id + ' rejected.', response)

          _tag.labelEl().css('background', '#b00');
          _tag.labelEl().find('i.fa').removeClass('fa-spinner fa-spin')
                                     .addClass('fa-exclamation-circle');

          $('tr#tag_' + _tag.id + ' .operation-tag-delete .fa').removeClass('fa-spinner fa-spin')
                                                               .addClass('fa-exclamation-circle')
                                                               .css('color', '#600');
          $('tr#tag_' + _tag.id).css('color', '#600');

          _tag.has_dependent_spectra = response.has_dependent_spectra;
          _tag.dependent_spectra = response.dependent_spectra;
          _tag.is_latest = response.is_latest;

          if (response.hasOwnProperty('has_dependent_spectra') && _tag.has_dependent_spectra) {

            _tag.notice("Operation could not be deleted because other operations rely on it. Try cloning this spectrum to make changes without disrupting dependent data.", "error");

          } else if (response.hasOwnProperty('is_latest') && !_tag.is_latest) {

            _tag.notice("Operation could not be deleted because it is not the most recent operation to this spectrum. Deletions must occur most-recent-first.", "error");

          } else {

            _tag.notice("There was an error.", "error");

          }

          if (callback) callback(response, _tag); // for testing, at least

        }

      });
 
    }


    // scrubs local tag data; for use after deletion
    // note: overriding superclass
    _tag.cleanUp = function(callback) {

        _tag.datum.graph.dim();

        // if it failed to initialize, the element may not exist
        if (_tag.el) _tag.el.remove();
        if (_tag.operationEl) _tag.operationEl.remove();

        // remove it from datum.tags:
        _tag.datum.tags.splice(_tag.datum.tags.indexOf(_tag), 1);

        // do this after removing
        _tag.showLastOperationDeleteButtonOnly();

        // flush the graph range so the image gets resized:
        _tag.datum.graph.range = false;

        // re-fetch spectrum data, as it may have been overwritten by various tags:
        _tag.datum.fetch(false, function() {

          _tag.datum.parseTags();
          _tag.datum.graph.reload();
          _tag.datum.graph.refresh();
          _tag.datum.graph.undim();

          if (callback) callback(_tag);

        });

    }


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

          _tag.operationEl.find(".snapshot").append('<i style="color:#999;" class="fa fa-chevron-circle-down" rel="popover" data-placement="bottom" data-html="true" data-title="Dependent spectra" data-content=""></i>');

          var string = '<p><small>This <a href="https://publiclab.org/wiki/spectral-workbench-snapshots" target="_blank">snapshot</a> (ID #' + _tag.snapshot_id + ') is used by ' + _tag.dependent_spectra.length + ' other operations. You therefore cannot delete it, but you can clone this spectrum and revert this operation on the copy.</small></p><p>';
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
  
            _tag.operationEl.find(".snapshot").append('<i style="color:#ed0;" class="fa fa-exclamation-triangle" rel="popover" data-placement="bottom" data-html="true" data-title="No snapshot" data-content=""></i>');
            var string = "<p>The spectrum this operation refers to does not have any snapshots, which means it may be uncalibrated, and/or be created using Spectral Workbench 1.0, an old version. Be aware that this may affect your use of this spectrum.</p>";
            _tag.operationEl.find(".snapshot i").attr('data-content', string);
            _tag.operationEl.find(".snapshot i").popover();

          // there IS a reference, but it's not the only one:
          } else {
 
            var string = "";

            if (_tag.refers_to_latest_snapshot) {

              _tag.operationEl.find(".snapshot").append('<i style="color:#999;" class="fa fa-chevron-down" rel="popover" data-placement="bottom" data-html="true" data-title="Updates" data-content=""></i>');
              string += "<p>The spectrum this operation refers to has other snapshots which you can refer to instead.</p>";

            } else {

              _tag.operationEl.find(".snapshot").append('<i style="color:#ed0;" class="fa fa-exclamation-triangle" rel="popover" data-placement="bottom" data-html="true" data-title="Updates" data-content=""></i>');
              string += "<p>The spectrum this operation refers to has been edited since the reference was made, and this operation no longer refers to the most recent snapshot of the spectrum.</p>";

            }

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


      } else {

        _tag.operationEl.append("<td class='snapshot'></td>");

      }


      _tag.operationEl.append("<td class='title'><span class='label purple'>" + _tag.name + "</span></td>");
      if (_tag.has_reference) _tag.operationEl.find('.label').append("#" + _tag.reference_id);
      _tag.operationEl.append("<td class='date'><small>" + moment(_tag.json.created_at).format("MM-DD-YY HH:mm a") + "</small></td>");
      _tag.operationEl.append("<td class='description'><small>" + _tag.description() + " <a href='//publiclab.org/wiki/spectral-workbench-tags#" + _tag.key + "'>Read more</a></small></td>");
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


    // only final operation should have deletion button
    _tag.showLastOperationDeleteButtonOnly = function() {

      var operationTable = $('table.operations');
      operationTable.find('tr.operation-tag .operations-tools .operation-tag-delete-disabled').show();
      operationTable.find('tr.operation-tag .operations-tools .operation-tag-delete').hide();
      operationTable.find('tr.operation-tag .date .last-indicator').remove();

      // need to check for *datum's last tag's* deletability
      if (_tag.datum.tags[_tag.datum.tags.length - 1].deletable()) {

        operationTable.find('tr.operation-tag:last .operations-tools .operation-tag-delete-disabled').hide();
        operationTable.find('tr.operation-tag:last .operations-tools .operation-tag-delete').show();
        operationTable.find('tr.operation-tag:last .date').append(' <p class="last-indicator"><small><i>most recent</i></small></p>');

      }

    }


    _tag.parse = function() {

      if (_tag.key == "subtract") {

        SpectralWorkbench.API.Core.subtract(_tag.datum, _tag.value_with_snapshot);

      } else if (_tag.key == "flip:horizontal") {

        SpectralWorkbench.API.Core.flipHorizontal(_tag.datum);

      } else if (_tag.key == "calibrate") {

        // We only copy spectra if you refer to a snapshot of another spectrum; 
        // no copying from original data as it should not have a calibration:
        if (_tag.has_reference) SpectralWorkbench.API.Core.copyCalibration(_tag.datum, _tag.value_with_snapshot);

// warn user here that there's a problem

      } else if (_tag.key == "transform") {

        SpectralWorkbench.API.Core.transform(_tag.datum, _tag.value_with_snapshot);

      } else if (_tag.key == "smooth") {

        SpectralWorkbench.API.Core.smooth(_tag.datum, _tag.value);

      } else if (_tag.key == "blend") {

        var blend_id = _tag.value_with_snapshot.split('$')[0],
            expression = _tag.value_with_snapshot.split('$')[1];

        SpectralWorkbench.API.Core.blend(_tag.datum, blend_id, expression);

      } else if (_tag.key == "range") {

        SpectralWorkbench.API.Core.range(_tag.datum, +_tag.value.split('-')[0], +_tag.value.split('-')[1]);

      }

      // save the parsed tag data
      if (_tag.needs_snapshot) _tag.data = JSON.stringify(_tag.datum.json.data);

    }


    // send request to server to change the tag's reference
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

      return (!_tag.hasOwnProperty('snapshot_id') || _tag.has_dependent_spectra != true);

    }


    _tag.parse();

    if (_tag.uploadable) {

      _tag.upload(callback);
 
      // render called after upload, in uploadSuccess
 
    } else {
 
      if (callback) callback(); // callback directly, as we don't need to wait for an upload

      _tag.render();
 
    }

    return _tag;

  }

});
