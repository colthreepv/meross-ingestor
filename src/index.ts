import MerossCloud, {
  GetControlElectricityResponse, GetControlPowerConsumptionXResponse, MerossCloudDevice,
} from 'meross-cloud'

const options = {
  email: process.env.MEROSS_EMAIL!,
  password: process.env.MEROSS_PASSWORD!,
}

const readTimeStamp = (time) => new Date(time * 1000)
const readConsumptionX = (res: GetControlPowerConsumptionXResponse) => {
  if (res.consumptionx == null) return
  if (Array.isArray(res.consumptionx) === false) return
  if (res.consumptionx.length !== 1) return
  const reading = res.consumptionx[0]

  return {
    date: readTimeStamp(reading.time),
    value: reading.value,
  }
}

const readElectricity = (res: GetControlElectricityResponse) => {
  if (res.electricity == null) return
  const { current, voltage, power } = res.electricity
  return {
    current: current / 10000,
    voltage: voltage / 10,
    power: power / 1000,
  }
}

async function printConsumption (device: MerossCloudDevice) {
  const [consumption, electricity] = await Promise.all([
    device.getControlPowerConsumptionX(),
    device.getControlElectricity(),
  ])
  console.log(device.dev.devName, 'electricity', readElectricity(electricity))
  console.log(device.dev.devName, 'consumption', readConsumptionX(consumption))
}

async function main () {
  const meross = new MerossCloud(options)
  const deviceList = await meross.connect()
  console.log('meross connected')
  // const firstDevice = deviceList[0]
  // printConsumption(firstDevice)

  // firstDevice.on('connected', () => printConsumption(firstDevice))
  // setInterval(() => printConsumption(firstDevice), 10 * 1000)

  deviceList.forEach(printConsumption)
  setInterval(() => deviceList.forEach(printConsumption), 10 * 1000)
}

try {
  main()
} catch (err) {
  console.error('Error happened', err)
  process.exit(1)
}

process.on('unhandledRejection', function(reason, p){
  console.log("Possibly Unhandled Rejection at: Promise ", p, " reason: ", reason);
  // application specific logging here
});
