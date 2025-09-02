

declare namespace JackpotComp {
    type CCComponent = import('cc').Component;

    interface JackpotPlayParam {
        hit: boolean;
        type: string;
        amount: number;
    }
}

interface JackpotComp extends JackpotComp.CCComponent {
    play(param: JackpotComp.JackpotPlayParam): Promise<void>;
}