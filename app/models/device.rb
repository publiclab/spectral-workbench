# frozen_string_literal: true

class Device < ActiveRecord::Base
  validates_presence_of :name, on: :create, message: "can't be blank"
  validates_presence_of :user_id, on: :create, message: "can't be blank"

  def calibration
    Spectrum.find calibration_id
  end
end
