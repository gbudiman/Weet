var block_explorer = function() {
  const fetch_amount = 3
  var infura_key
  var contract_address
  var web3
  var contract
  var earliest
  var table
  var refresh
  var user_lut

  var init = function(_skip_fetch) {
    let skip_fetch = _skip_fetch == undefined ? false : _skip_fetch
    table = $('#content')
    refresh = $('#refresh')
    earliest = -1
    user_lut = {}

    $.ajax({
      url: '/contract_meta',
      method: 'GET'
    }).done(res => {
      infura_key = res.infura_key
      contract_address = res.contract_address
      web3 = new Web3(new Web3.providers.HttpProvider('https://ropsten.infura.io/' + infura_key))

      attach_refresh()
      attach_fetch_more()

      $.ajax({
        url: '/abi',
        method: 'GET'
      }).done(abi => {
        contract = new web3.eth.Contract(abi, contract_address)

        if (!skip_fetch) {
          fetch()
        }
      })
    })
    
  }

  var attach_refresh = function() {
    refresh.on('click', function() {
      table.empty()
      earliest = -1
      user_lut = {}
      fetch()
    })
  }

  var attach_fetch_more = function() {
    $('#load-more').on('click', function() {
      fetch()
    })
  }

  var fetch = function() {
    let id = earliest
    if (id == -1) {

      contract.methods.weet_count().call().then(n => {
        earliest = n
        fetch_from(n - 1)
      })
    } else {
      fetch_from(id - 1)
    }
  }

  var get_weet = function(id) {
    return new Promise((resolve, reject) => {
      contract.methods.get_weet(id).call().then(a => {
        resolve(a)
      })
    })
  }

  var fetch_from = async function(n) {
    set_button_state('is_fetching')
    let min_id = Math.max(0, n - fetch_amount + 1)
    let promises = {}

    
    if (n < 0) {
      set_button_state('end_of_content')
      return
    }

    for (let i = n; i >= min_id; i--) {
      table
        .append('<tr data-iteration=' + i + '>'
              +   '<td class="date">...</td>'
              +   '<td class="time"></td>'
              +   '<td class="weeter-id"><span class="text-id" /> <span class="text-name" /></td>'
              +   '<td class="content"></td>'
              +   '<td class="state"></td>'
              + '</tr>')
      promises[i] = true
      earliest = earliest - 1

      contract.methods.weets(i).call().then(id => {
        table.find('[data-iteration=' + i + ']').attr('data-id', id)

        contract.methods.get_weet(parseInt(id)).call().then(a => {
          let row = table.find('[data-id=' + id + ']')
          let xi = parseInt(row.attr('data-iteration'))
          let t = moment(parseInt(a[2]) * 1000).toDate()
          let user_id = a[1]
          row.find('.date').text(t.toLocaleDateString())
          row.find('.time').text(t.toLocaleTimeString())
          row.find('.weeter-id').attr('data-weeter-id', user_id)
          row.find('.weeter-id').find('.text-id').text(user_id)
          row.find('.content').text(a[3])

          let l = user_lut[user_id]
          if (l == undefined) {
            user_lut[user_id] = undefined
          } else {
            row.find('.weeter-id').find('.text-name').text(lut)
          }

          let state = row.find('.state')

          if (a[4] == true) {
            if (a[5] == true) {
              
              state.text('Published')
              state.addClass('published')
            } else {
              state.text('Rejected')
              state.addClass('rejected')
            }
          } else {
            state.text('Pending...')
          }

          delete promises[xi]
          if (Object.keys(promises).length == 0) {
            populate_lut()
            if (n - fetch_amount < 0) {
              set_button_state('end_of_content')
            } else {
              set_button_state('available')
            }
          } 
        })
      })
    }
  }

  var populate_lut = function() {
    let a = new Array()
    console.log(user_lut)
    $.each(user_lut, (k, v) => {
      if (v == null) {
        a.push(k)
      }
    })

    $.ajax({
      url: '/weeter_names',
      method: 'GET',
      data: {
        ids: a
      }
    }).done(res => {
      res.forEach(x => {
        let id = x.id
        let name = x.name

        let r = table.find('[data-weeter-id=' + x.id + ']')
        r.find('.text-name').text(x.name)
      })
    })
  }

  var set_button_state = function(state) {
    let button = $('#load-more')

    switch(state) {
      case 'is_fetching': button.prop('disabled', true).text('Fetching...'); break
      case 'end_of_content': button.prop('disabled', true).text('End Of Chain'); break
      case 'available': button.prop('disabled', false).text('Load next ' + fetch_amount + ' events'); break
    }
  }

  var validate_checksum = function(id, weeter_id, timestamp, content) {
    return new Promise((resolve, reject) => {
      contract.methods.validate_weet(id, weeter_id, timestamp, content).call().then(n => {
        resolve(n)
      })
    })
    
  }

  return {
    init: init,
    validate_checksum: validate_checksum,
    get_weet: get_weet
  }
}()