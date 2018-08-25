var layout = function() {
  let post_button
  let post_content
  let char_remaining

  var init = function() {
    initialize_non_clickable_links()
    initialize_tooltips()
    initialize_editable()
    initialize_weet_field()
  }

  var initialize_editable = function() {
    $('#navbar-user-name').editable({
      type: 'text',
      url: '/edit_name',
      placement: 'bottom',
      success: function(response, new_value) {
        if (response.success == false) {
          if (response.error == 'not_unique') {
            return 'Username has been taken'
          }
        } else {
          $('[data-author-id=' + response.pk + ']').text(new_value)
        }
      }
    })
  }

  var initialize_weet_field = function() {
    post_button = $('#post-weet')
    post_content = $('#weet-content')
    char_remaining = $('#char-remaining')

    var set_post_button_state = function(state) {
      switch(state) {
        case 'busy':
          post_button.addClass('disabled')
          break
        case 'available':
          post_button.removeClass('disabled')
          break
      }
    }

    var evaluate_length = function() {
      let length = post_content.val().trim().length
      if (length == 0) {
        set_post_button_state('busy')
      } else {
        set_post_button_state('available')
      }
      char_remaining.text((280 - length) + ' characters left')
    }

    post_content.on('keyup', function() {
      evaluate_length()
    })

    post_button.off('click').on('click', function() {
      $.ajax({
        method: 'POST',
        url: '/weet',
        data: {
          content: post_content.val().trim()
        }
      }).done(res => {
        if (res.success) {
          post_content.val('')
          evaluate_length()
        }
      })
    })

    evaluate_length()
  }

  var initialize_non_clickable_links = function() {
    $('.not-clickable').off('click').on('click', event => {
      event.preventDefault()
    })
  }

  var initialize_tooltips = function() {
    let t = $('[data-toggle="tooltip"]')
    $('[data-toggle="tooltip"]').tooltip()
  }

  var get = function(id) {
    return $('[data-id=' + id + ']')
  }

  var enable_vote = function(id, _val) {
    let obj = get(id)
    let val = (_val == undefined) ? true : _val
    let buttons = obj.find('.vote')

    buttons.attr('data-id=' + id)
    if (val) {
      buttons.removeClass('disabled').addClass('enabled')
      obj.find('[data-vote-toggle="tooltip"]').attr('data-original-title', '')
    } else {
      buttons.addClass('disabled').removeClass('enabled')
      obj.find('[data-vote-toggle="tooltip"]').attr('data-original-title', 'Voting period has ended')
    }
  }

  var enable_tooltips = function(id) {
    let obj = get(id)

    obj.find('[data-vote-toggle="tooltip"]').tooltip()
    obj.find('[data-vote-remainder-toggle="tooltip"]').tooltip()
  }

  var set_blockchain_persisted = function(id) {
    let obj = get(id)
    obj.find('.blockchain-persisted').show().tooltip()
  }

  var set_content = function(id, author_id, author, date, content) {
    let obj = get(id)
    let author_obj = obj.find('.weet-author').find('a')

    author_obj.text(author).attr('href', '/weeter/' + author_id).attr('data-author-id', author_id)
    obj.find('.weet-date').text(date)
    obj.find('.weet-body').text(content)
    enable_tooltips(id)
  }

  var set_vote_timer = function(id, until) {
    let obj = get(id)
    let timer_container = obj.find('.timer-container')
    let timer_bar = obj.find('.timer-bar')
    let timer_text = obj.find('.timer-text')
    let denominator = 3600000 // milliseconds

    timer_container.show()

    let timing_task = function(obj, until) {
      let delta = (until - moment())
      let delta_denominator = delta / denominator
      let width_percentage = delta_denominator * 100
      let minute = parseInt(delta / 60000)
      let second = parseInt(delta / 1000) % 60
      let secondt = ((second < 10) ? '0' : '') + second.toString()

      timer_bar.css('width', width_percentage + '%')
      timer_text.text(minute + ':' + secondt)

      if (delta >= 0) {
        setTimeout(function() {
          timing_task(obj, until)
        }, 1000)
      } else {
        timer_text.text('Calculating...')
        enable_vote(id, false)
      }
    }

    setTimeout(function() {
      timing_task(timer_bar, until)
    }, 1000)
  }

  var publish_weet = function(id, _val) {
    let obj = get(id)
    let val = (_val == undefined) ? true : _val

    obj.find('.timer-container').hide()

    if (val) {
      obj.find('.weet-rejected').hide()
      obj.find('.weet-approved').show()
    } else {
      obj.find('.weet-approved').hide()
      obj.find('.weet-rejected').show()
    }
  }

  var exec_test = function() {
    // enable_tooltips(-1)
    // set_vote_timer(-1, moment().add(45, 'minutes'))
  }

  return {
    init: init,
    enable_vote: enable_vote,
    publish_weet: publish_weet,
    set_vote_timer: set_vote_timer,
    set_content: set_content,
    set_blockchain_persisted: set_blockchain_persisted
  }
}()