require 'open3'
require 'concurrent'

class Blockchain < ApplicationRecord
  belongs_to :weeet
  validates :weeet, presence: true
  enum command: [ :upload, :publish, :rejex ]

  def self.get_lock
    return Config.find_by(key: 'blockchain_lock')
  end

  def self.release_lock
    ap 'lock released'
    get_lock.update(property: 'false')
  end

  def self.acquire_lock
    lock_success = false
    ActiveRecord::Base.transaction do
      c = get_lock
      if c.property == 'false'
        c.property = 'true'
        c.save!

        ap 'lock acquired'
        lock_success = true
      end
    end
    
    return lock_success
  end

  def self.upload weet:
    Blockchain.create weeet_id: weet.id, command: :upload
    trigger_jobs
  end

  def self.publish weet:, val:
    Blockchain.create weeet_id: weet.id, command: (val ? :publish : :rejex )
    trigger_jobs
  end

  def self.get_workload
    return Blockchain.where(executed: false).order(created_at: :asc)
  end

  def self.trigger_jobs
    Concurrent::Promise.execute do
      if acquire_lock
        tasks = get_workload

        if tasks.count > 0
          task = tasks.first
          ap "Executing the following task:"
          ap task
          self.exec_task task: task.command, weet: Weeet.find(task.weeet_id), ref: task
        else
          ap "No more task remaining"
          release_lock
        end
      end
    end
  end

  def self.exec_task task:, weet:, ref:
    Dir.chdir Rails.root.join('lib', 'contract_interface')
    Open3.popen3('node', 
                 'interface.js',
                 task,
                 weet.id.to_s,
                 weet.user_id.to_s,
                 weet.created_at.to_i.to_s,
                 weet.content,
                 ENV['wallet_address'],
                 ENV['wallet_pk']) do |stdin, stdout, stderr|
      stdout.each_line do |line|
        print("OUT> #{line}")
        if line.match(/ SYNC COMPLETED\!/)
          ActiveRecord::Base.transaction do
            #ref.update(executed: true)
            ref.executed = true
            ref.is_successful = true
            ref.save!
            if task == 'upload'
              weet.persisted_on_blockchain = true
              weet.save!
            end
            
            release_lock
          end

          trigger_jobs
        end
        
      end

      stderr.each_line do |line|
        print("ERR> #{line}")
        if line.match(/Unhandled promise rejection/)
          ActiveRecord::Base.transaction do
            ref.executed = true
            ref.save!

            release_lock
          end

          trigger_jobs
        end
      end
    end
  end
end