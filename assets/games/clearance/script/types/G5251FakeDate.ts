import { onBeginGame } from '@/games/clearance/script/types/G5251Interface';

export class beginGameData {
    private static _instance: beginGameData;
    private constructor() { }
    public static get Instance() {
        return this._instance || (this._instance = new this());
    }

    public dataDemo: onBeginGame[] = [
        { 'event': true, 'data': { 'PayTotal': 0, 'Lines': [[]], 'Cards': [[[2, 7, 7, 4], [8, 9, 5, 13], [7, 7, 8, 16], [5, 5, 2, 6], [3, 8, 8, 7]]], 'Scatter': { 'ID': 0, 'GridNum': 0, 'Grids': null }, 'FreeGame': { 'HitFree': false, 'ID': 0, 'FreeGameTime': 0, 'FreeGamePayoffTotal': 0 }, 'FreeGameSpin': { 'FreeGameTime': 0, 'FreeGamePayoffTotal': 0, 'WagersID': 0 }, 'RollerNumber': 0, 'BBJackpot': null, 'WagersID': 5200008434885, 'Credit': 4688.3, 'Credit_End': 4688.3, 'AxisLocation': '', 'Status': 0, 'HitWagersID': 0 }, 'tokenId': '/72' }
        , { 'event': true, 'data': { 'PayTotal': 0, 'Lines': [[]], 'Cards': [[[6, 6, 3, 2], [5, 5, 18, 8], [2, 16, 8, 18], [6, 4, 8, 8], [8, 1, 7, 7]]], 'Scatter': { 'ID': 0, 'GridNum': 0, 'Grids': null }, 'FreeGame': { 'HitFree': false, 'ID': 0, 'FreeGameTime': 0, 'FreeGamePayoffTotal': 0 }, 'FreeGameSpin': { 'FreeGameTime': 0, 'FreeGamePayoffTotal': 0, 'WagersID': 0 }, 'RollerNumber': 0, 'BBJackpot': null, 'WagersID': 5200008434886, 'Credit': 4682.3, 'Credit_End': 4682.3, 'AxisLocation': '', 'Status': 0, 'HitWagersID': 0 }, 'tokenId': '/73' }
        , { 'event': true, 'data': { 'PayTotal': 0, 'Lines': [[]], 'Cards': [[[4, 8, 8, 3], [6, 14, 4, 5], [7, 8, 8, 11], [6, 4, 5, 5], [8, 8, 7, 7]]], 'Scatter': { 'ID': 0, 'GridNum': 0, 'Grids': null }, 'FreeGame': { 'HitFree': false, 'ID': 0, 'FreeGameTime': 0, 'FreeGamePayoffTotal': 0 }, 'FreeGameSpin': { 'FreeGameTime': 0, 'FreeGamePayoffTotal': 0, 'WagersID': 0 }, 'RollerNumber': 0, 'BBJackpot': null, 'WagersID': 5200008434889, 'Credit': 4676.3, 'Credit_End': 4676.3, 'AxisLocation': '', 'Status': 0, 'HitWagersID': 0 }, 'tokenId': '/4' }
        , { 'event': true, 'data': { 'PayTotal': 31.2, 'Lines': [[{ 'GridNum': 4, 'Grids': [3, 5, 10, 15], 'Payoff': 24, 'Element': [2, 10, 2, 2], 'ElementID': 2, 'DoubleTime': 1 }], [{ 'GridNum': 3, 'Grids': [1, 5, 11], 'Payoff': 0.6, 'Element': [7, 17, 7], 'ElementID': 7, 'DoubleTime': 2 }, { 'GridNum': 3, 'Grids': [1, 5, 12], 'Payoff': 0.6, 'Element': [7, 17, 7], 'ElementID': 7, 'DoubleTime': 2 }, { 'GridNum': 3, 'Grids': [2, 5, 11], 'Payoff': 0.6, 'Element': [7, 17, 7], 'ElementID': 7, 'DoubleTime': 2 }, { 'GridNum': 3, 'Grids': [2, 5, 12], 'Payoff': 0.6, 'Element': [7, 17, 7], 'ElementID': 7, 'DoubleTime': 2 }, { 'GridNum': 3, 'Grids': [3, 5, 11], 'Payoff': 0.6, 'Element': [7, 17, 7], 'ElementID': 7, 'DoubleTime': 2 }, { 'GridNum': 3, 'Grids': [3, 5, 12], 'Payoff': 0.6, 'Element': [7, 17, 7], 'ElementID': 7, 'DoubleTime': 2 }], []], 'Cards': [[[7, 7, 2, 6], [10, 5, 5, 3], [8, 2, 7, 7], [5, 5, 2, 6], [4, 8, 8, 3]], [[7, 7, 7, 6], [17, 5, 5, 3], [1, 8, 7, 7], [4, 5, 5, 6], [4, 8, 8, 3]], [[6, 6, 4, 6], [5, 5, 5, 3], [5, 13, 1, 8], [4, 5, 5, 6], [4, 8, 8, 3]]], 'Scatter': { 'ID': 0, 'GridNum': 0, 'Grids': null }, 'FreeGame': { 'HitFree': false, 'ID': 0, 'FreeGameTime': 0, 'FreeGamePayoffTotal': 0 }, 'FreeGameSpin': { 'FreeGameTime': 0, 'FreeGamePayoffTotal': 0, 'WagersID': 0 }, 'RollerNumber': 0, 'BBJackpot': null, 'WagersID': 5200008434891, 'Credit': 4670.3, 'Credit_End': 4701.5, 'AxisLocation': '', 'Status': 0, 'HitWagersID': 0 }, 'tokenId': '/6' }
        , { 'event': true, 'data': { 'PayTotal': 0, 'Lines': [[]], 'Cards': [[[6, 3, 5, 7], [8, 1, 5, 13], [7, 15, 8, 8], [6, 4, 1, 6], [3, 8, 8, 4]]], 'Scatter': { 'ID': 0, 'GridNum': 0, 'Grids': null }, 'FreeGame': { 'HitFree': false, 'ID': 0, 'FreeGameTime': 0, 'FreeGamePayoffTotal': 0 }, 'FreeGameSpin': { 'FreeGameTime': 0, 'FreeGamePayoffTotal': 0, 'WagersID': 0 }, 'RollerNumber': 0, 'BBJackpot': null, 'WagersID': 5200008434893, 'Credit': 4695.5, 'Credit_End': 4695.5, 'AxisLocation': '', 'Status': 0, 'HitWagersID': 0 }, 'tokenId': '/8' }
        , { 'event': true, 'data': { 'PayTotal': 0, 'Lines': [[]], 'Cards': [[[5, 5, 4, 6], [18, 8, 8, 1], [8, 3, 12, 7], [2, 6, 6, 5], [5, 5, 3, 6]]], 'Scatter': { 'ID': 0, 'GridNum': 0, 'Grids': null }, 'FreeGame': { 'HitFree': false, 'ID': 0, 'FreeGameTime': 0, 'FreeGamePayoffTotal': 0 }, 'FreeGameSpin': { 'FreeGameTime': 0, 'FreeGamePayoffTotal': 0, 'WagersID': 0 }, 'RollerNumber': 0, 'BBJackpot': null, 'WagersID': 5200008434894, 'Credit': 4689.5, 'Credit_End': 4689.5, 'AxisLocation': '', 'Status': 0, 'HitWagersID': 0 }, 'tokenId': '/9' }
        , { 'event': true, 'data': { 'PayTotal': 0, 'Lines': [[]], 'Cards': [[[4, 6, 6, 2], [5, 3, 16, 8], [8, 7, 7, 1], [14, 6, 4, 5], [8, 2, 7, 7]]], 'Scatter': { 'ID': 0, 'GridNum': 0, 'Grids': null }, 'FreeGame': { 'HitFree': false, 'ID': 0, 'FreeGameTime': 0, 'FreeGamePayoffTotal': 0 }, 'FreeGameSpin': { 'FreeGameTime': 0, 'FreeGamePayoffTotal': 0, 'WagersID': 0 }, 'RollerNumber': 0, 'BBJackpot': null, 'WagersID': 5200008434895, 'Credit': 4683.5, 'Credit_End': 4683.5, 'AxisLocation': '', 'Status': 0, 'HitWagersID': 0 }, 'tokenId': '/10' }
        , { 'event': true, 'data': { 'PayTotal': 0, 'Lines': [[]], 'Cards': [[[7, 7, 2, 6], [5, 5, 9, 8], [2, 7, 7, 8], [6, 3, 2, 6], [8, 8, 1, 7]]], 'Scatter': { 'ID': 0, 'GridNum': 0, 'Grids': null }, 'FreeGame': { 'HitFree': false, 'ID': 0, 'FreeGameTime': 0, 'FreeGamePayoffTotal': 0 }, 'FreeGameSpin': { 'FreeGameTime': 0, 'FreeGamePayoffTotal': 0, 'WagersID': 0 }, 'RollerNumber': 0, 'BBJackpot': null, 'WagersID': 5200008434896, 'Credit': 4677.5, 'Credit_End': 4677.5, 'AxisLocation': '', 'Status': 0, 'HitWagersID': 0 }, 'tokenId': '/11' }
        , { 'event': true, 'data': { 'PayTotal': 0, 'Lines': [[]], 'Cards': [[[2, 7, 7, 6], [4, 16, 8, 3], [15, 8, 8, 3], [5, 13, 9, 6], [8, 8, 7, 7]]], 'Scatter': { 'ID': 0, 'GridNum': 0, 'Grids': null }, 'FreeGame': { 'HitFree': false, 'ID': 0, 'FreeGameTime': 0, 'FreeGamePayoffTotal': 0 }, 'FreeGameSpin': { 'FreeGameTime': 0, 'FreeGamePayoffTotal': 0, 'WagersID': 0 }, 'RollerNumber': 0, 'BBJackpot': null, 'WagersID': 5200008434897, 'Credit': 4671.5, 'Credit_End': 4671.5, 'AxisLocation': '', 'Status': 0, 'HitWagersID': 0 }, 'tokenId': '/12' }
        , { 'event': true, 'data': { 'PayTotal': 0, 'Lines': [[]], 'Cards': [[[2, 7, 7, 6], [5, 4, 8, 8], [1, 13, 5, 2], [5, 1, 7, 7], [4, 8, 8, 1]]], 'Scatter': { 'ID': 0, 'GridNum': 0, 'Grids': null }, 'FreeGame': { 'HitFree': false, 'ID': 0, 'FreeGameTime': 0, 'FreeGamePayoffTotal': 0 }, 'FreeGameSpin': { 'FreeGameTime': 0, 'FreeGamePayoffTotal': 0, 'WagersID': 0 }, 'RollerNumber': 0, 'BBJackpot': null, 'WagersID': 5200008434900, 'Credit': 4665.5, 'Credit_End': 4665.5, 'AxisLocation': '', 'Status': 0, 'HitWagersID': 0 }, 'tokenId': '/14' }
        , { 'event': true, 'data': { 'PayTotal': 0, 'Lines': [[]], 'Cards': [[[7, 2, 6, 6], [6, 14, 4, 5], [5, 5, 2, 7], [2, 6, 6, 4], [3, 6, 6, 4]]], 'Scatter': { 'ID': 0, 'GridNum': 0, 'Grids': null }, 'FreeGame': { 'HitFree': false, 'ID': 0, 'FreeGameTime': 0, 'FreeGamePayoffTotal': 0 }, 'FreeGameSpin': { 'FreeGameTime': 0, 'FreeGamePayoffTotal': 0, 'WagersID': 0 }, 'RollerNumber': 0, 'BBJackpot': null, 'WagersID': 5200008434901, 'Credit': 4659.5, 'Credit_End': 4659.5, 'AxisLocation': '', 'Status': 0, 'HitWagersID': 0 }, 'tokenId': '/15' }
        , { 'event': true, 'data': { 'PayTotal': 0, 'Lines': [[]], 'Cards': [[[18, 7, 7, 2], [9, 8, 8, 2], [7, 7, 8, 8], [6, 3, 2, 6], [7, 4, 3, 8]]], 'Scatter': { 'ID': 0, 'GridNum': 0, 'Grids': null }, 'FreeGame': { 'HitFree': false, 'ID': 0, 'FreeGameTime': 0, 'FreeGamePayoffTotal': 0 }, 'FreeGameSpin': { 'FreeGameTime': 0, 'FreeGamePayoffTotal': 0, 'WagersID': 0 }, 'RollerNumber': 0, 'BBJackpot': null, 'WagersID': 5200008434902, 'Credit': 4653.5, 'Credit_End': 4653.5, 'AxisLocation': '', 'Status': 0, 'HitWagersID': 0 }, 'tokenId': '/16' }
        , { 'event': true, 'data': { 'PayTotal': 0, 'Lines': [[]], 'Cards': [[[8, 3, 6, 6], [5, 1, 8, 8], [2, 7, 7, 6], [7, 7, 12, 14], [5, 5, 3, 6]]], 'Scatter': { 'ID': 0, 'GridNum': 0, 'Grids': null }, 'FreeGame': { 'HitFree': false, 'ID': 0, 'FreeGameTime': 0, 'FreeGamePayoffTotal': 0 }, 'FreeGameSpin': { 'FreeGameTime': 0, 'FreeGamePayoffTotal': 0, 'WagersID': 0 }, 'RollerNumber': 0, 'BBJackpot': null, 'WagersID': 5200008434903, 'Credit': 4647.5, 'Credit_End': 4647.5, 'AxisLocation': '', 'Status': 0, 'HitWagersID': 0 }, 'tokenId': '/17' }
        , { 'event': true, 'data': { 'PayTotal': 0, 'Lines': [[]], 'Cards': [[[3, 6, 6, 7], [4, 5, 5, 18], [7, 7, 8, 8], [1, 15, 15, 4], [8, 4, 5, 5]]], 'Scatter': { 'ID': 0, 'GridNum': 0, 'Grids': null }, 'FreeGame': { 'HitFree': false, 'ID': 0, 'FreeGameTime': 0, 'FreeGamePayoffTotal': 0 }, 'FreeGameSpin': { 'FreeGameTime': 0, 'FreeGamePayoffTotal': 0, 'WagersID': 0 }, 'RollerNumber': 0, 'BBJackpot': null, 'WagersID': 5200008434904, 'Credit': 4641.5, 'Credit_End': 4641.5, 'AxisLocation': '', 'Status': 0, 'HitWagersID': 0 }, 'tokenId': '/18' }
        , { 'event': true, 'data': { 'PayTotal': 0, 'Lines': [[]], 'Cards': [[[2, 6, 6, 3], [3, 13, 7, 4], [7, 8, 8, 2], [3, 2, 6, 6], [3, 8, 8, 4]]], 'Scatter': { 'ID': 0, 'GridNum': 0, 'Grids': null }, 'FreeGame': { 'HitFree': false, 'ID': 0, 'FreeGameTime': 0, 'FreeGamePayoffTotal': 0 }, 'FreeGameSpin': { 'FreeGameTime': 0, 'FreeGamePayoffTotal': 0, 'WagersID': 0 }, 'RollerNumber': 0, 'BBJackpot': null, 'WagersID': 5200008434906, 'Credit': 4635.5, 'Credit_End': 4635.5, 'AxisLocation': '', 'Status': 0, 'HitWagersID': 0 }, 'tokenId': '/20' }
        , { 'event': true, 'data': { 'PayTotal': 0, 'Lines': [[]], 'Cards': [[[6, 4, 7, 7], [9, 5, 5, 4], [10, 15, 7, 8], [1, 7, 7, 4], [7, 4, 3, 8]]], 'Scatter': { 'ID': 0, 'GridNum': 0, 'Grids': null }, 'FreeGame': { 'HitFree': false, 'ID': 0, 'FreeGameTime': 0, 'FreeGamePayoffTotal': 0 }, 'FreeGameSpin': { 'FreeGameTime': 0, 'FreeGamePayoffTotal': 0, 'WagersID': 0 }, 'RollerNumber': 0, 'BBJackpot': null, 'WagersID': 5200008434907, 'Credit': 4629.5, 'Credit_End': 4629.5, 'AxisLocation': '', 'Status': 0, 'HitWagersID': 0 }, 'tokenId': '/21' }
        , { 'event': true, 'data': { 'PayTotal': 0.6, 'Lines': [[{ 'GridNum': 3, 'Grids': [1, 7, 9], 'Payoff': 0.6, 'Element': [7, 7, 7], 'ElementID': 7, 'DoubleTime': 1 }], []], 'Cards': [[[7, 2, 6, 6], [3, 13, 7, 4], [7, 8, 8, 11], [13, 4, 6, 6], [6, 6, 4, 7]], [[18, 2, 6, 6], [8, 3, 13, 4], [8, 8, 8, 11], [13, 4, 6, 6], [6, 6, 4, 7]]], 'Scatter': { 'ID': 0, 'GridNum': 0, 'Grids': null }, 'FreeGame': { 'HitFree': false, 'ID': 0, 'FreeGameTime': 0, 'FreeGamePayoffTotal': 0 }, 'FreeGameSpin': { 'FreeGameTime': 0, 'FreeGamePayoffTotal': 0, 'WagersID': 0 }, 'RollerNumber': 0, 'BBJackpot': null, 'WagersID': 5200008434908, 'Credit': 4623.5, 'Credit_End': 4624.1, 'AxisLocation': '', 'Status': 0, 'HitWagersID': 0 }, 'tokenId': '/22' }
        , { 'event': true, 'data': { 'PayTotal': 0, 'Lines': [[]], 'Cards': [[[7, 7, 6, 6], [18, 8, 8, 1], [18, 7, 7, 8], [13, 4, 6, 6], [3, 5, 5, 18]]], 'Scatter': { 'ID': 18, 'GridNum': 3, 'Grids': [5, 9, 20] }, 'FreeGame': { 'HitFree': true, 'ID': 18, 'FreeGameTime': 12, 'FreeGamePayoffTotal': 0 }, 'FreeGameSpin': { 'FreeGameTime': 0, 'FreeGamePayoffTotal': 0, 'WagersID': 0 }, 'RollerNumber': 0, 'BBJackpot': null, 'WagersID': 5200008434910, 'Credit': 4618.1, 'Credit_End': 4618.1, 'AxisLocation': '', 'Status': 1, 'HitWagersID': 0 }, 'tokenId': '/24' }
        , { 'event': true, 'data': { 'PayTotal': 0, 'Lines': [[]], 'Cards': [[[4, 6, 6, 2], [8, 8, 11, 7], [9, 13, 5, 2], [5, 9, 7, 7], [1, 8, 8, 2]]], 'Scatter': { 'ID': 0, 'GridNum': 0, 'Grids': null }, 'FreeGame': { 'HitFree': false, 'ID': 0, 'FreeGameTime': 0, 'FreeGamePayoffTotal': 0 }, 'FreeGameSpin': { 'FreeGameTime': 11, 'FreeGamePayoffTotal': 0, 'WagersID': 5200008434910 }, 'RollerNumber': 1, 'BBJackpot': null, 'WagersID': 5200008434914, 'Credit': 4618.1, 'Credit_End': 4618.1, 'AxisLocation': '', 'Status': 3, 'HitWagersID': 5200008434910 }, 'tokenId': '/27' }
        , { 'event': true, 'data': { 'PayTotal': 2.4, 'Lines': [[{ 'GridNum': 3, 'Grids': [3, 5, 12], 'Payoff': 0.6, 'Element': [7, 15, 7], 'ElementID': 7, 'DoubleTime': 2 }, { 'GridNum': 3, 'Grids': [4, 5, 12], 'Payoff': 0.6, 'Element': [7, 15, 7], 'ElementID': 7, 'DoubleTime': 2 }], []], 'Cards': [[[6, 18, 7, 7], [15, 4, 5, 5], [3, 8, 8, 7], [5, 5, 2, 6], [8, 8, 3, 5]], [[6, 6, 6, 18], [17, 4, 5, 5], [2, 3, 8, 8], [5, 5, 2, 6], [8, 8, 3, 5]]], 'Scatter': { 'ID': 0, 'GridNum': 0, 'Grids': null }, 'FreeGame': { 'HitFree': false, 'ID': 0, 'FreeGameTime': 0, 'FreeGamePayoffTotal': 0 }, 'FreeGameSpin': { 'FreeGameTime': 10, 'FreeGamePayoffTotal': 2.4, 'WagersID': 5200008434910 }, 'RollerNumber': 1, 'BBJackpot': null, 'WagersID': 5200008434915, 'Credit': 4618.1, 'Credit_End': 4620.5, 'AxisLocation': '', 'Status': 3, 'HitWagersID': 5200008434910 }, 'tokenId': '/28' }
        , { 'event': true, 'data': { 'PayTotal': 0, 'Lines': [[]], 'Cards': [[[7, 7, 2, 6], [1, 16, 8, 1], [7, 15, 8, 8], [8, 8, 12, 5], [7, 1, 8, 8]]], 'Scatter': { 'ID': 0, 'GridNum': 0, 'Grids': null }, 'FreeGame': { 'HitFree': false, 'ID': 0, 'FreeGameTime': 0, 'FreeGamePayoffTotal': 0 }, 'FreeGameSpin': { 'FreeGameTime': 9, 'FreeGamePayoffTotal': 2.4, 'WagersID': 5200008434910 }, 'RollerNumber': 1, 'BBJackpot': null, 'WagersID': 5200008434916, 'Credit': 4620.5, 'Credit_End': 4620.5, 'AxisLocation': '', 'Status': 3, 'HitWagersID': 5200008434910 }, 'tokenId': '/29' }
        , { 'event': true, 'data': { 'PayTotal': 0, 'Lines': [[]], 'Cards': [[[2, 6, 6, 3], [1, 5, 5, 3], [7, 7, 8, 8], [6, 6, 5, 13], [5, 5, 3, 8]]], 'Scatter': { 'ID': 0, 'GridNum': 0, 'Grids': null }, 'FreeGame': { 'HitFree': false, 'ID': 0, 'FreeGameTime': 0, 'FreeGamePayoffTotal': 0 }, 'FreeGameSpin': { 'FreeGameTime': 8, 'FreeGamePayoffTotal': 2.4, 'WagersID': 5200008434910 }, 'RollerNumber': 1, 'BBJackpot': null, 'WagersID': 5200008434917, 'Credit': 4620.5, 'Credit_End': 4620.5, 'AxisLocation': '', 'Status': 3, 'HitWagersID': 5200008434910 }, 'tokenId': '/30' }
        , { 'event': true, 'data': { 'PayTotal': 0, 'Lines': [[]], 'Cards': [[[6, 2, 7, 7], [5, 18, 8, 8], [9, 13, 5, 2], [7, 7, 4, 6], [5, 3, 8, 8]]], 'Scatter': { 'ID': 0, 'GridNum': 0, 'Grids': null }, 'FreeGame': { 'HitFree': false, 'ID': 0, 'FreeGameTime': 0, 'FreeGamePayoffTotal': 0 }, 'FreeGameSpin': { 'FreeGameTime': 7, 'FreeGamePayoffTotal': 2.4, 'WagersID': 5200008434910 }, 'RollerNumber': 1, 'BBJackpot': null, 'WagersID': 5200008434918, 'Credit': 4620.5, 'Credit_End': 4620.5, 'AxisLocation': '', 'Status': 3, 'HitWagersID': 5200008434910 }, 'tokenId': '/31' }
        , { 'event': true, 'data': { 'PayTotal': 0, 'Lines': [[]], 'Cards': [[[6, 6, 3, 5], [5, 5, 1, 16], [4, 3, 8, 8], [2, 5, 5, 9], [7, 4, 8, 8]]], 'Scatter': { 'ID': 0, 'GridNum': 0, 'Grids': null }, 'FreeGame': { 'HitFree': false, 'ID': 0, 'FreeGameTime': 0, 'FreeGamePayoffTotal': 0 }, 'FreeGameSpin': { 'FreeGameTime': 6, 'FreeGamePayoffTotal': 2.4, 'WagersID': 5200008434910 }, 'RollerNumber': 1, 'BBJackpot': null, 'WagersID': 5200008434931, 'Credit': 4620.5, 'Credit_End': 4620.5, 'AxisLocation': '', 'Status': 3, 'HitWagersID': 5200008434910 }, 'tokenId': '/33' }
        , { 'event': true, 'data': { 'PayTotal': 0, 'Lines': [[]], 'Cards': [[[3, 2, 7, 7], [14, 4, 5, 5], [8, 8, 2, 7], [6, 4, 16, 8], [4, 7, 7, 1]]], 'Scatter': { 'ID': 0, 'GridNum': 0, 'Grids': null }, 'FreeGame': { 'HitFree': false, 'ID': 0, 'FreeGameTime': 0, 'FreeGamePayoffTotal': 0 }, 'FreeGameSpin': { 'FreeGameTime': 5, 'FreeGamePayoffTotal': 2.4, 'WagersID': 5200008434910 }, 'RollerNumber': 1, 'BBJackpot': null, 'WagersID': 5200008434932, 'Credit': 4620.5, 'Credit_End': 4620.5, 'AxisLocation': '', 'Status': 3, 'HitWagersID': 5200008434910 }, 'tokenId': '/34' }
        , { 'event': true, 'data': { 'PayTotal': 0, 'Lines': [[]], 'Cards': [[[3, 6, 6, 7], [12, 8, 8, 3], [7, 7, 8, 8], [5, 1, 8, 8], [7, 4, 5, 5]]], 'Scatter': { 'ID': 0, 'GridNum': 0, 'Grids': null }, 'FreeGame': { 'HitFree': false, 'ID': 0, 'FreeGameTime': 0, 'FreeGamePayoffTotal': 0 }, 'FreeGameSpin': { 'FreeGameTime': 4, 'FreeGamePayoffTotal': 2.4, 'WagersID': 5200008434910 }, 'RollerNumber': 1, 'BBJackpot': null, 'WagersID': 5200008434934, 'Credit': 4620.5, 'Credit_End': 4620.5, 'AxisLocation': '', 'Status': 3, 'HitWagersID': 5200008434910 }, 'tokenId': '/35' }
        , { 'event': true, 'data': { 'PayTotal': 0, 'Lines': [[]], 'Cards': [[[3, 6, 6, 7], [5, 3, 6, 14], [2, 16, 8, 18], [1, 5, 5, 4], [4, 7, 7, 1]]], 'Scatter': { 'ID': 0, 'GridNum': 0, 'Grids': null }, 'FreeGame': { 'HitFree': false, 'ID': 0, 'FreeGameTime': 0, 'FreeGamePayoffTotal': 0 }, 'FreeGameSpin': { 'FreeGameTime': 3, 'FreeGamePayoffTotal': 2.4, 'WagersID': 5200008434910 }, 'RollerNumber': 1, 'BBJackpot': null, 'WagersID': 5200008434935, 'Credit': 4620.5, 'Credit_End': 4620.5, 'AxisLocation': '', 'Status': 3, 'HitWagersID': 5200008434910 }, 'tokenId': '/36' }
        , { 'event': true, 'data': { 'PayTotal': 24, 'Lines': [[{ 'GridNum': 4, 'Grids': [3, 7, 9, 15], 'Payoff': 1.5, 'Element': [7, 7, 7, 7], 'ElementID': 7, 'DoubleTime': 2 }, { 'GridNum': 4, 'Grids': [3, 7, 9, 16], 'Payoff': 1.5, 'Element': [7, 7, 7, 7], 'ElementID': 7, 'DoubleTime': 2 }, { 'GridNum': 4, 'Grids': [3, 8, 9, 15], 'Payoff': 1.5, 'Element': [7, 15, 7, 7], 'ElementID': 7, 'DoubleTime': 2 }, { 'GridNum': 4, 'Grids': [3, 8, 9, 16], 'Payoff': 1.5, 'Element': [7, 15, 7, 7], 'ElementID': 7, 'DoubleTime': 2 }, { 'GridNum': 4, 'Grids': [4, 7, 9, 15], 'Payoff': 1.5, 'Element': [7, 7, 7, 7], 'ElementID': 7, 'DoubleTime': 2 }, { 'GridNum': 4, 'Grids': [4, 7, 9, 16], 'Payoff': 1.5, 'Element': [7, 7, 7, 7], 'ElementID': 7, 'DoubleTime': 2 }, { 'GridNum': 4, 'Grids': [4, 8, 9, 15], 'Payoff': 1.5, 'Element': [7, 15, 7, 7], 'ElementID': 7, 'DoubleTime': 2 }, { 'GridNum': 4, 'Grids': [4, 8, 9, 16], 'Payoff': 1.5, 'Element': [7, 15, 7, 7], 'ElementID': 7, 'DoubleTime': 2 }], []], 'Cards': [[[6, 18, 7, 7], [8, 11, 7, 15], [7, 8, 8, 10], [5, 9, 7, 7], [4, 8, 8, 1]], [[6, 6, 6, 18], [8, 8, 11, 17], [2, 8, 8, 10], [1, 8, 5, 9], [4, 8, 8, 1]]], 'Scatter': { 'ID': 0, 'GridNum': 0, 'Grids': null }, 'FreeGame': { 'HitFree': false, 'ID': 0, 'FreeGameTime': 0, 'FreeGamePayoffTotal': 0 }, 'FreeGameSpin': { 'FreeGameTime': 2, 'FreeGamePayoffTotal': 26.4, 'WagersID': 5200008434910 }, 'RollerNumber': 1, 'BBJackpot': null, 'WagersID': 5200008434936, 'Credit': 4620.5, 'Credit_End': 4644.5, 'AxisLocation': '', 'Status': 3, 'HitWagersID': 5200008434910 }, 'tokenId': '/37' }
        , { 'event': true, 'data': { 'PayTotal': 0, 'Lines': [[]], 'Cards': [[[3, 5, 5, 4], [5, 5, 9, 8], [8, 2, 7, 7], [4, 6, 6, 18], [8, 8, 7, 7]]], 'Scatter': { 'ID': 0, 'GridNum': 0, 'Grids': null }, 'FreeGame': { 'HitFree': false, 'ID': 0, 'FreeGameTime': 0, 'FreeGamePayoffTotal': 0 }, 'FreeGameSpin': { 'FreeGameTime': 1, 'FreeGamePayoffTotal': 26.4, 'WagersID': 5200008434910 }, 'RollerNumber': 1, 'BBJackpot': null, 'WagersID': 5200008434938, 'Credit': 4644.5, 'Credit_End': 4644.5, 'AxisLocation': '', 'Status': 3, 'HitWagersID': 5200008434910 }, 'tokenId': '/4' }
        , { 'event': true, 'data': { 'PayTotal': 0, 'Lines': [[]], 'Cards': [[[7, 7, 2, 6], [8, 1, 5, 5], [7, 9, 13, 5], [6, 6, 2, 5], [4, 5, 5, 3]]], 'Scatter': { 'ID': 0, 'GridNum': 0, 'Grids': null }, 'FreeGame': { 'HitFree': false, 'ID': 0, 'FreeGameTime': 0, 'FreeGamePayoffTotal': 0 }, 'FreeGameSpin': { 'FreeGameTime': 0, 'FreeGamePayoffTotal': 26.4, 'WagersID': 5200008434910 }, 'RollerNumber': 1, 'BBJackpot': null, 'WagersID': 5200008434940, 'Credit': 4644.5, 'Credit_End': 4644.5, 'AxisLocation': '', 'Status': 3, 'HitWagersID': 5200008434910 }, 'tokenId': '/6' }
        , { 'event': true, 'data': { 'PayTotal': 3, 'Lines': [[{ 'GridNum': 3, 'Grids': [4, 6, 11], 'Payoff': 3, 'Element': [3, 3, 3], 'ElementID': 3, 'DoubleTime': 1 }], []], 'Cards': [[[2, 6, 6, 3], [8, 3, 5, 5], [8, 8, 3, 12], [5, 2, 6, 6], [8, 8, 4, 5]], [[6, 2, 6, 6], [5, 8, 5, 5], [8, 8, 8, 12], [5, 2, 6, 6], [8, 8, 4, 5]]], 'Scatter': { 'ID': 0, 'GridNum': 0, 'Grids': null }, 'FreeGame': { 'HitFree': false, 'ID': 0, 'FreeGameTime': 0, 'FreeGamePayoffTotal': 0 }, 'FreeGameSpin': { 'FreeGameTime': 0, 'FreeGamePayoffTotal': 0, 'WagersID': 0 }, 'RollerNumber': 0, 'BBJackpot': null, 'WagersID': 5200008434941, 'Credit': 4638.5, 'Credit_End': 4641.5, 'AxisLocation': '', 'Status': 0, 'HitWagersID': 0 }, 'tokenId': '/7' }
    ];

    public data: onBeginGame[] = [
        {
            'event': true, 'data': {
                'PayTotal': 80,
                'Lines': [
                    [
                        { 'GridNum': 3, 'Grids': [1, 5, 10], 'Payoff': 20, 'Element': [8, 8, 8], 'ElementID': 8, 'DoubleTime': 1 },
                        { 'GridNum': 3, 'Grids': [1, 5, 11], 'Payoff': 20, 'Element': [8, 8, 8], 'ElementID': 8, 'DoubleTime': 1 },
                        { 'GridNum': 3, 'Grids': [2, 5, 10], 'Payoff': 20, 'Element': [8, 8, 8], 'ElementID': 8, 'DoubleTime': 1 },
                        { 'GridNum': 3, 'Grids': [2, 5, 11], 'Payoff': 20, 'Element': [8, 8, 8], 'ElementID': 8, 'DoubleTime': 1 }
                    ],
                    []
                ],
                'Cards': [
                    [[8, 8, 3, 6], [8, 18, 18, 5], [7, 8, 8, 8], [4, 1, 6, 6], [4, 8, 8, 3]],
                    [[6, 6, 3, 6], [5, 18, 18, 5], [2, 8, 7, 2], [4, 1, 6, 6], [4, 8, 8, 3]]
                ],
                'Scatter': { 'ID': 0, 'GridNum': 0, 'Grids': null },
                'FreeGame': { 'HitFree': false, 'ID': 0, 'FreeGameTime': 0, 'FreeGamePayoffTotal': 0 },
                'FreeGameSpin': { 'FreeGameTime': 0, 'FreeGamePayoffTotal': 0, 'WagersID': 0 },
                'RollerNumber': 0, 'BBJackpot': null,
                'WagersID': 161838,
                'Credit': 99400, 'Credit_End': 99480,
                'AxisLocation': '', 'Status': 0, 'HitWagersID': 0
            }, 'tokenId': '/3'
        }
        , {
            'event': true, 'data': {
                'PayTotal': 0,
                'Lines': [[]],
                'Cards': [[[6, 6, 4, 7], [1, 2, 2, 10], [7, 4, 8, 2], [1, 18, 7, 4], [8, 4, 5, 5]]],
                'Scatter': { 'ID': 0, 'GridNum': 0, 'Grids': null },
                'FreeGame': { 'HitFree': false, 'ID': 0, 'FreeGameTime': 0, 'FreeGamePayoffTotal': 0 },
                'FreeGameSpin': { 'FreeGameTime': 0, 'FreeGamePayoffTotal': 0, 'WagersID': 0 },
                'RollerNumber': 0, 'BBJackpot': null,
                'WagersID': 161839,
                'Credit': 99280, 'Credit_End': 99280,
                'AxisLocation': '', 'Status': 0, 'HitWagersID': 0
            }, 'tokenId': '/4'
        }
        , {
            'event': true, 'data': {
                'PayTotal': 0,
                'Lines': [[]],
                'Cards': [[[6, 6, 4, 7], [1, 2, 2, 10], [7, 4, 8, 2], [1, 18, 7, 4], [8, 4, 5, 5]]],
                'Scatter': { 'ID': 0, 'GridNum': 0, 'Grids': null },
                'FreeGame': { 'HitFree': false, 'ID': 0, 'FreeGameTime': 0, 'FreeGamePayoffTotal': 0 },
                'FreeGameSpin': { 'FreeGameTime': 0, 'FreeGamePayoffTotal': 0, 'WagersID': 0 },
                'RollerNumber': 0, 'BBJackpot': null,
                'WagersID': 161839,
                'Credit': 99280, 'Credit_End': 99280,
                'AxisLocation': '', 'Status': 0, 'HitWagersID': 0
            }, 'tokenId': '/4'
        }
        , {
            'event': true, 'data': {
                'PayTotal': 0,
                'Lines': [[]],
                'Cards': [[[6, 6, 4, 7], [1, 18, 18, 10], [7, 18, 8, 2], [1, 18, 7, 4], [8, 4, 5, 5]]],
                'Scatter': { 'ID': 0, 'GridNum': 0, 'Grids': null },
                'FreeGame': { 'HitFree': false, 'ID': 0, 'FreeGameTime': 0, 'FreeGamePayoffTotal': 0 },
                'FreeGameSpin': { 'FreeGameTime': 0, 'FreeGamePayoffTotal': 0, 'WagersID': 0 },
                'RollerNumber': 0, 'BBJackpot': null,
                'WagersID': 161839,
                'Credit': 99280, 'Credit_End': 99280,
                'AxisLocation': '', 'Status': 0, 'HitWagersID': 0
            }, 'tokenId': '/4'
        }
        , {
            'event': true, 'data': {
                'PayTotal': 17600,
                'Lines': [
                    [
                        { 'DoubleTime': 2, 'Element': [2, 10, 10, 10], 'ElementID': 2, 'GridNum': 4, 'Grids': [3, 8, 9, 13], 'Payoff': 800 }
                    ],
                    [
                        { 'DoubleTime': 4, 'Element': [6, 17, 17, 17], 'ElementID': 6, 'GridNum': 4, 'Grids': [1, 8, 9, 13], 'Payoff': 100 },
                        { 'DoubleTime': 4, 'Element': [6, 17, 17, 6], 'ElementID': 6, 'GridNum': 4, 'Grids': [1, 8, 9, 14], 'Payoff': 100 },
                        { 'DoubleTime': 4, 'Element': [6, 17, 17, 6], 'ElementID': 6, 'GridNum': 4, 'Grids': [1, 8, 9, 15], 'Payoff': 100 },
                        { 'DoubleTime': 4, 'Element': [6, 17, 14, 17], 'ElementID': 6, 'GridNum': 4, 'Grids': [1, 8, 12, 13], 'Payoff': 100 },
                        { 'DoubleTime': 4, 'Element': [6, 17, 14, 6], 'ElementID': 6, 'GridNum': 4, 'Grids': [1, 8, 12, 14], 'Payoff': 100 },
                        { 'DoubleTime': 4, 'Element': [6, 17, 14, 6], 'ElementID': 6, 'GridNum': 4, 'Grids': [1, 8, 12, 15], 'Payoff': 100 },
                        { 'DoubleTime': 4, 'Element': [7, 17, 17, 17, 7], 'ElementID': 7, 'GridNum': 5, 'Grids': [2, 8, 9, 13, 17], 'Payoff': 100 },
                        { 'DoubleTime': 4, 'Element': [7, 17, 17, 17, 7], 'ElementID': 7, 'GridNum': 5, 'Grids': [2, 8, 9, 13, 18], 'Payoff': 100 },
                        { 'DoubleTime': 4, 'Element': [7, 17, 7, 17, 7], 'ElementID': 7, 'GridNum': 5, 'Grids': [2, 8, 10, 13, 17], 'Payoff': 100 },
                        { 'DoubleTime': 4, 'Element': [7, 17, 7, 17, 7], 'ElementID': 7, 'GridNum': 5, 'Grids': [2, 8, 10, 13, 18], 'Payoff': 100 },
                        { 'DoubleTime': 4, 'Element': [7, 17, 7, 17, 7], 'ElementID': 7, 'GridNum': 5, 'Grids': [2, 8, 11, 13, 17], 'Payoff': 100 },
                        { 'DoubleTime': 4, 'Element': [7, 17, 7, 17, 7], 'ElementID': 7, 'GridNum': 5, 'Grids': [2, 8, 11, 13, 18], 'Payoff': 100 },
                        { 'DoubleTime': 4, 'Element': [7, 17, 17, 17, 7], 'ElementID': 7, 'GridNum': 5, 'Grids': [3, 8, 9, 13, 17], 'Payoff': 100 },
                        { 'DoubleTime': 4, 'Element': [7, 17, 17, 17, 7], 'ElementID': 7, 'GridNum': 5, 'Grids': [3, 8, 9, 13, 18], 'Payoff': 100 },
                        { 'DoubleTime': 4, 'Element': [7, 17, 7, 17, 7], 'ElementID': 7, 'GridNum': 5, 'Grids': [3, 8, 10, 13, 17], 'Payoff': 100 },
                        { 'DoubleTime': 4, 'Element': [7, 17, 7, 17, 7], 'ElementID': 7, 'GridNum': 5, 'Grids': [3, 8, 10, 13, 18], 'Payoff': 100 },
                        { 'DoubleTime': 4, 'Element': [7, 17, 7, 17, 7], 'ElementID': 7, 'GridNum': 5, 'Grids': [3, 8, 11, 13, 17], 'Payoff': 100 },
                        { 'DoubleTime': 4, 'Element': [7, 17, 7, 17, 7], 'ElementID': 7, 'GridNum': 5, 'Grids': [3, 8, 11, 13, 18], 'Payoff': 100 },
                        { 'DoubleTime': 4, 'Element': [6, 17, 17, 17], 'ElementID': 6, 'GridNum': 4, 'Grids': [4, 8, 9, 13], 'Payoff': 100 },
                        { 'DoubleTime': 4, 'Element': [6, 17, 17, 6], 'ElementID': 6, 'GridNum': 4, 'Grids': [4, 8, 9, 14], 'Payoff': 100 },
                        { 'DoubleTime': 4, 'Element': [6, 17, 17, 6], 'ElementID': 6, 'GridNum': 4, 'Grids': [4, 8, 9, 15], 'Payoff': 100 },
                        { 'DoubleTime': 4, 'Element': [6, 17, 14, 17], 'ElementID': 6, 'GridNum': 4, 'Grids': [4, 8, 12, 13], 'Payoff': 100 },
                        { 'DoubleTime': 4, 'Element': [6, 17, 14, 6], 'ElementID': 6, 'GridNum': 4, 'Grids': [4, 8, 12, 14], 'Payoff': 100 },
                        { 'DoubleTime': 4, 'Element': [6, 17, 14, 6], 'ElementID': 6, 'GridNum': 4, 'Grids': [4, 8, 12, 15], 'Payoff': 100 }
                    ],
                    [
                        { 'DoubleTime': 6, 'Element': [1, 1, 9], 'ElementID': 1, 'GridNum': 3, 'Grids': [1, 6, 9], 'Payoff': 500 },
                        { 'DoubleTime': 6, 'Element': [1, 1, 17], 'ElementID': 1, 'GridNum': 3, 'Grids': [1, 6, 12], 'Payoff': 500 }
                    ],
                    [
                        { 'DoubleTime': 10, 'Element': [6, 6, 17], 'ElementID': 6, 'GridNum': 3, 'Grids': [4, 5, 10], 'Payoff': 40 }
                    ],
                    []
                ],
                'Cards': [
                    [[7, 7, 2, 6], [1, 8, 8, 10], [10, 7, 7, 14], [10, 6, 6, 3], [7, 7, 4, 3]],
                    [[6, 7, 7, 6], [1, 8, 8, 17], [17, 7, 7, 14], [17, 6, 6, 3], [7, 7, 4, 3]],
                    [[1, 7, 7, 6], [3, 1, 8, 8], [9, 7, 7, 17], [5, 5, 10, 3], [4, 6, 4, 3]],
                    [[7, 7, 7, 6], [6, 3, 8, 8], [13, 17, 7, 7], [5, 5, 10, 3], [4, 6, 4, 3]],
                    [[7, 7, 7, 7], [14, 3, 8, 8], [5, 13, 7, 7], [5, 5, 10, 3], [4, 6, 4, 3]]
                ],
                'Scatter': { 'ID': 0, 'GridNum': 0, 'Grids': null },
                'FreeGame': { 'HitFree': false, 'ID': 0, 'FreeGameTime': 0, 'FreeGamePayoffTotal': 0 },
                'FreeGameSpin': { 'FreeGameTime': 0, 'FreeGamePayoffTotal': 0, 'WagersID': 0 },
                'RollerNumber': 0, 'BBJackpot': null,
                'WagersID': 161838,
                'Credit': 99400, 'Credit_End': 99480,
                'AxisLocation': '', 'Status': 0, 'HitWagersID': 0
            }, 'tokenId': '/3'
        }
        , {
            'event': true, 'data': {
                'PayTotal': 0,
                'Lines': [[]],
                'Cards': [[[6, 4, 7, 7], [8, 8, 1, 5], [4, 11, 16, 16], [1, 6, 6, 4], [7, 7, 4, 5]]],
                'Scatter': { 'ID': 0, 'GridNum': 0, 'Grids': null },
                'FreeGame': { 'HitFree': false, 'ID': 0, 'FreeGameTime': 0, 'FreeGamePayoffTotal': 0 },
                'FreeGameSpin': { 'FreeGameTime': 0, 'FreeGamePayoffTotal': 0, 'WagersID': 0 },
                'RollerNumber': 0, 'BBJackpot': null,
                'WagersID': 161840,
                'Credit': 99080, 'Credit_End': 99080,
                'AxisLocation': '', 'Status': 0, 'HitWagersID': 0
            }, 'tokenId': '/5'
        }
        , {
            'event': true, 'data': {
                'PayTotal': 0,
                'Lines': [[]],
                'Cards': [[[6, 6, 4, 7], [1, 18, 18, 10], [7, 18, 8, 2], [1, 18, 7, 4], [8, 4, 5, 5]]],
                'Scatter': { 'ID': 0, 'GridNum': 0, 'Grids': null },
                'FreeGame': { 'HitFree': false, 'ID': 0, 'FreeGameTime': 0, 'FreeGamePayoffTotal': 0 },
                'FreeGameSpin': { 'FreeGameTime': 0, 'FreeGamePayoffTotal': 0, 'WagersID': 0 },
                'RollerNumber': 0, 'BBJackpot': null,
                'WagersID': 161839,
                'Credit': 99280, 'Credit_End': 99280,
                'AxisLocation': '', 'Status': 0, 'HitWagersID': 0
            }, 'tokenId': '/4'
        }
        , {
            'event': true, 'data': {
                'PayTotal': 0,
                'Lines': [[]],
                'Cards': [[[6, 4, 7, 7], [8, 8, 1, 5], [4, 11, 16, 16], [1, 6, 6, 4], [7, 7, 4, 5]]],
                'Scatter': { 'ID': 0, 'GridNum': 0, 'Grids': null },
                'FreeGame': { 'HitFree': false, 'ID': 0, 'FreeGameTime': 0, 'FreeGamePayoffTotal': 0 },
                'FreeGameSpin': { 'FreeGameTime': 0, 'FreeGamePayoffTotal': 0, 'WagersID': 0 },
                'RollerNumber': 0, 'BBJackpot': null,
                'WagersID': 161840,
                'Credit': 99080, 'Credit_End': 99080,
                'AxisLocation': '', 'Status': 0, 'HitWagersID': 0
            }, 'tokenId': '/5'
        }
        , {
            'event': true, 'data': {
                'PayTotal': 0,
                'Lines': [[]],
                'Cards': [[[6, 4, 7, 7], [8, 8, 1, 5], [4, 11, 16, 16], [1, 6, 6, 4], [7, 7, 4, 5]]],
                'Scatter': { 'ID': 0, 'GridNum': 0, 'Grids': null },
                'FreeGame': { 'HitFree': false, 'ID': 0, 'FreeGameTime': 0, 'FreeGamePayoffTotal': 0 },
                'FreeGameSpin': { 'FreeGameTime': 0, 'FreeGamePayoffTotal': 0, 'WagersID': 0 },
                'RollerNumber': 0, 'BBJackpot': null,
                'WagersID': 161840,
                'Credit': 99080, 'Credit_End': 99080,
                'AxisLocation': '', 'Status': 0, 'HitWagersID': 0
            }, 'tokenId': '/5'
        }
        , {
            'event': true, 'data': {
                'PayTotal': 0,
                'Lines': [[]],
                'Cards': [[[6, 4, 7, 7], [8, 8, 1, 5], [4, 11, 16, 16], [1, 6, 6, 4], [7, 7, 4, 5]]],
                'Scatter': { 'ID': 0, 'GridNum': 0, 'Grids': null },
                'FreeGame': { 'HitFree': false, 'ID': 0, 'FreeGameTime': 0, 'FreeGamePayoffTotal': 0 },
                'FreeGameSpin': { 'FreeGameTime': 0, 'FreeGamePayoffTotal': 0, 'WagersID': 0 },
                'RollerNumber': 0, 'BBJackpot': null,
                'WagersID': 161840,
                'Credit': 99080, 'Credit_End': 99080,
                'AxisLocation': '', 'Status': 0, 'HitWagersID': 0
            }, 'tokenId': '/5'
        }
        , {
            'event': true, 'data': {
                'PayTotal': 0,
                'Lines': [[]],
                'Cards': [[[6, 4, 7, 7], [8, 8, 1, 5], [4, 11, 16, 16], [1, 6, 6, 4], [7, 7, 4, 5]]],
                'Scatter': { 'ID': 0, 'GridNum': 0, 'Grids': null },
                'FreeGame': { 'HitFree': false, 'ID': 0, 'FreeGameTime': 0, 'FreeGamePayoffTotal': 0 },
                'FreeGameSpin': { 'FreeGameTime': 0, 'FreeGamePayoffTotal': 0, 'WagersID': 0 },
                'RollerNumber': 0, 'BBJackpot': null,
                'WagersID': 161840,
                'Credit': 99080, 'Credit_End': 99080,
                'AxisLocation': '', 'Status': 0, 'HitWagersID': 0
            }, 'tokenId': '/5'
        }
        , {
            'event': true, 'data': {
                'PayTotal': 0,
                'Lines': [[]],
                'Cards': [[[6, 4, 7, 7], [8, 8, 1, 5], [4, 11, 16, 16], [1, 6, 6, 4], [7, 7, 4, 5]]],
                'Scatter': { 'ID': 0, 'GridNum': 0, 'Grids': null },
                'FreeGame': { 'HitFree': false, 'ID': 0, 'FreeGameTime': 0, 'FreeGamePayoffTotal': 0 },
                'FreeGameSpin': { 'FreeGameTime': 0, 'FreeGamePayoffTotal': 0, 'WagersID': 0 },
                'RollerNumber': 0, 'BBJackpot': null,
                'WagersID': 161840,
                'Credit': 99080, 'Credit_End': 99080,
                'AxisLocation': '', 'Status': 0, 'HitWagersID': 0
            }, 'tokenId': '/5'
        }
        , {
            //進入免費遊戲
            'event': true, 'data': {
                'PayTotal': 80,
                'Lines': [
                    [
                        { 'GridNum': 3, 'Grids': [1, 5, 10], 'Payoff': 20, 'Element': [8, 8, 8], 'ElementID': 8, 'DoubleTime': 1 },
                        { 'GridNum': 3, 'Grids': [1, 5, 11], 'Payoff': 20, 'Element': [8, 8, 8], 'ElementID': 8, 'DoubleTime': 1 },
                        { 'GridNum': 3, 'Grids': [2, 5, 10], 'Payoff': 20, 'Element': [8, 8, 8], 'ElementID': 8, 'DoubleTime': 1 },
                        { 'GridNum': 3, 'Grids': [2, 5, 11], 'Payoff': 20, 'Element': [8, 8, 8], 'ElementID': 8, 'DoubleTime': 1 }
                    ],
                    []
                ],
                'Cards': [
                    [[8, 8, 3, 6], [8, 18, 18, 5], [2, 16, 8, 18], [6, 18, 5, 5], [5, 5, 18, 7]],
                    [[6, 6, 3, 6], [5, 18, 18, 5], [2, 16, 8, 18], [6, 18, 5, 5], [5, 5, 18, 7]]
                ],
                'Scatter': { 'ID': 18, 'GridNum': 3, 'Grids': [12, 14, 19] },
                'FreeGame': { 'HitFree': true, 'ID': 18, 'FreeGameTime': 12, 'FreeGamePayoffTotal': 0 },
                'FreeGameSpin': { 'FreeGameTime': 0, 'FreeGamePayoffTotal': 0, 'WagersID': 0 },
                'RollerNumber': 0, 'BBJackpot': null,
                'WagersID': 161841,
                'Credit': 98880, 'Credit_End': 98880,
                'AxisLocation': '', 'Status': 1, 'HitWagersID': 0
            }, 'tokenId': '/6'
        }
        , {
            'event': true, 'data': {
                'PayTotal': 17600,
                'Lines': [
                    [
                        { 'DoubleTime': 2, 'Element': [2, 10, 10, 10], 'ElementID': 2, 'GridNum': 4, 'Grids': [3, 8, 9, 13], 'Payoff': 800 }
                    ],
                    [
                        { 'DoubleTime': 4, 'Element': [6, 17, 17, 17], 'ElementID': 6, 'GridNum': 4, 'Grids': [1, 8, 9, 13], 'Payoff': 100 },
                        { 'DoubleTime': 4, 'Element': [6, 17, 17, 6], 'ElementID': 6, 'GridNum': 4, 'Grids': [1, 8, 9, 14], 'Payoff': 100 },
                        { 'DoubleTime': 4, 'Element': [6, 17, 17, 6], 'ElementID': 6, 'GridNum': 4, 'Grids': [1, 8, 9, 15], 'Payoff': 100 },
                        { 'DoubleTime': 4, 'Element': [6, 17, 14, 17], 'ElementID': 6, 'GridNum': 4, 'Grids': [1, 8, 12, 13], 'Payoff': 100 },
                        { 'DoubleTime': 4, 'Element': [6, 17, 14, 6], 'ElementID': 6, 'GridNum': 4, 'Grids': [1, 8, 12, 14], 'Payoff': 100 },
                        { 'DoubleTime': 4, 'Element': [6, 17, 14, 6], 'ElementID': 6, 'GridNum': 4, 'Grids': [1, 8, 12, 15], 'Payoff': 100 },
                        { 'DoubleTime': 4, 'Element': [7, 17, 17, 17, 7], 'ElementID': 7, 'GridNum': 5, 'Grids': [2, 8, 9, 13, 17], 'Payoff': 100 },
                        { 'DoubleTime': 4, 'Element': [7, 17, 17, 17, 7], 'ElementID': 7, 'GridNum': 5, 'Grids': [2, 8, 9, 13, 18], 'Payoff': 100 },
                        { 'DoubleTime': 4, 'Element': [7, 17, 7, 17, 7], 'ElementID': 7, 'GridNum': 5, 'Grids': [2, 8, 10, 13, 17], 'Payoff': 100 },
                        { 'DoubleTime': 4, 'Element': [7, 17, 7, 17, 7], 'ElementID': 7, 'GridNum': 5, 'Grids': [2, 8, 10, 13, 18], 'Payoff': 100 },
                        { 'DoubleTime': 4, 'Element': [7, 17, 7, 17, 7], 'ElementID': 7, 'GridNum': 5, 'Grids': [2, 8, 11, 13, 17], 'Payoff': 100 },
                        { 'DoubleTime': 4, 'Element': [7, 17, 7, 17, 7], 'ElementID': 7, 'GridNum': 5, 'Grids': [2, 8, 11, 13, 18], 'Payoff': 100 },
                        { 'DoubleTime': 4, 'Element': [7, 17, 17, 17, 7], 'ElementID': 7, 'GridNum': 5, 'Grids': [3, 8, 9, 13, 17], 'Payoff': 100 },
                        { 'DoubleTime': 4, 'Element': [7, 17, 17, 17, 7], 'ElementID': 7, 'GridNum': 5, 'Grids': [3, 8, 9, 13, 18], 'Payoff': 100 },
                        { 'DoubleTime': 4, 'Element': [7, 17, 7, 17, 7], 'ElementID': 7, 'GridNum': 5, 'Grids': [3, 8, 10, 13, 17], 'Payoff': 100 },
                        { 'DoubleTime': 4, 'Element': [7, 17, 7, 17, 7], 'ElementID': 7, 'GridNum': 5, 'Grids': [3, 8, 10, 13, 18], 'Payoff': 100 },
                        { 'DoubleTime': 4, 'Element': [7, 17, 7, 17, 7], 'ElementID': 7, 'GridNum': 5, 'Grids': [3, 8, 11, 13, 17], 'Payoff': 100 },
                        { 'DoubleTime': 4, 'Element': [7, 17, 7, 17, 7], 'ElementID': 7, 'GridNum': 5, 'Grids': [3, 8, 11, 13, 18], 'Payoff': 100 },
                        { 'DoubleTime': 4, 'Element': [6, 17, 17, 17], 'ElementID': 6, 'GridNum': 4, 'Grids': [4, 8, 9, 13], 'Payoff': 100 },
                        { 'DoubleTime': 4, 'Element': [6, 17, 17, 6], 'ElementID': 6, 'GridNum': 4, 'Grids': [4, 8, 9, 14], 'Payoff': 100 },
                        { 'DoubleTime': 4, 'Element': [6, 17, 17, 6], 'ElementID': 6, 'GridNum': 4, 'Grids': [4, 8, 9, 15], 'Payoff': 100 },
                        { 'DoubleTime': 4, 'Element': [6, 17, 14, 17], 'ElementID': 6, 'GridNum': 4, 'Grids': [4, 8, 12, 13], 'Payoff': 100 },
                        { 'DoubleTime': 4, 'Element': [6, 17, 14, 6], 'ElementID': 6, 'GridNum': 4, 'Grids': [4, 8, 12, 14], 'Payoff': 100 },
                        { 'DoubleTime': 4, 'Element': [6, 17, 14, 6], 'ElementID': 6, 'GridNum': 4, 'Grids': [4, 8, 12, 15], 'Payoff': 100 }
                    ],
                    [
                        { 'DoubleTime': 6, 'Element': [1, 1, 9], 'ElementID': 1, 'GridNum': 3, 'Grids': [1, 6, 9], 'Payoff': 500 },
                        { 'DoubleTime': 6, 'Element': [1, 1, 17], 'ElementID': 1, 'GridNum': 3, 'Grids': [1, 6, 12], 'Payoff': 500 }
                    ],
                    [
                        { 'DoubleTime': 10, 'Element': [6, 6, 17], 'ElementID': 6, 'GridNum': 3, 'Grids': [4, 5, 10], 'Payoff': 40 }
                    ],
                    []
                ],
                'Cards': [
                    [[7, 7, 2, 6], [1, 8, 8, 10], [10, 7, 7, 14], [10, 6, 6, 3], [7, 7, 4, 3]],
                    [[6, 7, 7, 6], [1, 8, 8, 17], [17, 7, 7, 14], [17, 6, 6, 3], [7, 7, 4, 3]],
                    [[1, 7, 7, 6], [3, 1, 8, 8], [9, 7, 7, 17], [5, 5, 10, 3], [4, 6, 4, 3]],
                    [[7, 7, 7, 6], [6, 3, 8, 8], [13, 17, 7, 7], [5, 5, 10, 3], [4, 6, 4, 3]],
                    [[7, 7, 7, 7], [14, 3, 8, 8], [5, 13, 7, 7], [5, 5, 10, 3], [4, 6, 4, 3]]
                ],
                'Scatter': { 'ID': 0, 'GridNum': 0, 'Grids': null },
                'FreeGame': { 'HitFree': false, 'ID': 0, 'FreeGameTime': 0, 'FreeGamePayoffTotal': 0 },
                'FreeGameSpin': { 'FreeGameTime': 4, 'FreeGamePayoffTotal': 17600, 'WagersID': 161841 },
                'RollerNumber': 1, 'BBJackpot': null,
                'WagersID': 161850,
                'Credit': 99280, 'Credit_End': 116880,
                'AxisLocation': '', 'Status': 3, 'HitWagersID': 161841
            }, 'tokenId': '/14'
        }
        , {
            'event': true, 'data': {
                'PayTotal': 17600,
                'Lines': [
                    [
                        { 'DoubleTime': 2, 'Element': [2, 10, 10, 10], 'ElementID': 2, 'GridNum': 4, 'Grids': [3, 8, 9, 13], 'Payoff': 800 }
                    ],
                    [
                        { 'DoubleTime': 4, 'Element': [6, 17, 17, 17], 'ElementID': 6, 'GridNum': 4, 'Grids': [1, 8, 9, 13], 'Payoff': 100 },
                        { 'DoubleTime': 4, 'Element': [6, 17, 17, 6], 'ElementID': 6, 'GridNum': 4, 'Grids': [1, 8, 9, 14], 'Payoff': 100 },
                        { 'DoubleTime': 4, 'Element': [6, 17, 17, 6], 'ElementID': 6, 'GridNum': 4, 'Grids': [1, 8, 9, 15], 'Payoff': 100 },
                        { 'DoubleTime': 4, 'Element': [6, 17, 14, 17], 'ElementID': 6, 'GridNum': 4, 'Grids': [1, 8, 12, 13], 'Payoff': 100 },
                        { 'DoubleTime': 4, 'Element': [6, 17, 14, 6], 'ElementID': 6, 'GridNum': 4, 'Grids': [1, 8, 12, 14], 'Payoff': 100 },
                        { 'DoubleTime': 4, 'Element': [6, 17, 14, 6], 'ElementID': 6, 'GridNum': 4, 'Grids': [1, 8, 12, 15], 'Payoff': 100 },
                        { 'DoubleTime': 4, 'Element': [7, 17, 17, 17, 7], 'ElementID': 7, 'GridNum': 5, 'Grids': [2, 8, 9, 13, 17], 'Payoff': 100 },
                        { 'DoubleTime': 4, 'Element': [7, 17, 17, 17, 7], 'ElementID': 7, 'GridNum': 5, 'Grids': [2, 8, 9, 13, 18], 'Payoff': 100 },
                        { 'DoubleTime': 4, 'Element': [7, 17, 7, 17, 7], 'ElementID': 7, 'GridNum': 5, 'Grids': [2, 8, 10, 13, 17], 'Payoff': 100 },
                        { 'DoubleTime': 4, 'Element': [7, 17, 7, 17, 7], 'ElementID': 7, 'GridNum': 5, 'Grids': [2, 8, 10, 13, 18], 'Payoff': 100 },
                        { 'DoubleTime': 4, 'Element': [7, 17, 7, 17, 7], 'ElementID': 7, 'GridNum': 5, 'Grids': [2, 8, 11, 13, 17], 'Payoff': 100 },
                        { 'DoubleTime': 4, 'Element': [7, 17, 7, 17, 7], 'ElementID': 7, 'GridNum': 5, 'Grids': [2, 8, 11, 13, 18], 'Payoff': 100 },
                        { 'DoubleTime': 4, 'Element': [7, 17, 17, 17, 7], 'ElementID': 7, 'GridNum': 5, 'Grids': [3, 8, 9, 13, 17], 'Payoff': 100 },
                        { 'DoubleTime': 4, 'Element': [7, 17, 17, 17, 7], 'ElementID': 7, 'GridNum': 5, 'Grids': [3, 8, 9, 13, 18], 'Payoff': 100 },
                        { 'DoubleTime': 4, 'Element': [7, 17, 7, 17, 7], 'ElementID': 7, 'GridNum': 5, 'Grids': [3, 8, 10, 13, 17], 'Payoff': 100 },
                        { 'DoubleTime': 4, 'Element': [7, 17, 7, 17, 7], 'ElementID': 7, 'GridNum': 5, 'Grids': [3, 8, 10, 13, 18], 'Payoff': 100 },
                        { 'DoubleTime': 4, 'Element': [7, 17, 7, 17, 7], 'ElementID': 7, 'GridNum': 5, 'Grids': [3, 8, 11, 13, 17], 'Payoff': 100 },
                        { 'DoubleTime': 4, 'Element': [7, 17, 7, 17, 7], 'ElementID': 7, 'GridNum': 5, 'Grids': [3, 8, 11, 13, 18], 'Payoff': 100 },
                        { 'DoubleTime': 4, 'Element': [6, 17, 17, 17], 'ElementID': 6, 'GridNum': 4, 'Grids': [4, 8, 9, 13], 'Payoff': 100 },
                        { 'DoubleTime': 4, 'Element': [6, 17, 17, 6], 'ElementID': 6, 'GridNum': 4, 'Grids': [4, 8, 9, 14], 'Payoff': 100 },
                        { 'DoubleTime': 4, 'Element': [6, 17, 17, 6], 'ElementID': 6, 'GridNum': 4, 'Grids': [4, 8, 9, 15], 'Payoff': 100 },
                        { 'DoubleTime': 4, 'Element': [6, 17, 14, 17], 'ElementID': 6, 'GridNum': 4, 'Grids': [4, 8, 12, 13], 'Payoff': 100 },
                        { 'DoubleTime': 4, 'Element': [6, 17, 14, 6], 'ElementID': 6, 'GridNum': 4, 'Grids': [4, 8, 12, 14], 'Payoff': 100 },
                        { 'DoubleTime': 4, 'Element': [6, 17, 14, 6], 'ElementID': 6, 'GridNum': 4, 'Grids': [4, 8, 12, 15], 'Payoff': 100 }
                    ],
                    [
                        { 'DoubleTime': 6, 'Element': [1, 1, 9], 'ElementID': 1, 'GridNum': 3, 'Grids': [1, 6, 9], 'Payoff': 500 },
                        { 'DoubleTime': 6, 'Element': [1, 1, 17], 'ElementID': 1, 'GridNum': 3, 'Grids': [1, 6, 12], 'Payoff': 500 }
                    ],
                    [
                        { 'DoubleTime': 10, 'Element': [6, 6, 17], 'ElementID': 6, 'GridNum': 3, 'Grids': [4, 5, 10], 'Payoff': 40 }
                    ],
                    []
                ],
                'Cards': [
                    [[7, 7, 2, 6], [1, 8, 8, 10], [10, 7, 7, 14], [10, 6, 6, 3], [7, 7, 4, 3]],
                    [[6, 7, 7, 6], [1, 8, 8, 17], [17, 7, 7, 14], [17, 6, 6, 3], [7, 7, 4, 3]],
                    [[1, 7, 7, 6], [3, 1, 8, 8], [9, 7, 7, 17], [5, 5, 10, 3], [4, 6, 4, 3]],
                    [[7, 7, 7, 6], [6, 3, 8, 8], [13, 17, 7, 7], [5, 5, 10, 3], [4, 6, 4, 3]],
                    [[7, 7, 7, 7], [14, 3, 8, 8], [5, 13, 7, 7], [5, 5, 10, 3], [4, 6, 4, 3]]
                ],
                'Scatter': { 'ID': 0, 'GridNum': 0, 'Grids': null },
                'FreeGame': { 'HitFree': false, 'ID': 0, 'FreeGameTime': 0, 'FreeGamePayoffTotal': 0 },
                'FreeGameSpin': { 'FreeGameTime': 1, 'FreeGamePayoffTotal': 35200, 'WagersID': 161841 },
                'RollerNumber': 1, 'BBJackpot': null,
                'WagersID': 161850,
                'Credit': 99280, 'Credit_End': 116880,
                'AxisLocation': '', 'Status': 3, 'HitWagersID': 161841
            }, 'tokenId': '/14'
        }
        , {
            //最後一局免費遊戲
            'event': true, 'data': {
                'PayTotal': 0,
                'Lines': [[]],
                'Cards': [[[7, 7, 2, 6], [3, 6, 14, 4], [7, 7, 9, 13], [6, 5, 13, 4], [8, 8, 7, 7]]],
                'Scatter': { 'ID': 0, 'GridNum': 0, 'Grids': null },
                'FreeGame': { 'HitFree': false, 'ID': 0, 'FreeGameTime': 0, 'FreeGamePayoffTotal': 0 },
                'FreeGameSpin': { 'FreeGameTime': 0, 'FreeGamePayoffTotal': 35200, 'WagersID': 161841 },
                'RollerNumber': 1, 'BBJackpot': null,
                'WagersID': 161854,
                'Credit': 117000, 'Credit_End': 117000,
                'AxisLocation': '', 'Status': 3, 'HitWagersID': 161841
            }, 'tokenId': '/4'
        }
        , {
            'event': true, 'data': {
                'PayTotal': 0,
                'Lines': [[]],
                'Cards': [[[6, 4, 7, 7], [8, 8, 1, 5], [4, 11, 16, 16], [1, 6, 6, 4], [7, 7, 4, 5]]],
                'Scatter': { 'ID': 0, 'GridNum': 0, 'Grids': null },
                'FreeGame': { 'HitFree': false, 'ID': 0, 'FreeGameTime': 0, 'FreeGamePayoffTotal': 0 },
                'FreeGameSpin': { 'FreeGameTime': 0, 'FreeGamePayoffTotal': 0, 'WagersID': 0 },
                'RollerNumber': 0, 'BBJackpot': null,
                'WagersID': 161840,
                'Credit': 99080, 'Credit_End': 99080,
                'AxisLocation': '', 'Status': 0, 'HitWagersID': 0
            }, 'tokenId': '/5'
        }
        , {
            'event': true, 'data': {
                'PayTotal': 0,
                'Lines': [[]],
                'Cards': [[[6, 4, 7, 7], [8, 8, 1, 5], [4, 11, 16, 16], [1, 6, 6, 4], [7, 7, 4, 5]]],
                'Scatter': { 'ID': 0, 'GridNum': 0, 'Grids': null },
                'FreeGame': { 'HitFree': false, 'ID': 0, 'FreeGameTime': 0, 'FreeGamePayoffTotal': 0 },
                'FreeGameSpin': { 'FreeGameTime': 0, 'FreeGamePayoffTotal': 0, 'WagersID': 0 },
                'RollerNumber': 0, 'BBJackpot': null,
                'WagersID': 161840,
                'Credit': 99080, 'Credit_End': 99080,
                'AxisLocation': '', 'Status': 0, 'HitWagersID': 0
            }, 'tokenId': '/5'
        }
        , {
            'event': true, 'data': {
                'PayTotal': 0,
                'Lines': [[]],
                'Cards': [[[6, 4, 7, 7], [8, 8, 1, 5], [4, 11, 16, 16], [1, 6, 6, 4], [7, 7, 4, 5]]],
                'Scatter': { 'ID': 0, 'GridNum': 0, 'Grids': null },
                'FreeGame': { 'HitFree': false, 'ID': 0, 'FreeGameTime': 0, 'FreeGamePayoffTotal': 0 },
                'FreeGameSpin': { 'FreeGameTime': 0, 'FreeGamePayoffTotal': 0, 'WagersID': 0 },
                'RollerNumber': 0, 'BBJackpot': null,
                'WagersID': 161840,
                'Credit': 99080, 'Credit_End': 99080,
                'AxisLocation': '', 'Status': 0, 'HitWagersID': 0
            }, 'tokenId': '/5'
        }
        , {
            //進入免費遊戲
            'event': true, 'data': {
                'PayTotal': 0,
                'Lines': [[]],
                'Cards': [[[6, 4, 7, 7], [3, 5, 5, 1], [2, 16, 8, 18], [6, 18, 5, 5], [5, 5, 18, 7]]],
                'Scatter': { 'ID': 18, 'GridNum': 3, 'Grids': [12, 14, 19] },
                'FreeGame': { 'HitFree': true, 'ID': 18, 'FreeGameTime': 12, 'FreeGamePayoffTotal': 0 },
                'FreeGameSpin': { 'FreeGameTime': 0, 'FreeGamePayoffTotal': 0, 'WagersID': 0 },
                'RollerNumber': 0, 'BBJackpot': null,
                'WagersID': 161841,
                'Credit': 98880, 'Credit_End': 98880,
                'AxisLocation': '', 'Status': 1, 'HitWagersID': 0
            }, 'tokenId': '/6'
        }
        , {
            'event': true, 'data': {
                'PayTotal': 17600,
                'Lines': [
                    [
                        { 'DoubleTime': 2, 'Element': [2, 10, 10, 10], 'ElementID': 2, 'GridNum': 4, 'Grids': [3, 8, 9, 13], 'Payoff': 800 }
                    ],
                    [
                        { 'DoubleTime': 4, 'Element': [6, 17, 17, 17], 'ElementID': 6, 'GridNum': 4, 'Grids': [1, 8, 9, 13], 'Payoff': 100 },
                        { 'DoubleTime': 4, 'Element': [6, 17, 17, 6], 'ElementID': 6, 'GridNum': 4, 'Grids': [1, 8, 9, 14], 'Payoff': 100 },
                        { 'DoubleTime': 4, 'Element': [6, 17, 17, 6], 'ElementID': 6, 'GridNum': 4, 'Grids': [1, 8, 9, 15], 'Payoff': 100 },
                        { 'DoubleTime': 4, 'Element': [6, 17, 14, 17], 'ElementID': 6, 'GridNum': 4, 'Grids': [1, 8, 12, 13], 'Payoff': 100 },
                        { 'DoubleTime': 4, 'Element': [6, 17, 14, 6], 'ElementID': 6, 'GridNum': 4, 'Grids': [1, 8, 12, 14], 'Payoff': 100 },
                        { 'DoubleTime': 4, 'Element': [6, 17, 14, 6], 'ElementID': 6, 'GridNum': 4, 'Grids': [1, 8, 12, 15], 'Payoff': 100 },
                        { 'DoubleTime': 4, 'Element': [7, 17, 17, 17, 7], 'ElementID': 7, 'GridNum': 5, 'Grids': [2, 8, 9, 13, 17], 'Payoff': 100 },
                        { 'DoubleTime': 4, 'Element': [7, 17, 17, 17, 7], 'ElementID': 7, 'GridNum': 5, 'Grids': [2, 8, 9, 13, 18], 'Payoff': 100 },
                        { 'DoubleTime': 4, 'Element': [7, 17, 7, 17, 7], 'ElementID': 7, 'GridNum': 5, 'Grids': [2, 8, 10, 13, 17], 'Payoff': 100 },
                        { 'DoubleTime': 4, 'Element': [7, 17, 7, 17, 7], 'ElementID': 7, 'GridNum': 5, 'Grids': [2, 8, 10, 13, 18], 'Payoff': 100 },
                        { 'DoubleTime': 4, 'Element': [7, 17, 7, 17, 7], 'ElementID': 7, 'GridNum': 5, 'Grids': [2, 8, 11, 13, 17], 'Payoff': 100 },
                        { 'DoubleTime': 4, 'Element': [7, 17, 7, 17, 7], 'ElementID': 7, 'GridNum': 5, 'Grids': [2, 8, 11, 13, 18], 'Payoff': 100 },
                        { 'DoubleTime': 4, 'Element': [7, 17, 17, 17, 7], 'ElementID': 7, 'GridNum': 5, 'Grids': [3, 8, 9, 13, 17], 'Payoff': 100 },
                        { 'DoubleTime': 4, 'Element': [7, 17, 17, 17, 7], 'ElementID': 7, 'GridNum': 5, 'Grids': [3, 8, 9, 13, 18], 'Payoff': 100 },
                        { 'DoubleTime': 4, 'Element': [7, 17, 7, 17, 7], 'ElementID': 7, 'GridNum': 5, 'Grids': [3, 8, 10, 13, 17], 'Payoff': 100 },
                        { 'DoubleTime': 4, 'Element': [7, 17, 7, 17, 7], 'ElementID': 7, 'GridNum': 5, 'Grids': [3, 8, 10, 13, 18], 'Payoff': 100 },
                        { 'DoubleTime': 4, 'Element': [7, 17, 7, 17, 7], 'ElementID': 7, 'GridNum': 5, 'Grids': [3, 8, 11, 13, 17], 'Payoff': 100 },
                        { 'DoubleTime': 4, 'Element': [7, 17, 7, 17, 7], 'ElementID': 7, 'GridNum': 5, 'Grids': [3, 8, 11, 13, 18], 'Payoff': 100 },
                        { 'DoubleTime': 4, 'Element': [6, 17, 17, 17], 'ElementID': 6, 'GridNum': 4, 'Grids': [4, 8, 9, 13], 'Payoff': 100 },
                        { 'DoubleTime': 4, 'Element': [6, 17, 17, 6], 'ElementID': 6, 'GridNum': 4, 'Grids': [4, 8, 9, 14], 'Payoff': 100 },
                        { 'DoubleTime': 4, 'Element': [6, 17, 17, 6], 'ElementID': 6, 'GridNum': 4, 'Grids': [4, 8, 9, 15], 'Payoff': 100 },
                        { 'DoubleTime': 4, 'Element': [6, 17, 14, 17], 'ElementID': 6, 'GridNum': 4, 'Grids': [4, 8, 12, 13], 'Payoff': 100 },
                        { 'DoubleTime': 4, 'Element': [6, 17, 14, 6], 'ElementID': 6, 'GridNum': 4, 'Grids': [4, 8, 12, 14], 'Payoff': 100 },
                        { 'DoubleTime': 4, 'Element': [6, 17, 14, 6], 'ElementID': 6, 'GridNum': 4, 'Grids': [4, 8, 12, 15], 'Payoff': 100 }
                    ],
                    [
                        { 'DoubleTime': 6, 'Element': [1, 1, 9], 'ElementID': 1, 'GridNum': 3, 'Grids': [1, 6, 9], 'Payoff': 500 },
                        { 'DoubleTime': 6, 'Element': [1, 1, 17], 'ElementID': 1, 'GridNum': 3, 'Grids': [1, 6, 12], 'Payoff': 500 }
                    ],
                    [
                        { 'DoubleTime': 10, 'Element': [6, 6, 17], 'ElementID': 6, 'GridNum': 3, 'Grids': [4, 5, 10], 'Payoff': 40 }
                    ],
                    []
                ],
                'Cards': [
                    [[7, 7, 2, 6], [1, 8, 8, 10], [10, 7, 7, 14], [10, 6, 6, 3], [7, 7, 4, 3]],
                    [[6, 7, 7, 6], [1, 8, 8, 17], [17, 7, 7, 14], [17, 6, 6, 3], [7, 7, 4, 3]],
                    [[1, 7, 7, 6], [3, 1, 8, 8], [9, 7, 7, 17], [5, 5, 10, 3], [4, 6, 4, 3]],
                    [[7, 7, 7, 6], [6, 3, 8, 8], [13, 17, 7, 7], [5, 5, 10, 3], [4, 6, 4, 3]],
                    [[7, 7, 7, 7], [14, 3, 8, 8], [5, 13, 7, 7], [5, 5, 10, 3], [4, 6, 4, 3]]
                ],
                'Scatter': { 'ID': 0, 'GridNum': 0, 'Grids': null },
                'FreeGame': { 'HitFree': false, 'ID': 0, 'FreeGameTime': 0, 'FreeGamePayoffTotal': 0 },
                'FreeGameSpin': { 'FreeGameTime': 4, 'FreeGamePayoffTotal': 18000, 'WagersID': 161841 },
                'RollerNumber': 1, 'BBJackpot': null,
                'WagersID': 161850,
                'Credit': 99280, 'Credit_End': 116880,
                'AxisLocation': '', 'Status': 3, 'HitWagersID': 161841
            }, 'tokenId': '/14'
        }
        , {
            //最後一局免費遊戲
            'event': true, 'data': {
                'PayTotal': 0,
                'Lines': [[]],
                'Cards': [[[7, 7, 2, 6], [3, 6, 14, 4], [7, 7, 9, 13], [6, 5, 13, 4], [8, 8, 7, 7]]],
                'Scatter': { 'ID': 0, 'GridNum': 0, 'Grids': null },
                'FreeGame': { 'HitFree': false, 'ID': 0, 'FreeGameTime': 0, 'FreeGamePayoffTotal': 0 },
                'FreeGameSpin': { 'FreeGameTime': 0, 'FreeGamePayoffTotal': 18120, 'WagersID': 161841 },
                'RollerNumber': 1, 'BBJackpot': null,
                'WagersID': 161854,
                'Credit': 117000, 'Credit_End': 117000,
                'AxisLocation': '', 'Status': 3, 'HitWagersID': 161841
            }, 'tokenId': '/4'
        }
        , {
            'event': true, 'data': {
                'PayTotal': 0,
                'Lines': [[]],
                'Cards': [[[3, 5, 7, 4], [8, 8, 9, 5], [8, 8, 7, 7], [12, 14, 6, 18], [8, 2, 7, 7]]],
                'Scatter': { 'ID': 0, 'GridNum': 0, 'Grids': null },
                'FreeGame': { 'HitFree': false, 'ID': 0, 'FreeGameTime': 0, 'FreeGamePayoffTotal': 0 },
                'FreeGameSpin': { 'FreeGameTime': 0, 'FreeGamePayoffTotal': 0, 'WagersID': 0 },
                'RollerNumber': 0, 'BBJackpot': null,
                'WagersID': 161855,
                'Credit': 116800, 'Credit_End': 116800,
                'AxisLocation': '', 'Status': 0, 'HitWagersID': 0
            }, 'tokenId': '/5'
        }
        // {
        //     "event": true,
        //     "data": {
        //         "PayTotal": 7,
        //         "Lines": [
        //             [
        //                 { "GridNum": 4, "Grids": [2, 5, 9, 14], "Payoff": 1, "Element": [5, 13, 17, 5], "ElementID": 5, "DoubleTime": 1 },
        //                 { "GridNum": 4, "Grids": [2, 6, 9, 14], "Payoff": 1, "Element": [5, 5, 17, 5], "ElementID": 5, "DoubleTime": 1 },
        //                 { "GridNum": 4, "Grids": [4, 8, 9, 16], "Payoff": 0.5, "Element": [7, 7, 17, 7], "ElementID": 7, "DoubleTime": 1 }
        //             ],
        //             [
        //                 { "GridNum": 3, "Grids": [1, 7, 12], "Payoff": 0.8, "Element": [3, 17, 3], "ElementID": 3, "DoubleTime": 2 },
        //                 { "GridNum": 3, "Grids": [2, 7, 12], "Payoff": 0.8, "Element": [3, 17, 3], "ElementID": 3, "DoubleTime": 2 }
        //             ],
        //             [
        //                 { "GridNum": 3, "Grids": [2, 5, 12], "Payoff": 1, "Element": [2, 10, 2], "ElementID": 2, "DoubleTime": 3 },
        //                 { "GridNum": 3, "Grids": [2, 7, 12], "Payoff": 1, "Element": [2, 2, 2], "ElementID": 2, "DoubleTime": 3 },
        //                 { "GridNum": 3, "Grids": [2, 8, 12], "Payoff": 1, "Element": [2, 2, 2], "ElementID": 2, "DoubleTime": 3 },
        //                 { "GridNum": 5, "Grids": [3, 6, 9, 15, 20], "Payoff": 4, "Element": [4, 4, 12, 4, 4], "ElementID": 4, "DoubleTime": 3 }
        //             ],
        //             [
        //                 { "GridNum": 4, "Grids": [1, 8, 10, 13], "Payoff": 0.5, "Element": [8, 17, 17, 17], "ElementID": 8, "DoubleTime": 5 },
        //                 { "GridNum": 4, "Grids": [1, 8, 10, 14], "Payoff": 0.5, "Element": [8, 17, 17, 8], "ElementID": 8, "DoubleTime": 5 },
        //                 { "GridNum": 4, "Grids": [1, 8, 12, 13], "Payoff": 0.5, "Element": [8, 17, 16, 17], "ElementID": 8, "DoubleTime": 5 },
        //                 { "GridNum": 4, "Grids": [1, 8, 12, 14], "Payoff": 0.5, "Element": [8, 17, 16, 8], "ElementID": 8, "DoubleTime": 5 },
        //                 { "GridNum": 4, "Grids": [2, 8, 10, 13], "Payoff": 1, "Element": [6, 17, 17, 17], "ElementID": 6, "DoubleTime": 5 },
        //                 { "GridNum": 4, "Grids": [2, 8, 10, 16], "Payoff": 1, "Element": [6, 17, 17, 6], "ElementID": 6, "DoubleTime": 5 },
        //                 { "GridNum": 5, "Grids": [3, 8, 9, 13, 19], "Payoff": 10, "Element": [1, 17, 9, 17, 1], "ElementID": 1, "DoubleTime": 5 },
        //                 { "GridNum": 5, "Grids": [3, 8, 9, 13, 20], "Payoff": 10, "Element": [1, 17, 9, 17, 1], "ElementID": 1, "DoubleTime": 5 },
        //                 { "GridNum": 5, "Grids": [3, 8, 10, 13, 19], "Payoff": 10, "Element": [1, 17, 17, 17, 1], "ElementID": 1, "DoubleTime": 5 },
        //                 { "GridNum": 5, "Grids": [3, 8, 10, 13, 20], "Payoff": 10, "Element": [1, 17, 17, 17, 1], "ElementID": 1, "DoubleTime": 5 },
        //                 { "GridNum": 5, "Grids": [3, 8, 11, 13, 19], "Payoff": 10, "Element": [1, 17, 1, 17, 1], "ElementID": 1, "DoubleTime": 5 },
        //                 { "GridNum": 5, "Grids": [3, 8, 11, 13, 20], "Payoff": 10, "Element": [1, 17, 1, 17, 1], "ElementID": 1, "DoubleTime": 5 },
        //                 { "GridNum": 4, "Grids": [4, 8, 10, 13], "Payoff": 1, "Element": [6, 17, 17, 17], "ElementID": 6, "DoubleTime": 5 },
        //                 { "GridNum": 4, "Grids": [4, 8, 10, 16], "Payoff": 1, "Element": [6, 17, 17, 6], "ElementID": 6, "DoubleTime": 5 }
        //             ],
        //             [
        //                 { "GridNum": 5, "Grids": [1, 7, 11, 14, 18], "Payoff": 4, "Element": [4, 4, 17, 4, 4], "ElementID": 4, "DoubleTime": 5 },
        //                 { "GridNum": 5, "Grids": [1, 7, 11, 14, 19], "Payoff": 4, "Element": [4, 4, 17, 4, 4], "ElementID": 4, "DoubleTime": 5 },
        //                 { "GridNum": 5, "Grids": [1, 7, 12, 14, 18], "Payoff": 4, "Element": [4, 4, 17, 4, 4], "ElementID": 4, "DoubleTime": 5 },
        //                 { "GridNum": 5, "Grids": [1, 7, 12, 14, 19], "Payoff": 4, "Element": [4, 4, 17, 4, 4], "ElementID": 4, "DoubleTime": 5 },
        //                 { "GridNum": 4, "Grids": [2, 5, 11, 13], "Payoff": 6, "Element": [1, 1, 17, 1], "ElementID": 1, "DoubleTime": 5 },
        //                 { "GridNum": 4, "Grids": [2, 5, 12, 13], "Payoff": 6, "Element": [1, 1, 17, 1], "ElementID": 1, "DoubleTime": 5 },
        //                 { "GridNum": 3, "Grids": [3, 8, 9], "Payoff": 0.8, "Element": [3, 11, 11], "ElementID": 3, "DoubleTime": 5 },
        //                 { "GridNum": 3, "Grids": [3, 8, 11], "Payoff": 0.8, "Element": [3, 11, 17], "ElementID": 3, "DoubleTime": 5 },
        //                 { "GridNum": 3, "Grids": [3, 8, 12], "Payoff": 0.8, "Element": [3, 11, 17], "ElementID": 3, "DoubleTime": 5 }
        //             ],
        //             [
        //                 { "GridNum": 4, "Grids": [1, 8, 11, 16], "Payoff": 0.5, "Element": [7, 17, 17, 7], "ElementID": 7, "DoubleTime": 5 },
        //                 { "GridNum": 3, "Grids": [2, 8, 11], "Payoff": 0.4, "Element": [6, 17, 17], "ElementID": 6, "DoubleTime": 5 },
        //                 { "GridNum": 3, "Grids": [3, 7, 9], "Payoff": 0.4, "Element": [5, 5, 5], "ElementID": 5, "DoubleTime": 5 },
        //                 { "GridNum": 3, "Grids": [3, 7, 10], "Payoff": 0.4, "Element": [5, 5, 13], "ElementID": 5, "DoubleTime": 5 },
        //                 { "GridNum": 3, "Grids": [3, 7, 11], "Payoff": 0.4, "Element": [5, 5, 17], "ElementID": 5, "DoubleTime": 5 },
        //                 { "GridNum": 3, "Grids": [3, 7, 12], "Payoff": 0.4, "Element": [5, 5, 5], "ElementID": 5, "DoubleTime": 5 },
        //                 { "GridNum": 3, "Grids": [3, 8, 9], "Payoff": 0.4, "Element": [5, 17, 5], "ElementID": 5, "DoubleTime": 5 },
        //                 { "GridNum": 3, "Grids": [3, 8, 10], "Payoff": 0.4, "Element": [5, 17, 13], "ElementID": 5, "DoubleTime": 5 },
        //                 { "GridNum": 3, "Grids": [3, 8, 11], "Payoff": 0.4, "Element": [5, 17, 17], "ElementID": 5, "DoubleTime": 5 },
        //                 { "GridNum": 3, "Grids": [3, 8, 12], "Payoff": 0.4, "Element": [5, 17, 5], "ElementID": 5, "DoubleTime": 5 },
        //                 { "GridNum": 5, "Grids": [4, 8, 11, 13, 20], "Payoff": 8, "Element": [2, 17, 17, 2, 2], "ElementID": 2, "DoubleTime": 5 },
        //                 { "GridNum": 5, "Grids": [4, 8, 11, 15, 20], "Payoff": 8, "Element": [2, 17, 17, 2, 2], "ElementID": 2, "DoubleTime": 5 }
        //             ],
        //             [
        //                 { "GridNum": 4, "Grids": [1, 8, 12, 15], "Payoff": 1.5, "Element": [4, 12, 17, 4], "ElementID": 4, "DoubleTime": 5 },
        //                 { "GridNum": 3, "Grids": [2, 7, 12], "Payoff": 1.5, "Element": [1, 9, 17], "ElementID": 1, "DoubleTime": 5 },
        //                 { "GridNum": 3, "Grids": [3, 7, 12], "Payoff": 1.5, "Element": [1, 9, 17], "ElementID": 1, "DoubleTime": 5 }
        //             ],
        //             [
        //                 { "GridNum": 3, "Grids": [1, 7, 9], "Payoff": 1.5, "Element": [1, 17, 1], "ElementID": 1, "DoubleTime": 5 },
        //                 { "GridNum": 3, "Grids": [1, 8, 9], "Payoff": 1.5, "Element": [1, 17, 1], "ElementID": 1, "DoubleTime": 5 },
        //                 { "GridNum": 3, "Grids": [2, 7, 11], "Payoff": 0.2, "Element": [7, 17, 7], "ElementID": 7, "DoubleTime": 5 },
        //                 { "GridNum": 3, "Grids": [2, 8, 11], "Payoff": 0.2, "Element": [7, 17, 7], "ElementID": 7, "DoubleTime": 5 },
        //                 { "GridNum": 4, "Grids": [4, 7, 10, 13], "Payoff": 4, "Element": [2, 17, 2, 2], "ElementID": 2, "DoubleTime": 5 },
        //                 { "GridNum": 4, "Grids": [4, 7, 12, 13], "Payoff": 4, "Element": [2, 17, 2, 2], "ElementID": 2, "DoubleTime": 5 },
        //                 { "GridNum": 4, "Grids": [4, 8, 10, 13], "Payoff": 4, "Element": [2, 17, 2, 2], "ElementID": 2, "DoubleTime": 5 },
        //                 { "GridNum": 4, "Grids": [4, 8, 12, 13], "Payoff": 4, "Element": [2, 17, 2, 2], "ElementID": 2, "DoubleTime": 5 }
        //             ],
        //             []
        //         ],
        //         "Cards": [
        //             [[4, 5, 6, 7], [13, 5, 2, 7], [17, 16, 2, 3], [4, 5, 6, 7], [2, 1, 1, 4]],
        //             [[3, 3, 4, 6], [4, 2, 17, 2], [1, 16, 2, 3], [8, 7, 4, 6], [2, 1, 1, 4]],
        //             [[1, 2, 4, 6], [10, 4, 2, 2], [12, 1, 16, 2], [8, 7, 4, 6], [2, 1, 1, 4]],
        //             [[8, 6, 1, 6], [5, 4, 11, 17], [9, 17, 1, 16], [17, 8, 7, 6], [4, 2, 1, 1]],
        //             [[4, 1, 3, 2], [1, 5, 4, 11], [11, 5, 17, 17], [1, 4, 2, 7], [5, 4, 4, 2]],
        //             [[7, 6, 5, 2], [9, 12, 5, 17], [5, 13, 17, 5], [2, 8, 2, 7], [18, 8, 5, 2]],
        //             [[4, 1, 1, 2], [11, 5, 9, 12], [2, 7, 2, 17], [18, 5, 4, 8], [3, 18, 8, 5]],
        //             [[1, 7, 6, 2], [11, 5, 17, 17], [1, 2, 7, 2], [2, 18, 5, 8], [3, 18, 8, 5]],
        //             [[4, 4, 2, 6], [5, 13, 11, 5], [16, 14, 15, 15], [4, 18, 5, 8], [3, 18, 8, 5]]
        //         ],
        //         "Scatter": { "ID": 0, "GridNum": 0, "Grids": null },
        //         "FreeGame": { "HitFree": false, "ID": 0, "FreeGameTime": 0, "FreeGamePayoffTotal": 0 },
        //         "FreeGameSpin": { "FreeGameTime": 0, "FreeGamePayoffTotal": 0, "WagersID": 0, "LastGame": false },
        //         "RollerNumber": 0,
        //         "BBJackpot": {
        //             "Pools": [
        //                 { "JPTypeID": 1, "PoolAmount": 19939.593422559952, "JPType": "GRAND", "PoolID": "grand", "RaiseAmount": 0, "Ratio": 0, "timestamp": 1687166508796 },
        //                 { "JPTypeID": 2, "PoolAmount": 6574.390133839945, "JPType": "MAJOR", "PoolID": "6", "RaiseAmount": 0, "Ratio": 0, "timestamp": 1687166508796 },
        //                 { "JPTypeID": 3, "PoolAmount": 103.0032, "JPType": "MINOR", "PoolID": "6-5251", "RaiseAmount": 0, "Ratio": 0, "timestamp": 1687166508796 },
        //                 { "JPTypeID": 4, "PoolAmount": 5.399200000000011, "JPType": "MINI", "PoolID": "456039324", "RaiseAmount": 0, "Ratio": 0, "timestamp": 1687166508796 }
        //             ]
        //         },
        //         "WagersID": 1163011,
        //         "Credit": 6045.6,
        //         "Credit_End": 6774.3,
        //         "AxisLocation": "",
        //         "Status": 0,
        //         "HitWagersID": 0
        //     }, "tokenId": "/65"
        // }
    ];

    // public static getData() {

    //     let _data = JSON.stringify(this._arr[0]);
    //     if (this._arr.length > 1) this._arr.splice(0, 1);
    //     _data = JSON.parse(_data);
    //     return _data["result"]["data"];
    //     // return _data;

    // }

    // public getData(): onBeginGame {
    //     return this.data[0];
    // }
}
// }