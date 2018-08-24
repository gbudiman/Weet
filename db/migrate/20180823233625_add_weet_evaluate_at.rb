class AddWeetEvaluateAt < ActiveRecord::Migration[5.2]
  def change
    add_column :weeets, :evaluate_at, :datetime, null: false
  end
end
