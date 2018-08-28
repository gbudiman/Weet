class AddBlockchainExecStatus < ActiveRecord::Migration[5.2]
  def change
    add_column :blockchains, :is_successful, :boolean, null: false, default: false
  end
end
