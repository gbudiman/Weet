class WeeetController < ApplicationController
  def index
    @current_user = current_user
  end

  def heartbeat
  end
  
  def fetch
    render json: (Weeet.fetch limit: (params[:limit] || 5).to_i,
                              from: (params[:from] || -1).to_i)
  end

  def fetch_with
    render json: (Weeet.fetch_with id: params[:id].to_i)
  end

  def get_votes
    render json: (Weeet.get_votes id: params[:id].to_i, user_id: current_user.id)
  end

  def send_vote
    up = params[:voteup] == 'true'
    weet_id = params[:id].to_i

    if up
      current_user.upvote weet_id: weet_id
    else
      current_user.downvote weet_id: weet_id
    end

    render json: { success: true }
  end

  def post_weet
    current_user.weet! content: params[:content]
    render json: { success: true }
  end
end
