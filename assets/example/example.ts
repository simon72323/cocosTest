import { _decorator, assetManager, Component, director, instantiate, Prefab, Node, Toggle, Label, SpriteFrame, Slider, EditBox, sp } from 'cc';

import { getEventManager } from '@common/manager/EventManager';
import { urlHelper } from '@common/utils/UrlHelper';
import { commonStore } from '@common/h5GameTools/CommonStore';
import { getUrlQuery } from '@common/utils/UrlUtils';
import { disWatchAll, watch, watchFixed } from '@common/utils/Reactivity';

import { getGameName } from '@common/config/gameList';
import { generatePromise } from '@common/utils/tools';
import { Comm, Game } from '@common/h5GameTools/GTCommEvents';
import { GameStatus } from '@common/h5GameTools/State';
generatePromise();

const { ccclass, property } = _decorator;

@ccclass('example')
export class example extends Component {
    @property(Label)
    betLabel?: Label | null = null;
    @property(Label)
    creditLabel?: Label | null = null;
    mainStageNode?: Node;

    onEnable(){
        this.loadGame();
    }
    // async start() {
    //     // const site = getUrlQuery('site');
    //     // let htmlUrl = '';

    //     // const xcSites: Record<string, string> = {
    //     //     'xcDev': 'xcdemo.dowin-dev.com',
    //     //     'xcTest': 'xcdemo.dowin-test.com'
    //     // };
    //     // const lmSites: Record<string, string> = {
    //     //     'lmDev': 'lmdemo.dowin-dev.com',
    //     //     'lmTest': 'lmdemo.dowin-test.com'
    //     // };
    //     // const bbSites: Record<string, string> = {
    //     //     'bbDev': 'casino1.bb-in555.com',
    //     //     'bbTest': 'bbgp-game1.casinovir999.net'
    //     // };
    //     // const demoSites: Record<string, string> = {
    //     //     'bbDevDemo': 'demo.bb-in555.com',
    //     //     'bbTestDemo': 'demo.casinovir999.net'
    //     // };

    //     // const siteDomain = {
    //     //     ...lmSites,
    //     //     ...xcSites,
    //     //     ...bbSites,
    //     //     ...demoSites
    //     // };

    //     // xcSites[site] && (urlHelper.site = 'XC');
    //     // lmSites[site] && (urlHelper.site = 'LM');
    //     // demoSites[site] && (urlHelper.isDemo = true);

    //     // commonStore.resetStoreStateState();

    //     // const gameType = urlHelper.gameType;
    //     // const xcLikeDomain = xcSites[site] ?? lmSites[site];

    //     // if (xcLikeDomain || demoSites[site]) {
    //     //     if (xcLikeDomain) {
    //     //         const xcSid = urlHelper.sid || getUrlQuery('xcSid');

    //     //         const resp = await (await fetch(`https://${xcLikeDomain}/DemoAPI/Cli/Platform/DemoXC/Session?originDomain=${xcLikeDomain}&gameType=${gameType}&lang=zh-tw`, {
    //     //             'headers': {
    //     //                 'accept': 'application/json, text/plain, */*',
    //     //                 'accept-language': 'zh-TW,zh;q=0.9,en-US;q=0.8,en;q=0.7',
    //     //                 'ekey': 'mroftalpm',
    //     //                 'priority': 'u=1, i',
    //     //                 'sec-ch-ua': '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
    //     //                 'sec-ch-ua-mobile': '?0',
    //     //                 'sec-ch-ua-platform': '"macOS"',
    //     //                 'sec-fetch-dest': 'empty',
    //     //                 'sec-fetch-mode': 'cors',
    //     //                 'sec-fetch-site': 'same-origin',
    //     //                 'sid': xcSid,
    //     //                 'userid': '456052807',
    //     //                 'Referer': `https://${xcLikeDomain}`,
    //     //                 'Referrer-Policy': 'strict-origin-when-cross-origin'
    //     //             },
    //     //             'body': null,
    //     //             'method': 'GET'
    //     //         })).json();

    //     //         htmlUrl = resp.data.game;
    //     //         urlHelper.domain = new URL(htmlUrl).origin;
    //     //     } else {
    //     //         urlHelper.domain = `https://${demoSites[site]}`;
    //     //         htmlUrl = `${urlHelper.domain}/game/game.php?GameType=${gameType}&lang=zh-tw`;
    //     //     }

    //     //     const resp = await fetch(htmlUrl);
    //     //     const demoPage = await resp.text();
    //     //     let sid = /var SessionID = '([^']+)';/.exec(demoPage)?.[1];

    //     //     if (!sid) {
    //     //         sid = new URL(resp.url).searchParams.get('sid') ?? '';
    //     //     }
    //     //     urlHelper.sid = sid;
    //     // } else {
    //     //     urlHelper.domain = `https://${siteDomain[site]}`;
    //     // }

    //     // if (urlHelper.isDemo) {
    //     //     if (site === 'xcDev' || site === 'xcTest') {
    //     //         const resp = await (await fetch(`https://xcdemo.dowin-${site === 'xcDev' ? 'dev' : 'test'}.com/DemoAPI/Cli/Platform/DemoXC/Session?originDomain=xcdemo.dowin-${site === 'xcDev' ? 'dev' : 'test'}.com&gameType=${urlHelper.gameType}&lang=zh-tw`, {
    //     //             'headers': {
    //     //                 'accept': 'application/json, text/plain, */*',
    //     //                 'accept-language': 'zh-TW,zh;q=0.9,en-US;q=0.8,en;q=0.7',
    //     //                 'ekey': 'mroftalpm',
    //     //                 'priority': 'u=1, i',
    //     //                 'sec-ch-ua': '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
    //     //                 'sec-ch-ua-mobile': '?0',
    //     //                 'sec-ch-ua-platform': '"macOS"',
    //     //                 'sec-fetch-dest': 'empty',
    //     //                 'sec-fetch-mode': 'cors',
    //     //                 'sec-fetch-site': 'same-origin',
    //     //                 'sid': getUrlQuery('xcSid') || 'd0eacbb90193a88c544dededf333f5ac',
    //     //                 'userid': '456052807',
    //     //                 'Referer': `https://xcdemo.dowin-${site === 'xcDev' ? 'dev' : 'test'}.com/`,
    //     //                 'Referrer-Policy': 'strict-origin-when-cross-origin'
    //     //             },
    //     //             'body': null,
    //     //             'method': 'GET'
    //     //         })).json();
    //     //         htmlUrl = resp.data.game;

    //     //         urlHelper.site = 'XC';
    //     //         urlHelper.domain = new URL(htmlUrl).origin;

    //     //         commonStore.storeMutation.setData('customConfig', {
    //     //             ...commonStore.storeState.customConfig,
    //     //             showDecimalPoints: false
    //     //         });
    //     //     } else {
    //     //         urlHelper.domain = site === 'dev' ? 'https://demo.bb-in555.com/' : 'https://demo.casinovir999.net/';
    //     //         htmlUrl = `${urlHelper.domain}/game/game.php?GameType=${urlHelper.gameType}&lang=zh-tw`;
    //     //     }

    //     //     const resp = await fetch(htmlUrl);
    //     //     const demoPage = await resp.text();
    //     //     let sid = /var SessionID = '([^']+)';/.exec(demoPage)?.[1] ?? urlHelper.sid;

    //     //     if (!sid) {
    //     //         sid = new URL(resp.url).searchParams.get('sid') ?? '';
    //     //     }
    //     //     urlHelper.sid = sid;
    //     // } else {
    //     //     urlHelper.domain = 'https://bbgp-game1.casinovir999.net';
    //     // }

    //     // commonStore.storeMutation.setData('bgAudioOn', false);
    //     // commonStore.storeMutation.setData('effectAudioOn', false);
    //     // commonStore.storeMutation.setData('direction', ({ 'L': 'L', 'P': 'P' } as const)[getUrlQuery('direction') as 'L' | 'P'] ?? 'P');

    //     // getEventManager().on(Comm.SHOW_EXCHANGE_PAGE, () => {
    //     //     const rateSplit = commonStore.storeState.base.split(':');
    //     //     let rate = 1;

    //     //     if (!isNaN(+rateSplit[0]) && !isNaN(+rateSplit[1])) {
    //     //         rate = +rateSplit[1] / +rateSplit[0];
    //     //     }

    //     //     if (commonStore.storeState.customConfig.canExchange) {
    //     //         getEventManager().emit(Game.EXCHANGE_CREDIT, {
    //     //             exchangeCredit: Math.floor(commonStore.storeState.balance * rate),
    //     //             callback: () => {}
    //     //         });
    //     //     }

    //     //     getEventManager().emit(Comm.LOADER_TOGGLE_SETTING_PANEL, { status: false });
    //     // });

    //     // getEventManager().on(Game.PRE_BUY_FREEGAME_SPIN, () => {
    //     //     getEventManager().emit(Game.BUY_FREEGAME_SPIN, null);
    //     // });

    //     // getEventManager().on(Game.PRE_SPIN, param => {
    //     //     console.log('PRE_SPIN', param.preBet);
    //     //     param.callback(true);
    //     // });

    //     // getEventManager().on(Comm.SHOW_ALERT, param => {
    //     //     console.log('SHOW_ALERT', param);
    //     // });

    //     // getEventManager().on(Comm.SHOW_BET_OPTION, param => {
    //     //     console.log('SHOW_BET_OPTION', param);
    //     // });

    //     // getEventManager().on(Comm.SET_BET_OPTION_NODE_PARAM, param => {
    //     //     console.log('SET_BET_OPTION_NODE_PARAM', param);
    //     // });

    //     // getEventManager().on(Game.RESTART_GAME, () => {
    //     //     this.reloadGame();
    //     // });

    //     // getEventManager().on(Comm.HIT_JACKPOT, parm => {
    //     //     console.log('中JP', {
    //     //         jpAmount: parm.jpAmount,
    //     //         jpType: parm.jpType
    //     //     });

    //     //     parm.callback();
    //     // });

    //     // watchFixed(() => commonStore.storeState.gameStatus, gameStatus => {
    //     //     if (gameStatus === GameStatus.OnReady && (commonStore.storeState.isAutoPlay || commonStore.storeState.isFreeGame)) {
    //     //         getEventManager().emit(Game.SPIN, null);
    //     //     }
    //     // });

    //     // watchFixed(() => commonStore.storeState.totalBet, totalBet => {
    //     //     if (this.betLabel) {
    //     //         this.betLabel.string = `${totalBet}`;
    //     //     }
    //     // }, { immediate: true });

    //     // watchFixed(() => commonStore.storeState.credit, credit => {
    //     //     if (this.creditLabel) {
    //     //         this.creditLabel.string = `${credit}`;
    //     //     }
    //     // }, { immediate: true });

    //     await this.loadGame();
    //     // this.showSpin();
    // }

    // private reloadGame() {
    //     // disWatchAll();
    //     this.mainStageNode?.destroy();
    //     this.mainStageNode = undefined;

    //     this.loadGame(true);
    // }

    private async loadGame(isReload = false) {
        const waitLoad = generatePromise();//生成Promise

        const gameType = getGameName(urlHelper.gameType);//獲取遊戲名稱
        //載入遊戲bundle
        assetManager.loadBundle(gameType!, async (err, bundle) => {
            if (!err) {
                //載入loading prefab
                const [loadingPrefab] = await Promise.all([
                    new Promise<Prefab | undefined>(resolve => {
                        bundle.load('prefab/loadingScene', Prefab, (err, data) => {
                            resolve(data);
                        });
                    }),
                    new Promise<void>(resolve => {
                        (function loadLang(lang = urlHelper.lang) {
                            bundle.loadDir(`langResources/loadingPage/${lang}`, (err, data) => {
                                if (err || !data.length) {
                                    if (lang !== 'en') {
                                        loadLang('en');
                                    } else {
                                        resolve();
                                    }
                                    return;
                                }
                                resolve();
                            });
                        })();
                    })
                ]);

                let loadingNode: Node | null = null;
                if (loadingPrefab) {
                    loadingNode = instantiate(loadingPrefab);
                    director.getScene()?.getChildByName('Canvas')?.addChild(loadingNode);
                }

                const progress = {
                    finished1: 0,
                    finished2: 0,
                    total1: 1,
                    total2: 1,
                    prePercent: 0,
                    get percent1() {
                        return this.finished1 / this.total1;
                    },
                    get percent2() {
                        return this.finished2 / this.total2;
                    },
                    get percentSum() {
                        return Math.max(this.percent1 * 0.8 + this.percent2 * 0.2, this.prePercent);
                    },
                    update() {
                        getEventManager().emit('updateLoadingProgress', {
                            percent: this.percentSum
                        });
                        this.prePercent = this.percentSum;
                    }
                };

                //載入遊戲prefab
                const [mainStagePrefab] = await Promise.all([
                    new Promise<Prefab | undefined>(resolve => {
                        bundle.load('prefab/gameScene', Prefab, (finished: number, total: number) => {
                            progress.finished1 = finished;
                            progress.total1 = total;
                            progress.update();
                        }, (err, data) => {
                            resolve(data);
                        });
                    }),
                    new Promise<void>(resolve => {
                        (function loadLang(lang = urlHelper.lang) {
                            bundle.loadDir(`langResources/gameCore/${lang}`, (finished: number, total: number) => {
                                progress.finished2 = finished;
                                progress.total2 = total;
                                progress.update();
                            }, (err, data) => {
                                if (err || !data.length) {
                                    if (lang !== 'en') {
                                        loadLang('en');
                                    } else {
                                        resolve();
                                    }
                                    return;
                                }
                                resolve();
                            });
                        })();
                    }),
                    new Promise<void>(resolve => {
                        bundle.loadDir('gameCore/resources/Comm', SpriteFrame, () => {
                            resolve();
                        });
                    }),
                    new Promise<void>(resolve => {
                        bundle.loadDir('gameCore/resources/Comm/Spine', sp.SkeletonData, () => {
                            resolve();
                        });
                    })
                ]);

                if (isReload) {
                    getEventManager().emit('updateLoadingProgress', {
                        percent: 1
                    });
                }

                if (mainStagePrefab) {
                    this.mainStageNode = instantiate(mainStagePrefab);
                    director.getScene()?.getChildByName('Canvas')?.addChild(this.mainStageNode);
                    this.mainStageNode.setSiblingIndex(0);
                }

                waitLoad.resolve();
                loadingNode?.destroy();

                // const disWatch = watch(() => commonStore.storeState.gameStatus === GameStatus.OnGameSetupReady, onGameSetupReady => {
                //     if (onGameSetupReady) {
                //         loadingNode?.destroy();
                //         disWatch();
                //     }
                // }, { immediate: true });
            }
        });

        await waitLoad.promise;
    }

    /**
     * @deprecated 使用 spinSpine.setAnimation 替代
     */
    // showSpin() {
    //     if (this.spinNode && this.rotateImage && getUrlQuery('showSpin')) {
    //         const angle = new Vec3();
    //         this.spinNode.active = true;
    //         let speed = -10;

    //         director.on(Director.EVENT_END_FRAME, () => {
    //             Vec3.set(angle, 0, 0, angle.z < -360 ? speed : angle.z + speed);
    //             this.rotateImage?.getNode.setRotationFromEuler(angle);
    //         }, this);

    //         this.changeSpinSpine(null, 'up');
    //     }
    // }

    // toggleSound(target: Toggle) {
    //     commonStore.storeMutation.setData('bgAudioOn', target.isChecked);
    //     commonStore.storeMutation.setData('effectAudioOn', target.isChecked);
    // }

    // toggleReverse(target: Toggle) {
    //     (window as any).devStore.storeMutations.setData('reverseReel', target.isChecked);
    // }

    // toggleTurbo(target: Toggle) {
    //     commonStore.storeMutation.setData('isTurbo', target.isChecked);
    // }

    // toggleAuto(target: Toggle) {
    //     commonStore.storeMutation.setData('isAutoPlay', target.isChecked);
    // }

    // toggleFreeGame(target: Toggle) {
    //     getEventManager().emit('dev_freeGame', target.isChecked);
    // }

    // spin() {
    //     getEventManager().emit(Game.SPIN, null);
    // }

    // stop() {
    //     getEventManager().emit(Game.STOP_SPIN, null);
    // }

    // getCurrentBetIndex() {
    //     return commonStore.storeState.betCreditList.findIndex((item: number) => item === commonStore.storeState.totalBet);
    // }

    // minusBet() {
    //     const currentIndex = this.getCurrentBetIndex();
    //     const prevItem = commonStore.storeState.betCreditList[currentIndex - 1] ?? commonStore.storeState.betCreditList[commonStore.storeState.betCreditList.length - 1];
    //     commonStore.storeMutation.setData('bet', prevItem);
    // }

    // plusBet() {
    //     const currentIndex = this.getCurrentBetIndex();
    //     const nextItem = commonStore.storeState.betCreditList[currentIndex + 1] ?? commonStore.storeState.betCreditList[0];
    //     commonStore.storeMutation.setData('bet', nextItem);
    // }
}