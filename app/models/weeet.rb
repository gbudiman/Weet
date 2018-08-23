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

  def evaluate!
    return if self.is_evaluated 

    votes = Vote.where(weet_id: self.id)
    ups = votes.where(voteup: true)
    downs = votes.where(voteup: false)

    self.is_evaluated = true

    if ups.count > downs.count
      self.is_published = true
      self.save!

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


  end
end
