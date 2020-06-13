import AsciiTable from 'ascii-table'
import { MerossCloudDevice } from 'meross-cloud'

interface TimeoutRecap {
  name: string
  amount: number
}

const MAX_TIMEOUTS = 10
const blacklist: Map<string, number> = new Map()

const overallTimeouts: Map<string, TimeoutRecap> = new Map()
let TIMEOUT_THRESHOLD = 5
let timeoutsSinceAdjust = 0
let timeoutsCounter = 0

export function cleanDevices (devices: MerossCloudDevice[]): MerossCloudDevice[] {
  const toRemove = devices
    .map(device => device.dev.uuid)
    .filter(uuid => blacklist.has(uuid))
    .filter(uuid => {
      const amount = Number(blacklist.get(uuid))
      if (amount >= MAX_TIMEOUTS) return true
      return false
    })

  if (toRemove.length === 0) return devices
  return devices.filter(device => {
    if (toRemove.includes(device.dev.uuid)) {
      console.log(`Removing device ${device.dev.devName} after ${MAX_TIMEOUTS} timeouts`)
      return false
    }
    return true
  })
}

export function deviceDidTimeout (device: MerossCloudDevice) {
  const { devName, uuid } = device.dev
  const amount = blacklist.has(uuid) ? Number(blacklist.get(uuid)) + 1 : 1
  const totalAmount = overallTimeouts.has(uuid) ? Number(overallTimeouts.get(uuid)?.amount) + 1 : 1
  blacklist.set(uuid, amount)
  overallTimeouts.set(uuid, { name: devName, amount: totalAmount })

  // Prints timeout information every TIMEOUT_THRESHOLD times
  timeoutsCounter++
  timeoutsSinceAdjust++
  if (timeoutsCounter > TIMEOUT_THRESHOLD) {
    timeoutsCounter = 0
    const table = new AsciiTable('Overall TIMEOUT events')
    table.setHeading('Name', 'TIMEOUT(s)')
    for (const [, timeoutRecap] of overallTimeouts.entries()) {
      table.addRow(timeoutRecap.name, timeoutRecap.amount)
    }
    console.log(table.toString())
  }
}

export function deviceDidRespond (device: MerossCloudDevice) {
  const { uuid } = device.dev
  blacklist.delete(uuid)
}

function adjustThreshold (deviceAmount: number, errorsAmount: number) {
  // timeouts: 0, devices: 10 => 15
  // timeouts: 15, devices: 10 => Math.floor(devices * 1.5) + Math.floor(devices * (timeouts / 10)) ::: 30
  return Math.floor(deviceAmount * 1.5) + Math.floor(deviceAmount * (errorsAmount / 10))
}

export function adjustTimeoutsThreshold (deviceAmount: number): void {
  const newThreshold = adjustThreshold(deviceAmount, timeoutsSinceAdjust)
  TIMEOUT_THRESHOLD = newThreshold
  timeoutsSinceAdjust = 0
}
