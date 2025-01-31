const ws = new WebSocket('ws://localhost:8080');

if (ws) {
    ws.onopen = () => {
        console.log('websocket connection established');
    };

    ws.onerror = (error) => {
        console.error('websocket error:', error);
    };
}

if (!window.encodeBackStanza) {
    window.encodeBackStanza = require("WAWap").encodeStanza;
}

require("WAWap").encodeStanza = (...args) => {
    const result = window.encodeBackStanza(...args);
    console.log(args[0]);
    ws.send(JSON.stringify({
        type: 'WA_FRONT',
        data: args[0],
    }));
    return result;
};