# node-red-contrib-cotejs
Cote nodes for Node Red.

Cote lets you write zero-configuration microservices in Node.js without nginx, haproxy, redis, rabbitmq or anything else. It is batteries — and chargers! — included.

## Features
- **Zero dependency:** Microservices with only JavaScript and Node.js and NodeRED
- **Zero-configuration:** no IP addresses, no ports, no routing to configure
- **Decentralized:** No fixed parts, no "manager" nodes, no single point of failure
- **Auto-discovery:** Services discover each other without a central bookkeeper
- **Fault-tolerant:** Don't lose any requests when a service is down
- **Scalable:** Horizontally scale to any number of machines
- **Performant:** Process thousands of messages per second

Now you could make many nodereds communicate without any configuration on the same network.

## Pub/Sub
Create a publisher on Nodered:
```
[{"id":"77277e94.17762","type":"cote-publisher","z":"9621d6b7.201ad8","config":"e0666882.cdb1d8","name":"","topic":"message","namespace":"","key":"","x":600,"y":180,"wires":[]},{"id":"617f5589.8d056c","type":"inject","z":"9621d6b7.201ad8","name":"","topic":"","payload":"","payloadType":"date","repeat":"","crontab":"","once":false,"x":440,"y":180,"wires":[["77277e94.17762"]]},{"id":"e0666882.cdb1d8","type":"cote-config","z":"","ctype":"broadcast","host":"","port":"","dbase":"","pass":""}]
```

After create many subscribers on the same or other machines:
```
[{"id":"1a7d44c0.3dc35b","type":"cote-subscriber","z":"9621d6b7.201ad8","config":"e0666882.cdb1d8","name":"","topic":"message","namespace":"","key":"","x":760,"y":120,"wires":[["fc4310c0.b2a0a"]]},{"id":"fc4310c0.b2a0a","type":"debug","z":"9621d6b7.201ad8","name":"","active":true,"console":"false","complete":"false","x":930,"y":120,"wires":[]},{"id":"e0666882.cdb1d8","type":"cote-config","z":"","ctype":"broadcast","host":"","port":"","dbase":"","pass":""}]
```

## Request/Response

Create a Requester:
```
[{"id":"3b315b94.892214","type":"cote-requester","z":"9621d6b7.201ad8","config":"e0666882.cdb1d8","name":"","topic":"myFunction","namespace":"","key":"","x":640,"y":580,"wires":[["11e6254.049d7db"]]},{"id":"21d5b113.c921ee","type":"inject","z":"9621d6b7.201ad8","name":"","topic":"","payload":"{\"a\":\"b\"}","payloadType":"json","repeat":"","crontab":"","once":false,"x":410,"y":580,"wires":[["3b315b94.892214"]]},{"id":"11e6254.049d7db","type":"debug","z":"9621d6b7.201ad8","name":"","active":true,"console":"false","complete":"false","x":890,"y":580,"wires":[]},{"id":"e0666882.cdb1d8","type":"cote-config","z":"","ctype":"broadcast","host":"","port":"","dbase":"","pass":""}]
```

Create one or more Responders on the same or other machines:
```
[{"id":"f77da713.fbfb88","type":"cote-responder","z":"9621d6b7.201ad8","config":"e0666882.cdb1d8","name":"","topic":"myFunction","namespace":"","key":"","x":420,"y":340,"wires":[["fdd3b4c2.a6d828","17f2e8ac.130177"]]},{"id":"94d25e5c.7c884","type":"cote-responder-out","z":"9621d6b7.201ad8","name":"","x":880,"y":340,"wires":[]},{"id":"fdd3b4c2.a6d828","type":"debug","z":"9621d6b7.201ad8","name":"","active":true,"console":"false","complete":"false","x":670,"y":380,"wires":[]},{"id":"17f2e8ac.130177","type":"function","z":"9621d6b7.201ad8","name":"","func":"msg.payload = {\n    hello:\"world\"\n};\nreturn msg;","outputs":1,"noerr":0,"x":650,"y":340,"wires":[["94d25e5c.7c884"]]},{"id":"e0666882.cdb1d8","type":"cote-config","z":"","ctype":"broadcast","host":"","port":"","dbase":"","pass":""}]
```

