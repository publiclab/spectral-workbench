# frozen_string_literal: true

class SpectraSet < ActiveRecord::Base
  validates_presence_of :title, :user_id
  validates :title, length: { maximum: 60 }
  has_many :comments, dependent: :destroy
  has_and_belongs_to_many :spectrums
  belongs_to :user

  validates :title, format: { with: /\A[\w\ -\'\"]+\z/, message: 'can contain only letters, numbers, and spaces.' }

  def calibrated_spectrums
    spectrums.where(calibrated: true).uniq
  end

  def all_calibrated
    !spectrums.collect(&:calibrated).include?(false)
  end

  def some_calibrated
    spectrums.collect(&:calibrated).include?(true)
  end

  def contains(spectrum)
    spectrums.include?(spectrum)
  end

  def as_json_with_snapshots
    json = as_json.merge(spectra: [])
    json[:spectra] = snapshots(false)
    json
  end

  def as_json_with_calibrated_snapshots
    json = as_json.merge(spectra: [])
    json[:spectra] = snapshots(calibrated_spectrums)
    json
  end

  # latest snapshots of all spectra, if exist, in JSON
  # default to spectra themselves if not
  def snapshots(spectrums)
    spectrums ||= self.spectrums
    json = []
    spectrums.each do |spectrum|
      json << spectrum.as_json(except: [:data])
      if spectrum.snapshots.nil? || spectrum.snapshots.empty?
        json.last[:data] = JSON.parse(spectrum.data)
        json.last[:snapshot_id] = false
      else
        json.last[:data] = JSON.parse(spectrum.snapshots.last.data)
        json.last[:snapshot_id] = spectrum.snapshots.last.id
      end
    end
    # OPTIMIZE: and test this
    json
  end

  def match(spectrum)
    set = sort_set(spectrum)
    # find lowest score, return it
    set = set.sort_by { |a| a[1] }
    Spectrum.find set[0][0].to_i
  end

  def sort_set(spectrum)
    scored = {}
    spectrums.collect(&:id).each do |id|
      scored[id] = spectrum.compare(id) if id != self.id
    end
    scored
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
        UserMailer.set_commenter_notification(self, new_comment, registered_commenter)
      else
        UserMailer.unregistered_set_commenter_notification(self, new_comment, email)
      end
    end
  end

  private

  def spectra_set_params
    params.require(:spectra_set).permit(:title, :notes, :spectrums_string, :author, :user_id)
  end
end
