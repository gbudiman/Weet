class UserController < ApplicationController
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
end
