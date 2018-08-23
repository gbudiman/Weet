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
end
