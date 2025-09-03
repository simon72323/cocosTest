import { WebSocketEvent } from '@/common/core/network/WebSocketEvent';

// assets/common/core/webSocket/WebSocketCore.ts
export class WebSocketCore {
    private ws: WebSocket | null = null;
    private eventListeners: Map<string, Function[]> = new Map();
    private reconnectAttempts: number = 0;
    private maxReconnectAttempts: number = 5;
    private reconnectDelay: number = 1000;
    private url: string = '';
    private isConnecting: boolean = false;
    private useCrypto: any = null;

    public get isConnected(): boolean {
        return this.ws?.readyState === WebSocket.OPEN;
    }

    /**
     * 添加事件監聽器
     * @param eventName 事件名稱
     * @param callback 事件處理函數
     */
    public on(eventName: string, callback: Function): void {
        if (!this.eventListeners.has(eventName)) {
            this.eventListeners.set(eventName, []);
        }
        this.eventListeners.get(eventName)!.push(callback);
    }

    /**
     * 移除事件監聽器
     * @param eventName 事件名稱
     */
    public off(eventName: string): void {
        this.eventListeners.delete(eventName);
    }

    /**
     * 觸發事件
     * @param eventName 事件名稱
     * @param data 事件數據
     */
    private emit(eventName: string, data: any): void {
        const listeners = this.eventListeners.get(eventName);
        if (listeners) {
            listeners.forEach(callback => callback(data));
        }
    }

    /**
     * 連接WebSocket
     * @param url WebSocket URL
     */
    public connect(url: string): void {
        if (this.isConnecting) return;

        this.url = url;
        this.isConnecting = true;

        try {
            this.ws = new WebSocket(url);
            this.setupWebSocketHandlers();
        } catch (error) {
            this.isConnecting = false;
            console.error('WebSocket connection failed:', error);
        }
    }

    /**
     * 設置WebSocket事件處理函數
     */
    private setupWebSocketHandlers(): void {
        if (!this.ws) return;

        this.ws.onopen = () => {
            this.isConnecting = false;
            this.reconnectAttempts = 0;
            this.emit(WebSocketEvent.NETWORK_STATUS, { status: 'open' });
        };

        this.ws.onmessage = event => {
            try {
                let data = event.data;

                // 如果使用加密，先解密
                if (this.useCrypto) {
                    data = this.useCrypto.decrypt(data);
                }

                const parsedData = JSON.parse(data);
                this.emit(WebSocketEvent.NETWORK_RESULT, parsedData);
            } catch (error) {
                console.error('WebSocket onmessage error:', error);
                this.emit(WebSocketEvent.NETWORK_RESULT, { raw: event.data });
            }
        };

        this.ws.onerror = error => {
            this.isConnecting = false;
            this.emit(WebSocketEvent.NETWORK_STATUS, { status: 'error', error });
        };

        this.ws.onclose = event => {
            this.isConnecting = false;
            this.emit(WebSocketEvent.NETWORK_STATUS, { status: 'close', code: event.code, reason: event.reason });

            if (!event.wasClean && this.reconnectAttempts < this.maxReconnectAttempts) {
                this.scheduleReconnect();
            }
        };
    }

    /**
     * 發送消息到服務器
     * @param data 發送的數據
     */
    public callServer(data: any): void {
        if (this.isConnected) {
            let message = JSON.stringify(data);

            // 如果使用加密，先加密
            if (this.useCrypto) {
                message = this.useCrypto.encrypt(message);
            }

            this.ws!.send(message);
        } else {
            console.error('WebSocket is not connected');
        }
    }

    /**
     * 關閉WebSocket
     */
    public close(): void {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
    }

    /**
     * 重新連接WebSocket
     */
    public reconnect(): void {
        if (this.url) {
            this.connect(this.url);
        }
    }

    /**
     * 設置WebSocket
     * @param param 參數
     */
    public setupWs(param: any): void {
        if (param.useCrypto) {
            this.useCrypto = param.useCrypto;
        }
    }

    /**
     * 設置重新連接WebSocket
     */
    private scheduleReconnect(): void {
        this.reconnectAttempts++;
        const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

        setTimeout(() => {
            if (!this.isConnected) {
                this.connect(this.url);
            }
        }, delay);
    }
}