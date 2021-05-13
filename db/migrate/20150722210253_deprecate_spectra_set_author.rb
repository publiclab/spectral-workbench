# frozen_string_literal: true

class DeprecateSpectraSetAuthor < ActiveRecord::Migration[5.2]
  def up
    SpectraSet.all.each do |set|
      if set.author != '' && set.user_id.zero? && user = User.find_by_login(set.author)
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
