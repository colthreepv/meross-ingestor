import { InfluxDB, IPoint } from 'influx'
import MerossCloud, { GetControlElectricityResponse, MerossCloudDevice } from 'meross-cloud'

import config from './config'

const influx = new InfluxDB(config.influxConfig)
const meross = new MerossCloud(config.merossConfig)

interface ElectricityReading {
  current: number
  voltage: number
  power: number
}

const readElectricity = (res: GetControlElectricityResponse): ElectricityReading => {
  const { current, voltage, power } = res.electricity
  return {
    current: current / 10000,
    voltage: voltage / 10,
    power: power / 1000,
  }
}

async function printConsumption (device: MerossCloudDevice) {
  const electricity = await device.getControlElectricity()
  console.log(device.dev.devName, 'electricity', readElectricity(electricity))
}

async function logError (promise: Promise<void>): Promise<void> {
  try {
    await promise
  } catch (err) {
    console.error('Error occurred', err)
  }
}

async function pollAndPublish (devices: MerossCloudDevice[], influxMeasurement: string) {
  const merossMeasurements = await Promise.all(devices.map(async device => device.getControlElectricity()))
  const measurements = devices
    .map((device, idx) => ({ dev: device.dev, res: merossMeasurements[idx] }))
    .filter(({ dev, res }) => res.electricity != null)
    .map(({ dev, res }) => ({ dev, electricity: readElectricity(res) }))
    .map(({ dev, electricity }): IPoint => ({
      tags: { device: dev.devName },
      fields: electricity,
    }))

  return influx.writeMeasurement(influxMeasurement, measurements)
}

async function main () {
  const { measurement } = config.influxOptions
  const deviceList = await meross.connect()
  console.log('meross connected')

  await logError(pollAndPublish(deviceList, measurement))
  setInterval(() => void logError(pollAndPublish(deviceList, measurement)), 10000)
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
