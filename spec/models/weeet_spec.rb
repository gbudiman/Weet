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
  end

  it 'should not post content longer than 280 characters' do
    content = 'c' * 281
    expect do 
      @user.weet!(content: content) 
    end.to raise_error(ActiveModel::StrictValidationFailed, /Content is too long/)
  end

  it 'should execute publish command successfully' do
    weet = @user.weet!(content: 'blabla')
    weet.publish!

    expect(Weeet.find(weet.id).is_published).to eq true
  end
end
