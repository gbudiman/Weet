var heartbeat = function() {
  const cable = ActionCable.createConsumer('ws://localhost:2998/cable')

  var init = function() {
    cable.subscriptions.create('WeeetChannel', {
      connected: cable_connected,
      received: cable_message
    })
  }

  var cable_connected = function(data) {
    console.log('Cable connected')
  }

  var cable_message = function(data) {
    console.log(data)
    switch(data.action) {
      case 'new_weet': new_weet(data.id); break
      case 'upvote_changed': vote_changed(data.id, data.val, 'up'); break
      case 'downvote_changed': vote_changed(data.id, data.val, 'down'); break
      case 'weet_evaluated': weet_evaluated(data.id, data.val); break
    }
    
  }

  var new_weet = function(id) {
    weet_cloner.notify_new(id)
  }

  var vote_changed = function(id, val, mode) {
    layout.update_vote(id, val, mode)
  }

  var weet_evaluated = function(id, val) {
    layout.publish_weet(id, val)
  }

  return {
    init: init
  }
}()