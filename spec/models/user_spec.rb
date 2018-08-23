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
end
