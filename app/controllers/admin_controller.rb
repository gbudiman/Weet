class AdminController < ApplicationController
  before_action :authenticate_user!
  before_action :authenticate_admin!

  def index
  end

  def get_weeters
    render json: User.all.order(name: :asc)
  end

  def edit_karma
    karma = params[:value].to_i
    if (karma < 0) 
      render json: { success: false, error: :must_be_greater_than_zero }
    else 
      id = params[:pk].to_i
      u = User.find(id)
      u.update(karma: karma)
      ActionCable.server.broadcast "weeet_channel_#{id}", { action: :karma_changed, val: u.karma, has_enough: u.has_enough_karma }
      render json: { success: true }  
    end
  end

  def edit_streak
    streak = params[:value].to_i
    if (streak < 0 or streak > 2)
      render json: { success: false, error: :streak_out_of_range }
    else
      id = params[:pk].to_i
      u = User.find(id)
      u.update(winning_streak: streak)
      render json: { success: true }
    end
  end

  def edit_refill
    render json: User.admin_edit_refill(id: params[:id].to_i)
  end

private
  def authenticate_admin!
    if current_user.role != 'admin'
      redirect_to controller: 'weeet', action: 'index'
    end
  end
end
