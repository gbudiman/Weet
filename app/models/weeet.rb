class Weeet < ApplicationRecord
  belongs_to :user
  validates :user, presence: true
  validates :content, length: { maximum: 280 }, strict: true
  has_many :votes

  before_create :add_evaluate_at

  # def publish!
  #   self.is_published = true
  #   self.save!
  # end

  def self.seed 
    ActiveRecord::Base.transaction do
      users = User.seed
      user_count = users.count
      24.times do |i|
        user = users[i % user_count]
        content = "This post is created by #{user.name}"
        user.weet! content: content
      end
    end
  end

  def self.fetch limit:, from:
    ap from
    w = Weeet.joins(:user)
             .limit(limit)
             .order('weeets.created_at DESC')
             .select('weeets.id AS id',
                     'weeets.content AS weet_content',
                     'weeets.created_at AS weet_created_at',
                     'users.id AS weeter_id',
                     'users.name AS weeter_name',
                     'users.email AS weeter_email',
                     'weeets.evaluate_at AS weet_evaluate_at',
                     'weeets.is_evaluated AS weet_is_evaluated',
                     'weeets.is_published AS weet_is_published')

    if from > 0
      w = w.where('weeets.id < :t', t: from)
    end

    return w
  end

  def self.get_votes id:, user_id:
    votes = Vote.where(weeet_id: id)
    has_voted = (votes.where(user_id: user_id).count == 1)

    return {
      id: id,
      upvote_count: votes.where(voteup: true).count,
      downvote_count: votes.where(voteup: false).count,
      has_voted: votes.where(user_id: user_id).count == 1,
      voteup: has_voted ? votes.where(user_id: user_id).first.voteup : nil
    }
  end

  def vote up: true, by:
    if Time.now > self.evaluate_at
      raise RuntimeError, 'Voting period has ended'
    end

    Vote.create weeet_id: self.id,
                user_id: by,
                voteup: up
  end

  def evaluate!
    return if self.is_evaluated 
    return if Time.now < self.evaluate_at

    votes = Vote.where(weeet_id: self.id)
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
