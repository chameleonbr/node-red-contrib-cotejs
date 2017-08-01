const cote = require('cote');

module.exports = function (RED) {
    function CoteSubscriber(n) {
        RED.nodes.createNode(this, n);
        this.config = RED.nodes.getNode(n.config);
        this.name = n.name;
        this.topic = n.topic;
        this.namespace = n.namespace;
        this.key = n.key;
        let node = this;

        let options = {
            name: node.name || "CoteSub@"+node.id,
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

        const sub = new cote.Subscriber(options);
        node.on('close', function (done) {
            sub.close();
            done();
        });
        sub.on(node.topic,(req)=>{
            msg = {};
            msg.payload = req;
            node.send(msg);
        })
    }
    RED.nodes.registerType("cote-subscriber", CoteSubscriber);
}