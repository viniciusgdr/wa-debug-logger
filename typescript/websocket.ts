import { WebSocket } from 'ws'

export class WebSocketService {
    public ws: WebSocket;

    constructor() {
        this.ws = new WebSocket('ws://localhost:8080');
        this.initialize();
    }

    private initialize(): void {
        this.ws.on('open', () => {
            setInterval(() => {
                this.ws.send(JSON.stringify({
                    tag: 'ping'
                }));
            }, 10000);
        });
    }

    public send(data: unknown): void {
        this.ws.send(JSON.stringify(data));
    }
}
