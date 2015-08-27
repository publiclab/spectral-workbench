class Like < ActiveRecord::Base

  attr_accessible :spectrum_id, :user_id

  validates_presence_of :user_id, :spectrum_id
  belongs_to :user
  belongs_to :spectrum
  before_create :increment_likes
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
