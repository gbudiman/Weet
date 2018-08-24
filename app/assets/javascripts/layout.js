var layout = function() {
  var init = function() {
    initialize_non_clickable_links()
    initialize_tooltips()
    exec_test()
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

  var set_content = function(id, author, date, content) {
    let obj = get(id)
    obj.find('.weet-author').text(author)
    obj.find('.weet-date').text(date)
    obj.find('.weet-body').text(content)
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
    enable_tooltips(-1)
    set_vote_timer(-1, moment().add(55, 'minute'))
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