import { config } from 'dotenv'
import { ISingleHostConfig } from 'influx'
import { CloudOptions } from 'meross-cloud'

export type APP_ENV = 'development' | 'production' | 'test'
export type DB_CHOICE = 'influx'

const ENV = process.env.NODE_ENV === 'production' ? 'production' : (process.env.NODE_ENV ?? 'development') as APP_ENV
// use of file .env.environment file **only** outside production
if (ENV !== 'production') config({ path: `.env.${ENV}` })

export function isEmpty (value: any): boolean {
  if (value === undefined) return true
  if (value === null) return true
  if (typeof value === 'string' && value === '') return true
  return false
}

const influxConfig: ISingleHostConfig = {}
;[
  { env: 'INFLUX_USERNAME', key: 'username' },
  { env: 'INFLUX_PASSWORD', key: 'password' },
  { env: 'INFLUX_HOST', key: 'host' },
  { env: 'INFLUX_PORT', key: 'port' },
  { env: 'INFLUX_PROTOCOL', key: 'protocol' },
  { env: 'INFLUX_DATABASE', key: 'database' },
].forEach(({ env, key }) => {
  if (!isEmpty(process.env[env])) influxConfig[key] = process.env[env]
})

const merossConfig: CloudOptions = {
  email: process.env.MEROSS_EMAIL!,
  password: process.env.MEROSS_PASSWORD!,
}

export default {
  merossConfig,
  whichDb: 'influx' as DB_CHOICE,
  influxConfig,
  influxOptions: {
    measurement: process.env.INFLUX_MEASUREMENT ?? 'meross',
  },
}
