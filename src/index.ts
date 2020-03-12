import MerossCloud, {
  GetControlElectricityResponse, GetControlPowerConsumptionXResponse, MerossCloudDevice,
} from 'meross-cloud'

// import { promisify } from 'util'

const options = {
  email: process.env.MEROSS_EMAIL!,
  password: process.env.MEROSS_PASSWORD!,
}

const meross = new MerossCloud(options)

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

meross.on('deviceInitialized', (deviceId, deviceDef, device) => {
  console.log('New device ' + deviceId + ': ' + JSON.stringify(deviceDef))

  function printConsumption (device: MerossCloudDevice) {
    // console.log('device', device)
    // device.getControlPowerConsumptionX((err, res) => console.log('Consumption', readConsumptionX(res)))
    device.getControlElectricity((err, res) => console.log(deviceDef.devName, 'electricity', readElectricity(res)))
    console.log('--------------')
  }

  device.on('connected', () => {
    // device.getSystemAbilities((err, res) => console.log(deviceDef, 'Abilities: ' + JSON.stringify(res, null, 2)))

    printConsumption(device)
    setInterval(() => printConsumption(device), 10 * 1000)
  })
})

meross.connect((error) => {
  console.log('connect error: ' + error)
})

// meross.on('connected', (deviceId) => {
//   console.log(deviceId + ' connected');
// });

// meross.on('close', (deviceId, error) => {
//   console.log(deviceId + ' closed: ' + error);
// });

// meross.on('error', (deviceId, error) => {
//   console.log(deviceId + ' error: ' + error);
// });

// meross.on('reconnect', (deviceId) => {
//   console.log(deviceId + ' reconnected');
// });

// meross.on('data', (deviceId, payload) => {
//   console.log(deviceId + ' data: ' + JSON.stringify(payload));
// });


