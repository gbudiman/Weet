class User < ApplicationRecord
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable and :omniauthable
  devise :database_authenticatable, :rememberable, :registerable
  enum role: [ :regular, :admin ]
  has_many :votes, dependent: :destroy
  has_many :weeets, dependent: :destroy

  def self.seed
    users = Array.new
    seeds = ['admin']
    9.times do |i|
      seeds.push "user#{i}"
    end

    ActiveRecord::Base.transaction do
      seeds.each do |seed|
        u = User.find_or_initialize_by name: seed,
                                       email: "#{seed}@nomail.org"
                                       

        u.password = seed
        u.password_confirmation = seed
        u.save!
        users.push u
      end

      User.where(name: 'admin').first.admin!
    end

    return users
  end

  def self.edit_name id:, value:
    user = User.find(id)
    if user
      user.name = value
      user.save!

      ActionCable.server.broadcast 'weeet_channel', { action: :name_changed, 
                                                      id: user.id,
                                                      val: user.name }
    end
  end

  def self.get_activity id:
    begin
      user = User.find(id)
      weets = Weeet.where(user_id: id)
                   .select('weeets.content AS weet_content')
                   .select('weeets.created_at AS weet_date')
                   .select('weeets.is_evaluated AS weet_is_evaluated')
                   .select('weeets.is_published AS weet_is_published')
                   .order('weeets.created_at DESC')
                   .limit(25)

      votes = Vote.joins(:weeet)
                  .joins('INNER JOIN users ON weeets.user_id = users.id')
                  .where(user_id: id)
                  .select('weeets.content AS weet_content')
                  .select('weeets.is_evaluated AS weet_is_evaluated')
                  .select('weeets.is_published AS weet_is_published')
                  .select('users.name AS weeter_name')
                  .select('votes.voteup AS vote_up')
                  .select('votes.created_at AS vote_date')
                  .order('votes.created_at DESC')
                  .limit(100)

      return {
        weets: weets,
        votes: votes,
        karma: user.karma,
        winning_streak: user.winning_streak,
        name: user.name,
        email: user.email,
        refill: user.karma_fill_time
      }
    rescue ActiveRecord::RecordNotFound
      return {
        error: :no_such_user_id
      }
    end
  end

  def has_enough_karma
    return :insufficient_karma if self.karma == 0
      
    pendings = User.joins(votes: :weeet)
                   .where(id: self.id)
                   .where('weeets.is_evaluated' => false)

    if pendings.count * 10 >= self.karma
      return :insufficient_pending_karma
    end

    return true
  end

  def weet! content:
    w = Weeet.create content: content, user_id: self.id
    ActionCable.server.broadcast 'weeet_channel', { action: :new_weet, id: w.id }
    Blockchain.upload weet: w
    return w
  end

  def upvote weet_id:
    Weeet.find(weet_id).vote up: true, by: self.id
    ActionCable.server.broadcast 'weeet_channel', { action: :upvote_changed, 
                                                    id: weet_id, 
                                                    val: Weeet.joins(:votes)
                                                              .where('votes.weeet_id' => weet_id)
                                                              .where('votes.voteup' => true).count}
    ActionCable.server.broadcast "weeet_channel_#{self.id}", { action: :karma_changed, val: self.karma, has_enough: has_enough_karma }                                                              
  end

  def downvote weet_id:
    Weeet.find(weet_id).vote up: false, by: self.id
    ActionCable.server.broadcast 'weeet_channel', { action: :downvote_changed, 
                                                    id: weet_id, 
                                                    val: Weeet.joins(:votes)
                                                              .where('votes.weeet_id' => weet_id)
                                                              .where('votes.voteup' => false).count}
    ActionCable.server.broadcast "weeet_channel_#{self.id}", { action: :karma_changed, val: self.karma, has_enough: has_enough_karma }                                                              
  end

  def reset!
    self.winning_streak = 0
    self.karma = 100
    self.save!
  end

  def win!
    self.winning_streak = self.winning_streak + 1
    case self.winning_streak
    when 2
      self.karma = self.karma + 20
    when 3
      self.karma = self.karma + 50
      self.winning_streak = 0
    end 

    # if self.karma > 0
    #   self.karma_fill_time = nil
    # end

    self.save!
    ActionCable.server.broadcast "weeet_channel_#{self.id}", { action: :karma_changed, val: self.karma, has_enough: has_enough_karma }
  end

  def lose!
    self.karma = self.karma - 10
    self.winning_streak = 0

    if self.karma == 0
      fill_time = ENV['mode'] == 'fast' ? (Time.now + 1.minute) : (Time.now + 1.day)
      self.karma_fill_time = fill_time
      EvaluatorWorker.perform_at(fill_time, 'evaluate')
      EvaluatorWorker.perform_at(fill_time + 5.seconds, 'evaluate')
    end
    self.save!
    ActionCable.server.broadcast "weeet_channel_#{self.id}", { action: :karma_changed, val: self.karma, has_enough: has_enough_karma }
  end

  def self.mass_refill
    count = 0
    User.where('karma_fill_time <= :t', t: Time.now).each do |user|
      user.refill_karma!
      count = count + 1
    end
  end

  def refill_karma!
    if Time.now > self.karma_fill_time
      self.karma = self.karma + 20
      self.karma_fill_time = nil
    end

    self.save!
    ActionCable.server.broadcast "weeet_channel_#{self.id}", { action: :karma_changed, val: self.karma, has_enough: has_enough_karma } 
  end
end
