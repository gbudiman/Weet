var SlideToUnlock = function() {
  var mouse_state
  var mouse_init_x
  var current_object
  var callback_executed

  var init = function(id, _h) {
    mouse_state = 'up'
    current_object = null
    callback_executed = false
    var h = _h == undefined ? {} : _h

    var settings = {
      height: h.height || 64,
      font_size: (h.font_size || 24),
      margin_top: (h.margin_top || -48),
      text_idle: h.text_idle || 'Slide To Unlock &raquo',
      text_disabled: h.text_disabled || 'This element is disabled',
      text_slid: h.text_slid || 'Unlocking...',
      text_done: h.text_done || 'Unlocked',
      func_slid: h.func_slid,
      func_done: h.func_done,
      style_bg_done: h.style_bg_done || '#337ab7',
      style_color_done: h.style_color_done || '#fff',
      style_bg_slid: h.style_bg_slid || '#ffbb33',
      style_color_slid: h.style_color_slid || '#fff',
      style_bg_idle: h.style_bg_idle || '#eee',
      style_color_idle: h.style_color_idle || '#333',
      style_bg_disabled: h.style_bg_disabled || '#ccc',
      style_color_disabled: h.style_color_disabled || '#888',
      start_disabled: h.start_disabled || false
    }

    var s = '<div class="slide-to-unlock-parent" '
          +      'data-bg-done="' + settings.style_bg_done + '" '
          +      'data-bg-slid="' + settings.style_bg_slid + '" '
          +      'data-bg-idle="' + settings.style_bg_idle + '" '
          +      'data-bg-disabled="' + settings.style_bg_disabled + '" '
          +      'data-color-done="' + settings.style_color_done + '" '
          +      'data-color-slid="' + settings.style_color_slid + '" '
          +      'data-color-idle="' + settings.style_color_idle + '" '
          +      'data-color-disabled="' + settings.style_color_disabled + '" '
          + '>'
          +   '<div class="slideable" />'
          +     '<div class="slide-text" '
          +        'data-disabled="' + settings.text_disabled + '" '
          +        'data-idle="' + settings.text_idle + '" '
          +        'data-slid="' + settings.text_slid + '" '
          +        'data-done="' + settings.text_done + '">' + settings.text_idle
          +   '</div>'
          + '</div>'


    attach_bodily_functions()
    $(id)
      .append(s)
      .find('.slide-to-unlock-parent')
        .css('height', settings.height + 'px')
        .find('.slideable')
          .each(attach_drag)
          .css('height', settings.height + 'px')  

    $(id)
      .find('.slide-text')
        .css('font-size', settings.font_size + 'px')
        .css('height', settings.height + 'px')
        .css('margin-top', settings.margin_top + 'px')

    $(id)[0].slider_reset = function() {
      unslide($(this).find('.slideable'))
      $(this)[0].slider_enable()
    }

    $(id)[0].slider_enable = function(_val) {
      slider_enable($(this), _val == undefined ? true : _val)
    }

    $(id)[0].slider_toggle = function() {
      var has_disabled = $(this).find('.slideable').hasClass('disabled')
      $(this)[0].slider_enable(has_disabled)
    }

    $(id)[0].func_slid = function() {
      var $this = $(this)
      var anchor = $this.find('.slide-to-unlock-parent')

      if (anchor.attr('data-executed') != 'true'){
        $this.trigger('slider-hit')
        anchor.attr('data-executed', true)

        return new Promise((resolve, reject) => {
          switch_state_to($(this), 'slid')

          if (settings.func_slid) {
            settings.func_slid().then(h => {
              $this.trigger('slider-slid', h)
              resolve(h)
            })
          } else {
            $this.trigger('slider-slid', h)
            resolve(true)
          }
        })
      } 
    }

    $(id)[0].func_done = function(h) {
      var $this = $(this)

      return new Promise((resolve, reject) => {
        switch_state_to($(this), 'done')
        if (settings.func_done) {
          settings.func_done(h).then(h => {
            $this.trigger('slider-done', h)
            resolve(h)
          })
        } else {
          $this.trigger('slider-done', h)
          resolve(true)
        }
      })
    }

    $(id)[0].adjust_slider_position = function() {
      var $this = $(this)
      var slider = $this.find('.slideable')
      var margin_left = parseInt(slider.css('margin-left'))

      if (margin_left > 1) {
        slider.css('margin-left', ($this.width() - slider.width() - 2) + 'px')
      }
    }

    $(id)[0].set_slid_text = function(x, _html) {
      var html = _html == undefined ? false : _html

      if (html) {
        $(this).find('.slide-text').html(x)
      } else {
        $(this).find('.slide-text').text(x)
      }
    }

    $(id)[0].set_done_text = function(x, _html) {
      var html = _html == undefined ? false : _html

      if (html) {
        $(this).find('.slide-text').html(x)
      } else {
        $(this).find('.slide-text').text(x)
      }
    }

    $(window).on('resize', function() {
      $(id)[0].adjust_slider_position()
    })

    if (settings.start_disabled) {
      $(id)[0].slider_enable(false)
    }

    return $(id)[0]
  }

  var attach_bodily_functions = function() {
    $('body').on('mousemove', function(event) {
      if (current_object && mouse_state == 'down') {
        var delta = event.pageX - mouse_init_x

        if (is_at_end(current_object)) {
          var container = current_object.parent().parent()[0]
          var fpos = current_object.parent().width() - current_object.width()

          current_object.css('margin-left', fpos + 'px')

          if (!callback_executed) {
            callback_executed = true
            try {
              container.func_slid().then(x => container.func_done(x))
            } catch(err) {}
          }
        } else {
          var fpos = current_object.parent().width() - current_object.width()
          if (delta > fpos) {
            current_object.css('margin-left', fpos + 'px')
          } else {
            current_object.css('margin-left', (delta < -1 ? -1 : delta) + 'px')
          }
        }
      }
    })

    $('body').on('mouseup', function(event) {
      if (current_object && mouse_state == 'down') {
        mouse_state = 'up'

        if (!is_at_end(current_object)) {
          current_object.trigger('slider-unslid')
          unslide(current_object)
        }

        callback_executed = false
        current_object = null
      }
    })
  }

  var attach_drag = function() {
    var $this = $(this)
    $(this).on('mousedown', function(event) {
      if (mouse_state == 'up' && !$this.hasClass('disabled')) {
        mouse_init_x = event.pageX
        mouse_state = 'down' 
        current_object = $this 
      }
    })

    return $this
  }

  var unslide = function(el) {
    //el.css('margin-left', -1 + 'px')
    el.animate({
      marginLeft: -1
    }, 125)

    switch_state_to(el.parent().parent(), 'idle')
    callback_executed = false

  }

  var switch_state_to = function(el, target) {
    var sub_el = el.find('.slide-text')
    var el = el.find('.slide-to-unlock-parent')

    switch(target) {
      case 'idle': 
        sub_el.text(sub_el.attr('data-idle'))
        el.css('background-color', el.attr('data-bg-idle'))
        el.attr('data-executed', false)
        sub_el.css('color', el.attr('data-color-idle')) 
        break
      case 'slid':
        sub_el.text(sub_el.attr('data-slid'))
        el.css('background-color', el.attr('data-bg-slid'))
        sub_el.css('color', el.attr('data-color-slid')) 
        break
      case 'done': 
        sub_el.text(sub_el.attr('data-done'))
        el.css('background-color', el.attr('data-bg-done'))
        sub_el.css('color', el.attr('data-color-done')) 
        break
      case 'disabled':
        sub_el.text(sub_el.attr('data-disabled'))
        el.css('background-color', el.attr('data-bg-disabled'))
        el.attr('data-executed', false)
        sub_el.css('color', el.attr('data-color-disabled')) 
        break
    }
  }

  var slider_enable = function(el, val) {
    var slideable = el.find('.slideable')
    if (!val) {
      unslide(slideable)
      slideable.addClass('disabled')
      switch_state_to(el, 'disabled')
      el.trigger('slider-disabled')
    } else {
      slideable.removeClass('disabled')
      switch_state_to(el, 'idle')
      el.trigger('slider-enabled')
    }

    slideable.attr('data-is-enabled', val)
  }

  var is_at_end = function(el) {
    var comb = parseInt(el.css('margin-left')) + el.width()
    var max_width = el.parent().width()
    return comb >= max_width
  }

  return {
    init: init
  }
}()