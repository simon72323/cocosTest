
import { urlHelper } from '@common/utils/UrlHelper';
import { _decorator, Component, Label, WebView, UITransform, UIOpacity, sys, view, screen } from 'cc';

import { GTLoadingCommTool as CommTool } from '@/loading/script/comm/GTLoadingCommTool';
const { ccclass, property } = _decorator;

export enum WEBMODE{
    NONE,
    RULE,
    HISTORY,
    HELP
}

@ccclass('GTWebView')
export class GTWebView extends Component {
    @property(Label) public titleLabel: Label = null!;
    @property(WebView) public webView: WebView = null!;
    private iframeDocument : Document = null!;
    private webMode: WEBMODE = 0;
    private webviewWrapper : HTMLElement = null!;

    gesturestartBind! : (data: any) => void;
    stopScrollBind! : (data: any) => void;
    onScreenResizeBind!: () => void;

    protected onLoad(): void {
        this._setupListener();


    }

    protected onDisable(): void {
        this._getOpacity().opacity = 0;

        if(!this.webviewWrapper){
            this.webviewWrapper = document.getElementById('webview-wrapper')!;
        }
        this.webView.url = '';
        this.webviewWrapper.hidden = true;
        this.webviewWrapper.style.width = '0';
        this.webviewWrapper.style.height = '0';
        this.webviewWrapper.style.transform = '';
        this.webMode = null!;
    }

    start() {
        this.iframeDocument = this.webView.nativeWebView!.contentDocument!;
        this.gesturestartBind = this.gesturestart.bind(this);
        this.stopScrollBind = this.stopScroll.bind(this);
        if (this.iframeDocument) {
            this.iframeDocument.addEventListener('gesturestart', this.gesturestartBind);
            this.iframeDocument.addEventListener('touchmove', this.stopScrollBind, { passive: false });
            this.iframeDocument.body.style.overflow = 'hidden'; // 禁止外部页面滚动
            this.iframeDocument.addEventListener('wheel', event => {
                event.stopPropagation(); // 阻止事件传播到父页面
            }, { passive: false });
        }
        // this.onCanvasResize();
        // view.on('canvas-resize', this.onCanvasResize, this);

    }

    private _setupListener(){
        this.webView.node.on(WebView.EventType.LOADED, this._webViewOnComplete.bind(this));
        this.webView.node.on(WebView.EventType.LOADING, this._webViewOnLoading.bind(this));
        this.webView.node.on(WebView.EventType.ERROR, this._webViewOnError.bind(this));
        this.onScreenResizeBind = () => {
            this.onCanvasResize();
            // setTimeout(this.onCanvasResize.bind(this), 100);
        };

        window.addEventListener('resize', this.onScreenResizeBind);
        screen.on('window-resize',this.onScreenResizeBind, this);
    }

    public onCanvasResize():void{
        const cw = document.documentElement.clientWidth;
        const ch = document.documentElement.clientHeight;

        this.webView.node.getComponent(UITransform)!.width = cw;
        this.webView.node.getComponent(UITransform)!.height = ch;

        //先縮小視窗讓網頁內容自適應大小，再放大整個webview
        const isDesktop = sys.platform === sys.Platform.DESKTOP_BROWSER;
        const isSupportReFix = CommTool.checkNeedRefixNode() && CommTool.canAutoFix();
        const sizeRatio = CommTool.getScaleRatioFromDesign();
        const scaleRatio = 2.2;
        const webViewHeight = CommTool.getCanvas()!.height * sizeRatio - 118 - 260; //118 Topbar + 260 BottomBar
        const targetWidth = 1078/ scaleRatio;
        const targetHeight = (isDesktop || !isSupportReFix ?1542: webViewHeight)/ scaleRatio;
        this.webView.getComponent(UITransform)!.setContentSize(targetWidth, targetHeight);
        this.webView.node.setScale(scaleRatio, scaleRatio);

        view.emit('canvas-resize');
    }

    private gesturestart(event : any):void{
        // 阻止兩指縮放畫面
        event.preventDefault();
    }

    private stopScroll(event : any):void{
        const currentY = event.touches[0].clientY;
        const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
        let startY = 0;
        // 如果是在頁面頂部並且是下拉動作，阻止刷新
        if (scrollTop === 0 && currentY > startY) {
            event.preventDefault();
        }
    }

    public onDestroy():void{
        if(this.iframeDocument){
            this.iframeDocument.removeEventListener('gesturestart',this.gesturestartBind);
            this.iframeDocument.removeEventListener('touchmove', this.stopScrollBind);
        }
    }

    onEnable():void{
        this.onCanvasResize();
        if(this.webviewWrapper){
            this.webviewWrapper.hidden = false;
        }
        if(this.webMode == null){
            this.setWebMode(WEBMODE.RULE);
        }
    }

    public setWebMode(mode: WEBMODE){
        this._getOpacity().opacity = 0;
        if (mode == WEBMODE.HISTORY && this.webMode != WEBMODE.HISTORY) this.loadUrl(urlHelper.getBetHistoryURL());
        else if (mode == WEBMODE.RULE && this.webMode != WEBMODE.RULE) this.loadUrl(urlHelper.getRulePageURL());
        else if (mode == WEBMODE.HELP && this.webMode != WEBMODE.HELP) this.loadUrl(urlHelper.getHelpURL());
        this.webMode = mode;

    }

    public getWebMode():WEBMODE{
        return this.webMode;
    }

    public setTitle(title: string){
        this.titleLabel.string = title;
    }

    public getTitle(): string{
        return this.titleLabel.string;
    }

    public loadUrl(url: string){
        this.webView.url = url;
        CommTool.setNodeFade(this.webView.node, false);
    }

    public getUrl(): string{
        return this.webView.url;
    }

    private _getOpacity():UIOpacity{
        return this.webView.node.getComponent(UIOpacity)!;
    }

    private _webViewOnLoading(_component: WebView){
        // Logger.debug('_webViewOnLoading - ' + component.url);
    }

    private _webViewOnComplete(_component: WebView){
        // Logger.debug('_webViewOnComplete - '+ component.state);
        this.onCanvasResize();
        // this._getOpacity().opacity = 255;
        CommTool.setNodeFade(this.webView.node, true);
    }

    private _webViewOnError(_component: WebView,  ..._args: any[]){
        // Logger.debug('_webViewOnError - '+ component.state);
        // console.info(args);
        this._getOpacity().opacity = 255;
    }
}

