var block_explorer = function() {
  const infura_key = '6647daa5d5b541958f75ef76dd670221'
  const contract_address = '0x270217dba3d133c09483528753a39136ea848c7d'
  const fetch_amount = 5
  var web3

  var contract = null
  var earliest
  var table
  var refresh

  var init = function() {
    web3 = new Web3(new Web3.providers.HttpProvider('https://ropsten.infura.io/' + infura_key))
    table = $('#content')
    refresh = $('#refresh')
    earliest = -1

    attach_refresh()
    attach_fetch_more()

    $.ajax({
      url: '/abi',
      method: 'GET'
    }).done(abi => {
      contract = new web3.eth.Contract(abi, contract_address)

      fetch()
    })
  }

  var attach_refresh = function() {
    refresh.on('click', function() {
      table.empty()
      earliest = -1
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

  var fetch_from = async function(n) {
    set_button_state('is_fetching')
    let min_id = Math.max(0, n - fetch_amount + 1)
    let promises = {}

    console.log(n + '->' + min_id)
    if (n < 0) {
      set_button_state('end_of_content')
      return
    }

    for (let i = n; i >= min_id; i--) {
      table
        .append('<tr data-iteration=' + i + '>'
              +   '<td class="timestamp"></td>'
              +   '<td class="weeter-id"></td>'
              +   '<td class="content"></td>'
              +   '<td class="state"></td>'
              + '</tr>')
      promises[i] = true
      earliest = earliest - 1

      contract.methods.weets(i).call().then(id => {
        table.find('[data-iteration=' + i + ']').attr('data-id', id)

        contract.methods.get_weet(parseInt(id)).call().then(a => {
          console.log(a)
          let row = table.find('[data-id=' + id + ']')
          let xi = parseInt(row.attr('data-iteration'))
          row.find('.timestamp').text(moment(parseInt(a[2]) * 1000).toDate().toLocaleString())
          row.find('.weeter-id').text(a[1])
          row.find('.content').text(a[3])

          if (a[4] == true) {
            let state = row.find('.state')
            state.text('Published')
            state.addClass('published')
          }

          delete promises[xi]
          if (Object.keys(promises).length == 0) {
            
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

  var set_button_state = function(state) {
    let button = $('#load-more')

    switch(state) {
      case 'is_fetching': button.prop('disabled', true).text('Fetching...'); break
      case 'end_of_content': button.prop('disabled', true).text('End Of Chain'); break
      case 'available': button.prop('disabled', false).text('Load next ' + fetch_amount + ' events'); break
    }
  }

  var validate_checksum = function(id, weeter_id, timestamp, content) {
    contract.methods.validate_weet(id, weeter_id, timestamp, content).call().then(n => {

      console.log(n)
    })
  }

  return {
    init: init,
    validate_checksum: validate_checksum
  }
}()