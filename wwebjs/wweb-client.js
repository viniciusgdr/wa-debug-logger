const { Client, LocalAuth } = require('whatsapp-web.js');
const { WebSocket } = require('ws');

(async () => {
  const client = new Client({
    puppeteer: {
      headless: false,
      args: [
        '--ignore-certificate-errors',
        '--allow-insecure-localhost',
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-web-security'
      ],
    },
    authStrategy: new LocalAuth({
      dataPath: 'temp/db',
      clientId: 'client'
    }),
    bypassCSP: true,
  });

  client.on('ready', async () => {
    console.log('client is ready!');

    client.pupPage.evaluate(() => {
      const ws = new WebSocket('ws://localhost:8080');
      
      if (ws) {
        ws.onopen = () => {
          console.log('WebSocket connection established');
          setInterval(() => {
            ws.send(JSON.stringify({ tag: 'ping' }));
          }, 10000);
        };

        ws.onerror = (error) => {
          console.error('WebSocket error:', error);
        };
      }

      const originalConsoleLog = console.log;

      console.log = (...args) => {
        if (ws && ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({
            type: 'WA_FRONT',
            data: args,
          }));
        }
        originalConsoleLog(...args);
      };

      if (!window.encodeBackStanza) {
        window.encodeBackStanza = require("WAWap").encodeStanza;
      }

      require("WAWap").encodeStanza = (...args) => {
        const result = window.encodeBackStanza(...args);
        console.log(args[0]);
        return result;
      };
    });
  });

  client.initialize();
})();