require 'rails_helper'

RSpec.describe Weeet, type: :model do
  before :each do
    User.seed
    @user = User.where(role: :regular).last
  end

  it 'should post content correctly' do
    content = 'c' * 280
    weet = @user.weet!(content: content)
    Weeet.find(weet.id)
    expect(weet.content).to eq content
    expect(weet.is_published).to eq false
    expect(weet.evaluate_at).to be > (Time.now + 58.minute)
  end

  it 'should not post content longer than 280 characters' do
    content = 'c' * 281
    expect do 
      @user.weet!(content: content) 
    end.to raise_error(ActiveModel::StrictValidationFailed, /Content is too long/)
  end

  # it 'should execute publish command successfully' do
  #   weet = @user.weet!(content: 'blabla')
  #   weet.publish!

  #   expect(Weeet.find(weet.id).is_evaluated).to eq true
  #   expect(Weeet.find(weet.id).is_published).to eq true
  # end

  context 'evaluation' do
    before :each do
      @weet = @user.weet!(content: 'blah')
    end

    it 'should not evaluate before 1 hour period ends' do
      @weet.evaluate!
      expect(Weeet.find(@weet.id).is_evaluated).to eq false
    end

    it 'should evaluate after 1 hour period ends' do
      @weet.update(evaluate_at: Time.now - 1.minute)
      @weet.evaluate!

      weet = Weeet.find(@weet.id)
      expect(weet.is_evaluated).to eq true
      expect(weet.is_published).to eq false
    end
  end
  
end
