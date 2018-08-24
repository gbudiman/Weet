class WeeetController < ApplicationController
  def fetch
    render json: (Weeet.fetch limit: (params[:limit] || 5).to_i,
                              from: params[:from] || Time.now)
  end

  def get_votes
    render json: (Weeet.get_votes id: params[:id].to_i)
  end

  def send_vote
    up = params[:up] == 'up'
    weet_id = params[:id].to_i

    if up
      current_user.upvote weet_id: weet_id
    else
      current_user.downvote weet_id: weet_id
    end

    render json: { success: true }
  end

  def post_weet
    current_user.weet! content: params[:weet]
    render json: { success: true }
  end
end
