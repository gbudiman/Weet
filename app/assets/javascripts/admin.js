var admin = function() {
  var content
  var refresh

  var init = function() {
    content = $('#content')
    refresh = $('#refresh')

    set_refresh()
    fetch()
  }

  var set_refresh = function() {
    refresh.on('click', function() {
      content.empty()
      fetch()
    })
  }

  var fetch = function() {
    $.ajax({
      method: 'GET',
      url: '/weeters'
    }).done(res => {
      //console.log(res)
      res.forEach(r => {
        append(r)
      })

      activate_all()
    })
  }

  var activate_all = function() {
    $('[karma-id]').each(function() {
      let $this = $(this)
      $this.editable({
        type: 'text',
        pk: $this.attr('karma-id'),
        url: '/edit/karma',
        title: 'Edit karma (>0)',
        success: function(response, new_value) {
          if (response.success == false) {
            if (response.error == 'must_be_greater_than_zero') {
              return 'Karma must be greater than zero'
            }
          }
        }
      })
    })

    $('[streak-id]').each(function() {
      let $this = $(this)
      $this.editable({
        type: 'text',
        pk: $this.attr('streak-id'),
        url: '/edit/streak',
        title: 'Edit winning streak (0~2)',
        success: function(response, new_value) {
          if (response.success == false) {
            if (response.error == 'streak_out_of_range') {
              return 'Winning streak must be between 0 and 2 inclusive'
            }
          }
        }
      })
    })

    $('[refill-id]').off('click').on('click', function() {
      let $this = $(this)
      let id = $this.attr('refill-id')

      $.ajax({
        method: 'POST',
        url: '/edit/refill',
        data: {
          id: id
        }
      }).done(res => {
        if (res.success) {
          $this.parent().text('Scheduled ' + moment(res.fill_time).fromNow())
          $this.hide()
        }
      })
    })
  }

  var append = function(r) {
    let karma = '<span karma-id=' + r.id + '>' + r.karma + '</span>'
    let streak = '<span streak-id=' + r.id + '>' + r.winning_streak + '</span>'
    let refill

    if (r.karma_fill_time == null) {
      refill = '<button refill-id=' + r.id + ' class="btn btn-success">'
             +   'Schedule in 15 secs'
             + '</button>'
    } else {
      refill = 'Scheduled ' + moment(r.karma_fill_time).fromNow()
    }

    content
      .append('<tr>'
            +   '<td>' + r.id + '</td>'
            +   '<td>' + r.name + '</td>'
            +   '<td class="numeric">' + karma + '</td>'
            +   '<td class="numeric">' + streak + '</td>'
            +   '<td>' + refill + '</td>'
            + '</tr>')
  }

  return {
    init: init
  }
}()