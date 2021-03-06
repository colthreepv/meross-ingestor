import { MerossCloud, MerossCloudDevice } from 'meross-cloud-ts'

import { adjustTimeoutsThreshold, cleanDevices, resetBlackList } from './blacklist'
import config from './config'
import { pollSingleAndPublish, spreadFunctionCalls } from './meross'

const meross = new MerossCloud(config.merossConfig)

const RELOAD_DEVICES_AFTER = 360 // every 1 hour

// prepares polling functions and executes them spreading out in time
const operation = (devices: MerossCloudDevice[], measurement: string) =>
  spreadFunctionCalls(devices.map(device => () => void pollSingleAndPublish(device, measurement)))

async function main () {
  const { measurement } = config.influxOptions
  let intervalCounter = 0
  let deviceList = await meross.connect()
  adjustTimeoutsThreshold(deviceList.length)
  console.log(`meross connected, found ${deviceList.length} devices`)

  operation(deviceList, measurement)

  const onInterval = async () => {
    intervalCounter++
    if (intervalCounter > RELOAD_DEVICES_AFTER) {
      meross.disconnectAll(true)
      deviceList = await meross.getDeviceList()
      console.log(`updated devices list, found ${deviceList.length} devices`)
      intervalCounter = 0
      resetBlackList()
    } else {
      deviceList = cleanDevices(deviceList)
    }
    adjustTimeoutsThreshold(deviceList.length)
    operation(deviceList, measurement)
  }

  setInterval(() => void onInterval(), 10000)
}

try {
  void main()
} catch (err) {
  console.error('Error happened', err)
  process.exit(1)
}

process.on('unhandledRejection', function (reason, p) {
  console.log('Possibly Unhandled Rejection at: Promise ', p, ' reason: ', reason)
  // application specific logging here
})
