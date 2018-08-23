class Weeet < ApplicationRecord
  belongs_to :user
  validates :user, presence: true
  validates :content, length: { maximum: 280 }, strict: true

  def publish!
    self.is_published = true
    self.save!
  end

  def vote up: true, by:
    Vote.create weet_id: self.id,
                user_id: by,
                voteup: up
  end
end
