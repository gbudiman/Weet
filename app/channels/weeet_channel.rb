class WeeetChannel < ApplicationCable::Channel
  def subscribed
    # stream_from "some_channel"
    stream_from "weeet_channel"

    #ap current_user
    #ap params[:user_id]
    #ap "---"
    if current_user and current_user.id == params[:user_id].to_i
      #ap params[:user_id]
      ap "Streamed #{params[:user_id]}"
      stream_from "weeet_channel_#{params[:user_id]}"
    end
  end

  def unsubscribed
    # Any cleanup needed when channel is unsubscribed
  end
end
