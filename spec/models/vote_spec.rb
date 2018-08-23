require 'rails_helper'

RSpec.describe Vote, type: :model do
  before :each do
    User.seed
    @users = User.all
    @weet = @users[0].weet! content: 'blabla'
  end

  it 'should handle downvoted weet correctly' do
    @users[1..3].each do |user|
      user.downvote weet_id: @weet.id
    end

    @users[4..-1].each do |user|
      user.upvote weet_id: @weet.id
    end
  end

  it 'should reject self-vote' do
    expect do 
      @users[0].upvote weet_id: @weet.id
    end.to raise_error(ArgumentError, /Self-voting is not allowed/)
  end

  it 'should reject vote from user with zero karma' do
    user = @users[5]
    user.karma = 0
    user.save!

    expect do
      user.upvote weet_id: @weet.id
    end.to raise_error(RuntimeError, 'Insufficient karma')
  end
end
