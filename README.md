# meross-ingestor
Will get your Electricity data from Meross Smartplug(s) to influxdb  
Available on Docker Hub: [colthreepv/meross-ingestor][dockerhub]

Start with docker:
```
docker run --name meross-ingestor \
  -e INFLUX_HOST=hostname \
  -e INFLUX_PORT=8086 \
  -e INFLUX_DATABASE=database \
  -e MEROSS_EMAIL=user@name.com \
  -e MEROSS_PASSWORD=yourpassword \
  colthreepv/meross-ingestor:v1.0.1
```

[dockerhub]: https://hub.docker.com/r/colthreepv/meross-ingestor

# Complete list of Environment Variables

- INFLUX_USERNAME
- INFLUX_PASSWORD
- ⚠️ INFLUX_HOST
- INFLUX_PORT
- INFLUX_PROTOCOL (`http` or `https`)
- ⚠️INFLUX_DATABASE

- ⚠️MEROSS_EMAIL
- ⚠️MEROSS_PASSWORD

Variables marked with ⚠️ are required

# Pre-requisites
The Influx database needs to be created before captured data can be sent to it.
If you are not sending your data to an existing Influx database, this can be done most easily via the CLI. 
Execute the `influx` command to get an interactive prompt

```
root@72ee790882b5:/# influx
Connected to http://localhost:8086 version 1.8.4
InfluxDB shell version: 1.8.4
>
```

Verify you have admin privs on the Influx server

```
> show users
user admin
---- -----
root true
```

Create the database. You can change parameters if you wish, or accept the defaults by simply entering
```
> create database meross
```
where meross can be replaced with the name of the database you wish to create to capture your data. 
Enter this name as the database in your `-e INFLUX_DATABASE=database` docker instantiation.

# Changelog
## [1.3.0] - 2021-04-18
### Changed
- Using [meross-cloud-ts](meross-cloud-ts) now as underlying library

[meross-cloud-ts]: https://www.npmjs.com/package/meross-cloud-ts

## [1.2.1] - 2020-06-14
### Changed
- Better TIMEOUT threshold calculation, based on previous occurrences

## [1.2.0] - 2020-06-13
### Added
- Devices gets blacklisted after 10 timeouts
- Device list gets updated ever 1 hour
- Print TIMEOUT information every few timeouts (5)
