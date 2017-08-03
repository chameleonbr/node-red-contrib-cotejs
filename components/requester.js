const cote = require('cote');

const connector = require('./connector');

module.exports = function (RED) {
    RED.events.on('nodes-started',()=>{
        connector.events.emit('start','req');
    })
    function CoteRequester(n) {
        RED.nodes.createNode(this, n);
        this.config = RED.nodes.getNode(n.config);
        this.name = n.name;
        this.topic = n.topic;
        this.ntype = 'req';
        let node = this;

        connector.events.emit('attach',node);

        node.on('close', function (done) {
            connector.events.emit('detach',node);
            done();
        });
    }
    RED.nodes.registerType("cote-requester", CoteRequester);
}