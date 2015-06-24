class AddAnonymousUser < ActiveRecord::Migration
  def up

    # create an "anonymous" user:
    User.new({ id:0, login:'anonymous', email: 'web@publiclab.org' }).save

    # not anonymous, but has user_id = 0 because they predate user system
    Spectrum.where("author != 'anonymous'").where(user_id: 0).each do |spectrum|
      user = User.where(login:spectrum.author).first
      unless user.nil?
        spectrum.user_id = user.id 
        spectrum.save
      end
    end

    add_column :spectra_sets, :user_id, :integer, :default => 0
    
    SpectraSet.where("author != 'anonymous'").each do |set|
      user = User.where(login:set.author).first
      unless user.nil?
        set.user_id = user.id 
        set.save
      end
    end

    add_column :comments, :user_id, :integer, :default => 0

    Comment.where("author != 'anonymous'").each do |comment|
      user = User.where(login:comment.author).first
      unless user.nil?
        comment.user_id = user.id 
        comment.save
      end
    end

  end

  def down
    remove_column :spectra_sets, :user_id
    remove_column :comments,     :user_id
  end

end
