module ApplicationCable
  class Connection < ActionCable::Connection::Base
    identified_by :uuid

    def connect
      #self.current_user = find_verified_user
      self.uuid = SecureRandom.urlsafe_base64
    end

  private
    def find_verified_user
      if verified_user = User.find_by(id: cookies.encrypted[:user_id])
        verified_user
      else
        reject_unauthorized_connection
      end
    end
  end
end
