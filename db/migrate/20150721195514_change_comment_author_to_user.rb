# frozen_string_literal: true

class ChangeCommentAuthorToUser < ActiveRecord::Migration[5.2]
  def up
    change_column_null :comments, :spectra_set_id, true

    Comment.all.each do |comment|
      next if comment.has_user?
      next unless user = User.find_by_login(comment.author)

      comment.user_id = user.id
      comment.save
    end
    add_column :comments, :intensity, :integer
  end

  def down
    change_column_null :comments, :spectra_set_id, false, 0
    remove_column :comments, :wavelength
    remove_column :comments, :intensity
  end
end
