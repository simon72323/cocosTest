const gameList = {
    /** 幸運財神-5030 */
    'LuckyMoney': '5030',
    /** 森林舞會-5045 */
    'AnimalParty': '5045',
    /** 瘋狂水果盤-5058 */
    'CrazyFruits': '5058',
    /** 大話西遊-5067 */
    'AChineseOdyssey': '5067',
    /** 數字大轉輪-5076 */
    'LuckyNumber': '5076',
    /** 3D數字大轉輪-5079 */
    '3DLuckyNumber': '5079',
    /** 金瓶梅II-5094 */
    'JinPingMai2': '5094',
    /** 五行-5096 */
    'WuXing': '5096',
    /** 五福臨門-5098 */
    'FiveBlessings': '5098',
    /** 多福多財-5128 */
    'GoodFortune': '5128',
    /** 糖果派對3-5143 */
    'CandyParty3': '5143',
    /** 九尾狐-5153 */
    'JiuWeiHu': '5153',
    /** 葫蘆娃-5166 */
    'FireOfHuluwa': '5166',
    /** 滿天星-5175 */
    'AllStars': '5175',
    /** 抖音DJ-5182 */
    'TikTokDJ': '5182',
    /** 魚躍龍門-5184 */
    'CarpTurnDragon': '5184',
    /** 大豐收-5185 */
    'RichHarvest': '5185',
    /** 豬寶滿滿-5191 */
    'PiggyBank': '5191',
    /** 糖果吧-5193 */
    'CandyBar': '5193',
    /** 下龍灣神話-5198 */
    'TheLegendOfHaLongBay': '5198',
    /** 魚蝦蟹開了-5200 */
    'HooHeyHow': '5200',
    /** 草原拍拍-5209 */
    'Safari': '5209',
    /** 糖果繽紛樂-5210 */
    'CandyPop': '5210',
    /** 富貴金蟾-5213 */
    'GoldenToad': '5213',
    /** 今晚有戲-5215 */
    'BeijingOpera': '5215',
    /** 人魚祕寶-5216 */
    'Mermaid': '5216',
    /** 任你鑽-5219 */
    'DiamondFortune': '5219',
    /** 極樂盤絲洞-5220 */
    'SpiderSpirits': '5220',
    /** 瘋狂果醬罐-5222 */
    'CrazyJamJar': '5222',
    /** 火燒連環船-5225 */
    'ChiBi': '5225',
    /** 連消1024-5226 */
    'Elimination1024': '5226',
    /** 聚寶消消樂-5231 */
    'TreasurePotPuzzle': '5231',
    /** 超牛逼-5234 */
    'AwesomeBuffalo': '5234',
    /** 舞獅奪寶-5242 */
    'LionsFindTreasure': '5242',
    /** 太有財-5243 */
    'TooRich': '5243',
    /** 龍爭虎鬥-5244 */
    'DragonAndTigerFighting': '5244',
    /** 筋斗雲-5246 */
    'GoGoSomersaultCloud': '5246',
    /** 無限1024-5247 */
    'Unlimited1024': '5247',
    /** 採礦飛車-5250 */
    'Minecart': '5250',
    /** 一桿清台-5251 */
    'Clearance': '5251',
    /** 矮精靈-5252 */
    'Leprechaun': '5252',
    /** 爆發富-5253 */
    'Parvenu': '5253',
    /** 爆爆生財 -5256 */
    'FireCrackers': '5256',
    /** 葉問-5257 */
    'IpMan': '5257',
    /** 爆利金剛-5259 */
    'GoldKingKong': '5259',
    /** 招財喵喵-5261 */
    'FortuneCat': '5261',
    /** 金龍發發發-5264 */
    'Dragon888': '5264',
    /** 牛郎織女-5265 */
    'MagpieBridge': '5265',
    /** AV派對-5267 */
    'BeautyParty': '5267',
    /** 百搭雙星-5268 */
    'TwinsWild': '5268',
    /** 大鵬展翅-5269 */
    'BigWings': '5269',
    /** 火箭-5270 */
    'Crash': '5270',
    /** 財犬-5272 */
    'LuckyDog': '5272',
    /** HelloTiki -5273 */
    'HelloTiki': '5273',
    /** 財富宙升-5274 */
    'ZeusRise': '5274',
    /** 麻將胡了-5275 */
    'MahjongWays': '5275',
    /** 碰碰胡-5276 */
    'Mahjong': '5276',
    /** 幸運王牌-5277 */
    'LuckyAce': '5277',
    /** ColorGame-5278 */
    'ColorGame': '5278',
    /** 翻轉神廟-5311 */
    'FlippedTemple': '5311',
    /** 秘境冒險-5601 */
    'AdvenTure': '5601',
    /** 發大財-5823 */
    'BigProsperity': '5823',
    /** 喜福牛年-5835 */
    'HappyGoldenOxOfHappiness': '5835',
    /** 喜福猴年-5837 */
    'HappyGoldenMonkeyOfHappiness': '5837',
    /** 連環奪寶-5901 */
    'DuoBao': '5901',
    /** 糖果派對-5902 */
    'CandyParty': '5902',
    /** 秦皇祕寶-5903 */
    'Emperor': '5903',
    /** 糖果派對2-5908 */
    'CandyParty2': '5908',
    /** 寶石派對-5911 */
    'GemParty': '5911',
    /** 連環奪寶2-5912 */
    'DuoBao2': '5912',
    /** 糖果派對極速版-5171 */
    'CandyPartyFast': '5171',
    /** 奪寶奇喵-5279 */
    'catRaider': '5279'
};

// 從遊戲ID獲取遊戲名稱
const idToNameMap = new Map(Object.entries(gameList).map(([name, id]) => [id, name]));
export function getGameName(gameId: string): string | undefined {
    return idToNameMap.get(gameId);
}