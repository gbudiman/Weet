class CreateBlockchains < ActiveRecord::Migration[5.2]
  def change
    create_table :blockchains, id: false do |t|
      t.bigserial :id,              primary_key: true
      t.belongs_to :weeet
      t.integer :command,           null: false
      t.boolean :executed,          null: false, default: false
      t.timestamps
    end

    add_index :blockchains, [:weeet_id, :command]
  end
end
