// import { GameState } from "./CGEnum";
// import { onBeginGame, onJoinGame, onLoadInfo, onUpdate } from "./CGInterface";

// const GAME_TYPE = "5278";

// //登入資料
// export const LoadInfoData = new class {
//   private msg: onLoadInfo = {
//     "action": "onLoadInfo",
//     "event": true,
//     "gameType": GAME_TYPE,
//     "data":
//     {
//       "UserID": 123456,
//       "Balance": 100000,
//       // "Limit": 100000,
//       "Base": "1:1",
//       "DefaultBase": "1:1",
//       "UserAutoExchange": { "IsAuto": false, "Credit": 2000, "BeBase": "1:1", "Record": [] },
//       "BetCreditList": [1, 5, 10, 20, 50, 100, 200, 500, 1000, 2000],//遊戲籌碼注額
//       "BetRange": { Max: 1, Min: 45000 },//押注範圍
//       "Currency": "RMB",
//       "LoginName": "Player",
//       "AutoExchange": false,
//       "Credit": 2000,
//       // "betBase": "",
//       // "isCash": false,
//     }
//   }
//   public getData(): onLoadInfo {
//     return this.msg;
//   }
// }

// //登入遊戲資料
// export const JoinGameData = new class {
//   private msg: onJoinGame = {
//     "action": "onJoinGame",
//     "gameType": GAME_TYPE,
//     "event": true,
//     "data":
//     {
//       "gameState": GameState.BeginGame,
//       "roundSerial": 47378797,
//       // "limit": 45000,
//       "playerData": {
//         "enterID": 39,
//         "displayName": "Simon",
//         "avatarID": 17,
//       },
//       "startColor": Array.from({ length: 3 }, () => Math.floor(Math.random() * 24)),//該局起始顏色編號(0~23)
//       "countdown": 10,//剩餘押注時間
//       "betTotalTime": 15,//遊戲押注時間(彈性調整)
//       //前100局路紙顏色[新到舊]
//       "roadmap": ["Red-Blue-Yellow", "Grey-Grey-Green", "Yellow-Purple-Red", "Purple-Yellow-Green", "Yellow-Purple-Red", "Yellow-Grey-Red", "Red-Yellow-Green", "Red-Green-Red", "Green-Yellow-Purple", "Yellow-Red-Green"],
//       "roadmapRate": { "Yellow": 53, "Grey": 37, "Purple": 46, "Blue": 38, "Red": 61, "Green": 65 }, // 本地用戶各注區押注百分比
//       "dice": "Purple-Grey-Grey",//該局開獎顏色
//       "roomInfo": {
//         "playerList": [
//           { "enterID": 1, "displayName": "gu7698741", "pay": 6889190, "betInfo": { "Red": { "BetCredit": 2000, "payoff": 0, "odds": 0 } }, "avatarID": 14 },
//           { "enterID": 2, "displayName": "fgmf6819", "pay": 7387400, "betInfo": null, "avatarID": 17 },
//           { "enterID": 3, "displayName": "wmufaf59", "pay": 6869980, "betInfo": { "Yellow": { "BetCredit": 20, "payoff": 0, "odds": 0 } }, "avatarID": 27 },
//           { "enterID": 4, "displayName": "ohqfz1417", "pay": 6774380, "betInfo": { "Red": { "BetCredit": 50, "payoff": 0, "odds": 0 } }, "avatarID": 28 },
//           { "enterID": 5, "displayName": "xszfh542", "pay": 6420720, "betInfo": null, "avatarID": 9 },
//           { "enterID": 6, "displayName": "mzcmpgwy", "pay": 7177010, "betInfo": null, "avatarID": 30 },
//           { "enterID": 7, "displayName": "j15617623", "pay": 7168250, "betInfo": null, "avatarID": 19 },
//           { "enterID": 8, "displayName": "ycjwt65992", "pay": 6519140, "betInfo": null, "avatarID": 20 },
//           { "enterID": 9, "displayName": "pqptl68821", "pay": 6555110, "betInfo": null, "avatarID": 2 },
//           { "enterID": 10, "displayName": "yu45742619", "pay": 7123720, "betInfo": null, "avatarID": 3 },
//           { "enterID": 11, "displayName": "lordytpyq", "pay": 6933690, "betInfo": null, "avatarID": 2 },
//           { "enterID": 12, "displayName": "lcrwhpkxl", "pay": 7169360, "betInfo": null, "avatarID": 4 },
//           { "enterID": 13, "displayName": "m1248734", "pay": 6550290, "betInfo": null, "avatarID": 9 },
//           { "enterID": 14, "displayName": "vsxsq41262", "pay": 6934060, "betInfo": null, "avatarID": 29 },
//           { "enterID": 15, "displayName": "h813995287", "pay": 6557290, "betInfo": null, "avatarID": 12 },
//           { "enterID": 16, "displayName": "srwp526877", "pay": 6655070, "betInfo": null, "avatarID": 0 },
//           { "enterID": 17, "displayName": "nlrwt6544", "pay": 6965010, "betInfo": null, "avatarID": 24 },
//           { "enterID": 18, "displayName": "cn21959473", "pay": 7101540, "betInfo": null, "avatarID": 4 },
//           { "enterID": 19, "displayName": "u836788486", "pay": 6613180, "betInfo": null, "avatarID": 26 },
//           { "enterID": 20, "displayName": "o99298176", "pay": 6837320, "betInfo": null, "avatarID": 12 },
//           { "enterID": 21, "displayName": "hthvlwxc", "pay": 6830720, "betInfo": null, "avatarID": 22 },
//           { "enterID": 22, "displayName": "q686187846", "pay": 6378800, "betInfo": { "Green": { "BetCredit": 20, "payoff": 0, "odds": 0 } }, "avatarID": 8 },
//           { "enterID": 23, "displayName": "uqqi13493", "pay": 6924570, "betInfo": null, "avatarID": 24 },
//           { "enterID": 24, "displayName": "ghelv124", "pay": 6031430, "betInfo": null, "avatarID": 0 },
//           { "enterID": 25, "displayName": "dksk787234", "pay": 7367500, "betInfo": null, "avatarID": 16 },
//           { "enterID": 26, "displayName": "ju2229693", "pay": 7120070, "betInfo": null, "avatarID": 15 },
//           { "enterID": 27, "displayName": "m82624196", "pay": 6663010, "betInfo": null, "avatarID": 18 },
//           { "enterID": 28, "displayName": "ak8416155", "pay": 6787900, "betInfo": { "Grey": { "BetCredit": 20, "payoff": 0, "odds": 0 } }, "avatarID": 16 },
//           { "enterID": 29, "displayName": "qkfcub391", "pay": 6621470, "betInfo": null, "avatarID": 18 },
//           { "enterID": 30, "displayName": "jz43179385", "pay": 6912780, "betInfo": null, "avatarID": 0 },
//           { "enterID": 31, "displayName": "jwf6934877", "pay": 6746770, "betInfo": null, "avatarID": 17 },
//           { "enterID": 32, "displayName": "sxg2725516", "pay": 6913440, "betInfo": null, "avatarID": 11 },
//           { "enterID": 33, "displayName": "beym37146", "pay": 6477010, "betInfo": null, "avatarID": 15 },
//           { "enterID": 34, "displayName": "m2925125", "pay": 6414460, "betInfo": null, "avatarID": 20 },
//           { "enterID": 49, "displayName": "pppdemo8", "pay": 0, "avatarID": 7 }
//         ]
//       }
//     }
//   }
//   public getData(): onJoinGame {
//     return this.msg;
//   }
// }

// //更新押注資料(新局)
// export const UpdateNewRoundData = new class {
//   private msg: onUpdate = {
//     "action": "onUpdate",
//     "gameType": GAME_TYPE,
//     "data":
//     {
//       "state": GameState.NewRound,//新局開始
//       "roundSerial": 47378797,
//       "startColor": Array.from({ length: 3 }, () => Math.floor(Math.random() * 24)),//該局起始顏色編號(0~23)
//       // "newPlayer": [{ "enterID": 39, "displayName": "simon39", "avatarID": 17 }],
//       // "leavePlayer": [{ "enterID": 32, "displayName": "simon32", "avatarID": 12 }],
//     }
//   }
//   public getData(): onUpdate {
//     this.msg.data.startColor = Array.from({ length: 3 }, () => Math.floor(Math.random() * 24));
//     return this.msg;
//   }
// }

// //每秒更新押注資料
// export const UpdateBeginGameData = new class {
//   private msg: onUpdate = {
//     "action": "onUpdate",
//     "gameType": GAME_TYPE,
//     "data":
//     {
//       "state": GameState.BeginGame,// 押注中
//       "countdown": 10,//剩餘押注時間
//       "betInfo": [
//         { "enterID": 23, "betInfo": [{ "color": "Red", "betCredit": 200 }] },
//         { "enterID": 2, "betInfo": [{ "color": "Grey", "betCredit": 200 }] },
//         { "enterID": 25, "betInfo": [{ "color": "Green", "betCredit": 200 }] },
//         { "enterID": 5, "betInfo": [{ "color": "Blue", "betCredit": 50 }] }
//       ],
//       // "newPlayer": [{ "enterID": 39, "displayName": "simon39", "avatarID": 17 }],
//     }
//   }
//   public getData(countdown: number): onUpdate {
//     this.msg.data.countdown = countdown - 1;
//     return this.msg;
//   }
// }

// //更新派彩資料
// export const UpdateOpeningData = new class {
//   private index = -1;
//   private msg: onUpdate = {
//     "action": "onUpdate",
//     "gameType": GAME_TYPE,
//     "data":
//     {
//       "state": GameState.Opening,//開獎中
//       "dice": "Grey-Grey-Grey",//該局開獎顏色
//       "position": Math.floor(Math.random() * 1000),//本局表演的路徑ID (隨機0~999) 
//       "payInfo": [
//         { "enterID": 2, "pay": 300 },
//         { "enterID": 25, "pay": 750 },
//         { "enterID": 5, "pay": 300 }
//       ],
//       "roadmapRate": { "Grey": 51, "Red": 52, "Yellow": 45, "Blue": 55, "Green": 46, "Purple": 51 }, // 本地用戶各注區押注百分比
//     }
//   }

//   private getWinColor() {
//     this.index++;
//     if (this.index > 5)
//       this.index = 5;
//     const show = [
//       "Grey-Purple-Purple",
//       "Blue-Blue-Blue",
//       "Grey-Red-Yellow",
//       "Red-Red-Red",
//       "Grey-Purple-Blue",
//       "Grey-Grey-Grey"
//     ];
//     Logger.debug("開獎", show[this.index])
//     return show[this.index];
//   }
//   public getData(): onUpdate {
//     this.msg.data.position = Math.floor(Math.random() * 1000);
//     this.msg.data.dice = this.getWinColor();
//     return this.msg;
//   }
// }


// //更新派彩資料
// export const UpdateEndedGameData = new class {
//   private msg: onUpdate = {
//     "action": "onUpdate",
//     "gameType": GAME_TYPE,
//     "data":
//     {
//       "state": GameState.EndedGame,//遊戲結束
//     }
//   }
//   public getData(): onUpdate {
//     return this.msg;
//   }
// }

// //接收玩家押注資料
// export const BetData = new class {
//   private msg: onBeginGame = {
//     "action": "onBeginGame",
//     "gameType": GAME_TYPE,
//     "event": true,
//     "message": "餘額不足",
//     "data":
//     {
//       // 用戶押注額
//       "betInfo": {
//         "Cards": [
//           { "color": "Red", "betCredit": 200 },
//           { "color": "Yellow", "betCredit": 300 },
//           { "color": "Green", "betCredit": 400 }
//         ]
//       },
//       "BetTotal": 900,
//       "wagersID": 12345671,
//       "Credit": 2000,// 用戶剩餘額度
//       "CreditEnd": 1900
//     }
//   }
//   public getData(): onBeginGame {
//     return this.msg;
//   }
// }
