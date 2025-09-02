import { _decorator } from 'cc';
import { GTCustomButton } from './GTCustomButton';
import { NumberUtils } from '@common/utils/NumberUtils';
const { ccclass } = _decorator;

@ccclass('GTSelectCreditBtn')
export class GTSelectCreditBtn extends GTCustomButton {
    private _credit: number = 0;

    protected onLoad(): void {
        
    }
    /**
     * 
     * @param credit 
     */
    public setCredit(credit: number){
        this._credit = credit;
        if(credit == -1 ){
            this.setLabelStrings('全額兌換');
        }else{
            const param = {
                formatValue: credit, // 要格式化的數值，字串形式
                roundCount: 0,              // 四捨五入到小數點後兩位
                thousandth: true,           // 使用千位分隔符
                keepDecimal: true,         // 不保留小數部分，轉為整數
                isKFormat: true            // 使用"K"格式顯示
              };

            this.setLabelStrings(NumberUtils.formatNumber(param));
        }
    }
    public getCredit():number{
        return this._credit;
    }
}

