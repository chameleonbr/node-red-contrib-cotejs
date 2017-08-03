const cote = require('cote');
const EventEmitter = require('events');

const removeArrayItem = (arr, itemToRemove) => {
    return arr.filter(item => item !== itemToRemove)
}

/*
['req'][config] Requester  instance
['res'][config] Responder  instance
['sub'][config] Subscriber instance
['pub'][config] Publisher  instance
*/
const instances = {
    req: {},
    res: {},
    pub: {},
    sub: {},
}
const configs = {

};
const responders = {};

const nodes = {};

const events = new EventEmitter();

events.on('attach', (node) => {
    nodes[node.id] = node;
    addConfig(node);
})

events.on('detach', (node) => {
    nodes[node.id] = undefined;
    //delConfig(node);
})

events.on('start', (type) => {
    for (prop in instances[type]) {
        instances[type][prop].close();
    }
    instances[type] = {}

    for (nodeName in nodes) {
        let node = nodes[nodeName];

        if (node.ntype === type) {

            let inst = getInstance(node);

            switch (node.ntype) {
                case 'res':
                    inst.on(node.topic, (req) => {
                        return new Promise((resolve, reject) => {
                            msg = {};
                            msg.payload = req;
                            msg._cbResolve = resolve;
                            msg._cbReject = reject;
                            node.send(msg);
                        })
                    });
                    break;
                case 'req':
                    node.on('input', function (msg) {
                        if (typeof (msg.payload) == "object") {
                            msg.payload['type'] = node.topic;
                            inst.send(msg.payload).then((data) => {
                                msg.payload = data;
                                node.send(msg);
                            }).catch((err) => {
                                node.error(err);
                            })
                        } else {
                            node.error('Payload object is required');
                        }
                    });
                    break;
                case 'pub':
                    node.on('input', function (msg) {
                        let topic;
                        if (msg.topic !== undefined && msg.topic !== "") {
                            topic = msg.topic;
                        }
                        else {
                            topic = node.topic;
                        }

                        inst.publish(topic, msg.payload);
                    });
                    break;
                case 'sub':
                    inst.on(node.topic, (req) => {
                        msg = {};
                        msg.payload = req;
                        node.send(msg);
                    })
                    break;
                default:
                    break;
            }
        }
    }
})

const addConfig = (node) => {
    if (configs[node.config.id] === undefined) {
        configs[node.config.id] = {
            req: [], // requester
            res: [], // responder
            pub: [], // publisher
            sub: [], // subscriber
        }
    }
    configs[node.config.id][node.ntype].push(node.topic);
}

const delConfig = (node) => {
    removeArrayItem(configs[node.config.id][node.ntype], node.topic);
}

const newInstance = (node) => {
    let options = {
        name: node.ntype + "@" + node.config.id,
        namespace: node.config.namespace || undefined,
        key: node.config.key || undefined,
        requests: configs[node.config.id]['req'] || undefined,
        respondsTo: configs[node.config.id]['res'] || undefined,
        broadcasts: configs[node.config.id]['pub'] || undefined,
        subscribesTo: configs[node.config.id]['sub'] || undefined
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
    switch (node.ntype) {
        case 'sub':
            inst = new cote.Subscriber(options);
            break;
        case 'pub':
            inst = new cote.Publisher(options);
            break;
        case 'req':
            inst = new cote.Requester(options);
            break;
        case 'res':
            inst = new cote.Responder(options);
            break;
    }
    return inst;
}

const getInstance = (node) => {
    if (instances[node.ntype][node.config.id] === undefined) {
        instances[node.ntype][node.config.id] = newInstance(node)
    }
    return instances[node.ntype][node.config.id];
}













const getResponder = (node) => {
    if (responders[node.id] === undefined) {
        let options = {
            name: node.name || "CoteResponder@" + node.id,
            namespace: node.namespace || undefined,
            key: node.key || undefined,
            respondsTo: [node.topic]
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
        responders[node.id] = new cote.Responder(options);
    }
    return responders[node.id];
}
const delResponder = (node) => {
    if (responders[node.id] !== undefined) {
        responders[node.id].close();
        responders[node.id] = undefined;
    }
}

module.exports = {
    getResponder,
    delResponder,
    events
}