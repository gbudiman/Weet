var activity = function() {
  let snip_limit = 48
  var init = function() {
    fetch()
  }

  var fetch = function() {
    $.ajax({
      method: 'GET',
      url: '/user/fetch_activity?id=' + user_id
    }).done(res => {
      if (res.error && res.error == 'no_such_user_id') {
        $('#user-name').text('No such user...')
        $('#karma-point').text('???')
        $('#user-streak').text('???')
        $('#user-weets').append('<tr><td colspan=3>Invalid user ID...')
        $('#user-votes').append('<tr><td colspan=4>Invalid user ID...')
      } else {
        $('#karma-point').text(res.karma)
        $('#user-name').text(res.name)
        $('#user-email').text(res.email)
        $('#user-streak').text(res.winning_streak)

        let w = ''
        res.weets.forEach(weet => {
          let eval_state = weet.is_evaluated ? (weet.is_published ? 'Published' : 'Rejected') : 'Pending'
          w += '<tr>'
            +    '<td>' + weet.weet_date + '</td>'
            +    '<td>' + snip(weet.weet_content) + '</td>'
            +    '<td>' + eval_state + '</td>'
            +  '</tr>'
        })

        $('#user-weets').append(w)

        let v = ''
        res.votes.forEach(vote => {
          let eval = (vote.weet_is_evaluated ? (vote.weet_is_published ? '<td class="voteup"><span class="glyphicon glyphicon-ok" /></td>'
                                                                       : '<td class="votedown"><span class="glyphicon glyphicon-remove" /></td>')
                                             : '<td><span class="glyphicon glyphicon-time /></td>')
          let ud = (vote.vote_up ? '<td class="voteup"><span class="glyphicon glyphicon-arrow-up" /></td>'
                                 : '<td class="votedown"><span class="glyphicon glyphicon-arrow-down" /></td>')
          v += '<tr>'
            +    '<td>' + vote.vote_date + '</td>'
            +    '<td>' + vote.weeter_name + '</td>'
            +    '<td>' + snip(vote.weet_content) + '</td>'
            +    eval
            +    ud
            +  '</tr>'
        })

        $('#user-votes').append(v)
      }
    })
  }

  var snip = function(x) {
    let ret = x.substring(0, snip_limit)
    return ret + (x.length > snip_limit ? '...' : '')
  }

  return {
    init: init
  }
}()