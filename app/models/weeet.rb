class Weeet < ApplicationRecord
  belongs_to :user
  validates :user, presence: true
  validates :content, length: { maximum: 280 }, strict: true

  def publish!
    self.is_published = true
    self.save!
  end
end
