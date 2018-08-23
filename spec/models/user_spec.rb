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
  end
end
