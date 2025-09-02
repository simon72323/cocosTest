export const WebSocketEvent = {
    // 連接相關
    CONNECT: 'connect',
    DISCONNECT: 'disconnect',
    // 狀態相關
    NETWORK_STATUS: 'network_status',    // 網絡狀態更新
    NETWORK_RESULT: 'network_result'  // 網絡操作結果
} as const;