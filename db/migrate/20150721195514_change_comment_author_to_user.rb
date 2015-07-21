class ChangeCommentAuthorToUser < ActiveRecord::Migration
  def up
    change_column_null :comments, :spectra_set_id, true

    Comment.all.each do |comment|
      unless comment.has_user?
        if user = User.find_by_login(comment.author)
          comment.user_id = user.id
          comment.save
        end
      end
    end
    add_column :comments, :wavelength, :integer
    add_column :comments, :intensity,  :integer
  end

  def down
    change_column_null :comments, :spectra_set_id, false, 0
    remove_column :comments, :wavelength
    remove_column :comments, :intensity
  end
end
