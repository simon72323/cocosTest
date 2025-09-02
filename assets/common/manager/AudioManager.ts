/**
 * AudioManager - 遊戲音效管理器
 * 
 * 使用前提：
 * 音效文件必須放在 bundle 的以下目錄：
 *    - 音效：audio/sound/
 *    - 音樂：audio/music/
 * 
 * 基本用法：
 * 1. 先實例化AudioManager，再加載音效資源才能播放音效
 *    const audioManager = getAudioManager().getInstance();
 *    await audioManager.loadBundleAudios('bundleName');
 * 
 * 2. 音效控制：
 *    // 播放一般音效（可選擇是否循環）
 *    audioManager.playSound('soundName', false);
 * 
 *    // 播放可重疊的短音效（建議音效長度 < 1秒）
 *    audioManager.playOnceSound('soundName');
 * 
 *    // 播放背景音樂（自動循環）
 *    audioManager.playMusic('musicName');
 * 
 * 3. 停止控制：
 *    // 停止特定音效
 *    audioManager.stopSound('soundName');
 *    
 *    // 停止特定音樂(此腳本已有做自動切換背景音樂控制，需要時才用)
 *    audioManager.stopMusic('musicName');
 * 
 *    // 停止所有音效和音樂
 *    audioManager.stopAllAudio();
 * 
 *    // 降低背景音樂音量
 *    audioManager.lowerMusic();
 *    
 *    // 恢復背景音樂音量
 *    audioManager.restoreMusic();
 */

import { _decorator, AudioSource, game, Game, tween, Component, assetManager, AudioClip, AssetManager, Tween, Node, director } from 'cc';
import { Logger } from '@common/utils/Logger';
import { commonStore } from '@common/h5GameTools/CommonStore';
import { watch } from '@common/utils/Reactivity';

interface AudioInfo {
    startTime: number;//紀錄播放當下時間(讓後台來回切換時正常接續播放音效)
    duration: number;//音頻長度
    audioClip: AudioClip;//音效
    audioSource: AudioSource;//音效源
    musicPlaying?: boolean;//紀錄背景音樂播放狀態
}
const { ccclass } = _decorator;

@ccclass('AudioManager')
export class AudioManager extends Component {
    private static _instance: AudioManager | null = null;
    private soundMap: Map<string, AudioInfo> = new Map();//紀錄音效
    private musicMap: Map<string, AudioInfo> = new Map();//紀錄音樂
    private isAudioContextRunning: boolean = false;//等待AudioContext啟動
    private audioSetting: boolean = false;//音效設置
    private isInBackground: boolean = false;//是否處於背景
    private isLowerMusic: boolean = false;//是否降低背景音樂

    /**
     * 監聽遊戲隱藏和顯示
     */
    protected onEnable() {
        game.on(Game.EVENT_HIDE, this.onGameHide, this);
        game.on(Game.EVENT_SHOW, this.onGameShow, this);
    }

    /**
     * 釋放資源
     */
    protected onDestroy() {
        // 移除事件監聽
        game.off(Game.EVENT_HIDE, this.onGameHide, this);
        game.off(Game.EVENT_SHOW, this.onGameShow, this);
        if (this !== AudioManager._instance) {
            return;
        }
        // 釋放音效資源
        for (const [name, audioInfo] of this.soundMap) {
            audioInfo.audioSource.stop();
            audioInfo.audioSource.destroy();
            if (audioInfo.audioClip) {
                assetManager.releaseAsset(audioInfo.audioClip);
            }
        }
        this.soundMap.clear();

        // 釋放音樂資源
        for (const [name, audioInfo] of this.musicMap) {
            audioInfo.audioSource.stop();
            audioInfo.audioSource.destroy();
            if (audioInfo.audioClip) {
                assetManager.releaseAsset(audioInfo.audioClip);
            }
        }
        this.musicMap.clear();
        AudioManager._instance = null;// 清理單例實例
    }

    /**
     * 獲取實例
     * @returns 實例
     */
    public static getInstance(): AudioManager {
        if (!AudioManager._instance) {
            const node = new Node('AudioManager');
            director.getScene()!.addChild(node);
            // director.addPersistRootNode(node);
            AudioManager._instance = node.addComponent(AudioManager);
        }
        return AudioManager._instance!;
    }


    /**
     * 加載 bundle 內的音效
     * @param bundleName bundle名稱
     */
    public async loadBundleAudios(bundleName: string): Promise<void> {
        const existingBundle = assetManager.getBundle(bundleName);
        if (existingBundle) {
            await this.loadAudio(existingBundle);
        } else {
            const bundle = await this.getBundle(bundleName);
            await this.loadAudio(bundle);
        }
        this.updateAudioSetting();//更新音效狀態
        this.watchAudioSetting();//監聽【公版】音效狀態
    }

    /**
     * 獲取 bundle
     * @param bundleName bundle名稱
     * @returns bundle
     */
    private getBundle(bundleName: string): Promise<AssetManager.Bundle> {
        return new Promise((resolve, reject) => {
            assetManager.loadBundle(bundleName, (err, bundle) => {
                if (err) {
                    Logger.error(`無法獲取${bundleName} bundle: ${err}`);
                    return;
                }
                resolve(bundle);
            });
        });
    }

    /**
     * 加載 bundle 內的音效
     * @param bundle 遊戲 bundle
     */
    private async loadAudio(bundle: AssetManager.Bundle): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            let loadedCount = 0;
            const checkComplete = () => {
                loadedCount++;
                if (loadedCount === 2) resolve();
            };
            bundle?.loadDir('audio/music', AudioClip, (err, audioClips: AudioClip[]) => {
                if (err) {
                    Logger.error('加載音樂失敗:', err);
                    return;
                }
                // 將音樂存入 Map
                audioClips.forEach(clip => {
                    // 檢查是否已存在相同名稱的音樂
                    if (this.musicMap.has(clip.name)) return; // 跳過已存在的音樂
                    const audioSource = this.addComponent(AudioSource)!;
                    audioSource.playOnAwake = false; // 避免自動播放
                    audioSource.clip = clip;
                    this.musicMap.set(clip.name, {
                        startTime: 0,
                        duration: audioSource.duration,
                        audioClip: clip,
                        audioSource: audioSource,
                        musicPlaying: false
                    });
                });
                Logger.debug(`已加載 ${audioClips.length} 個音樂`);
                checkComplete();

            });
            bundle?.loadDir('audio/sound', AudioClip, (err, audioClips: AudioClip[]) => {
                if (err) {
                    Logger.error('加載音效失敗:', err);
                    return;
                }
                // 將音效存入 Map
                audioClips.forEach(clip => {
                    if (this.soundMap.has(clip.name)) return; // 跳過已存在的音效
                    const audioSource = this.addComponent(AudioSource)!;
                    audioSource.playOnAwake = false; // 避免自動播放
                    audioSource.clip = clip;
                    this.soundMap.set(clip.name, {
                        startTime: 0,
                        duration: audioSource.duration,
                        audioClip: clip,
                        audioSource: audioSource
                    });
                });
                Logger.debug(`已加載 ${audioClips.length} 個音效`);
                checkComplete();
            });
        });
    }

    /**
     * 監聽【公版】音效狀態
     */
    private watchAudioSetting() {
        watch(() => commonStore.storeState.bgAudioOn, () => {
            this.updateAudioSetting();
        });
    }

    /**
     * 更新音效狀態
     */
    private updateAudioSetting() {
        this.audioSetting = commonStore.storeState.bgAudioOn;
        this.audioSetting ? this.onAudio() : this.offAudio();
    }

    /**
     * 檢查是否支持AudioContext
     * @returns 是否支持AudioContext
     */
    private async onUserInteraction() {
        try {
            if (this.isAudioContextRunning)
                return true;
            // 檢查瀏覽器是否支持 AudioContext
            const AudioContextClass = ((window as any).webkitAudioContext || window.AudioContext);
            if (!AudioContextClass) {
                Logger.debug('不支援AudioContext返回true');
                this.isAudioContextRunning = true;
                return true;
            }

            const audioContext = new AudioContextClass();
            // Safari需要特別處理
            if (audioContext.state === 'suspended') {
                await audioContext.resume();
            }

            this.isAudioContextRunning = audioContext.state === 'running';
            return this.isAudioContextRunning;
        } catch (error) {
            Logger.debug('AudioContext 初始化失敗', error);
            this.isAudioContextRunning = true;
            return true;
        }
    }

    /**
     * 隱藏遊戲時強制靜音
     */
    private onGameHide() {
        this.isInBackground = true;
        Tween.stopAllByTag(99);//停止所有聲音類的Tween，聲音使用99標籤
        this.offAudio();
    }

    /**
     * 顯示遊戲時恢復音效
     */
    private onGameShow() {
        this.isInBackground = false;
        this.updateAudioSetting();//更新音效狀態
    }

    /**
     * 播放音效
     * @param audioName 音效名稱
     * @param loop 是否循環
     */
    public async playSound(audioName: string, loop: boolean = false) {
        const audioInfo = this.soundMap.get(audioName)!;
        if (!audioInfo) return;
        audioInfo.startTime = Date.now(); // 更新開始時間(背景運行時也要記錄)
        audioInfo.audioSource.loop = loop;
        audioInfo.audioSource.currentTime = 0;
        if (!(await this.onUserInteraction()) || !this.audioSetting || this.isInBackground) return;
        audioInfo.audioSource.volume = 1;
        audioInfo.audioSource.play();
    }

    /**
     * 播放獨立音效(重疊性音效使用)建議音效長度小於1秒
     * @param audioName 音效名稱
     */
    public async playOnceSound(audioName: string) {
        const audioInfo = this.soundMap.get(audioName)!;
        if (!audioInfo) return;
        const audioClip = audioInfo.audioClip;
        audioInfo.audioSource.currentTime = 0;
        if (!(await this.onUserInteraction()) || !this.audioSetting || this.isInBackground) return; // 檢查音效開關和後台狀態
        audioInfo.audioSource.volume = 1;
        audioInfo.audioSource.playOneShot(audioClip);
    }

    /**
     * 播放音樂(會自動恢復音樂音量)
     * @param audioName 音樂名稱(固定循環)
     */
    public async playMusic(audioName: string) {
        //如果背景音樂變小，則先恢復音樂
        if (this.isLowerMusic) this.restoreMusic();

        //判斷music的Map哪個聲音在播放
        for (const audioInfo of this.musicMap.values()) {
            if (!audioInfo) continue;
            if (audioInfo.musicPlaying && audioInfo.audioClip.name !== audioName) {
                audioInfo.musicPlaying = false;//設置為未播放
                //這邊的聲音淡出不會受Tween.stopAllByTag(99)影響，避免切到後台時被停掉
                tween(audioInfo.audioSource).to(0.3, { volume: 0 }).call(() => {
                    audioInfo.audioSource.stop();//停止播放該音效
                }).start();
            }
        }
        const audioInfo = this.musicMap.get(audioName)!;
        if (!audioInfo) return;
        audioInfo.audioSource.loop = true;//循環播放
        audioInfo.musicPlaying = true;//設置為正在播放
        audioInfo.audioSource.play();//重頭播放(背景運行時也要啟用播放)
        if (!(await this.onUserInteraction()) || !this.audioSetting || this.isInBackground) return;
        tween(audioInfo.audioSource).to(0.3, { volume: 1 }).tag(99).start();
    }

    /**
     * 音樂變小
     */
    public async lowerMusic() {
        this.isLowerMusic = true;//觸發降低背景音
        if (!(await this.onUserInteraction()) || !this.audioSetting || this.isInBackground) return;
        for (const audioInfo of this.musicMap.values()) {
            if (!audioInfo) continue;
            tween(audioInfo.audioSource).to(0.3, { volume: 0.2 }).tag(99).start();
        };
    };

    /**
     * 音樂恢復
     */
    public async restoreMusic() {
        this.isLowerMusic = false;//觸發恢復背景音
        if (!(await this.onUserInteraction()) || !this.audioSetting || this.isInBackground) return;
        for (const audioInfo of this.musicMap.values()) {
            if (!audioInfo) continue;
            tween(audioInfo.audioSource).to(0.3, { volume: 1 }).tag(99).start();
        };
    };

    /**
     * 停止音效(淡出)
     * @param audioName 音效名稱
     */
    public stopSound(audioName: string) {
        const audioInfo = this.soundMap.get(audioName)!;
        audioInfo.audioSource.loop = false;//停止循環
        audioInfo.startTime = Date.now() - audioInfo.duration * 1000;//代表音效播完(已超過音頻時間)
        tween(audioInfo.audioSource).to(0.3, { volume: 0 }).call(() => {
            audioInfo.audioSource.stop();
        }).start();
    }

    /**
     * 停止音樂(淡出)
     * @param audioName 音樂名稱
     */
    public stopMusic(audioName: string) {
        const audioInfo = this.musicMap.get(audioName)!;
        tween(audioInfo.audioSource).to(0.3, { volume: 0 }).call(() => {
            audioInfo.audioSource.stop();
        }).start();
    }

    // 關閉音效
    private offAudio() {
        //音效暫停
        for (const audioInfo of this.soundMap.values()) {
            audioInfo.audioSource.volume = 0;
        };
        //音樂統一靜音
        for (const audioInfo of this.musicMap.values()) {
            audioInfo.audioSource.volume = 0;
        };
    }

    // 恢復音效
    private onAudio() {
        const currentTime = Date.now();
        //音效接續播放
        for (const audioInfo of this.soundMap.values()) {
            const elapsedTime = (currentTime - audioInfo.startTime) / 1000;//距啟動的經過時間(秒)
            // 如果距啟動的經過時間已經超過音頻長度，則停止播放
            if (elapsedTime >= audioInfo.duration && !audioInfo.audioSource.loop) {
                audioInfo.audioSource.stop();
            } else {
                audioInfo.audioSource.volume = 0;
                audioInfo.audioSource.currentTime = elapsedTime;//設置播放時間點（秒）
                audioInfo.audioSource.play();
                tween(audioInfo.audioSource).to(0.2, { volume: 1 }).tag(99).start();//聲音淡入
            }
        };
        //音樂聲音恢復
        const musicVolume = this.isLowerMusic ? 0.2 : 1;
        for (const audioInfo of this.musicMap.values()) {
            if (audioInfo.musicPlaying) {
                tween(audioInfo.audioSource).to(0.2, { volume: musicVolume }).tag(99).start();//聲音淡入
            }
        };
    }
}

export const getAudioManager = () => {
    return AudioManager.getInstance();
}