class Weeet < ApplicationRecord
  belongs_to :user
  validates :user, presence: true
  validates :content, length: { maximum: 280 }, strict: true

  before_create :add_evaluate_at

  # def publish!
  #   self.is_published = true
  #   self.save!
  # end

  def vote up: true, by:
    if Time.now > self.evaluate_at
      raise RuntimeError, 'Voting period has ended'
    end

    Vote.create weet_id: self.id,
                user_id: by,
                voteup: up
  end

  def evaluate!
    return if self.is_evaluated 
    return if Time.now < self.evaluate_at

    votes = Vote.where(weet_id: self.id)
    ups = votes.where(voteup: true)
    downs = votes.where(voteup: false)

    ActiveRecord::Base.transaction do
      self.is_evaluated = true

      if ups.count > downs.count
        self.is_published = true
        

        ups.each do |upvote|
          User.find(upvote.user_id).win!
        end

        downs.each do |downvote|
          User.find(downvote.user_id).lose!
        end
      else
        ups.each do |upvote|
          User.find(upvote.user_id).lose!
        end

        downs.each do |downvote|
          User.find(downvote.user_id).win!
        end
      end

      self.save!
    end
  end

private
  def add_evaluate_at
    self.evaluate_at = Time.now + 1.hour
  end
end
