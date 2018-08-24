var weet_cloner = function() {
  let oldest_content
  let template
  let feed

  var init = function() {
    template = $('#weet-template')
    feed = $('#feed')
    fetch()
  }

  var fetch = function() {
    $.ajax({
      method: 'GET',
      url: '/weets'
    }).done(res => {
      res.forEach(weet => {
        clone(weet)
      })
    })
  }

  var clone = function(weet) {
    if (oldest_content == undefined || moment(weet.weet_created_at) < oldest_content) {
      let cloned = template.clone()
      cloned.attr('data-id', weet.id).show()
      feed.append(cloned)

      layout.set_content(weet.id, weet.weeter_id, weet.weeter_name, weet.weet_created_at, weet.weet_content)
      if (weet.weet_is_evaluated) {
        layout.publish_weet(weet.id, weet.weet_is_published)
      } else {
        layout.set_vote_timer(weet.id, moment(weet.weet_evaluate_at))
        layout.enable_vote(weet.id)
      }
      
      oldest_content = moment(weet.weet_created_at)
    }
  }
  return {
    init: init
  }
}()