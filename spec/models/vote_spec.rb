require 'rails_helper'

RSpec.describe Vote, type: :model do
  before :each do
    User.seed
    @users = User.all
    @weet = @users[0].weet! content: 'blabla'
    @karma_cache = {}
  end

  it 'should handle upvoted weet correctly' do
    @users[1..3].each do |user|
      @karma_cache[user.id] = user.karma
      user.downvote weet_id: @weet.id
    end

    @users[4..-1].each do |user|
      @karma_cache[user.id] = user.karma
      user.upvote weet_id: @weet.id
    end

    @weet.update(evaluate_at: Time.now - 1.minute)
    @weet.evaluate!
    expect(@weet.is_evaluated).to eq true
    expect(@weet.is_published).to eq true

    @users[1..3].each do |user|
      expect(User.find(user.id).karma).to eq(@karma_cache[user.id] - 10)
    end
  end

  it 'should handle downvoted weet correctly' do
    @users[1..3].each do |user|
      @karma_cache[user.id] = user.karma
      user.upvote weet_id: @weet.id
    end

    @users[4..-1].each do |user|
      @karma_cache[user.id] = user.karma
      user.downvote weet_id: @weet.id
    end

    @weet.update(evaluate_at: Time.now - 1.minute)
    @weet.evaluate!
    expect(@weet.is_evaluated).to eq true
    expect(@weet.is_published).to eq false

    @users[1..3].each do |user|
      expect(User.find(user.id).karma).to eq(@karma_cache[user.id] - 10)
    end
  end

  it 'should reject vote on evaluated weet' do
    @weet.update(evaluate_at: Time.now - 2.minute)
    expect do
      @users[1].upvote weet_id: @weet.id
    end.to raise_error(RuntimeError, /Voting period has ended/)
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

  it 'should reject vote from user that has too many pending votes' do
    user = @users[5]
    user.update(karma: 30)

    weets = Array.new
    4.times do 
      weets.push @users[4].weet!(content: 'blah')
    end

    weets[0..2].each do |weet|
      user.upvote weet_id: weet.id
    end

    expect do
      user.upvote weet_id: weets[-1].id
    end.to raise_error(RuntimeError, 'Insufficient pending karma')
  end

  it 'should disallow double-vote' do
    user = @users[5]
    user.upvote weet_id: @weet.id

    expect do
      user.upvote weet_id: @weet.id
    end.to raise_error(ActiveRecord::RecordNotUnique)
  end
end
