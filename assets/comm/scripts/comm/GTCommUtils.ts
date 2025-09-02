import { assetManager, SpriteFrame } from "cc";


export function loadSprite(path: string): Promise<SpriteFrame> {
    const bundle = assetManager.getBundle('comm');
    return new Promise((resolve, reject) => {
        if (bundle) {
            bundle.load(path, SpriteFrame, (err, spriteFrame) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(spriteFrame);
                }
            });
        } else {
            reject(new Error('Bundle not found'));
        }
    });
}

export function getSpritePath(spriteName: string): string {
    return `textures/ui/${spriteName}/spriteFrame`;
}