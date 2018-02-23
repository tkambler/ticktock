# TickTock

TickTock runs scheduled tasks within your Docker containers. Tasks can be executed within existing containers or run within new containers that are created for each cycle and subsequently removed. TickTock includes built-in support for sending task notifications via email.

## Sample docker-compose.yml

````
version: '3.4'

services:

  ticktock:
    image: tkambler/ticktock
    volumes:
      - ./example/config.yml:/config.yml
      - /var/run/docker.sock:/var/run/docker.sock
    userns_mode: "host"
````

## Sample Configuration File

A configuration file like the one shown below must be mountained into the container at `/config.yml`.

```
tasks:
  - title: Do Something
    description: It does something very important.
    interval: every 10 seconds
    type: run
    image: mhart/alpine-node:8.6.0
    command: ["ls", "-al"]
    overlap: false
    enabled: false
  - title: List running processes
    description: It lists running processes.
    interval: every 10 seconds
    type: exec
    container: container1
    command: ["ps", "aux"]
    overlap: false
    enabled: true
    email:
      - foo@localhost.site
      - herp@derp.com
email:
  smtp:
    from_name: TickTock
    from_email: ticktock@localhost.site
    config:
      host: maildev
      port: 25
      secure: false
      tls:
        secure: false
        ignoreTLS: true
        rejectUnauthorized: false
```

## Executing Tasks on Demand

Create a terminal session with the running TickTock container and run the script as shown below. You will be presented with a list of available tasks. Make a selection, and it will be immediately executed.

```
$ docker-compose exec ticktock sh
$ ./execute
````