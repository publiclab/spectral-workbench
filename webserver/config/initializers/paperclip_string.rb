# Indicate location of "identify" command: 
#Paperclip.options[:command_path] = "/usr/bin/identify"
#Paperclip.options[:command_path] = "/usr/local/bin"

# Thank you to http://bendangelo.me/?p=60
module Paperclip
 
  #converts a string into a file for paperclip to save
  # useage
  # self.avatar = Paperclip::string_to_file('bob.png', 'image/png', 'BASE64 here')
  def self.string_to_file(name, type, data)
    image = StringIO.new(data)
    image.class.class_eval { attr_accessor :original_filename, :content_type }

    image.original_filename = name
    image.content_type = type
    return image
  end
 
end

