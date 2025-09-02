export enum SlotGameEvent {
  /** 連線中斷 */
  CLOSE = "close",
  /** 連線開啟 */
  CONNECTED = "connected",
  /** 連線重啟 */
  RECONNECTED = "reconnected",
  /** 收到Server Respone Ready事件 */
  READY = "ready",
  /** 更新四層彩金資訊 */
  UPDATE_JP = "updateJP",
  /** 跑馬燈資訊 */
  UPDATE_MARQUEE = "updateMarquee",
  /** 登入結果 */
  LOGIN = "login",
  /** 取得機台結果 */
  TAKE_MACHINE = "takeMachine",
  /**  LoadInfo 結果 */
  LOAD_INFO = "onLoadInfo",
  /** 加入遊戲結果 */
  JOIN_GAME = "joinGame",
  /** 滿台 */
  GET_MACHINE_LIST = "getMachineList",
  /** 目前機台資訊 */
  GET_MACHINE_DETAIL = "getMachineDetail",
  /** 換分結果 */
  CREDIT_EXCHANGE = "creditExchange",
  /** 洗分結果 */
  BALANCE_EXCHANGE = "balanceExchange",
  /** 中Jackpot */
  HIT_JACKPOT = "onHitJackpot",
  /** beginGame結果 */
  BEGIN_GAME = "beginGame",
  /** doubleGame結果 */
  DOUBLE_GAME = "onDoubleGame",
  /** endGame結果 */
  END_GAME = "onEndGame",
  /** 中bonusGame */
  HIT_BONUS = "onHitBonus",
  /** bonusGame 結束 */
  END_BONUS = "onEndBonus",
  /** 保留機台結果 */
  KEEP_MACHINE_STATUS = "keepMachineStatus",
  /** 離開機台 */
  MACHINE_LEAVE = "machineLeave",
  /** api回傳錯誤 */
  ON_ERROR = "error",
  /** 儲存換分記錄 */
  SAVE_USER_AUTO_EXCHANGE = "saveUserAutoExchange",
  /** 更新資料 */
  UPDATE = "update",
  /** 玩家資料 */
  PLAYER = "player",
  /** 更新Credit */
  UPDATE_CREDIT = "updateCredit"
}