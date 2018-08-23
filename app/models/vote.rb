class Vote < ApplicationRecord
  validate :not_self_vote
  validate :has_enough_karma

private
  def not_self_vote
    weet = Weeet.find(self.weet_id)
    if weet.user_id == self.user_id
      raise ArgumentError, "Self-voting is not allowed"
    end
  end

  def has_enough_karma
    user = User.find(self.user_id)
    if user.karma == 0
      raise RuntimeError, 'Insufficient karma'
    end
  end
end
