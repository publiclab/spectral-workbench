class Procedure < ActiveRecord::Base
  attr_accessible :title, :author, :user_id, :description, :main_image_url, :is_active

  validates_presence_of :title, :author, :user_id
  validates :title, length: { maximum: 60 }
  has_many :comments, :dependent => :destroy

  validates :title, :format => { with: /\A[\w\ -\'\"]+\z/, message: "can contain only letters, numbers, and spaces." }

end
