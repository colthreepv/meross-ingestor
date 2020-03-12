const MerossCloud = require('meross-cloud')

const options = {
  email: process.env.MEROSS_EMAIL,
  password: process.env.MEROSS_PASSWORD,
}

const meross = new MerossCloud(options)

const readTimeStamp = (time) => new Date(time * 1000)
const readConsumptionX = (res) => {
  if (res.consumptionx == null) return
  if (Array.isArray(res.consumptionx) === false) return
  if (res.consumptionx.length !== 1) return
  const reading = res.consumptionx[0]

  return {
    date: readTimeStamp(reading.time),
    value: reading.value,
  }
}

const readElectricity = (res) => {
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

  function printConsumption (device) {
    device.getControlPowerConsumptionX((err, res) => console.log('Consumption', readConsumptionX(res)))
    device.getControlElectricity((err, res) => console.log('Electricity', readElectricity(res)))
  }

  device.on('connected', () => {
    device.getSystemAbilities((err, res) => console.log('Abilities: ' + JSON.stringify(res, null, 2)))

    printConsumption(device)
    setInterval(() => printConsumption(device), 10 * 1000)
  })
})
