class AddIsEvaluatedWeet < ActiveRecord::Migration[5.2]
  def change
    add_column :weeets, :is_evaluated, :boolean, null: false, default: false
  end
end
