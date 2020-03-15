import { InfluxDB, IPoint } from 'influx'
import MerossCloud, {
  GetControlElectricityResponse, MerossCloudDevice, MerossMessage, TimeoutError,
} from 'meross-cloud'

import config from './config'

const influx = new InfluxDB(config.influxConfig)
const meross = new MerossCloud(config.merossConfig)

interface ElectricityReading {
  current: number
  voltage: number
  power: number
}

type ElectricityMessage = MerossMessage<GetControlElectricityResponse>

const readElectricity = (msg: ElectricityMessage): ElectricityReading => {
  const { current, voltage, power } = msg.payload
  return {
    current: current / 10000,
    voltage: voltage / 10,
    power: power / 1000,
  }
}

// spread function calls over time
function spreadFunctionCalls (calls: Function[], maxTime = 5000): void {
  const delayEach = Math.floor(maxTime / calls.length)

  calls.forEach((fnCall, idx) => setTimeout(() => fnCall(), idx * delayEach))
}

async function pollSingleAndPublish (device: MerossCloudDevice, influxMeasurement: string) {
  let merossMeasurement: ElectricityMessage
  try {
    merossMeasurement = await device.getControlElectricity()
  } catch (err) {
    if (err instanceof TimeoutError) {
      return console.error(`Timeout on ${device.dev.devName} request`)
    }
    return console.error('Error occurred', err)
  }
  const electricity = readElectricity(merossMeasurement)
  const point: IPoint = {
    tags: { device: device.dev.devName },
    fields: electricity,
  }

  try {
    await influx.writeMeasurement(influxMeasurement, [point])
  } catch (err) {
    return console.error('Write on database failed', err)
  }
}

async function main () {
  const { measurement } = config.influxOptions
  const deviceList = await meross.connect()
  console.log('meross connected')

  // prepares polling functions and executes them spreading out in time
  spreadFunctionCalls(deviceList.map(device => () => void pollSingleAndPublish(device, measurement)))

  setInterval(() =>
    spreadFunctionCalls(deviceList.map(device => () => void pollSingleAndPublish(device, measurement)))
  , 10000)
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
