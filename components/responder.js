const cote = require('cote');

const connector = require('./connector');

module.exports = function (RED) {

    RED.events.on('nodes-started', () => {
        connector.events.emit('start', 'res');
    })

    function CoteResponder(n) {
        RED.nodes.createNode(this, n);
        this.config = RED.nodes.getNode(n.config);
        this.name = n.name;
        this.topic = n.topic;
        this.ntype = 'res';
        let node = this;

        connector.events.emit('attach', node);

        node.on('close', function (done) {
            connector.events.emit('detach', node);
            done();
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