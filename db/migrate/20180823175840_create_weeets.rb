class CreateWeeets < ActiveRecord::Migration[5.2]
  def change
    create_table :weeets, id: false do |t|
      t.bigserial :id,              primary_key: true
      t.belongs_to :user
      t.string :content,            null: false
      t.boolean :is_published,      null: false, default: false
      t.timestamps
    end
  end
end
