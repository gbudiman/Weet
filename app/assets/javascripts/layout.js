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

  var set_vote_timer = function(id, until) {

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
  }

  return {
    init: init,
    enable_vote: enable_vote,
    publish_weet: publish_weet,
    set_vote_timer: set_vote_timer
  }
}()