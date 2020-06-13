import AsciiTable from 'ascii-table'
import { MerossCloudDevice } from 'meross-cloud'

interface TimeoutRecap {
  name: string
  amount: number
}

const MAX_TIMEOUTS = 10
const blacklist: Map<string, number> = new Map()

const overallTimeouts: Map<string, TimeoutRecap> = new Map()
const TIMEOUT_THRESHOLD = 5
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
  if (timeoutsCounter > TIMEOUT_THRESHOLD) {
    timeoutsCounter = 0
    const table = new AsciiTable('Overall TIMEOUT events')
    table.setHeading('Name', 'TIMEOUT(s)')
    for (const [_, timeoutRecap] of overallTimeouts.entries()) {
      table.addRow(timeoutRecap.name, timeoutRecap.amount)
    }
    console.log(table.toString())
  }
}

export function deviceDidRespond (device: MerossCloudDevice) {
  const { uuid } = device.dev
  blacklist.delete(uuid)
}
