class CreateConfigs < ActiveRecord::Migration[5.2]
  def change
    create_table :configs, id: false do |t|
      t.bigserial :id,              primary_key: true
      t.string :key,                null: false
      t.string :property,           null: false
    end
  end
end
