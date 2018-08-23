class CreateVotes < ActiveRecord::Migration[5.2]
  def change
    create_table :votes, id: false do |t|
      t.bigserial :id,              primary_key: true
      t.belongs_to :user
      t.belongs_to :weet
      t.boolean :voteup,            null: false
      t.timestamps
    end
  end
end
