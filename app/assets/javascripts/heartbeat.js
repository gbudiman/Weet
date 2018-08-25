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
    }
    
  }

  var new_weet = function(id) {
    weet_cloner.notify_new(id)
  }

  return {
    init: init
  }
}()