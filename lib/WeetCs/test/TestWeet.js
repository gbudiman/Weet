var WeetFactory = artifacts.require('WeetFactory')

contract('WeetFactory', async(accounts) => {
  let admin = accounts[0]
  let dummy = accounts[1]
  let instance

  beforeEach('setup contract before each test', async() => {
    instance = await WeetFactory.deployed()
  })

  it('should have proper admin', async() => {
    assert.equal(await instance.address_admin.call(), admin)
  })

  it('should block weet upload from non-admin', async() => {
    try {
      await instance.upload_weet(50, 35, 15314, 'junk', { from: dummy })
      assert.fail('Expecting rejection because non-admin')
    } catch(error) {
      assert(true)
    }
  })

  contract('chain manipulation', async() => {
    let weets = [
      { weet_id: 1751, weeter_id: 3, timestamp: parseInt(Date.now() / 1000), weet: 'hello world'},
      { weet_id: 1752, weeter_id: 4, timestamp: parseInt(Date.now() / 1000), weet: 'hello blockchain'},
      { weet_id: 1580, weeter_id: 4, timestamp: parseInt(Date.now() / 1000), weet: '你好， 世界'},
    ]

    let extra_weet = [
      { weet_id: 1581, weeter_id: 4, timestamp: parseInt(Date.now() / 1000), weet: 'Aloha'},
    ]

    before(async() => {
      let weet_count = 0
      for (const weet of weets) {
        await instance.upload_weet(weet.weet_id, weet.weeter_id, weet.timestamp, weet.weet, { from: admin })
        assert(await instance.weet_count.call(), weet_count)
        assert(await instance.weets.call(weet_count), weet.weet_id)
        weet_count++
      }
    })
    
    it('should retrieve weets correctly', async() => {
      for (const weet of weets) {
        let r = await instance.get_weet.call(weet.weet_id, { from: dummy })
        let cs = await instance.validate_weet.call(weet.weet_id, weet.weeter_id, weet.timestamp, weet.weet, { from: dummy })
        let content = r[3]
        let is_published = r[4]
        assert.equal(content, weet.weet)
        assert(cs)
        assert(!is_published)
      }
    })

    it('should retrieve number of weets correctly', async() => {
      let count = 0
      let weeter_id = 4

      weets.map(x => count = count + (x.weeter_id == weeter_id ? 1 : 0))
      let weeter_count = await instance.weeter_stat.call(weeter_id)
      assert(count, weeter_count)
    })

    it('should not overwrite weet content', async() => {
      let weet = weets[0]
      let original = weet.weet
      let corrupted = 'corrupted message'

      try {
        await instance.upload_weet(weet.weet_id, weet.weeter_id, weet.timestamp, corrupted, { from: admin })
        assert.fail('Expection rejection of weet modification')
      } catch(error) {
        let rt = await instance.get_weet.call(weet.weet_id, { from: dummy })
        assert.equal(rt[3], original)
      }

      let rt = await instance.get_weet.call(weet.weet_id)
      assert(await rt[3], original)
    })

    it('should publish weet correctly', async() => {
      let weet = weets[0]
      await instance.publish_weet(weet.weet_id, weet.weeter_id, weet.timestamp, weet.weet, { from: admin })

      let cweet = await instance.get_weet.call(weet.weet_id)
      let is_published = cweet[4]
      assert(is_published)
    })

    it('should reject publishing from non-admin', async() => {
      let weet = extra_weet[0]

      try {
        await instance.publish_weet(weet.weet_id, weet.weeter_id, weet.timestamp, weet.weet, { from: dummy })
        assert.fail('Expecting rejection due to non-admin')
      } catch(error) {

      }

      let cweet = await instance.get_weet.call(weet.weet_id)
      let is_published = cweet[4]
      assert(!is_published)
    })

    it('should reject publishing corrupted weet', async() => {
      let weet = weets[1]
      weet.weet = 'garbled'

      try {
        await instance.publish_weet(weet.weet_id, weet.weeter_id, weet.timestamp, weet.weet, { from: admin })
        assert.fail('Expecting rejection due to non-admin')
      } catch(error) {
        let rt = await instance.get_weet.call(weet.weet_id)
        let published = rt[4]
        assert(!published)
      }

      let cweet = await instance.get_weet.call(weet.weet_id)
      let is_published = cweet[4]
      assert(!is_published)
    })
  })
})