require 'rails_helper'

RSpec.describe User, type: :model do
  before :each do
    User.seed
    @admin = User.where(role: :admin).first
    @user = User.where(role: :regular).first
  end

  it 'should be initialized properly' do
    expect(@user.karma).to eq 100
    expect(@user.role).to eq 'regular'

    expect(@admin.karma).to eq 100
    expect(@admin.role).to eq 'admin'
  end

  context 'winning streak component' do
    it 'should grant bonus 20 karma and 50 karma on 2nd and 3rd streak, and no bonus afterwards' do
      init_streak = 1
      init_karma = @user.karma
      @user.update(winning_streak: init_streak)
      @user.win!

      user = User.find(@user.id)
      expect(user.winning_streak).to eq(init_streak + 1)
      expect(user.karma).to eq(init_karma + 20)

      @user.win!
      user = User.find(@user.id)
      expect(user.winning_streak).to eq 0
      expect(user.karma).to eq(init_karma + 70)

      @user.win!
      user = User.find(@user.id)
      expect(user.winning_streak).to eq 1
      expect(user.karma).to eq(init_karma + 70)
    end

    it 'should clear karma fill time' do
      @user.karma = 10
      @user.lose!
      @user.save!

      expect(@user.karma).to eq 0
      expect(@user.karma_fill_time).to be > (Time.now + 1.day - 1.minute)

      @user.win!
      @user.win!
      expect(@user.karma).to eq 20
      expect(@user.karma_fill_time).to eq nil

    end
  end

  context 'losing' do
    it 'should lose 10 karma points' do
      3.times do
        user = User.find(@user.id)
        current_karma = user.karma
        @user.lose!

        user = User.find(@user.id)
        expect(user.karma).to eq(current_karma - 10)
      end
    end

    it 'should assign karma refill time when losing to zero karma' do
      user = User.find(@user.id)
      user.update(karma: 10)

      user.lose!
      expect(user.karma).to eq 0
      expect(user.karma_fill_time).to be > (Time.now + 1.day - 1.minute)
    end
  end

  context 'karma refill' do
    before :each do
      @user = User.find(@user.id)
      @user.update(karma: 0)
    end

    it 'should not be executed before set date' do
      dummy_fill = Time.now + 1.hour
      @user.update(karma_fill_time: dummy_fill)
      @user.refill_karma!
      expect(@user.karma).to eq 0

      expect(@user.karma_fill_time).to eq dummy_fill
    end

    it 'should be executed after set date' do
      @user.update(karma_fill_time: Time.now - 1.hour)
      @user.refill_karma!

      expect(@user.karma).to eq 20
      expect(@user.karma_fill_time).to eq nil
    end
  end
end
