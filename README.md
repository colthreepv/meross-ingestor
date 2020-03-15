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
  colthreepv/meross-ingestor:v1.0.0
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
