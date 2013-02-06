class Like < ActiveRecord::Base

  validates_presence_of :user_id, :spectrum_id
  belongs_to :user
  belongs_to :spectrum
  before_save :increment_likes
  after_destroy :decrement_likes

  private

  def increment_likes
    self.spectrum.like_count += 1
    self.spectrum.save 
  end

  def decrement_likes
    self.spectrum.like_count -= 1
    self.spectrum.save
  end

end
