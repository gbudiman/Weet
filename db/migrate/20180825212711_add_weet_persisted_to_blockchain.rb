class AddWeetPersistedToBlockchain < ActiveRecord::Migration[5.2]
  def change
    add_column :weeets, :persisted_on_blockchain, :boolean, null: false, default: false
  end
end
