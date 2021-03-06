var weet_cloner = function() {
  let oldest_content
  let template
  let feed
  let border

  let is_fetching
  let oldest_reached

  let has_enough_karma
  let karma_deprivation_reason

  var init = function() {
    template = $('#weet-template')
    feed = $('#feed')
    border = $('#border')
    is_fetching = false
    oldest_reached = false
    oldest_content = undefined
    has_enough_karma = false
    karma_deprivation_reason = 'Karma uninitialized'
    attach_window_events()
  }

  var attach_window_events = function() {
    $(window).on('scroll resize', function() {
      window.requestAnimationFrame(function() {
        let w = $(window).height()
        let b = border[0].getBoundingClientRect().y

        if (b < w) {
          
          //setTimeout(fetch, 1000)
          if (!is_fetching && !oldest_reached) {
            fetch()
          }
        }
      })
      
    })

    get_karma().then(function() {
      fetch()  
    })
  }

  var get_karma = function() {
    return new Promise((resolve, reject) => {
      $.ajax({
        method: 'GET',
        url: '/user/has_enough_karma'
      }).done(res => {
        if (res === true) {
          has_enough_karma = true
          karma_deprivation_reason = null
        } else {
          has_enough_karma = false
          switch(res) {
          case 'insufficient_karma': 
            karma_deprivation_reason = 'Not enough karma'
            break
          case 'insufficient_pending_karma':
            karma_deprivation_reason = 'Not enough karma due to pending votes'
            break
          }
        }
        resolve(true)
      })
    })
  }

  var fetch = function() {
    is_fetching = true
    $.ajax({
      method: 'GET',
      url: '/weets',
      data: {
        from: oldest_content
      }
    }).done(res => {
      if (res.length < 5) {
        oldest_reached = true
        border.text('No more Weet to display')
      }

      res.forEach(weet => {
        clone(weet)
      })

      is_fetching = false
    })
  }

  var notify_new = function(id) {
    $.ajax({
      method: 'GET',
      url: '/weet',
      data: {
        id: id
      }
    }).done(res => {
      get_karma().then(function() {
        clone(res, 'prepend')  
      })
      
    })
  }

  var clone = function(weet, _mode) {
    let mode = _mode == undefined ? 'append' : _mode

    if ($('[data-id=' + weet.id + ']').length > 0) return

    if (mode == 'prepend' || (oldest_content == undefined || weet.id < oldest_content)) {
      let cloned = template.clone()
      cloned.attr('data-id', weet.id)
      if (mode == 'append') {
        feed.append(cloned)
        cloned.show()
      } else {
        feed.prepend(cloned)
        cloned.show(400)
      }
      

      layout.set_content(weet.id, weet.weeter_id, weet.weeter_name, weet.weet_created_at, weet.weet_content)
      if (weet.weet_is_evaluated) {
        layout.publish_weet(weet.id, weet.weet_is_published)
        layout.enable_vote(weet.id, false)
      } else {
        layout.set_vote_timer(weet.id, moment(weet.weet_evaluate_at))

        if (has_enough_karma) {
          layout.enable_vote(weet.id, weet.weeter_id != current_user_id, 'Self-voting is not permitted')
        } else {
          layout.enable_vote(weet.id, false, karma_deprivation_reason)
        }
      }
      
      if (mode == 'append') {
        oldest_content = weet.id
      }
    }
  }

  return {
    init: init,
    notify_new: notify_new
  }
}()