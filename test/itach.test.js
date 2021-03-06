const test = require('ava')
const sinon = require('sinon')
const itach = require('../')

test.cb.beforeEach(t => {
  itach.setOptions({
    host: '10.0.0.2',
    port: 4998,
    reconnect: true,
    reconnectSleep: 1000,
    sendTimeout: 500,
    retryInterval: 99,
    connectionTimeout: 3000
  })
  t.deepEqual(itach.eventNames(), [])
  itach.on('error', console.log)
  t.end()
})

test.cb.afterEach(t => {
  itach.close({ reconnect: false })
  setTimeout(() => {
    itach.removeAllListeners()
    t.end()
  }, 1000)
})

test.serial.cb('can connect to itach device', t => {
  t.plan(1)

  const connectFunc = sinon.spy()

  itach.on('connect', connectFunc)

  itach.connect()

  setTimeout(() => {
    t.is(connectFunc.callCount, 1)
    t.end()
  }, 3000)
})

test.serial.cb('connection times out', t => {
  t.plan(3)

  const connectFunc = sinon.spy()
  const errorFunc = sinon.spy()

  itach.on('connect', connectFunc)
  itach.on('error', errorFunc)

  itach.connect({ connectionTimeout: 10 })

  setTimeout(() => {
    t.is(connectFunc.callCount, 0)
    t.is(errorFunc.callCount, 1)
    t.is(errorFunc.getCall(0).args[0].message, 'Connection timeout.')
    t.end()
  }, 3000)
})

test.serial.cb('sending sendir commands', t => {
  t.plan(1)

  itach.connect()

  itach.on('connect', async () => {
    const result = await itach.send('sendir,1:1,1,38400,1,1,347,173,22,22,22,65,22,22,22,22,22,65,22,22,22,22,22,22,22,22,22,22,22,65,22,22,22,65,22,65,22,22,22,22,22,22,22,22,22,65,22,22,22,22,22,22,22,22,22,22,22,65,22,65,22,22,22,65,22,65,22,65,22,65,22,65,22,1657')
    t.is(result, 'completeir,1:1,1')
    t.end()
  })
})

test.serial.cb('error when sending invalid sendir commands', t => {
  t.plan(2)

  itach.connect()

  itach.on('connect', async () => {
    const error = await t.throws(itach.send('sendir:'), Error)
    t.is(error.message, 'Invalid command. Command not found.')
    t.end()
  })
})

test.serial.cb('error when sendtimeout reached', t => {
  t.plan(2)

  itach.connect({ sendTimeout: 10 })

  itach.on('connect', async () => {
    const error = await t.throws(itach.send('getdevices'), Error)
    t.is(error.message, 'QueueTaskTimeout: Task failed to complete before timeout was reached.')
    t.end()
  })
})
