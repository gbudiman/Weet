class RenameVoteWeeetId < ActiveRecord::Migration[5.2]
  def change
    rename_column :votes, :weet_id, :weeet_id
  end
end
