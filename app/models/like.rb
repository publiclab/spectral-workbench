# frozen_string_literal: true

class Like < ActiveRecord::Base
  validates_presence_of :user_id, :spectrum_id
  belongs_to :user
  belongs_to :spectrum
  before_create :increment_likes
  after_destroy :decrement_likes

  private

  def increment_likes
    spectrum.like_count += 1
    spectrum.save
  end

  def decrement_likes
    spectrum.like_count -= 1
    spectrum.save
  end

  def like_params
    params.require(:like).permit(:spectrum_id, :user_id)
  end
end
