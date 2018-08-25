class UserController < ApplicationController
  def edit_name
    begin
      User.edit_name id: params[:pk].to_i, value: params[:value]
      render json: { success: true }
    rescue ActiveRecord::RecordNotUnique
      render json: { success: false, error: :not_unique }
    end
    
  end
end
