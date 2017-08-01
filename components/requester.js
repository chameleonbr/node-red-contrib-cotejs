const cote = require('cote');

module.exports = function (RED) {
    function CoteRequester(n) {
        RED.nodes.createNode(this, n);
        this.config = RED.nodes.getNode(n.config);
        this.name = n.name;
        this.topic = n.topic;
        this.namespace = n.namespace;
        this.key = n.key;
        let node = this;

        let options = {
            name: node.name || "CoteRequester@"+node.id,
            namespace: node.namespace || undefined,
            key: node.key || undefined
        }

        console.log(node);

        switch (node.config.ctype) {
            case 'redis':
                options['redis'] = {
                    host: node.config.host || undefined,
                    port: node.config.port || undefined,
                    password: node.config.pass || undefined,
                }
                break;
            case 'multicast':
                options['multicast'] = node.config.host;
                break;
            case 'broadcast':
            default:
                options['broadcast'] = node.config.host || '255.255.255.255'
                break;
        }

        const req = new cote.Requester(options);
        node.on('close', function (done) {
            req.close();
            done();
        });

        node.on('input', function (msg) {
            let topic;
            if (msg.topic !== undefined && msg.topic !== "") {
                topic = msg.topic;
            }
            else {
                topic = node.topic;
            }
            if (typeof (msg.payload) == "object") {
                msg.payload['type'] = topic;

                req.send(msg.payload).then((data) => {
                    msg.payload = data;
                    node.send(msg);
                }).catch((err) => {
                    node.error(err);
                })
            } else {
                node.error('Payload object is required')
            }
        });

    }
    RED.nodes.registerType("cote-requester", CoteRequester);
}