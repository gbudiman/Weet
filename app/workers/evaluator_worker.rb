class EvaluatorWorker
  include Sidekiq::Worker

  def perform(*args)
    # Do something
    case args[0].to_sym
    when :evaluate then evaluate_weet
    when :blockchain then commit_to_blockchain(args[1])
    end
  end

  def evaluate_weet
  end

  def commit_to_blockchain id
  end
end
