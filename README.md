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

Variables marked with `⚠️` are required


# Changelog
## [1.2.0] - 2020-06-13
### Added
- Devices gets blacklisted after 10 timeouts
- Device list gets updated ever 1 hour
- Print TIMEOUT information every few timeouts (5)

## [1.2.1] - 2020-06-14
### Changed
- Better TIMEOUT threshold calculation, based on previous occurrences
