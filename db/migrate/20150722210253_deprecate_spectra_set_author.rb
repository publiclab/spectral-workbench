class DeprecateSpectraSetAuthor < ActiveRecord::Migration
  def up
    SpectraSet.all.each do |set|
      if set.author != '' && set.user_id == 0 && user = User.find_by_login(set.author)
        set.user_id = user.id
        set.save
      end
    end

    drop_table :spectrum_links
  end

  def down
    add_table :spectrum_links
  end
end
