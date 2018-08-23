class User < ApplicationRecord
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable and :omniauthable
  devise :database_authenticatable, :rememberable
  enum role: [ :regular, :admin ]

  def self.seed
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
      end

      User.where(name: 'admin').first.admin!
    end
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

    self.save!
  end

  def lose!
    self.karma = self.karma - 10
    self.save!
  end
end
