class Vote < ApplicationRecord
  validate :not_self_vote
  validate :has_enough_karma

  belongs_to :user
  validates :user, presence: true
  belongs_to :weeet
  validates :weeet, presence: true

private
  def not_self_vote
    weet = Weeet.find(self.weeet_id)
    if weet.user_id == self.user_id
      raise ArgumentError, "Self-voting is not allowed"
    end
  end

  def has_enough_karma
    user = User.find(self.user_id)
    if user.karma == 0
      raise RuntimeError, 'Insufficient karma'
    end

    pendings = User.joins(votes: :weeet)
                   .where(id: self.user_id)
                   .where('weeets.is_evaluated' => false)

    if pendings.count * 10 >= user.karma
      raise RuntimeError, 'Insufficient pending karma'
    end
  end
end
