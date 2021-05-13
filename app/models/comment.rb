# frozen_string_literal: true

class Comment < ActiveRecord::Base
  belongs_to :user
  validates_presence_of :user_id, :body

  def spectra_set
    set
  end

  def set
    SpectraSet.find spectra_set_id
  end

  def spectrum
    Spectrum.where(id: spectrum_id).first
  end

  def has_set?
    spectra_set_id != 0 && !spectra_set_id.nil?
  end

  def has_spectrum?
    spectrum_id != 0 && !spectrum_id.nil? && Spectrum.where(id: spectrum_id).count != 0
  end

  def has_user?
    user_id != 0 && !user_id.nil?
  end

  def can_delete(user)
    (has_set? && set.author == user.login) || (has_spectrum? && spectrum.author == user.login) || author == user.login || user.role == 'admin'
  end

  private

  def comment_params
    params.require(:comment).permit(:spectrum_id, :body, :author, :email, :spectra_set_id, :user_id)
  end
end
