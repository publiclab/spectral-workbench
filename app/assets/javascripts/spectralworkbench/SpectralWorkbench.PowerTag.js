SpectralWorkbench.PowerTag = SpectralWorkbench.Tag.extend({

  has_reference: false,
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


  /* ======================================
   * <json> is a JSON obj of the tag as received from the server; 
   * if this doesn't exist, it's a new tag
   * <callback> will be called as callback(tag, ajaxResponse)
   */
  init: function(datum, name, json, callback) {

    // OH MY GOD, FORGETTING VAR HERE COST ME 3 HOURS:
    var _tag = this;

    _tag.render = function() {}; // override this early, so it's not called in _tag._super()

    // basic Tag initialization
    _tag._super(datum, name, json, false);


    _tag.key = _tag.name.split(':')[0];
    _tag.value = _tag.name.split(':')[1];
    _tag.value_snapshot = _tag.value; // include snapshot syntax if exists

    // scan for tags that require snapshots, but this isn't the right place to save it -- we need to parse it!
    if (_tag.snapshot_tagnames.indexOf(_tag.key) != -1) _tag.needs_snapshot = true;

    // has it generated a snapshot?
    // note that this won't have happened yet for new tags, until after parsing;
    // however, we check response from tag.upload() for a snapshot id and set it there too
    if (_tag.json.hasOwnProperty('snapshot_id')) { // from the server-side database
      _tag.snapshot_id = _tag.json.snapshot_id;
    }

    _tag.deletable = (!_tag.hasOwnProperty('snapshot_id') || _tag.has_dependent_spectra != true);

    if (_tag.name.match("#")) {

      _tag.has_reference = true;
      _tag.snapshot_id = _tag.value.split('#')[1];
      _tag.value = _tag.value.split('#')[0];

    }

    // Delete it from the server, then from the DOM;
    _tag.destroy = function(callback) {

      $('tr#tag_' + _tag.id + ' .label').css('background', '#bbb')
                                        .append(" <i class='fa fa-spinner fa-spin fa-white'></i>");

      $('tr#tag_' + _tag.id).css('color', '#bbb');

      $.ajax({
        url: "/tags/" + _tag.id,
        type: "DELETE",

        success: function(response) {

          _tag.cleanUp(callback);
 
        },

        error: function(response) {

          console.log('Deletion of tag ' + _tag.id + ' rejected.', response)

          $('tr#tag_' + _tag.id + ' .label').css('background', 'red')

          $('tr#tag_' + _tag.id + ' .label i.fa').removeClass('fa-spinner')
                                                 .addClass('fa-warning')
                                                 .css('color', '#600');

          $('tr#tag_' + _tag.id + ' .label').prop('rel', 'tooltip');
                                                 
// confirm fa-warning in a test

          $('tr#tag_' + _tag.id).css('color', '#600');

          _tag.has_dependent_spectra = response.has_dependent_spectra;
          _tag.is_latest = response.is_latest;

          if (response.has_dependent_spectra) {

            _tag.deletable = false;
            $('tr#tag_' + _tag.id + ' .label').prop('title', 'Operation could not be deleted because other operations rely on it. Try cloning this spectrum to make changes without disrupting dependent data.');

          } else if (!response.is_latest) {

            _tag.deletable = false;
            $('tr#tag_' + _tag.id + ' .label').prop('title', 'Operation could not be deleted because it is not the most recent operation to this spectrum. Deletions must occur most-recent-first.');

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

        _tag.showLastOperationDeleteButtonOnly();

        // remove it from datum.tags:
        _tag.datum.tags.splice(_tag.datum.tags.indexOf(_tag), 1);

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

      // display in Operations table;

      var operationTable = $('table.operations');

      _tag.operationEl = $("<tr class='operation-tag' id='tag_" + _tag.id + "'></tr>");

      if (_tag.snapshot_id) {

        _tag.operationEl.append("<td class='snapshot'><a href='https://publiclab.org/wiki/spectral-workbench-snapshots'><i rel='tooltip' title='This operation generated a data snapshot with id " + _tag.snapshot_id + ". Click to learn more.' class='fa fa-thumb-tack'></i></a></td>");

      } else {

        _tag.operationEl.append("<td class='snapshot'></td>");

      }

      _tag.operationEl.append("<td class='title'><span class='label purple'>" + _tag.name + "</span></td>");
      _tag.operationEl.append("<td class='date'><small>" + moment(_tag.json.created_at).format("MM-DD-YY HH:mm a") + "</small></td>");
      _tag.operationEl.append("<td class='description'><small>" + _tag.description() + " <a href='//publiclab.org/wiki/spectral-workbench-tags#" + _tag.key + "'>Read more</a></small></td>");
      _tag.operationEl.append("<td class='operations-tools'></td>");
      _tag.operationEl.find("td.operations-tools").append("<a class='operation-tag-delete'><i class='fa fa-trash btn btn-link'></i></a>");

      if (!_tag.deletable) _tag.operationEl.find("td.operations-tools").append("<i rel='tooltip' title='Other data depends on this snapshot. Clone the spectrum to work without affecting downstream use.' class='operation-tag-delete-disabled fa fa-lock btn btn-link disabled' style='color:#00a;'></i>");
      else _tag.operationEl.find("td.operations-tools").append("<i rel='tooltip' title='Subsequent operations depend on this snapshot.' class='operation-tag-delete-disabled fa fa-lock btn btn-link disabled'></i>");

      operationTable.append(_tag.operationEl);

      if (_tag.created_at) {

        // only final operation should have deletion button
        _tag.showLastOperationDeleteButtonOnly();
 
      }

      // initialize tooltips after hiding/showing is complete
      $("[rel=tooltip]").tooltip('destroy')
                        .tooltip();

      _tag.el.attr('rel', 'tooltip')
             .addClass('label label-info')
             .append("<a href='/tags/" + _tag.name + "'>" + _tag.name+"</a> ")


      // we use CSS classnames to identify tag types by color
      _tag.el.addClass('purple');
      _tag.el.attr('title', 'This is a powertag.');
      _tag.deleteEl = $('#tag_' + _tag.id + ' .operation-tag-delete');
      // these will only be clickable if the button is shown:
      _tag.deleteEl.attr('data-id', _tag.id)
                   .click(function() { 
                      if (confirm('Are you sure? This tag contains functional data used in the display and analysis of the spectrum.')) {
                        _tag.destroy();
                      }
                   });

      // deletion listener
      _tag.deleteEl.bind('ajax:success', function(){

        _tag.cleanUp();

      });

    }


    // only final operation should have deletion button
    _tag.showLastOperationDeleteButtonOnly = function() {

      var operationTable = $('table.operations');
      operationTable.find('tr.operation-tag .operations-tools .operation-tag-delete-disabled').show();
      operationTable.find('tr.operation-tag .operations-tools .operation-tag-delete').hide();

      if (_tag.deletable) {
        operationTable.find('tr.operation-tag:last .operations-tools .operation-tag-delete-disabled').hide();
        operationTable.find('tr.operation-tag:last .operations-tools .operation-tag-delete').show();
      }

    }


    _tag.parse = function() {

      if (_tag.key == "subtract") {

        SpectralWorkbench.API.Core.subtract(_tag.datum, _tag.value_snapshot);

      } else if (_tag.key == "flip:horizontal") {

        SpectralWorkbench.API.Core.flipHorizontal(_tag.datum);

      } else if (_tag.key == "calibrate") {

        if (_tag.has_reference) SpectralWorkbench.API.Core.copyCalibration(_tag.datum, _tag.value_snapshot);

      } else if (_tag.key == "transform") {

        SpectralWorkbench.API.Core.transform(_tag.datum, _tag.value_snapshot);

      } else if (_tag.key == "smooth") {

        SpectralWorkbench.API.Core.smooth(_tag.datum, _tag.value);

      } else if (_tag.key == "blend") {

        var blend_id = _tag.value_snapshot.split('$')[0],
            expression = _tag.value_snapshot.split('$')[1];

        SpectralWorkbench.API.Core.blend(_tag.datum, blend_id, expression);

      } else if (_tag.key == "range") {

        SpectralWorkbench.API.Core.range(_tag.datum, +_tag.value.split('-')[0], +_tag.value.split('-')[1]);

      }

      // save the parsed tag data
      if (_tag.needs_snapshot) _tag.data = JSON.stringify(_tag.datum.json.data);

    }


    // save supermethod so we can override but also run it: 
    // (please help me not do this as it seems silly)
    _tag.superUploadSuccess = _tag.uploadSuccess;

    _tag.uploadSuccess = function(response, callback) {

      _tag.superUploadSuccess(response, callback);

      _tag.deletable = (!_tag.hasOwnProperty('snapshot_id') || _tag.has_dependent_spectra != true);

    }


    _tag.parse();

    if (callback) _tag.upload(callback);

    return _tag;

  }

});
