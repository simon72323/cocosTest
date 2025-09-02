declare namespace ShowScoreComp {
    type CCComponent = import('cc').Component;

    interface ShowScorePlayParam {
        line: WebSocketCrush.BeginGameData.Line | WebSocketCrush.BeginGameData.Scatter
        isScatter?: boolean;
        onShowStart?: () => void;
        onShowEnd?: () => void;
        addScore?: () => void;
    }
}

interface ShowScoreComp extends ShowScoreComp.CCComponent {
    showPayoff(param: ShowScoreComp.ShowScorePlayParam): Promise<void>;
    needWaitAniEnd: boolean;
}