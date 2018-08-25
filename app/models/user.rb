class User < ApplicationRecord
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable and :omniauthable
  devise :database_authenticatable, :rememberable, :registerable
  enum role: [ :regular, :admin ]
  has_many :votes

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
    end
  end

  def weet! content:
    w = Weeet.create content: content, user_id: self.id
    ActionCable.server.broadcast 'weeet_channel', { action: :new_weet, id: w.id }
  end

  def upvote weet_id:
    Weeet.find(weet_id).vote up: true, by: self.id
  end

  def downvote weet_id:
    Weeet.find(weet_id).vote up: false, by: self.id
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
  end

  def lose!
    self.karma = self.karma - 10

    if self.karma == 0
      self.karma_fill_time = Time.now + 1.day
    end
    self.save!
  end

  def refill_karma!
    if Time.now > self.karma_fill_time
      self.karma = self.karma + 20
      self.karma_fill_time = nil
    end

    self.save!
  end
end
