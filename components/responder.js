const cote = require('cote');

module.exports = function (RED) {
    function CoteResponder(n) {
        RED.nodes.createNode(this, n);
        this.config = RED.nodes.getNode(n.config);
        this.name = n.name;
        this.topic = n.topic;
        this.namespace = n.namespace;
        this.key = n.key;
        let node = this;

        let options = {
            name: node.name || "CoteResponder@"+node.id,
            namespace: node.namespace || undefined,
            key: node.key || undefined
        }
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

        const res = new cote.Responder(options);

        node.on('close', function (done) {
            res.close();
            done();
        });

        res.on(node.topic, (req) => {
            return new Promise((resolve, reject) => {
                msg = {};
                msg.payload = req;
                msg._cbResolve = resolve;
                msg._cbReject = reject;
                node.send(msg);
            })
        });
    }
    RED.nodes.registerType("cote-responder", CoteResponder);

    function CoteResponderOut(n) {
        RED.nodes.createNode(this, n);
        let node = this;
        node.on('input', (msg) => {
            if (typeof (msg._cbResolve) == "function") {
                msg._cbResolve(msg.payload);
            }
        });
    }

    RED.nodes.registerType("cote-responder-out", CoteResponderOut);
}