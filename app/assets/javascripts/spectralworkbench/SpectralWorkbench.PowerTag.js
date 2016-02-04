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

    "calibration",
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
    if (_tag.reference_tagnames.indexOf(_tag.key) != -1) _tag.needs_reference = true;


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
     * Intercept and deal with the appended key:value#<snapshot_id>
     */
    _tag.filterReferenceId = function(name) {

      if (name.match("#")) {

        _tag.value = name.split(':')[1];
        _tag.value_with_snapshot = _tag.value; // include snapshot syntax if exists
 
        _tag.has_reference = true;
        _tag.reference_id = parseInt(name.split('#')[1]);
        _tag.name = name.split('#')[0];
        _tag.value = _tag.name.split(':')[1];

      } else {

        _tag.value_with_snapshot = _tag.value; // we use this value later even if there's no snapshot ref

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

          console.log('Deletion of tag ' + _tag.id + ' rejected.', response, _tag)

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

        _tag.datum.graph.dim();

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
        _tag.datum.graph.range = false;

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

      console.log('parsing', _tag.name);

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
        _tag.labelEl().removeClass('purple');
        _tag.labelEl().css('background', 'grey');
        if (callback) callback(_tag); // allow next tag to run

      }

    }


    /* ======================================
     * Send request to server to change the tag's reference
     */
    _tag.fetchReference = function(callback) {

      console.log('querying latest snapshot of', _tag.value, 'for tag.reference_id')

      $.ajax({

        url: "/spectrums/latest_snapshot_id/" + _tag.value,

        success: function(response) {

          if (response.responseText != "false") {

            _tag.filterReferenceId(_tag.name + '#' + parseInt(response));

          }

          if (callback) callback(_tag);

        }

      });

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

          _tag.datum.graph.dim();

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
