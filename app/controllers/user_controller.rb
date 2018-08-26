class UserController < ApplicationController
  before_action :authenticate_user!, except: [:has_enough_karma]
  
  def edit_name
    begin
      User.edit_name id: params[:pk].to_i, value: params[:value]
      render json: { success: true, pk: params[:pk] }
    rescue ActiveRecord::RecordNotUnique
      render json: { success: false, error: :not_unique }
    end
    
  end

  def activity
    @current_user = current_user
    @id = params[:id].to_i
  end

  def fetch_activity
    render json: User.get_activity(id: params[:id].to_i)
  end

  def has_enough_karma
    if current_user
      render json: User.find(current_user.id).has_enough_karma
    else
      render json: { error: :user_not_logged_in }
    end
  end
end
