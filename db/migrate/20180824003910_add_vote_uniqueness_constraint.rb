class AddVoteUniquenessConstraint < ActiveRecord::Migration[5.2]
  def change
    add_index :votes, [:user_id, :weeet_id], unique: true
  end
end
