# frozen_string_literal: true

require 'rubygems'
require 'rmagick'

class Spectrum < ActiveRecord::Base
  include ActionView::Helpers::DateHelper

  # place this before the has_one :snapshot so it runs before dependent => :destroy
  before_destroy :is_deletable?

  has_many :comments, dependent: :destroy
  has_many :likes, dependent: :destroy
  has_many :tags, dependent: :destroy
  has_many :snapshots, dependent: :destroy
  has_one :processed_spectrum, dependent: :destroy
  has_and_belongs_to_many :spectra_sets

  # Paperclip
  has_attached_file :photo,
                    path: ':rails_root/public/system/:attachment/:id/:style/:filename',
                    url: '/system/:attachment/:id/:style/:filename',
                    default_url: "/images/spectral-workbench-256.png",
                    styles: {
                      thumb: '300x100!',
                      large: '800x200!'
                    }

  validates_presence_of :title, on: :create, message: "can't be blank"
  validates_presence_of :author, on: :create, message: "can't be blank"
  validates :title, length: { maximum: 60 }
  validates :title, format: { with: /\A[\w\ -\'\"]+\z/, message: 'can contain only letters, numbers, and spaces.' }
  validates :author, format: { with: /\A\w[\w\.\-_@]+\z/, message: 'can contain only letters, numbers, hyphens, underscores and periods.' }
  validates_attachment_content_type :photo, content_type: ['image/jpg', 'image/jpeg', 'image/png', 'image/gif']
  validate :validate_json

  after_save :generate_processed_spectrum
  before_save :update_calibrated
  # before_create :rename_with_id

  # validation: not allowed to destroy a spectrum someone else depends on
  def is_deletable?
    destroyable = true
    tags.each do |tag|
      destroyable &&= (tag.snapshot.nil? || tag.snapshot.has_no_dependent_spectra?)
    end
    errors[:base] << 'spectrum is depended upon by other data'
    destroyable
  end

  def sets
    spectra_sets
  end

  def latest_snapshot
    Snapshot.where(spectrum_id: id)
            .order('created_at DESC')
            .limit(1)
            .last
  end

  #  def rename_with_id
  #    extension = File.extname(self.image_file_name).downcase
  #    self.image.instance_write(:file_name, "#{Time.now.to_i}#{extension}")
  #  end

  def validate_json
    if data.nil?
      true
    else
      begin
        !!(json = ActiveSupport::JSON.decode(data)) &&
          json['lines'].class == Array &&
          json['lines'].first.class == Hash &&
          !json['lines'].first['wavelength'].nil?
      rescue StandardError
        errors[:base] << 'data not in valid JSON format'
        false
      end
    end
  end

  # to output the text "data" field as json, not string data
  def json
    json = as_json(except: [:data])
    json['data'] = ActiveSupport::JSON.decode(clean_json)
    json
  end

  def update_calibrated
    self.calibrated = is_calibrated?
    true
  end

  def user
    User.find user_id
  end

  # this is used to determine if we should force user into 2.0 interface:
  def has_operations
    !Tag.where(spectrum_id: id)
        .collect(&:name)
        .reject { |s| s.match(':').nil? }.empty?
  end

  def self.weekly_tallies
    # past 52 weeks of data
    weeks = {}
    (0..52).each do |week|
      weeks[52 - week] = Spectrum.select(:created_at).where(created_at: Time.now - week.weeks..Time.now - (week - 1).weeks).count
    end
    weeks
  end

  # finds the brightest row of the image and uses that as its sample row
  def find_brightest_row
    image = Magick::ImageList.new('public' + (photo.url.split('?')[0]).gsub('%20', ' '))
    brightest_row = 0
    brightest = 0
    # sum brightness for each row
    (0..(image.rows - 1)).each do |row|
      brightness = 0
      px = image.export_pixels(0, row, image.columns, 1, 'RGB')
      (0..(image.columns / 3 - 1)).each do |col|
        r = px[col * 3]
        g = px[col * 3 + 1]
        b = px[col * 3 + 2]
        brightness += (r - g).abs + (g - b).abs + (b - r).abs # difference between colors
        brightness += (r + g + b) # overall brightness
      end
      if brightness > brightest
        brightest_row = row
        brightest = brightness
      end
    end
    brightest_row
  end

  # extracts serialized data from the top row of the stored image
  def extract_data
    pixels = []

    image = Magick::ImageList.new('public' + (photo.url.split('?')[0]).gsub('%20', ' '))
    # saved sample_row may be greater than image height, so temporarily compensate,
    # but preserve sample_row in case we rotate back or something
    self.sample_row = image.rows - 2 if sample_row > image.rows
    row = image.export_pixels(0, sample_row, image.columns, 1, 'RGB')

    (0..(row.length / 3 - 1)).each do |p|
      r = row[p * 3] / 255
      g = row[p * 3 + 1] / 255
      b = row[p * 3 + 2] / 255
      pixels << '{"pixel":' + p.to_s + ',"wavelength":null,"average":' + ((r + g + b) / 3).to_s + ',"r":' + r.to_s + ',"g":' + g.to_s + ',"b":' + b.to_s + '}'
    end

    t = title.delete("'").delete('"')
    # save it internally
    s = '{"name":"' + t + '","lines": ['
    s += pixels.join(',')
    s += ']}'
    self.data = s
    s
  end

  # {wavelength:null,average:0,r:0,g:0,b:0}
  def scale_data(start_w, end_w)
    d = ActiveSupport::JSON.decode(clean_json)
    i = 0
    d['lines'].each do |line|
      line['wavelength'] = (start_w.to_f + i * ((end_w.to_f - start_w.to_f) * 1.00 / d['lines'].length)).round(2)
      i += 1
    end
    self.data = ActiveSupport::JSON.encode(d)
    self
  end

  def calibration
    Spectrum.find powertag('calibration').to_i
  end

  def is_calibrated?
    if data.nil?
      false
    else
      if tags.collect(&:key).include?('calibrate') || tags.collect(&:key).include?('linearCalibration')
        true
      else
        begin
          d = ActiveSupport::JSON.decode(clean_json)
          !d.nil? && !d['lines'].nil? && !d['lines'].first['wavelength'].nil?
        rescue StandardError
          false
        end
      end
    end
  end

  def calibrate(axis_one, wavelength1, axis_two, wavelength2)
    extract_data
    d = ActiveSupport::JSON.decode(clean_json)
    i = 0
    stepsize = ((wavelength2.to_f - wavelength1.to_f) * 1.00 / (axis_two.to_f - axis_one.to_f))
    startwavelength = wavelength1.to_f - (stepsize * axis_one.to_f)
    d['lines'].each do |line|
      line['wavelength'] = (startwavelength + i * stepsize).round(2)
      i += 1
    end
    # this may cause trouble:
    reverse if (wavelength1 < wavelength2 && axis_one > axis_two) || (wavelength1 > wavelength2 && axis_one < axis_two)
    self.data = ActiveSupport::JSON.encode(d)
    self
  end

  # turns ' into " and puts "" around key names, to produce valid json
  def clean_json
    data.tr("'", '"').gsub(/([a-z]+):/, '"\\1":')
  end

  def forks
    Tag.where('name LIKE (?)', 'forked:' + id.to_s + '%').collect(&:spectrum)
  end

  def fork(user)
    new = dup
    new.author = user.login
    new.user_id = user.id
    new.photo = photo
    new.save!
    new.tag("forked:#{id}", user.id)
    # record "now" timestamp
    now = Time.now
    # now copy over all tags, in order:
    tags.each do |tag|
      next if tag.key == 'forked'

      newtag = new.tag(tag.name, user.id)
      now += 1 # increment now by one second per tag
      # preserve created_at, for tag ordering; we should be able to tell based on spectrum created_at
      newtag.created_at = now # forward-date each by 1 second
      if tag.needs_snapshot? && tag.snapshot && !tag.snapshot.data.nil?
        newtag.create_snapshot(tag.snapshot.data)
        newtag.snapshot.created_at = newtag.created_at
      end
      newtag.save
    end
    Spectrum.find new.id # refetch it to get all the tags, for some reason needed by tests
  end

  # clones calibration from another spectrum (preferably taken from the same device)
  # deprecating in 2.0 in favor of client-side powertag-based cloneCalibration
  def clone_calibration(clone_id)
    clone_source = Spectrum.find clone_id
    d = ActiveSupport::JSON.decode(clean_json)
    cd = clone_source.latest_json_data
    # assume linear:
    lines = cd['lines']
    lines = lines.reverse if clone_source.is_flipped
    length = lines.length
    start_wave_length = lines[0]['wavelength'].to_f
    end_wave_length = lines[length - 1]['wavelength'].to_f
    stepsize = (end_wave_length - start_wave_length) / d['lines'].length
    i = 0
    d['lines'].each do |line|
      line['wavelength'] = if cd['lines'][i] && d['lines'].length == length # if they're the same size, exactly
                             lines[i]['wavelength']
                           else
                             (start_wave_length + (i * stepsize)).round(2)
                           end
      i += 1
    end
    tag("calibrate:#{clone_id}", user_id)
    # figure out how to know when to reverse based on a cloned calibration... maybe we need to store reversal...
    # self.reverse if (wavelength1 < wavelength2 && x1 > x2) || (wavelength1 > wavelength2 && x1 < x2)
    self.data = ActiveSupport::JSON.encode(d)
    self.reversed = clone_source.reversed
    self
  end

  # rotate clockwise
  def rotate
    image = Magick::ImageList.new('public' + (photo.url.split('?')[0]).gsub('%20', ' '))
    image.rotate!(-90)
    image.write('public' + photo.url)
    photo.reprocess!
  end

  # horizontally flips image to match reversed spectrum, toggles 'reversed' flag
  def reverse
    image = Magick::ImageList.new('public' + (photo.url.split('?')[0]).gsub('%20', ' '))
    image.flop!
    image.write('public' + photo.url)
    self.reversed = !reversed
    photo.reprocess!
  end

  def image_from_dataurl(data)
    # remove image/png:base,
    data = data.split(',').pop

    # decode base64:
    data = Base64.decode64(data)

    self.photo = Paperclip.string_to_file('capture.png', 'image/png', data)
  end

  def range
    powertag('range').split('-').map(&:to_i)
  end

  def add_snapshot(tag, data)
    snapshots << Snapshot.create(
      user_id: tag.spectrum.user_id,
      tag_id: tag.id,
      data: data
    )

    snapshots.last
  end

  def tag(name, user_id)
    tag = Tag.new(
      name: name.strip,
      user_id: user_id,
      spectrum_id: id
    )
    tag.save
    tag
  end

  def normaltags
    tags.select { |tag| tag.name.match(':').nil? }
  end

  def remove_powertags(tag_prefix)
    tags.each do |tag|
      tag.delete if tag.name.split(':').first == tag_prefix
    end
  end

  def forked
    has_powertag('forked')
  end

  def created_at_in_words
    time_ago_in_words(created_at)
  end

  def data_as_hash
    ActiveSupport::JSON.decode(clean_json)['lines']
  end

  def bin_data(binsize)
    bins = {}
    count = {}

    data_as_hash.each do |datum|
      bin = (datum['wavelength'].to_f / binsize).to_i
      bins[bin] = 0 if bins[bin].nil?
      bins[bin] += datum['average'].to_i
      count[bin] = 0 if count[bin].nil?
      count[bin] += 1
    end
    result = {}
    bins.each_with_index do |bin, i|
      bin[1] = bin[1] / count[i] if count[i].to_i.positive?
      result[bin[0].to_i * binsize] = bin[1]
    end
    result
  end

  # compare self to other spectrum, return a # score
  def compare(spectrum_id)
    # both must be calibrated (do we need a flag for this?)

    # find difference, subtract average, square it
    # find overall average
    sum = 0
    data = bin_data(10)
    other = Spectrum.find(spectrum_id).bin_data(10)
    difference = 0
    difference_sum = 0
    data.each do |bin|
      sum += bin[1]
      difference_sum += 1
      difference += (other[bin[1]] - data[bin[1]])**2 unless other[bin[1]].nil? || data[bin[1]].nil?
    end

    # can we generate a "score" of the match? how close it was?
    difference
  end

  def find_match_in_set(set_id)
    set = sort_set(set_id)
    # find lowest score, return it
    set = set.sort_by { |a| a[1] }
    Spectrum.find set[0][0].to_i
  end

  def sort_set(set_id)
    set = SpectraSet.find set_id
    scored = {}

    set.spectra.collect(&:id).each do |id|
      scored[id] = compare(id) if id.to_i != self.id
    end
    scored
  end

  # used in capture interface for displaying latest calibration
  def wavelength_range
    d = latest_json_data
    range = [d['lines'][0]['wavelength'], d['lines'][d['lines'].length - 1]['wavelength']]
    # always returns range in ascending order
    range.reverse! if range.first && (range.first > range.last)
    range
  end

  # new spectrum from string of "wavelength:value,wavelength:value"
  def self.new_from_string(data)
    json = "{ 'lines': ["
    cols = data.split(',')
    cols.each_with_index do |datum, i|
      datum = datum.split(':')
      json += "{'wavelength':" + datum[0] + ",'average':" + datum[1] + '}'
      json += ',' if i < cols.length - 1
    end
    json += ']}'
    new(data: json)
  end

  def has_tag(name)
    !Tag.where(name: name).where(spectrum_id: id).empty?
  end

  def remove_tag(name)
    Tag.where(name: name).where(spectrum_id: id)[0].destroy
  end

  def toggle_tag(name, user_id)
    if has_tag(name)
      remove_tag(name)
    else
      tag(name, user_id)
    end
  end

  # no colon required
  def has_powertag(name)
    !powertags(name).empty?
  end

  # no colon required
  def powertags(name)
    Tag.where('name LIKE (?)', name + ':%').where(spectrum_id: id)
  end

  # if we can safely assume there's only one - no colon required
  def powertag(name)
    powertags(name).first.name.split(':').last
  end

  # if it has horizontally flipped input image: red is at left
  # newly calculated based on linearCalibration tag having x1 > x2
  def is_flipped
    has_powertag('linearCalibration') && powertag('linearCalibration').split('-')[0].to_f > powertag('linearCalibration').split('-')[1].to_f
  end

  def liked_by(user_id)
    Like.where(spectrum_id: id).find_by_user_id(user_id)
  end

  # notify each commenter about a new comment
  def notify_commenters(new_comment, current_user)
    emails = []
    comments.each do |comment|
      emails << comment.email if comment != new_comment && (!current_user || (comment.author != current_user.login)) && comment.author != author
    end
    # send for every commenter, whether they are a registered user or not...
    emails.uniq.each do |email|
      registered_commenter = User.find_by_email(email)
      if registered_commenter
        UserMailer.commenter_notification(self, new_comment, registered_commenter)
      else
        UserMailer.unregistered_commenter_notification(self, new_comment, email)
      end
    end
  end

  # Process the spectrum for the "Closest Match Module"
  # -- run after_save
  def generate_processed_spectrum
    if calibrated
      if processed_spectrum
        processed_spectrum.update_attributes(generate_hashed_values)
      else
        self.processed_spectrum = ProcessedSpectrum.new(generate_hashed_values)
      end
      processed_spectrum.save
    end
  end

  def latest_json_data
    if snapshots.count.positive?
      ActiveSupport::JSON.decode(snapshots.last.data)
    else
      ActiveSupport::JSON.decode(clean_json)
    end
  end

  # Generate the values hash for the processed spectrum
  def generate_hashed_values
    lines = latest_json_data['lines']

    values = {}
    counts = {}
    types = %w(a r g b)

    labels = {}
    labels['a'] = 'average'
    labels['r'] = 'r'
    labels['g'] = 'g'
    labels['b'] = 'b'

    bins = (10...1500).step(10)

    values['spectrum_id'] = id

    bins.each do |bin|
      types.each do |type|
        values["#{type}#{bin}"] = 0
      end
      counts[bin] = 0
    end

    lines.each do |line|
      wlength = line['wavelength']

      next unless !wlength.nil? && wlength.class != String

      # Some spectrums have "NaN" as wavelength and a, r, g, b values
      # Also, this protects from the condition where the wlength is nil
      bins_to_consider = get_bins(line['wavelength'].round)

      bins_to_consider.each do |bin|
        types.each do |type|
          values["#{type}#{bin}"] += line[labels[type]].round
        end
        counts[bin] += 1
      end
    end

    # Time to average the values and return

    bins.each do |bin|
      next unless (counts[bin]).positive?

      types.each do |type|
        values["#{type}#{bin}"] /= counts[bin]
      end
    end

    values
  end

  # Given a wavelength, decide which bin(s) it should fall into
  def get_bins(wavelength)
    base = (wavelength / 10) * 10
    diff = wavelength - base

    if base < 10 || base > 1490
      return [] # Skipping it off
    end

    if diff > 6 # This is in the next bin
      if base + 10 > 1490
        [] # Falls into 1500. So, Skip
      else
        [base + 10]
      end
    elsif diff < 4 # This is in this bin
      [base]
    else
      # This is in both the present and next bin
      if base + 10 > 1490
        [base] # 1500 again. Skip
      else
        [base, base + 10]
      end
    end
  end

  def find_similar(range)
    proc_nil = false

    if processed_spectrum.nil?
      spectra = []
      proc_nil = true
    else
      spectra = processed_spectrum.closest_match(range, 20)
    end

    # Some spectrums have many matches with range of 100. Some have very few.
    # So why stop just at 100? Something dynamic would be good, though takes some extra time
    # Implementing a sort of binary search for best spectra matching.

    # Time to make our matches more meaningful.

    range_visits = [range] # To check the ranges visited

    # This loop will take 10 iterations at maximum.
    while !proc_nil && ((spectra.size < 2) || (spectra.size > 6))
      range = if spectra.size > 6 # Need to reduce the range
                range - 10
              else
                range + 10
              end

      break if range_visits.member?(range) || (range < 10) || (range > 150)

      range_visits.push(range)
      spectra = processed_spectrum.closest_match(range, 20)
    end

    spectra
  end

  private

  def spectrum_params
    params.require(:spectrum).permit(:title, :author, :user_id, :notes, :photo, :video_row, :data)
  end
end
