# frozen_string_literal: true

# Indicate location of "identify" command:
# Paperclip.options[:command_path] = "/usr/bin/identify"
# Paperclip.options[:command_path] = "/usr/local/bin"

Paperclip::Attachment.default_options[:storage] = :fog
Paperclip::Attachment.default_options[:fog_directory] = ENV["GOOGLE_STORAGE_BUCKET_NAME"] || ''
Paperclip::Attachment.default_options[:path] = ":rails_root/public/system/:attachment/:id/:style/:filename"
Paperclip::Attachment.default_options[:fog_credentials] = {
    provider: ENV["FOG_PROVIDER"] || "Local",
    local_root: "#{Rails.root}/public",
    google_project: 'public-lab' ,
    google_json_key_location: ENV["GOOGLE_JSON_KEY_FILE"] || ''
}
Paperclip::Attachment.default_options[:fog_host] = ""

# Thank you to http://bendangelo.me/?p=60
module Paperclip
  # converts a string into a file for paperclip to save
  # useage
  # self.avatar = Paperclip::string_to_file('bob.png', 'image/png', 'BASE64 here')
  def self.string_to_file(name, type, data)
    image = StringIO.new(data)
    image.class.class_eval { attr_accessor :original_filename, :content_type }

    image.original_filename = name
    image.content_type = type
    image
  end
end
