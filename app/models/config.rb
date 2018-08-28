class Config < ApplicationRecord
  def self.seed
    c = Config.find_or_initialize_by(key: 'blockchain_lock')

    c.property = 'false'
    c.save!

    Blockchain.destroy_all
  end
end
