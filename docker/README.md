# How to build

Build docker image
```shell
docker build -t meross-ingestor:test -f docker/Dockerfile .
```

Create an env file to test your built image, like the following one:  
**.env.docker**:
```ini
INFLUX_USERNAME=username
INFLUX_PASSWORD=password
INFLUX_HOST=hostname
INFLUX_PORT=8086
INFLUX_PROTOCOL=http
INFLUX_DATABASE=database
MEROSS_EMAIL=user@name.com
MEROSS_PASSWORD=password
```

# Test built image
```shell
docker run --rm --env-file <env-file> meross-ingestor:test
```
