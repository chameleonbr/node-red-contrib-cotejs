const cote = require('cote');

module.exports = function (RED) {
    function CotePublisher(n) {
        RED.nodes.createNode(this, n);
        this.config = RED.nodes.getNode(n.config);
        this.name = n.name;
        this.topic = n.topic;
        this.namespace = n.namespace;
        this.key = n.key;
        let node = this;

        let options = {
            name: node.name || "CotePub@"+node.id,
            namespace: node.namespace || undefined,
            key: node.key || undefined
        }
        switch (node.config.ctype) {
            case 'redis':
                options['redis'] =  {
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

        const pub = new cote.Publisher(options);
        node.on('close', function (done) {
            pub.close();
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

            pub.publish(topic, msg.payload);
        });

    }
    RED.nodes.registerType("cote-publisher", CotePublisher);
}