const http = require('http');
const fs = require('fs');
const path = require('path');
const { WebSocket } = require('ws');

const CONTENT_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif'
};

const httpServer = http.createServer((req, res) => {
  const filePath = req.url === '/' ? 'index.html' : req.url;
  const ext = path.extname(filePath);

  try {
    const content = fs.readFileSync(path.join(__dirname, filePath));
    res.writeHead(200, { 'Content-Type': CONTENT_TYPES[ext] || 'application/octet-stream' });
    res.end(content);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Não encontrado');
  }
});

const wsServer = new WebSocket.Server({ server: httpServer });
const clients = new Set();

wsServer.on('connection', (ws) => {
  clients.add(ws);
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message.toString());
      clients.forEach((client) => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(data));
        }
      });
    } catch (error) {
      console.error('erro ao processar mensagem:', error);
    }
  });

  ws.on('close', () => {
    clients.delete(ws);
  });
});

const PORT = process.env.PORT || 8080;
httpServer.listen(PORT, () => {
  console.log(`servidor rodando em http://localhost:${PORT}`);
});