module.exports = function (RED) {
    function CoteConfig(n) {
        RED.nodes.createNode(this, n);
        this.ctype = n.ctype;
        this.host = n.host;
        this.port = n.port;
        this.dbase = n.dbase;
        this.pass = n.pass;
        this.namespace = n.namespace;
        this.key = n.key;
    }
    RED.nodes.registerType("cote-config", CoteConfig);
}