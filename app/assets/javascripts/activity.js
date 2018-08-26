var activity = function() {
  let snip_limit = 48
  var init = function() {
    fetch()
    activate_button()
  }

  var activate_button = function() {
    $('#refresh').on('click', function() {
      let $this = $(this)

      $this.prop('disabled', true).find('.text').text('Fetching...')
      fetch().then(function() {
        $this.prop('disabled', false).find('.text').text('Refresh')
      })
    })
  }

  var fetch = function() {
    return new Promise((resolve, reject) => {
      $.ajax({
        method: 'GET',
        url: '/user/fetch_activity?id=' + user_id
      }).done(res => {
        $('#user-weets').empty()
        $('#user-votes').empty()
        if (res.error && res.error == 'no_such_user_id') {
          $('#user-name').text('No such user...')
          $('#karma-point').text('???')
          $('#user-streak').text('???')
          $('#user-weets').append('<tr><td colspan=3>Invalid user ID...')
          $('#user-votes').append('<tr><td colspan=4>Invalid user ID...')
          $('#karma-refill').text('???')
        } else {
          $('#karma-point').text(res.karma)
          $('#user-name').text(res.name)
          $('#user-email').text(res.email)
          $('#user-streak').text(res.winning_streak)
          $('#karma-refill').text(res.refill == null ? 'Not scheduled' : moment(res.refill).fromNow())

          let w = ''
          res.weets.forEach(weet => {
            let eval_state = weet.weet_is_evaluated ? (weet.weet_is_published ? '<td class="voteup">Published</td>' 
                                                                              : '<td class="votedown">Rejected</td>') 
                                                    : '<td>Pending</td>'
            w += '<tr>'
              +    '<td>' + moment(weet.weet_date).fromNow() + '</td>'
              +    '<td>' + snip(weet.weet_content) + '</td>'
              +    eval_state
              +  '</tr>'
          })

          $('#user-weets').append(w)

          let v = ''
          res.votes.forEach(vote => {
            let eval = (vote.weet_is_evaluated ? (vote.weet_is_published ? '<td class="voteup"><span class="glyphicon glyphicon-ok" /></td>'
                                                                         : '<td class="votedown"><span class="glyphicon glyphicon-remove" /></td>')
                                               : '<td class="evalpending"><span class="glyphicon glyphicon-time" /></td>')
            let ud = (vote.vote_up ? '<td class="voteup"><span class="glyphicon glyphicon-arrow-up" /></td>'
                                   : '<td class="votedown"><span class="glyphicon glyphicon-arrow-down" /></td>')
            v += '<tr>'
              +    '<td>' + moment(vote.vote_date).fromNow() + '</td>'
              +    '<td>' + vote.weeter_name + '</td>'
              +    '<td>' + snip(vote.weet_content) + '</td>'
              +    eval
              +    ud
              +  '</tr>'
          })

          $('#user-votes').append(v)
        }

        resolve(true)
      })     
    })

  }

  var snip = function(x) {
    let ret = x.substring(0, snip_limit)
    return ret + (x.length > snip_limit ? '...' : '')
  }

  var update_karma = function(id, x) {
    if (user_id == id) {
      $('#karma-point').text(x)
    }
  }

  var update_streak = function(id, x) {
    if (user_id == id) {
      $('#user-streak').text(x)
    }
  }

  var update_name = function(id, x) {
    if (user_id == id) {
      $('#user-name').text(x)
    }
  }

  return {
    init: init,
    update_karma: update_karma,
    update_streak: update_streak,
    update_name: update_name
  }
}()