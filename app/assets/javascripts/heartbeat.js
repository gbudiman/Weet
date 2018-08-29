var heartbeat = function() {
  var cable

  var init = function() {
    $.ajax({
      method: 'GET',
      url: '/socket'
    }).done(res => {
      cable = ActionCable.createConsumer('ws://' + res.domain + ':' + res.port + '/cable')

      cable.subscriptions.create('WeeetChannel', {
        connected: cable_connected,
        received: cable_message
      })

      if (current_user_id != -1) {
        cable.subscriptions.create({
          channel: 'WeeetChannel',
          user_id: current_user_id 
        }, {
          connected: user_connected,
          received: user_message
        })
      }  
    })
    
  }

  var cable_connected = function(data) {
    console.log('Cable connected')
  }

  var user_connected = function(data) {
    console.log('User Cable connected')
  }

  var cable_message = function(data) {
    switch(data.action) {
      case 'new_weet': new_weet(data.id); break
      case 'upvote_changed': vote_changed(data.id, data.val, 'up'); break
      case 'downvote_changed': vote_changed(data.id, data.val, 'down'); break
      case 'weet_evaluated': weet_evaluated(data.id, data.val); break
      case 'karma_changed': activity_karma_changed(data.id, data.val); break
      case 'streak_changed': activity_streak_changed(data.id, data.val); break
      case 'name_changed': dual_name_changed(data.id, data.val); break;
    }
    
  }

  var user_message = function(data) {
    switch(data.action) {
      case 'karma_changed': karma_changed(data.val, data.has_enough); break
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

  var karma_changed = function(val, has_enough) {
    layout.update_karma(val, has_enough)
  }

  var activity_karma_changed = function(id, val) {
    activity.update_karma(id, val)
  }

  var activity_streak_changed = function(id, val) {
    activity.update_streak(id, val)
  }

  var dual_name_changed = function(id, val) {
    try {
      activity.update_name(id, val)
    } catch(e) {}

    try {
      layout.update_author_name(id, val)
    } catch(e) {}
  }

  return {
    init: init
  }
}()