import { Client, LocalAuth } from 'whatsapp-web.js';
import { WebSocket as NodeWebsocket } from 'ws';

(async () => {
  const webSocketServer = new NodeWebsocket.Server({ port: 8080 });
  const websockets: NodeWebsocket[] = [];

  webSocketServer.on('connection', (ws) => {
    ws.on('message', (message) => {
      const data = JSON.parse(message.toString());
      console.log(data);

      if (data.tag === 'frontapp') {
        websockets.push(ws);
      } else {
        websockets.forEach((socket) => {
          if (socket !== ws) {
            socket.send(JSON.stringify(data));
          }
        });
      }
    });
  });

  const client = new Client({
    puppeteer: {
      headless: false,
      args: [
        '--ignore-certificate-errors',
        '--allow-insecure-localhost',
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-web-security', // Disable CORS
        '--disable-features=IsolateOrigins,site-per-process', // Additional CORS disabling
        '--disable-site-isolation-trials', // Additional CORS disabling
        '--disable-webgl', // Disable WebGL
        '--disable-3d-apis', // Disable 3D APIs
        '--disable-breakpad', // Disable crash reports
        '--disable-client-side-phishing-detection', // Disable phishing detection
        '--disable-component-extensions-with-background-pages', // Disable background extensions
        '--disable-datasaver-prompt', // Disable data saver prompt
        '--disable-default-apps', // Disable default apps
        '--disable-domain-reliability', // Disable domain reliability
        '--disable-extensions', // Disable extensions
        '--disable-features=AudioServiceOutOfProcess', // Disable audio service out of process
        '--disable-hang-monitor', // Disable hang monitor
        '--disable-ipc-flooding-protection', // Disable IPC flooding protection
        '--disable-notifications', // Disable notifications
      ],
    },
    authStrategy: new LocalAuth({
      dataPath: 'db',
      clientId: 'client'
    }),
    // @ts-ignore
    bypassCSP: true,
  });

  client.on('ready', async () => {
    console.log('Client is ready!');

    client.pupPage!.evaluate(() => {
      const ws = new WebSocket('ws://localhost:8080');
      // @ts-ignore
      ws?.onopen = () => {
        console.log('WebSocket connection established');
      };

      // @ts-ignore
      ws?.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      console.log = (...args) => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({
            type: 'WA_FRONT',
            data: args,
          }));
        }
      };

      console.error = (...args) => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({
            type: 'WA_FRONT',
            data: args,
          }));
        }
      };

      // @ts-ignore
      if (!window.encodeBackStanza) {
        // @ts-ignore
        window.encodeBackStanza = require("WAWap").encodeStanza;
      }

      // @ts-ignore
      require("WAWap").encodeStanza = (...args) => {
        // @ts-ignore
        const result = window.encodeBackStanza(...args);
        console.log(args[0]);
        return result;
      };
    });
  });

  client.initialize();
})()