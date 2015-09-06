class ProcedureStep < ActiveRecord::Base
  attr_accessible :procedure_id, :step, :heading, :description, :capture_required, :is_optional, :image_url

  validates_presence_of :procedure_id, :step, :heading
  validates :heading, length: { maximum: 60 }
  has_many :comments, :dependent => :destroy

  validates :heading, :format => { with: /\A[\w\ -\'\"]+\z/, message: "can contain only letters, numbers, and spaces." }
end
