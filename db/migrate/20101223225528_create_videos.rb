class CreateVideos < ActiveRecord::Migration
  def self.up
    create_table :videos do |t|
      t.string :title
      t.string :author
      t.string :set
      t.string :scan_type # hyperspectral or timelapse
      t.text :data
      t.text :notes
      t.integer :version
      t.integer :start_frame
      t.integer :end_frame
      t.integer :parent_id
      t.string :video_file_name
      t.string :video_content_type
      t.string :video_file_size
      t.datetime :video_updated_at
      t.string :video_position

      t.timestamps
    end
  end

  def self.down
    drop_table :videos
  end
end
