import { InfluxDB, IPoint } from 'influx'
import { ElectricityResponse, MerossCloudDevice, MerossMessage, TimeoutError } from 'meross-cloud'

import { deviceDidRespond, deviceDidTimeout } from './blacklist'
import config from './config'

const influx = new InfluxDB(config.influxConfig)

interface ElectricityReading {
  current: number
  voltage: number
  power: number
}

type ElectricityMessage = MerossMessage<ElectricityResponse>

const readElectricity = (msg: ElectricityMessage): ElectricityReading => {
  const { current, voltage, power } = msg.payload
  return {
    current: current / 10000,
    voltage: voltage / 10,
    power: power / 1000,
  }
}

// spread function calls over time
export function spreadFunctionCalls (calls: Function[], maxTime = 5000): void {
  const delayEach = Math.floor(maxTime / calls.length)

  calls.forEach((fnCall, idx) => setTimeout(() => fnCall(), idx * delayEach))
}

export async function pollSingleAndPublish (device: MerossCloudDevice, influxMeasurement: string): Promise<void> {
  let merossMeasurement: ElectricityMessage
  try {
    merossMeasurement = await device.getControlElectricity()
  } catch (err) {
    if (err instanceof TimeoutError) return deviceDidTimeout(device)
    return console.error('Error occurred', err)
  }

  deviceDidRespond(device)
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
