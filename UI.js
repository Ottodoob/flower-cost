//取得目前網頁檔名
var wLocation = window.location;
var pageURL = wLocation.pathname.match(/[^\/]+$/) === null ? '' : wLocation.pathname.match(/[^\/]+$/)[0];
var url = location.href;
var gSPEED = 300;
var userAgent = navigator.userAgent;

// 上傳檔案時可接收的的副檔名
var FILE_UPLOAD_ACCEPT_TYPE = {
    IMAGE: '.png, .jpg, .jpeg, .gif, .bmp, .heic',
    VIDEO: 'video/*, .mp4',
    PDF: '.pdf',
};

// [Flow 1] 創建UI物件
try {
    var UI = {
        appVersion: typeof gAppVersion === 'undefined' ? '' : gAppVersion, //APP版本
        WebEnvironment: typeof WebEnvironment === 'undefined' ? 'MAIN' : WebEnvironment.toUpperCase(), //分正式或測試環境，來自masterPage
        JSBGoWebPage: true, //預設一定要能切主框頁面
        JSBNewWindow: true, //預設一定要有新視窗
        JSBCloseNewWindow: true, //預設一定要能關閉新視窗
        JSBOpenMenu: true, //預設一定要能開左選單
        JSBSignCA: true, //預設一定要有憑證

        JSBOpenQuotation: false,
        JSBShareTo: false,
        JSBGetVersion: false,
        JSBRedirect: false,
        JSBFunctionImg: false, // 選股右上角可以切換按鈕: 參數=search || share || list-columnar || list-block || share-image
        JSBScreenStock: false, // 選股右上角可以切換按鈕: 參數=search || share || list-columnar || list-block
        JSBUserResponse: false, // 傳送use的值給native
        JSBAutoLogin: false, // 自動登入並Redirect指定的頁面
        JSBOpenCamera: false, // 拍照需要傳絕對網址給native
        JSBOpenCameraWithOCR: false, // 拍照需要傳絕對網址給native
        JSBOpenPassBookCamera: false, // 拍照需要傳絕對網址給native
        JSBOpenSelfieCamera: false, // 拍照需要傳絕對網址給native
        JSBOpenDefaultCamera: false, // 拍照需要傳絕對網址給native
        JSBSetMenu: false, // 讓Native側選單在不展開時，能在背景展開web子項目
        JSBSignCAHome: false, // 首頁雙因子憑證簽章使用
        JSBSetUserSetting: false, // 系統設定，把user設定的值傳給Native
        JSBOpenSCAS: false, // 開啟原生端的競拍功能
        JSBCloseLoadingSpinner: false, // 關閉原生的loading spinner
        JSBSetRightBtnClose: false, // [注意] 安卓一定要用且安卓 only：false = 右上角的關閉按鈕不要做預設的關閉行為，而是由JS透過 onNativeCloseNewWindow 做別的事
        JSBSetLeftBtnBack: false, // [注意] 安卓一定要用且安卓 only：false = 左上角的返回按鈕不要做預設的行為，而是由JS透過 onNativeNewWindowBack 做別的事

        StartMode: false, //[2021模擬平台用]
        ActivateTab: false, //[2021模擬平台用]
        SetQuoteToTrade: false, //[2021模擬平台用]
    };

    UI.errMsg = '發生錯誤，請洽國票客服中心' + (typeof CallCenter === 'undefined' ? '。' : CallCenter + (typeof CallCenterTime === 'undefined' ? '' : '(' + CallCenterTime + ')'));
    UI.updateMsg = '請升級理財e管家APP到最新版才能使用本項功能';

    UI.inIframe = self !== top;
    UI.isEManager = false;
    UI.isISmart = false;
    UI.isEManager_iOS_IFRAME_WITHOUT_JSB = (function () {
        //在e管家APP中，不處理ios的iframe特例，這樣能針對ios iframe裡面的網頁做別的事情
        var isEManager_iOS_IFRAME_WITHOUT_JSB = false;
        if (typeof IN_EMANAGER !== 'undefined' || typeof JSB === 'object') {
            isEManager_iOS_IFRAME_WITHOUT_JSB = true;
        }
        return isEManager_iOS_IFRAME_WITHOUT_JSB;
    })();

    /**
     * 功能說明: 將屬性設為不可刪
     * @param {string} key - 要設為不可刪的屬性
     * @param {any} value - true=可動 || false=不可動
     */
    UI.lockProperty = function (key, value) {
        Object.defineProperty(this, key, { value: value, writable: true, enumerable: true, configurable: false });
        Object.defineProperty(window, key, { value: value, writable: true, enumerable: true, configurable: false });
        if (key !== '' && value) {
            document.querySelector('html').classList.add(key);
        }
    };

    /**
     * 功能說明: 判斷iOS的版本
     */
    UI.detectIOS = function () {
        this.lockProperty('isIOS', /iPad|iPhone|iPod/g.test(userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 0));

        let regArr = [/OS 11/g, /OS 12/g, /OS 13/g, /OS 14/g, /OS 15/g, /OS 16/g, /OS 17/g, /OS 18/g, /OS 19/g, /OS 20/g];
        for (let i = 0; i < regArr.length; i++) {
            let _Str = 'isI' + regArr[i].toString().split('/')[1].replace(' ', '').replace('.', '_');
            this.lockProperty(_Str, regArr[i].test(userAgent));
        }
        this.isIOSGt9 = this.isIOS && !(this.isIOS6 || this.isIOS7 || this.isIOS8);
        this.isIOSGt11 = this.isIOS && !(this.isIOS6 || this.isIOS7 || this.isIOS8 || this.isIOS9 || this.isIOS10);
        this.isIOSGt14 = this.isIOS && !(this.isIOS6 || this.isIOS7 || this.isIOS8 || this.isIOS9 || this.isIOS10 || this.isIOS11 || this.isIOS12 || this.isIOS13);

        // [硬體]是否為 pad
        this.lockProperty('isIPad', (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 0) || navigator.platform === 'iPad' || /iPad/g.test(userAgent));

        // [硬體]是否為有瀏海的新iphone
        // 20211118-在safari中, XR的innerHeight只有698, 所以把原本的700弄小到697
        this.lockProperty('isNewIphone', this.isIOS && top.innerHeight > 697);
        this.lockProperty('isIOS_withSafeArea', this.isIOS && top.innerHeight > 697);
        this.lockProperty('isOldIphone', !this.lockProperty);

        // [硬體]是否native WKwebview的裝置
        this.lockProperty('isWKwebview', typeof webkit === 'object' && webkit.messageHandlers !== undefined && webkit.messageHandlers.JSB !== undefined);
    };

    /**
     * 功能說明: 判斷Android的版本
     */
    UI.detectAndroid = function () {
        this.lockProperty('isAndroid', /Android/g.test(userAgent));

        let regArr = [
            /Android 5/g,
            /Android 6/g,
            /Android 7/g,
            /Android 8/g,
            /Android 9/g,
            /Android 10/g,
            /Android 11/g,
            /Android 12/g,
            /Android 13/g,
            /Android 14/g,
            /Android 15/g,
            /Android 16/g,
            /Android 17/g,
            /Android 18/g,
            /Android 19/g,
            /Android 20/g,
        ];
        for (let i = 0; i < regArr.length; i++) {
            let _Str = 'is' + regArr[i].toString().split('/')[1].replace(' ', '').replace('.', '_');
            this.lockProperty(_Str, regArr[i].test(userAgent));
        }
    };

    /**
     * 功能說明: OS判斷
     */
    UI.detectOS = function () {
        this.lockProperty('isWinXP', userAgent.toLowerCase().indexOf('windows nt 5.1') > -1);
        this.lockProperty('isWin7', userAgent.toLowerCase().indexOf('windows nt 6.1') > -1);
        this.lockProperty('isMac', userAgent.toLowerCase().indexOf('macintosh') > -1);

        this.detectIOS();
        this.detectAndroid();
    };

    /**
     * 功能說明: 瀏覽器判斷
     */
    UI.detectBrowser = function () {
        // 優先做
        this.lockProperty('isLine', userAgent.toLowerCase().indexOf('line') > -1);
        this.lockProperty(
            'isFb',
            userAgent.toLowerCase().indexOf('fban') > -1 ||
                userAgent.toLowerCase().indexOf('fbav') > -1 ||
                userAgent.toLowerCase().indexOf('fbios') > -1 ||
                userAgent.toLowerCase().indexOf('fbdv') > -1 ||
                userAgent.toLowerCase().indexOf('fbop') > -1 ||
                userAgent.toLowerCase().indexOf('fb4A') > -1
        );
        this.lockProperty('isSamsungBrowser', userAgent.toLowerCase().includes('samsungbrowser') || userAgent.toLowerCase().includes('samsung browser'));
        this.lockProperty('isFirefox', userAgent.toLowerCase().indexOf('firefox') > -1 && !this.isLine);
        this.lockProperty('isChrome', (userAgent.toLowerCase().indexOf('chrome') > -1 || userAgent.toLowerCase().indexOf('crios') > -1) && !this.isLine);
        this.lockProperty('isSafari', userAgent.toLowerCase().indexOf('safari') > -1 && !this.isChrome && !this.isLine);

        this.lockProperty('isIE', userAgent.toLowerCase().indexOf('trident') > -1);
        this.lockProperty(
            'isEdge',
            userAgent.toLowerCase().includes('edg/') || userAgent.toLowerCase().includes('edge') || userAgent.toLowerCase().includes('edga') || userAgent.toLowerCase().includes('edgios')
        );

        //20240314-mi
        this.lockProperty('isXiaoMi', userAgent.toLowerCase().includes('xiaomi') || userAgent.toLowerCase().includes('miuibrowser'));

        this.lockProperty(
            'isEManager',
            (function () {
                try {
                    // 檢測方式1 = userAgent有EManager字串 (Android >= 2.45  &&  iOS >= 1.1.37 [2022最低版更後]都可以使用ua的UI.isEManager)
                    // [deprecated] 檢測方式1 = userAgent有EManager字串 (Android >= 2.24  &&  iOS >= 1.1.33 [2021模擬平台專案])
                    if (userAgent.toLowerCase().indexOf('emanager') > -1) {
                        return true;
                    }
    
                    // 檢測方式2 = webview有沒有webkit物件
                    else {
                        let __eManagerFlag = false;
    
                        // 限制用WKwebkit && 非iOS chrome APP
                        if (UI.isIOS) {
                            __eManagerFlag = typeof webkit === 'object' && webkit.messageHandlers !== undefined && webkit.messageHandlers.JSB !== undefined;
                        }
                        if (UI.isAndroid) {
                            __eManagerFlag = typeof JSB === 'object';
                        }
                        return __eManagerFlag; // IN_EMANAGER = 後端給的e管家登入資訊
                    }
                } catch (e) {
                    alert(UI.errMsg + '錯誤訊息(isEManager): ' + e.message);
                }
            })()
        );

        this.lockProperty(
            "isISmart",
            (function () {
                try {
                    if (userAgent.toLowerCase().indexOf('ismart') > -1) {
                        return true;
                    }
                    else {
                        return false;
                    }
                } catch (e) {
                    alert(UI.errMsg + '錯誤訊息(isISmart): ' + e.message);
                }
            })()
        );

        this.lockProperty('html5', true);

        if (this.isEManager) {
            UI.updateMsg = '請升級理財e管家APP到最新版才能使用本項功能';
        } else {
            UI.updateMsg = '功能有誤，請聯絡客服';
        }
    };

    /**
     * 功能說明: 行動裝置判斷
     */
    UI.detectMobile = function () {
        this.lockProperty(
            'isMobile',
            /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent) ||
                /iPad|iPhone|iPod/g.test(userAgent) ||
                (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 0)
        );
        this.lockProperty('isPC', !this.isMobile);
    };

    /**
     * 功能說明: 判斷裝置品牌
     */
    UI.detectDeviceBrand = function () {
        let regArr = [/InFocus/g, /ASUS/g, /MI/g];
        for (let i = 0; i < regArr.length; i++) {
            let _Str = 'is' + regArr[i].toString().split('/')[1];
            this.lockProperty(_Str, regArr[i].test(userAgent));
        }
    };

    /**
     * 功能說明: e管家內的Project判斷
     */
    UI.detectEManagerProject = function () {
        // 模擬下單平台
        this.lockProperty('isSimulation', userAgent.toLowerCase().indexOf('simulation') > -1);
    };

    /**
     * 錯誤處理
     * @param {string|object} params - string = 瀏覽器/webview拋出的錯誤訊息內容文字
     * @param {string|object} params - object = {func: '功能名稱或模組名稱', hook:'錯誤發生的生命週期勾子', path: '出錯的檔案路徑', error: '捕捉到的錯誤'}
     * @param {string} strComponentName - 組件名稱|功能名稱
     */
    UI.handleError = function (params, strComponentName) {
        try {
            if (arguments.length === 0) {
                return;
            }

            strComponentName = strComponentName || '系統功能';

            if (typeof console.table === 'function') {
                console.table(params, strComponentName);
            } else {
                console.warn(params, strComponentName);
            }

            switch (typeof params) {
                case 'string':
                    try {
                        params = params || '出錯';

                        _displayMsg({
                            modal: params + '<br>(' + strComponentName + ')',
                            alert: params + '\n(' + strComponentName + ')',
                        });
                    } catch (error) {
                        console.error(`[UI] UI.handleError params = string. error = ${JSON.stringify(error)}`);
                    }

                    break;

                case 'object':
                    try {
                        /* [狀況1] params = error物件，會有兩個參數且沒自訂義 func
                         * 格式
                            UI.handleError(error, 'DCA|methodName');
                         */
                        if (arguments.length > 1) {
                            params = params || '出錯';

                            _displayMsg({
                                modal: params.display + '<br>(' + strComponentName + ')',
                                alert: params.display + '\n(' + strComponentName + ')',
                            });
                        } else {

                        /* [狀況2] params = 自訂義 錯誤物件，只有一個參數
                         * 格式
                            UI.handleError({
                                func: `定期定額`,
                                hook: `onMounted`,
                                file: `/Data/xxxx.ashx`,
                                page: encodeURI(location.href),
                                payload: {IDNO: 'A123456789', token: 'xxxx-xxxx-xxxx'},
                                error: error,
                                display: '系統有問題，請聯絡客服',
                             });
                        */
                            params = params || {};

                            params.func = params.func || '系統功能'; // 出錯的功能名稱
                            params.file = params.file || ''; // 出錯的檔案路敬
                            params.page = params.page || ''; // 出錯的功能頁面

                            const _errorObj = params.error || {};

                            params.error = _errorObj.message || _errorObj || 'EREOR'; //拋出來的錯誤字串
                            params.display = params.display || params.error || '系統有問題，請聯絡客服'; // 顯示給user的字眼
                            params.stack = JSON.stringify(params.error.stack);

                            params.ua = userAgent;
                            params.time = new Date();

                            // ajax xhr.status=0時不要秀
                            if (params.display.toLowerCase().indexOf('xhr.status = 0') > -1) {
                                return;
                            }

                            // 不要曝露太多API資訊
                            _displayMsg({
                                modal: params.display,
                                alert: params.display,
                            });
                        }
                    } catch (error) {
                        console.error(`[UI] UI.handleError params = object. error = ${JSON.stringify(error)}`);
                    }
                    break;

                default:
                    break;
            }

            function _displayMsg(config) {
                try {
                    config = config || {};
                    config.modal = config.modal || '';
                    config.alert = config.alert || '';

                    if (typeof WLS === 'object' && typeof WLS.Modal === 'function') {
                        WLS.Modal('失敗，請稍候再試', config.modal);
                    } else {
                        alert('失敗，請稍候再試\n' + config.alert);
                    }
                } catch (error) {
                    console.error(`[UI] UI.handleError _displayMsg error = ${JSON.stringify(error)}.config = ${JSON.stringify(config)}`);
                }
            }
        } catch (error) {
            console.error(`[UI] UI.handleError error = ${JSON.stringify(config)}`);
        }
    };

    /**
     * [todo]行銷用，紀錄user的使用軌跡
     */
    UI.marketingStatistics = function () {};

    /**
     * 數字格式化
     * 1. 千分位
     * 2. 小數點後兩位
     * @param {string|number} value - 要處理的字串
     * @param {string} term - 要洗成甚麼格式 '0,0.00', '0', '0,0', 'icon'
     * @returns {string} - 回傳資料長相 '2345.39'
     */
    UI.formatNumber = function (value, term) {
        if (value === '') return '-';
        if (!value) return '0.00';

        value = Number(value).toFixed(2);
        const _intPart = Math.trunc(value);
        // 整数部分處理，增加千分位
        const _intPartFormat = _intPart.toString().replace(/(\d)(?=(?:\d{3})+$)/g, '$1,');

        let _floatPart = '';
        const _valueArray = value.toString().split('.');
        if (_valueArray.length === 2) {
            _floatPart = _valueArray[1].toString();

            let _formatValue = '';
            switch (term) {
                case 'icon':
                    if (_valueArray[0].indexOf('-') > -1) {
                        _formatValue = '▼' + _intPartFormat.replace('-', '') + '.' + _floatPart;
                    } else if (_valueArray[0] !== '0') {
                        _formatValue = '▲' + _intPartFormat + '.' + _floatPart;
                    }
                    break;
                case '0.00': // 不要千分位+小數點後兩位
                    _formatValue = _intPart.toString() + '.' + _floatPart;
                    break;
                case '0,0': // 四捨五入到整數位
                    _formatValue = _intPartFormat;
                    break;
                case '0': // 整數位
                    _formatValue = _valueArray[0];
                    break;
                case '0,0.00': // [預設]千分位+小數點後兩位
                default:
                    _formatValue = _intPartFormat + '.' + _floatPart;
                    break;
            }
            return _formatValue;
        }
    };

    /**
     * 日期格式化
     * yyyy/mm/dd
     * @param {string} value - 要處理的字串
     * @param {string} term - 要洗成甚麼格式 'yyyy/mm/dd(預設)', 'mm/dd', 'mmdd'
     * @returns {string} - value等於8時，回傳資料長相 'yyyy/mm/dd' || value不等於8時，回傳原本的value
     */
    UI.formatDate = function (value, term) {
        if (typeof value !== 'string') {
            if (value === null || value === undefined) {
                return '';
            } else if (typeof value === 'number') {
                return value + '';
            }
        }

        if (value.length !== 8) {
            return value + '';
        }

        let _formatValue = '';
        switch (term) {
            case 'mm/dd':
                _formatValue = value.substr(4, 2) + '/' + value.substr(6, 2);
                break;
            case 'mmdd':
                _formatValue = value.substr(4, 4);
                break;
            case 'yyyy.mm.dd':
                _formatValue = value.substr(0, 4) + '.' + value.substr(4, 2) + '.' + value.substr(6, 2);
                break;
            case 'yyyy/mm/dd':
            default: //yyyy/mm/dd
                _formatValue = value.substr(0, 4) + '/' + value.substr(4, 2) + '/' + value.substr(6, 2);
                break;
        }
        return _formatValue;
    };

    // 函示說明：因jquery 3.5版本 移除trim()，所以自己寫一個
    UI.trimString = function (str = '') {
        try {
            return str.replace(/^\s+|\s+$/g, '');
        }  catch (e) {
            console.log('[UI.trimString]', e)
        }
    }

    /**
     * 上漲跌樣式
     * @param {string|number} value - 要處理的字串或數字
     * @returns {string} - 回傳樣式名稱
     */
    UI.setStyle = function (value) {
        if (!value) return '';

        if (typeof value === 'number') {
            if (value < 0) {
                return 'ibfs-fall';
            } else if (value !== 0) {
                return 'ibfs-rise';
            }
        } else if (typeof value === 'string') {
            value = UI.trimString(value);
            if (value.indexOf('-') > -1) {
                return 'ibfs-fall';
            } else if (value !== '0') {
                return 'ibfs-rise';
            }
        }
    };

    /**
     * 把傳入的字串去掉HTML標籤，只保留node或element的文字值，避免XSS
     */
    UI.htmlDecode = function (strText) {
        let div = document.createElement('div');
        div.innerHTML = strText;
        return div.textContent;
        // return div.innerText || div.textContent;
    };

    /**
     * 把文字編碼
     */
    UI.htmlEncode = function (strText) {
        let div = document.createElement('div');
        if (div.textContent !== null) {
            div.textContent = strText;
        } else {
            div.innerText = strText;
        }
        var text = div.innerHTML;
        div = null;
        return text;
    };

    /**
     * 追蹤使用紀錄
     * @param {string} objParams.client - 用甚麼工具追蹤
     * @param {object} objParams.record - 用捕抓的紀錄
     */
    UI.userTrack = function (objParams = {}) {
        objParams.client = objParams.client || '';
        objParams.record = objParams.record || {};

        switch (objParams.client) {
            case 'google':
                _trackByGoogle(objParams.record);
                break;
            default:
                break;
        }
    };

    /**
     * 生成一個由指定數量的字符組組成的密碼字符串。
     * 每組由大寫字母和數字組成，組之間用連字符分隔。
     * 生成的密碼不包含易混淆的字符（如 'I' 和 'O'）。
     * 
     * @param {number} digitOfSet - 每組中的字符數量。
     * @param {number} set - 要生成的組數。
     * @returns {string} 生成的密碼字符串。
     * 
     * @example
     * // 返回類似 "ABC1-XY2Z-LM3N" 的字符串
     * var tempPwd = pwdGenerator(4, 3);
     */
    UI.pwdGenerator = function(digitOfSet, set){
        if(typeof digitOfSet !== 'number'){ return ''; }
        if(typeof set !== 'number'){ return ''; }

        var strNew = '';
        var strSet = '';
        
        for (var i = 0; i < set; i++) {
            if (i > 0) {
                strNew += '-';  // 各組英數之間的分隔號
            }
            strSet = '';
    
            while (strSet.length < digitOfSet) {
                // 生成 50 到 90 之間的隨機數
                var num = Math.floor(Math.random() * (90 - 50 + 1)) + 50;
                
                // 排除 58~64 這區間的非英數符號
                if (num > 57 && num < 65) {
                    continue;
                }
                // 排除 I (73) 和 O (79)
                if (num === 73 || num === 79) {
                    continue;
                }
                
                strSet += String.fromCharCode(num);  // 將數字轉換為字元
            }
            strNew += strSet;
        }
        
        return strNew;
    };


    /**
     * 函示說明: 檢查的檔案類型
     * @param {string} file - 要檢查的檔案
     */
    UI.checkImageType = async function(file = {}) {
        try {
            const arrayBuffer = await file.arrayBuffer();
            const bytes = new Uint8Array(arrayBuffer);
            let magicBox = bytes.slice(4, 8);
            let magicNumber = bytes.slice(0, 4);
        
            if (magicNumber[0] === 0x47 && magicNumber[1] === 0x49 && magicNumber[2] === 0x46 && magicNumber[3] === 0x38) { 
                return 'gif';
            } 
        
            if (magicNumber[0] === 0x42 && magicNumber[1] === 0x4D) { 
                return 'bmp';
            } 
        
            if (magicNumber[0] === 0xFF && magicNumber[1] === 0xD8 && magicNumber[2] === 0xFF) { 
                return 'jpg';
            } 
        
            if (magicNumber[0] === 0x89 && magicNumber[1] === 0x50 && magicNumber[2] === 0x4E && magicNumber[3] === 0x47) { 
                return 'png';
            } 
        
            if(String.fromCharCode(magicBox[0], magicBox[1], magicBox[2], magicBox[3]).toLowerCase() === 'ftyp') {
                return 'heic';
            }
        
            return 'unknown'; 
        } catch(e) {
            console.error('checkImageType error', e);
            return 'unknown';
        }
    }
    
    /**
     * 函示說明：heic轉jpg
     * @param {string} file - 要轉換的檔案 (HEIC) 
     */
    UI.heicToJPG = async function(file = {}) {
        try {
            const arrayBuffer = await file.arrayBuffer();
            const libheif = window.libheif();
                    
            const decoder = new libheif.HeifDecoder();
            const data = decoder.decode(arrayBuffer);
        
            if (!data.length) {
                console.error('無法解碼 HEIC 檔案');
                return;
            }
        
            // 取得第一張圖片
            const image = data[0];
            const width = image.get_width();
            const height = image.get_height();
        
            const canvas = document.createElement('canvas');
        
            canvas.width = width;
            canvas.height = height;
            const context = canvas.getContext('2d');
            const imageData = context.createImageData(width, height);
        
            await new Promise((resolve, reject) => {
                image.display(imageData, (displayData) => {
                    if (!displayData) {
                    return reject(new Error('HEIF processing error'));
                    }
        
                    resolve();
                });
            });
        
            context.putImageData(imageData, 0, 0);
            
            const base64Image = canvas.toDataURL('image/jpeg');
            
            return base64Image;
        } catch(e) {
            console.error('heicToPNG error', e);
            return '';
        }
    }

    /**
     * 檢查字串是否包含私有區字元 (U+E000 至 U+F8FF)
     * @param {string} strText - 要檢查的字串
     * @returns {boolean} - 如果字串包含私有區字元，則回傳 true，否則回傳 false
     * @example

            UI.isEncodedInPUA("測試字串");

     */
    UI.isEncodedInPUA = function (strText) {
        try {                
            if (typeof(strText) !== "string") {
                return false;
            }

            for (var i = 0; i < strText.length; i++) {
                var c = strText.charCodeAt(i);
                if (c >= 0xe000 && c <= 0xf8ff) {
                    return true;
                }
            }
            return false;
        } catch (error) {
            console.error('UI.isEncodedInPUA 發生錯誤:', error);
            return false;
        }
    }

    /**
     * 啟用 web 滿天星主程式
        此函式會依序載入以下 JavaScript 檔案：
        1. jQuery v3 函式庫 (/Scripts/jQuery-v3.min.js)
        2. Astar API (/Scripts/Astar/AstarAPI-JQuery.min.js)
        3. Astar 定義檔 (/Scripts/Astar/AstarWebUI_Define.js)
        4. Astar Web UI 主程式

     * @param {boolean} doScanAllPage - 是否掃描整個頁面的所有元素，預設為否
     * @returns - 無
     * @example

        UI.initAstar();

     */
    UI.initAstar = function(doScanAllPage) {
        try {
            var jQuerySource = document.createElement('script');
            jQuerySource.src = "/Scripts/jQuery-v3.min.js";
            document.head.appendChild(jQuerySource);

            var AstarAPI = document.createElement('script');
            AstarAPI.src = "/Scripts/Astar/AstarAPI-JQuery.min.js";
            document.head.appendChild(AstarAPI);

            var AstarDefine = document.createElement('script');
            AstarDefine.src = "/Scripts/Astar/AstarWebUI_Define.js";
            document.head.appendChild(AstarDefine);

            if (doScanAllPage) {
                g_ProcessKeywordAttributeOnly = false;
            }
            else{
                g_ProcessKeywordAttributeOnly = true;
            }
            
            var AstarWebUI = document.createElement('script');
            AstarWebUI.src = "/Scripts/Astar/AstarWebUI-7.3.25.707.min.js";
            document.head.appendChild(AstarWebUI);

            var AstarStyle = document.createElement('link');
            AstarStyle.rel = "stylesheet";
            AstarStyle.href = "/Scripts/Astar/AstarIME-3.23.11.140.css";
            document.head.appendChild(AstarStyle);

            // 國票加工改滿天星主程式：等動態載入成功後，再呼叫 EmbedAstar 去掃描頁面難字 data-astar
            var scripts = [jQuerySource, AstarAPI, AstarDefine, AstarWebUI];
            var loadedCount = 0;
            scripts.forEach(function(script) {
                script.onload = function() {
                    loadedCount++;
                    if (loadedCount === scripts.length) {
                        console.log('IBFS script onload: EmbedAstar'), IsiPad() && (IME_CSS_CLASS_KEYBORAD_SHOW = 'astar-ime-keyboard-table-ipad'), EmbedAstar('', !1, void 0, void 0, !0);
                    }
                };
            });

        }
        catch(error) {
            console.error("UI.initAstar 發生錯誤:", error);
        }
    }

      
    UI.detectMobile();
    UI.detectOS();
    UI.detectBrowser();
    UI.detectDeviceBrand();
    UI.detectEManagerProject();
} catch (e) {
    console.log('功能異常[UI Object] ', e);
}

// [Flow 2] 創建一個全域的WLS物件，自訂業務端需要用的套件
try {
    var WLS = {
        /**
         * @param {string} AlertInputArr - 紀錄總共有多少輸入欄位需要出現警示, 紀錄輸入欄位的id. 用來讓頁面定位在該id用
         */
        AlertInputArr: [],

        /**
         * 函示說明：用自定義樣式的提醒框框取代 alert 的樣式 (有兼容UIkit的 WLS.msg組件)
         * @param {string} msg - 訊息內容文字, 特例：字串為"reset"就去掉所有自定義的樣式
         * @param {object} dom - 要出alert的表單物件選擇器 (=jquery選擇器)
         */
        Alert: function (msg, dom) {
            //console.log('-- WLS.Alert=', msg, dom)
            var __WLS = this;

            if (msg === 'reset') {
                this.AlertInputArr = [];
                this._isAlertReset();
                return false;
            }

            // TYPE1 = UIkit主版 (有兼容 UIkit && dom不是舊主版 (舊主版 = $('body').attr('id') === 'oldMasterPage')
            if (typeof UIkit !== 'undefined' && !(dom === undefined) && $('body').attr('id') !== 'oldMasterPage') {
                this.Msg($(dom).get(0).getAttribute('id'), msg, true);
            } 
            else {
                // TYPE2 = 舊主版 沒有UIkit
                var $Input = $(dom),
                    _Type = $Input.attr('type'),
                    CSS_Alert = 'td-alert',
                    CSS_Input = 'input-em',
                    // $Alert_Created = $('<div class=' + CSS_Alert + '>' + msg + '</div>'),
                    $main = $('main.wrapper'),
                    CSS_marginBottom = 'mb-5';

                $main.removeClass(CSS_marginBottom);

                this.AlertInputArr.push($Input.attr('id'));

                var $Label,
                    $AlertElem = $AlertElem || {};

                // 看看現在是什麼type
                if (_Type === 'radio' || _Type === 'checkbox') {
                    var $tempTR = $Input.closest('.td').parent('.tr');
                    if ($tempTR.prev('.tr-info').children('.td').length) {
                        $Label = $tempTR.prev('.tr-info').children('.td');
                    } else {
                        $Label = $('<div class="td"></div>');
                        $tempTR.before('<div class="tr tr-info r"></div>');
                        $tempTR.prev('.tr-info').append($Label);
                    }

                    const alertElem = $Label.children('.' + CSS_Alert)[0];
                    if (alertElem) {
                        $(alertElem).fadeIn(300).text(msg);
                    } else {
                        const newElem = document.createElement('div');
                        newElem.className = CSS_Alert;
                        newElem.textContent = msg; // 純文字，安全
                        $Label[0].insertBefore(newElem, $Label[0].firstChild); // 插入到最前面
                        $(newElem).fadeIn(300);
                    }
                    // $AlertElem = $Label.children('.' + CSS_Alert).fadeIn(300);
                    // $AlertElem.length ? $AlertElem.text(msg) : $Alert_Created.prependTo($Label);
                } else {
                    var oID = $Input.attr('id');
                    if (
                        oID === 'DC_Mobile' ||
                        oID === 'DC_Email' ||
                        oID === 'Household_Address' ||
                        oID === 'Address' ||
                        oID === 'Email' ||
                        oID === 'OneDayCredits' ||
                        oID === 'OneDayCredits_Money' ||
                        oID === 'Income' ||
                        $Input.hasClass('multiline')
                    ) {
                        // [特例] 填寫完整基本資料-2 ：
                        // input 有 multiline的時候也要折行
                        if ($Input.closest('.td').parent('.tr').prev('.tr-info').length === 0) {
                            $('<div class="tr tr-info"><div class="td v w-100"><div class="td-title w l"></div></div></div>').insertBefore($Input.closest('.td').parent('.tr'));
                        }
                        $Label = $Input.closest('.td').parent('.tr').prev('.tr-info').children('.td');
                    } else {
                        if ($Input.closest('.td').parent('.tr').prev('.tr-info').length === 0) {
                            $('<div class="tr tr-info"><div class="td v w-100"><div class="td-title w l"></div></div></div>').insertBefore($Input.closest('.td').parent('.tr'));
                        }

                        $Label = $Input.closest('.td').parent('.tr').prev('.tr-info').children('.td').removeClass('v');
                    }
                    // $AlertElem = $Label.children('.' + CSS_Alert).fadeIn(300);
                    // $AlertElem.length ? $AlertElem.text(msg) : $Alert_Created.appendTo($Label);
                    const alertElem = $Label.children('.' + CSS_Alert)[0]; // 取得 DOM 元素
                    if (alertElem) {
                        $(alertElem).fadeIn(300).text(msg); // 更新文字
                    } else {
                        const newElem = document.createElement('div');
                        newElem.className = CSS_Alert;
                        newElem.textContent = msg; // 使用 textContent 確保純文字
                        $Label[0].appendChild(newElem); // 附加到 DOM
                        $(newElem).fadeIn(300);
                    }
                }

                $Input.addClass(CSS_Input);
                $main.addClass(CSS_marginBottom);

                // 頁面拉到有錯的位置
                try {
                    $('html body')
                        .stop()
                        .animate(
                            {
                                scrollTop: $('.' + CSS_Input)
                                    .closest('.td')
                                    .parent('.tr')
                                    .prev('.tr-info')
                                    .offset().top,
                            },
                            500
                        );
                } catch (e) {
                    $('#' + __WLS.AlertInputArr[0]).focus();
                }
            } // END else
        },
        // 兼容小寫
        alert: function (msg, dom) {
            //console.log('-- WLS.alert', msg, dom)
            this.Alert(msg, dom);
        },

        /**
         * 函示說明：UIKIT新版開戶中，表單驗証用的綠字警示
         * @param {string} selectorID - 要驗證的表單元件id
         * @param {string} msg - 警示文字
         * @param {string} $scrollWrapper - 如果不是html, body在捲動，而是用flex框架+ div overflow-y去捲動的話，這個就是div物件
         */
        Msg: function (selectorID, msg, isFromWLSAlert, $scrollWrapper) {
            //console.log('-- WLS.Msg', selectorID, msg, arguments.length)

            var params = isFromWLSAlert ? msg : selectorID;
            if (params === 'reset') {
                this._isAlertReset();
                return false;
            }

            // TYPE1 = 舊主版 沒有UIkit
            if (typeof UIkit === 'undefined') {
                this.alert(msg, document.getElementById(selectorID));

                // TYPE2 = 有兼容 UIkit
            } else {
                var $el = $('#' + selectorID);
                var $li = $el.parent('li').length > 0 ? $el.parent('li') : $el.parent().parent('li');
                var isCheckEl = $el.attr('type') === 'checkbox' || $el.attr('type') === 'radio';

                // 0. 長error dom
                var msgBox = 'js-ibfs-errorMsg';
                var msgTxt = 'js-ibfs-errorMsg-text';

                var msgDiv = document.createElement('div');
                msgDiv.className = msgBox;

                var msgSpan = document.createElement('span');
                msgSpan.className = msgTxt;
                msgSpan.textContent = msg;

                msgDiv.appendChild(msgSpan);

                // 1. 加斷行
                if (isCheckEl) {
                    if ($li.length === 0) {
                        $li = $el.parent().parent().addClass('uk-flex-wrap');
                    }
                }

                // 2. appendTo parent
                if ($li.children('.' + msgBox).length === 0) {
                    if ($li.children('.required').length === 0) {
                        // li 下沒有無標題dom時
                        $li.prepend(msgDiv);
                    } else {
                        var requiredElements = $li.children('.required');
                        requiredElements.each(function() {
                            var requiredElement = $(this);
                            requiredElement[0].parentNode.insertBefore(msgDiv, requiredElement[0].nextSibling);
                        })
                    }
                } else {
                    $li.children('.' + msgBox)
                        .show()
                        .children('.' + msgTxt)
                        .text(msg);
                }

                // 3. input物件上樣式
                if (!isCheckEl) {
                    $el.addClass('js-ibfs-errorFocus');
                }

                let self = this;
                self.AlertInputArr = [];
                $('.' + msgBox + ':visible').each(function (index) {
                    if (index === 0) {
                        self.AlertInputArr.push(selectorID);
                        if (
                            UI.isIOS &&
                            $('#' + selectorID)
                                .prop('tagName')
                                .toLowerCase() === 'select'
                        ) {
                            return false;
                        }
                        $(this)
                            .parent('li')
                            .find('#' + selectorID)
                            .focus();
                        return false;
                    }
                });

                // 把頁面拉到有錯的位置
                if (self.AlertInputArr.length) {
                    try {
                        if ($('.js-ibfs-errorMsg-text:visible').eq(0).length === 0) {
                            return;
                        }

                        //(6/7) WLS.Msg擴增第四個參數$scrollWrapper，如果頁面不是用html, body捲動的話，就丟要捲動的div物件去拉定位
                        var $el = $('html, body');
                        if (typeof $scrollWrapper !== 'undefined' && $scrollWrapper.length) {
                            $el = $scrollWrapper;
                        }

                        const _top = $('.js-ibfs-errorMsg-text:visible').eq(0).offset().top;
                        $el.stop().animate({ scrollTop: _top }, 500);
                    } catch (e) {
                        $('#' + self.AlertInputArr[0]).focus();
                    }
                }
            } // END else
        },
        // 兼容小寫
        msg: function (selectorID, msg, isFromWLSAlert, $scrollWrapper) {
            this.Msg(selectorID, msg, isFromWLSAlert, $scrollWrapper);
        },

        /**
         * 函示說明：UIKIT版 + 舊主版 form 中，重新reset表單的錯誤訊息
         */
        _isAlertReset: function () {
            $('.js-ibfs-errorMsg').hide().removeClass('uk-hidden');
            $('.td-alert').text('').hide();
            $('.input-em').removeClass('input-em');
        },

        /**
         * 函示說明：在安卓手機中，把dom拉到畫面的某個地方
         * @param {object} dom - 要拉動的物件HTML Object
         */
        InView: function (dom) {
            var $obj = $(dom);
            $('html, body').scrollTop($obj.offset().top - $obj.outerHeight(true));
        },
        // 兼容小寫
        inView: function (dom) {
            this.InView(dom);
        },

        /**
         * 函示說明：在ios手機中，JSB.NewWindow再開啟JSB.NewWindow會出錯（父JSB.NewWindow頁面會refresh），所以用web仿造一個div型態NewWindow
         * [例外]: ios 1.1.26+可以用新視窗中再開新視窗
         * @param {object} title - NewWindow標題
         * @param {object} url - NewWindow的url
         * @param {object} scaling - Y/N, 能不能縮放, 在此無用, 僅為了介面跟JSB.NewWindow一致
         * @param {object} orientation - Y/N, 能不能旋轉, 在此無用, 僅為了介面跟JSB.NewWindow一致
         */
        NewWindow: function (title, url, scaling, orientation) {
            try {
                if (UI.isIOS && UI.appVersion !== undefined && UI.appVersion !== '') {
                    if (UI.appVersion.major >= 1 && UI.appVersion.minor >= 1 && UI.appVersion.build >= 26) {
                        //復原回native定義的JSB.NewWindow，而不要用div假裝的 WLS.NewWindow，
                        //因iOS 1.1.26 + 的nested JSB.NewWIndow可以一個一個關閉
                        //但iOS 1.1.25以下的點最內層JSB.NewWIndow的關閉按鈕時，會把所有JSB.NewWIndow都關掉
                        this.NewWindow = UI.JSBNewWindow_Proxy;
                        fnNewWindow(title, url, scaling, orientation);
                        return;
                    }
                }

                var id = 'newWindow';
                if ($('#' + id).length === 0) {
                    $(
                        '<div id="' +
                            id +
                            '" style="display:none;"><div id="newWindow_wrapper"><iframe src="' +
                            url +
                            '" id="newWindow_iframe" class="newWindow_iframe"></iframe></div><button id="' +
                            id +
                            '_close">關閉</button></div>'
                    ).appendTo($('body'));
                } else {
                    var $win = $('#' + id);
                    $win.children('#newWindow_iframe').attr('src', url);
                }
                $('body').scrollTop(0).addClass('newWindowopen');
                $('#' + id).fadeIn(300);

                $('body').on('click', '#newWindow_close, #bxslider_close', function () {
                    $('#' + id).hide();
                    $('body').removeClass('newWindowopen');
                });
            } catch (e) {
                alert('開發訊息:' + e);
            }
        }, // WLS.NewWindow();
        // 兼容小寫
        newWindow: function (title, url, scaling, orientation) {
            this.NewWindow(title, url, scaling, orientation);
        },

        CloseNewWindow: function (isIOS) {}, // WLS.CloseNewWindow();
        // 兼容小寫
        closeNewWindow: function (isIOS) {
            this.CloseNewWindow(isIOS);
        },

        containsHtmlTags: function(str = '') {
            const pattern = /<[^>]+>/;
            return pattern.test(str);
        },

        replaceAllHtmlTagsInString: function(inputString = '') {
            const replacedString = inputString.replace(/<div[^>]*>/g, '').replace(/<\/div>/g, '');

            const lines = replacedString.split('<br/>').map(line => line.trim()).filter(line => line);

            const container = document.createElement('div');
            container.style.textAlign = 'center';

            lines.forEach((line, index) => {
                if(this.containsHtmlTags(line)) {

                    const regex = /<[^>]+>/;

                    const hasHtmlStr = line.split(regex).map(line => line.trim());

                    hasHtmlStr.forEach((str) => {
                        if(str.toLocaleLowerCase() === 'kyc') {
                            const kyc = document.createElement('span');
                            kyc.textContent = 'KYC';
                            kyc.style.color = 'red';
                            container.appendChild(kyc);
                        } else {
                            container.appendChild(document.createTextNode(str));
                        }
                        
                    });

                    container.appendChild(document.createElement('br'));
                    return;
                }

                container.appendChild(document.createTextNode(line));

                if (index < lines.length - 1) {
                    container.appendChild(document.createElement('br'));
                }
            });

            return container;
        },

        /**
         * 函示說明：漂亮的alert
         * @param {string} title                 : 標題
         * @param {string} message               : 內文 可塞html
         * @param {function} onClose             : 按[onClose關閉]按鈕要做的事情
         * @param {object} onClose               : 因為原本的 onClose + obj 參數太難用，所以改寫一下，第三個參數若傳物件進來就重整config寫法
         *
         * @param {boolean} obj.multibutton      : 除了[onClose關閉]按鈕還有另一個按鈕
         * @param {string}   obj.labels          : { cancel: '關閉or取消, ''ok': '確定' } } 按鈕顯示的文字, cancal = 一顆按鈕中的那一顆 = 兩顆按鈕中的左邊; ok = 兩顆按鈕中的右邊
         * @param {function} obj.onClose         : 確定按鈕要做的事情
         * @param {function} obj.onOK            : 關閉按鈕要做的事情
         * @param {boolean} obj.stack            : alert/confirm在UIkit中的stack要能重疊顯示=true 還是只能顯示一個=false
         */

        Modal: function (title, message, onClose, obj) {
            //console.log('--APP Modal', typeof onClose);
            obj = obj || {};
            obj.onClose = obj.onClose || function () {};

            // 因為原本的 參數太難用，所以改寫一下，第三個參數若傳物件進來就重整config寫法
            if (typeof onClose === 'object') {
                var obj = onClose;
            }

            obj.multibutton = obj.multibutton || false;
            obj.onOK = obj.onOK || function () {};
            obj.labels = obj.labels || {};
            obj.labels.cancel = obj.labels.cancel || '關閉'; //第一顆 或 第二顆中的左邊按鈕
            obj.labels.ok = obj.labels.ok || '確定'; //第二顆中的右邊按鈕
            obj.class = obj.class || ''; //在Modal的title上加上客製化樣式

            if (typeof obj.stack === 'undefined') {
                obj.stack = true;
            } else {
                obj.stack = obj.stack;
            }

            // 有UIkit時就用uikit.modal && 不是舊主版
            if (typeof UIkit !== 'undefined' && $('body').attr('id') !== 'oldMasterPage') {
                if (title === 'close') {
                    UIkit.modal('.uk-modal').hide();
                    return;
                }

                // 2顆按鈕
                if (obj.multibutton) {
                    UIkit.modal
                        .confirm('<h2 class="uk-modal-title ' + obj.class + '" type="UIKit.modal.confirm">' + title + '</h2>' + message, {
                            stack: obj.stack,
                            labels: { ok: obj.labels.ok, cancel: obj.labels.cancel },
                        })
                        .then(
                            function () {
                                if (typeof obj.onOK === 'function') {
                                    obj.onOK();
                                }
                            },
                            function () {
                                if (typeof onClose === 'function') {
                                    onClose();
                                }
                                if (typeof onClose === 'object') {
                                    obj.onClose();
                                }
                            }
                        );
                } else {
                    // 一顆按鈕
                    UIkit.modal
                        .alert('<h2 class="uk-modal-title ' + obj.class + '" type="UIKit.modal.alert">' + title + '</h2>' + message, { stack: obj.stack, labels: { ok: obj.labels.ok } })
                        .then(function () {
                            if (typeof onClose === 'function') {
                                onClose();
                            }
                        });
                }
            } 
            else {
                var id = 'wlsModal';

                if (title === 'close') {
                    $('#wlsModal').remove();
                    $('body, html').removeClass(id + 'open');
                    return;
                }

                if ($('#' + id).length === 0) {
                    const modalDiv = document.createElement('div');
                    modalDiv.id = id;

                    const wrapperDiv = document.createElement('div');
                    wrapperDiv.id = id + '_wrapper';

                    const titleDiv = document.createElement('div');
                    titleDiv.id = id + '_title';
                    titleDiv.className = obj.class;
                    titleDiv.textContent = title; 

                    const bodyDiv = document.createElement('div');
                    bodyDiv.id = id + '_body';

                    const bodySpan = document.createElement('span');

                    if(this.containsHtmlTags(message)) {
                        const result = this.replaceAllHtmlTagsInString(message);
                        bodySpan.appendChild(result);
                    } else {
                        bodySpan.textContent = message;
                    }

                    bodyDiv.appendChild(bodySpan);

                    const footerDiv = document.createElement('div');
                    footerDiv.id = id + '_footer';

                    const closeButton = document.createElement('button');
                    closeButton.id = id + '_close';
                    closeButton.textContent = obj.labels.cancel;

                    if (obj.multibutton) {
                        var okButton = document.createElement('button');
                        okButton.id = id + '_btngo';
                        okButton.textContent = obj.labels.ok;
                        footerDiv.appendChild(okButton);
                    }

                    footerDiv.appendChild(closeButton);

                    wrapperDiv.appendChild(titleDiv);
                    wrapperDiv.appendChild(bodyDiv);
                    wrapperDiv.appendChild(footerDiv);

                    document.body.appendChild(modalDiv);
                    modalDiv.appendChild(wrapperDiv);
                } else {
                    $('#' + id + '_title').text(title);
                    $('#' + id + '_body').text(message);
                }
                $('body, html').addClass(id + 'open');
                $('#mainpage', window.parent.document).addClass(id + 'open');
                $('#' + id).addClass('open');

                $('#' + id).css('max-height', $(top).height() + 'px');

                $('#' + id + '_close')
                    .off('click')
                    .on('click', function () {
                        $('#' + id).removeClass('open');
                        $('body,html').removeClass(id + 'open');
                        $('#mainpage:not(iframe)', window.parent.document).removeClass(id + 'open');
                        if (typeof onClose === 'function') {
                            onClose();
                        }
                    });

                if (obj.multibutton) {
                    $('#' + id + '_btngo')
                        .off('click')
                        .on('click', function () {
                            if (typeof obj.onOK === 'function') {
                                obj.onOK();
                            }
                        });
                }
            } // end else
        }, // WLS.Modal()
        // 兼容小寫
        modal: function (title, message, onClose, obj) {
            this.Modal(title, message, onClose, obj);
        },

        /**
         * 函示說明：UIKIT新版開戶中，銀行下拉選單select要加上能輸入關鍵字模糊搜尋的元件
         * @param {string} selectorID - 要增加關鍵字模糊搜尋的select元件id
         * @param {boolean} opt.isBranch - true=是分行 false=分行
         * @param {string} opt.placeholder - 還沒選option時顯示的文字，預設為[請選擇銀行]
         */
        isBankSelectorActive: undefined,
        BankSelector: function (selectorID, opt) {
            var oWLS = this;

            var opt = opt || {};
            opt.isBranch = opt.isBranch || false;
            opt.placeholder = opt.placeholder || '';

            if (document.getElementById(selectorID) === null) {
                return;
            }

            var data = [];
            var options = $('#' + selectorID + '> option');
            for (var i = 0; i < options.length; i++) {
                var activeOption = options.eq(i);
                if (activeOption.text() !== '請選擇銀行') {
                    data.push({
                        text: UI.trimString(activeOption.text()),
                        value: activeOption.attr('value'),
                    });
                }
            }

            var $select = $('#' + selectorID);
            var inputID = 'ipt' + selectorID;
            var divID = 'div' + selectorID;
            var inputClear = 'ibfs-bankInputClear';
            var wrapper = 'ibfs-wrapperBank';

            // 1. 建立DOM ================================
            // 1-1 沒有banksPanel時長出一個
            if ($('#banksPanel').length === 0) {
                $('body').append('<div id="banksPanel" class="uk-position-absolute uk-hidden" style="left:0;right:0; overflow-y:auto;"><ul class="uk-list uk-padding-small"></ul></div>');
            }
            var $panelSelector = $('#banksPanel');

            // 1-2 沒有input時長出一個
            if ($select.prev('.' + wrapper).length === 0 && document.getElementById('ipt_' + selectorID) === null) {
                $select.before(
                    '<div class="uk-position-relative ibfs-wrapperBank" style=' +
                        'margin-top:' +
                        $select.css('margin-top') +
                        ';margin-bottom:' +
                        $select.css('margin-bottom') +
                        ';height:' +
                        $select.outerHeight() +
                        'px;  id="' +
                        divID +
                        '" ">' +
                        '<input type="text" id="' +
                        inputID +
                        '" autocomplete="off" class="uk-input uk-position-absolute uk-position-top ibfs-inputBank" style="height:' +
                        $select.outerHeight() +
                        'px;" placeholder="' +
                        (opt.placeholder !== '' ? opt.placeholder : opt.isBranch ? '請輸入分行名稱' : '請輸入銀行代碼或名稱') +
                        '" />' +
                        '<div class="uk-position-absolute uk-position-right ' +
                        inputClear +
                        ' uk-hidden"><span uk-icon="close"></span></div>' +
                        '</div>'
                );
            }
            var $input = $('#' + inputID);
            $select.addClass('uk-hidden');
            if ($select.is(':disabled')) {
                $input.prop('disabled', true);
            }

            // 2 設定值 ================================
            // 2-1 設定 input 的 value值
            if (!opt.isBranch) {
                // [銀行]
                $input.val($select.children('option[selected][value!=""]').eq(0).text());
            } else {
                // [分行]

                if ($select.val() === '請選擇分行' || $select.val() === '') {
                    $input.val('');
                } else {
                    // TYPE 1 = 從銀行下拉選單ajax長出來的
                    if ($select.children('option[selected]').length === 0) {
                        $input.val(data[0] === undefined ? '' : data[0].text);
                    } else {
                        // TYPE 2 = 頁面一進來就已經有被選中的option
                        $input.val($select.children('option[selected][value!=""]').text());
                    }
                }
            }

            // 2-2 自訂li下拉選單的 text & value
            if (!opt.isBranch) {
                // 自訂[銀行]下拉選單的值
                if (oWLS.allListHTML === undefined) {
                    oWLS.allListHTML = '';
                    for (var ii = 0; ii < data.length; ii++) {
                        oWLS.allListHTML += '<li data-value="' + data[ii].value + '"  data-from="bank init">' + data[ii].text + '</li>';
                    }
                } else {
                    oWLS.allListHTML = oWLS.allListHTML;
                }
            } else {
                // 自訂[分行]下拉選單的值
                var _AllBranchHTML = '';

                // TYPE 1 = 原本就有分行select下拉的值
                var isSingleBranch = $select.children('option').length === 1;
                var hasManyBranch = $select.children('option').length > 1;
                var singleBranchName = '';
                if(isSingleBranch){ 
                    singleBranchName = UI.trimString($select.children('option').text()); 
                }
           
                if (hasManyBranch || (isSingleBranch && singleBranchName !== '請選擇分行')) {
                    for (var ii = 0; ii < data.length; ii++) {
                        _AllBranchHTML += '<li data-value="' + data[ii].value + '"  data-from="branch init">' + data[ii].text + '</li>';
                    }
                } else if (isSingleBranch && singleBranchName === '請選擇分行') {
                    _AllBranchHTML += '<li data-value=""  data-from="branch nodata">無資料</li>';
                }
            }

            // 3. 綁定事件: keyin銀行代碼或名稱 ==========================================================

            var $input = $('#' + inputID);
            $input
                .on('focus', function (e) {
                    var $input = $(this);

                    if (!opt.isBranch) {
                        //銀行

                        if (UI.trimString($input.val()) === '') {
                            //console.log('TYPE1 請選擇銀行 ==> li秀全部銀行列表')
                            _showBanks({ input: $input });
                        } else {
                            if (oWLS.allListHTML.indexOf(UI.trimString($input.val())) === -1) {
                                //console.log('TYPE 2-1 input有輸入值 [值不對]輸入的值不在銀行清單中 ==> li秀全部銀行列表')
                                _showBanks({ input: $input });
                            } else {
                                //console.log('TYPE 2-2 input有輸入值 ==> li秀全部銀行列表-20220303改')
                                _showBanks({ input: $input });

                                //console.log('TYPE 2-2 input有輸入值 ==> li秀那一筆銀行名稱-20220303廢')
                                //$input.trigger('input');
                            }
                        }
                    } else {
                        //分行

                        var _html = '';
                        if (($select.val() === null || $select.val() === '') && $select.siblings('select[onchange*=BankSel]').val() === '') {
                            _html = '<li class="disabled">請先選銀行</li>';
                        } else {
                            _html = _AllBranchHTML;
                        }

                        _showBanks({
                            input: $input,
                            HTML: _html,
                        });
                    }

                    _showBankClearButton();
                })
                .on('input', function (e) {
                    var $input = $(this);
                    var _html = '';

                    for (var iii = 0; iii < data.length; iii++) {
                        if (data[iii].text.indexOf(UI.trimString($input.val())) > -1) {
                            _html += '<li data-value="' + data[iii].value + '" data-from="' + (opt.isBranch ? '分行' : '銀行') + ' input">' + data[iii].text + '</li>';

                            if (data[iii].text === UI.trimString($input.val())) {
                                var _isSelectedBank = true;
                                var _isSelectedBankValue = data[iii].value;
                                _html = '<li data-value="' + data[iii].value + '" data-from="' + (opt.isBranch ? '分行' : '銀行') + ' input 2">' + data[iii].text + '</li>';
                            }
                        }
                    }

                    $select.val(''); // 清除值
                    if (!opt.isBranch) {
                        // 清除分行值
                        $input
                            .parent('.' + wrapper)
                            .siblings('.' + wrapper)
                            .find('.ibfs-bankInputClear')
                            .trigger('click');
                    }

                    if (_html !== '') {
                        //console.log('模糊比對 => 有值 $input.val()=', $input.val(), ', 精確等於某銀行嗎=', _isSelectedBank)
                        _showBanks({
                            input: $input,
                            HTML: _html,
                        });

                        // 重新賦值給原本用的select --> value=銀行代碼
                        if (_isSelectedBank) {
                            _setSelected({
                                el: $select,
                                isSelectedValue: _isSelectedBankValue,
                            });
                            if (!opt.isBranch) {
                                $input
                                    .parent('.' + wrapper)
                                    .next('.uk-select')
                                    .trigger('change'); //.parent('.' + wrapper)//.siblings('.' + wrapper).next('.uk-select').trigger('change');
                            }
                        }
                    } else {
                        //console.log('模糊比對 => 沒值 $input.val()=', $input.val())
                        _showBanks({
                            input: $input,
                            HTML: '<li data-from="input" data-value="">無結果</li>',
                        });
                    }

                    _showBankClearButton();
                });

            // 4. [清除]按紐 ==========================================================
            $input.siblings('.' + inputClear).on('click', function () {
                $('#' + inputID).val('');
                $select.val('');
                if (!opt.isBranch) {
                    $input
                        .parent('.' + wrapper)
                        .siblings('.' + wrapper)
                        .children('input[placeholder="請輸入分行名稱"]')
                        .val('');
                    $input
                        .parent('.' + wrapper)
                        .siblings('.' + wrapper)
                        .next('.uk-select')
                        .val('');
                }
                _showBankClearButton();
            });

            // 5. 選中[銀行或分行選項] ==========================================================
            $select.prev('.' + wrapper).on('click', '#banksPanel > ul > li', function (e) {
                if ($(this).hasClass('disabled')) {
                    $panelSelector.addClass('uk-hidden');
                    return;
                }

                var optText = $(this).text();

                $panelSelector.prev('.uk-input').val($(this).data('value') === '' ? '' : optText);
                $panelSelector.addClass('uk-hidden');

                // 重新賦值給原本用的select --> value=銀行代碼
                _setSelected({
                    el: $select,
                    isSelectedValue: $(this).data('value'),
                    optText: optText,
                });

                if (!opt.isBranch) {
                    // 銀行 ==> 連動分行
                    $select.trigger('change');
                }
            });

            // 6. 模擬blur事件 = 綁定一次就好 ==========================================================
            if (this.isBankSelectorActive === undefined) {
                $('.wls-main, body#oldMasterPage').on('click', '*', function (e) {
                    var $el = $(e.target);
                    if ($el.hasClass('ibfs-inputBank') || $el.attr('id') === 'banksPanel' || $el.closest('#banksPanel').length) {
                    } else {
                        $panelSelector.addClass('uk-hidden');
                    }
                });

                this.isBankSelectorActive = true;
            }

            // 以下零組件 ==========================================================
            function _showBanks(obj) {
                var obj = obj || {};
                obj.input = obj.input || {};
                obj.HTML = obj.HTML || '';

                if (obj.HTML !== '') {
                    $panelSelector.children('ul').html(obj.HTML);
                } else {
                    $panelSelector.children('ul').html(oWLS.allListHTML);
                }
                $panelSelector.insertAfter(obj.input).css({
                    top: obj.input.outerHeight() + 'px',
                    'max-height': '50vh',
                });
                $panelSelector.removeClass('uk-hidden');
            }

            function _showBankClearButton() {
                if ($('#' + inputID).val() !== '') {
                    $('#' + inputID)
                        .siblings('.' + inputClear)
                        .removeClass('uk-hidden');
                } else {
                    $('#' + inputID)
                        .siblings('.' + inputClear)
                        .addClass('uk-hidden');
                }
            }

            function _setSelected(o) {
                o.optText = o.optText || '';
                o.el.find('option').removeAttr('selected');
                if (o.isSelectedValue !== '') {
                    var options = o.el.find('option[value="' + o.isSelectedValue + '"]');
                    if (options.length > 1) {
                        options.each(function (index, opt) {
                            if ($(opt).text() === o.optText) {
                                $(opt).prop('selected', true).attr('selected', 'selected');
                            }
                        });
                    } else {
                        options.prop('selected', true).attr('selected', 'selected');
                    }
                }
            }
        }, // WLS.BankSelector();
        // 兼容小寫
        bankSelector: function (selectorID, opt) {
            this.BankSelector(selectorID, opt);
        },

        /**
         * 函示說明：從銀行代碼抓取分行列表，用在開戶選出入金銀行等等
         * @param {function} objParams.onSelected - 取的分行列表後要做的事
         * @param {string} objParams.BankCode - 取道的銀行代碼
         * @param {string} objParams.No - 要傳遞給 onSelected callback中的字串，區分select ID用
         * @param {boolean} objParams.validate - 要不要做額外驗證，如檢核郵局700
         *
         */
        BankSel: function (objParams = {}) {
            objParams.onSelected = objParams.onSelected || function () {};
            objParams.BankCode = objParams.BankCode || '';
            objParams.No = objParams.No || '';
            objParams.validate = objParams.validate;

            const self = this;

            try {
                // true或沒指定validate的值才要判斷秀不秀勾勾
                if (objParams.validate === undefined || objParams.validate) {
                    // 檢查要不要顯示 郵局個資同意書的checkbox區塊
                    if ($('#jsPostAgree').length) {
                        self.RequireRead.showBox({ $box: $('#jsPostAgree'), doShow: objParams.BankCode === self.RequireRead.validatePostCode });
                    }

                    // 也面有其他select時也要一併檢查
                    if (self.RequireRead.validateShowbox({ rule: 'postCode' })) {
                        self.RequireRead.showBox({ $box: $('#jsPostAgree'), doShow: true });
                    }
                }

                $.ajax({
                    type: 'POST',
                    catche: false,
                    url: '/APP/EManager/EOpenS/BankBranch.ashx',
                    data: [{ name: 'BankCode', value: objParams.BankCode }],
                    dataType: 'json',
                })
                    .done(function (res) {
                        objParams.onSelected(res, objParams.No);
                    })
                    .fail(function (xhr, errorMsg, error) {
                        alert('分行取得失敗，請稍候再試');
                    })
                    .always(function (res) {});
            } catch (e) {
                console.log('[WLS.BankSel] e', e);
            }
        },

        // 兼容小寫
        bankSel: function () {
            this.BankSel();
        },

        /**
         * 函示說明：開戶中，選擇聯絡時間的radio+時間套件
         * @param {array} o.times - 要客制化時間就傳入這樣的陣列 [{ start: '8:00', end: '11:00'}, { start: '8:00', end: '11:00'} ]
         * @param {boolean} o.checked - 預設被選中的項目，預設為'0'=都不選。或'1','2','3','4'。
         * @param {boolean} o.isDisabled - 能不能點，預設為 false
         * @param {string} o.el - 要掛載到哪個dom上，預設為 '#jsContactTime'
         */
        ContactTime: function (o) {
            try {
                console.log(o);
                o = o || {};

                _formatData(o);
                _renderHtml(o);

                function _formatData(o) {
                    o.times = o.times || [
                        { start: '8:00', end: '11:00' },
                        { start: '11:00', end: '14:00' },
                        { start: '14:00', end: '17:00' },
                        { start: 'all', end: 'all' },
                    ];

                    o.checked = o.checked || '0';
                    o.checked = typeof o.checked === 'string' ? UI.trimString(o.checked) : '0';

                    o.isDisabled = o.isDisabled || false;
                    o.isDisabled = typeof o.isDisabled === 'boolean' ? o.isDisabled : false;

                    o.el = o.el || '#jsContactTime';
                    o.el = typeof o.checked === 'string' ? UI.trimString(o.el) : '#jsContactTime';

                    // set prop: radio被選中的狀態
                    o.times = o.times.map((x, index) => {
                        x.isChecked = index + 1 === parseInt(UI.trimString(o.checked));
                        return x;
                    });
                }
                function _renderHtml(o) {
                    let strHtml = ``;
                    if (o.times.length === 0) return;

                    o.times.forEach((x, index) => {
                        x.start = x.start || '0:00';
                        x.end = x.end || '0:00';
                        x.isChecked = x.isChecked || false;

                        const numIndex = index + 1;
                        const txtTime = x.start === 'all' ? `都可以` : `${x.start}~${x.end}`;

                        strHtml += `
                        <div>
                            <input type="radio" class="uk-radio" name="ContactTime" id="ContactTime${numIndex}"
                                    value ="${numIndex}"
                                    ${x.isChecked ? 'checked' : ''}
                                    ${o.isDisabled ? 'disabled' : ''} />
                            <label for="ContactTime${numIndex}">${txtTime}</label>
                        </div>`;
                    });

                    // set HTML
                    if ($(o.el).length) {
                        $(o.el).append($(strHtml));
                    }
                }
            } catch (error) {
                UI.handleError(error, `UI|IBFS|ContactTime`);
            }
        },
        // 兼容小寫
        contactTime: function (o) {
            this.ContactTime(o);
        },

        /**
         * 函示說明：開戶中，按Native右上角關閉按紐時，要跳預設modal
         */
        EopenCloseWindow: function () {
            top.onNativeCloseNewWindow = function () {
                WLS.Modal('提醒', '您確定要離開開戶流程嗎', function () {}, {
                    multibutton: true,
                    labels: {
                        cancel: '取消',
                        ok: '離開',
                    },
                    onOK: function () {
                        fnCloseNewWindow();
                    },
                });
            };
        },
        eopenCloseWindow: function () {
            this.EopenCloseWindow();
        },

        /**
         * 函示說明：要讀過文件才能打勾
         */
        RequireRead: {
            // 初始化
            init: function (strType = '') {
                const self = this;

                switch (strType) {
                    case 'postCode':
                        _iniPostCode(strType);
                        break;
                    default:
                        break;
                }

                function _iniPostCode(strType) {
                    // init需不需要出現郵局個資保護同意書
                    if ($('#jsPostAgree').length === 0) {
                        return;
                    }
                    self.showBox({ $box: $('#jsPostAgree'), doShow: self.validateShowbox({ rule: strType }) });

                    // UI: 點個資保護同意書彈跳出小視窗
                    if ($('#btnPostAgree').length === 0) {
                        return;
                    }
                    if ($('#PostAgreeModal').length === 0) {
                        return;
                    }

                    // 沒UIkit的兼容Modal
                    if (typeof UIkit === 'undefined') {
                        const $modal = $('#PostAgreeModal');
                        $modal.appendTo($('body')).addClass('ibfs-modal');
                        $modal.find('.uk-modal-close-outside').on('click', function () {
                            $modal.removeClass('ibfs-modal-open');
                        });
                    }
                    // 個資保護同意書點擊事件
                    $('#btnPostAgree').on('click', function (e) {
                        e.preventDefault();
                        self.doChecked({
                            $btn: $(this),
                            $chk: $('#chkPostAgree'),
                            $modal: $('#PostAgreeModal'),
                        });
                    });
                }
            },

            // 檢查要不要顯示【同意書勾勾區塊】
            validatePostCode: '700',
            validateShowbox: function (objParams = {}) {
                objParams.rule = objParams.rule || '';

                const self = this;
                let flagShow = false;

                switch (objParams.rule) {
                    // 20220920 顯示郵局的【個資保護同意書區塊】，檢查條件為郵局代碼700
                    case 'postCode':
                        // 選銀行的下拉
                        let $select = null;
                        if ($('.uk-select[onchange*=BankSel]').length) {
                            $select = $('.uk-select[onchange*=BankSel]');
                        } else if ($('select[onchange*=BankSel]').length) {
                            $select = $('select[onchange*=BankSel]');
                        } else {
                        }

                        if ($select === null) {
                            return;
                        }
                        $select.each(function (index, el) {
                            if ($(el).val() === self.validatePostCode) {
                                flagShow = true;
                                return false;
                            }
                        });
                        break;
                    default:
                        break;
                }

                return flagShow;
            },

            // 檢查要不要顯示【同意書勾勾區塊】
            validateChecked: function (objParams = {}) {
                objParams.$chk = objParams.$chk || {};
                objParams.$box = objParams.$box || {};
                objParams.onUnChecked = objParams.onUnChecked || {};

                if (objParams.$chk.length && !objParams.$chk.prop('checked') && !objParams.$box.hasClass('uk-hidden')) {
                    WLS.Modal('提醒', '請勾選已詳閱同意書並充分了解個資保護同意書', function () {
                        objParams.$chk.focus();
                    });
                    objParams.onUnChecked();
                }
            },

            // 顯示或隱藏【同意書勾勾區塊】
            showBox: function (objParams = {}) {
                objParams = objParams || {};
                objParams.$box = objParams.$box || {};
                objParams.doShow = objParams.doShow || false;

                const hideCSS = 'uk-hidden';
                if (objParams.doShow) {
                    if (typeof objParams.$box.removeClass === 'function') {
                        objParams.$box.removeClass(hideCSS);
                    }
                } else {
                    if (typeof objParams.$box.addClass === 'function') {
                        objParams.$box.addClass(hideCSS);
                    }
                }
            },

            // 【同意書勾勾區塊】打開modal後自動勾選同意勾勾並disabled
            doChecked: function (objParams) {
                objParams = objParams || {};
                objParams.$btn = objParams.$btn || {};
                objParams.$chk = objParams.$chk || {};
                objParams.$modal = objParams.$modal || {};

                objParams.$btn.data('hasread', true);

                objParams.$chk.prop('checked', true).attr({
                    checked: 'checked',
                    //disabled: 'disabled'
                });

                if (typeof UIkit === 'function') {
                    UIkit.modal(objParams.$modal).show();
                } else {
                    objParams.$chk.siblings('.wls-ui-checkbox').html('<div class="checked"><i class="icon-ok"></i></div>');
                    objParams.$modal.addClass('ibfs-modal-open');
                }
            },
        },

        /**
         * 陽春版的 autoComplete
         */
        EmailAutoComplete: function (selectorID = '', opt = {}) {
            if (document.getElementById(selectorID) === null) {
                return;
            }

            if ($('#' + selectorID + '> option').length === 0) {
                return;
            }

            const placeholder = opt.placeholder || '';
            const selectorAutoCompletePanel = '#autoCompletePanel';
            const $select = $('#' + selectorID);
            const inputID = 'ipt' + selectorID;
            const wrapper = 'ibfs-wrapperAutoComplete';
            const hiddenStyle = 'uk-hidden';
            const selectorIDdata = [];
            try {
                for (var i = 0; i < $('#' + selectorID + '> option').length; i++) {
                    var d = $('#' + selectorID + '> option');
                    if (d.eq(i).val() !== '') {
                        selectorIDdata.push({
                            text: UI.trimString(d.eq(i).text()),
                            value: d.eq(i).attr('value'),
                        });
                    }
                }

                /**
                 * 1. 建立DOM ================================
                 */
                // 1-1 沒有autoCompletePanel時長出一個
                if ($(selectorAutoCompletePanel).length === 0) {
                    $('body').append(`
                        <div id="autoCompletePanel">
                            <ul></ul>
                        </div>`);
                }
                const $panelSelector = $(selectorAutoCompletePanel);

                // 1-2 沒有input時長出一個
                if ($select.prev('.' + wrapper).length === 0 && document.getElementById('ipt_' + selectorID) === null) {
                    $select.before(`
                        <div class="uk-position-relative uk-flex-1 ${wrapper}" style="margin-top:${$select.css('margin-top')};margin-bottom:${$select.css(
                        'margin-bottom'
                    )};height:${$select.outerHeight()}px;">
                            <input type="text" id="${inputID}"  autocomplete="off" class="uk-input uk-flex-1 ibfs-inputAutoComplete" style="height:${$select.outerHeight()}px" placeholder="${
                        placeholder !== '' ? placeholder : ''
                    }"/>
                            <div class="uk-position-absolute uk-position-right uk-margin-right"><span id="checkIcon"  uk-icon="" style=""></span></div>
                        </div>
                    `);
                }

                $(`.${wrapper}`).append($panelSelector);

                // 1-3 長出 li
                let liHtml = ``;
                $('#' + selectorID + '> option').each((index, x) => {
                    liHtml += `<li class="" value="${$(x).val()}">${UI.trimString($(x).text())}</li>`;
                });
                $panelSelector.children('ul').html(liHtml);
                $(selectorAutoCompletePanel).addClass(hiddenStyle);
                $select.addClass(hiddenStyle);

                var $input = $('#' + inputID);

                // 2 設定值 ================================
                // 2-1 設定 input 的 value值

                $input.val($select.children('option[selected][value!=""]').eq(0).text());

                $input
                    .on('focus', function (e) {
                        var newVal = UI.trimString($input.val().toLowerCase());
                        if (newVal.length == 0) {
                            _showSelected({ input: $input });
                        }
                    })

                    .on('input', function (e) {
                        var $input = $(this);
                        var newVal = UI.trimString($input.val().toLowerCase());
                        var _html = '';
                        var _isnewVal = false;
                        var _email_arry = [];
                        var _email_hosting = '';
                        var _email_username = '';
                        var _selector_arry = [];

                        for (var iii = 0; iii < selectorIDdata.length; iii++) {
                            if (newVal.length > 0) {
                                if (UI.trimString($input.val()).includes('@')) {
                                    _email_arry = UI.trimString($input.val()).split('@');
                                    _email_username = _email_arry[0];
                                    _email_hosting = _email_arry[1];

                                    if (selectorIDdata[iii].value.includes(_email_hosting) && !_selector_arry.includes(_email_username + selectorIDdata[iii].value.replace(_email_username, ''))) {
                                        _html +=
                                            '<li value="' +
                                            _email_username +
                                            selectorIDdata[iii].value.replace(_email_username, '') +
                                            '">' +
                                            _email_username +
                                            selectorIDdata[iii].text.replace(_email_username, '') +
                                            '</li>';
                                        _selector_arry.push(_email_username + selectorIDdata[iii].value.replace(_email_username, ''));
                                    }
                                } else {
                                    _html += '<li value="' + UI.trimString($input.val()) + selectorIDdata[iii].value + '">' + UI.trimString($input.val()) + selectorIDdata[iii].text + '</li>';
                                    _selector_arry.push(UI.trimString($input.val()) + selectorIDdata[iii].value);
                                }
                            }
                        }

                        if (!_selector_arry.includes($input.val())) {
                            _html += '<li value="' + $input.val() + '">' + $input.val() + '</li>';
                        }

                        if (isEMail($input.val())) {
                            document.getElementById('checkIcon').setAttribute('uk-icon', 'check'); // 設置屬性的值 V
                            document.getElementById('checkIcon').setAttribute('style', 'color:#006d1a');
                        } else {
                            document.getElementById('checkIcon').setAttribute('uk-icon', 'close'); // 設置屬性的值 X
                            document.getElementById('checkIcon').setAttribute('style', 'color:#cc0000');
                        }

                        $select.val(''); // 清除值
                        if (_html !== '') {
                            _showSelected({
                                input: $input,
                                HTML: _html,
                            });
                        }
                    });

                /**
                 * 2. 事件綁定 ================================
                 */
                $select.prev('.' + wrapper).on('click', '#autoCompletePanel > ul > li', function (e) {
                    const $el = $(this);

                    if ($(this).hasClass('disabled')) {
                        $panelSelector.addClass(hiddenStyle);
                        return;
                    }

                    $(`#${inputID}`).val($el.text());
                    $panelSelector.prev('.uk-input').val($(this).data('value') === '' ? '' : $el.text());
                    $panelSelector.addClass('uk-hidden');

                    _setSelected({
                        el: $select,
                        isSelectedValue: $(this).data('value'),
                        optText: $el.text(),
                    });

                    if (isEMail($input.val())) {
                        document.getElementById('checkIcon').setAttribute('uk-icon', 'check'); // 設置屬性的值 V
                        document.getElementById('checkIcon').setAttribute('style', 'color:#006d1a');
                    } else {
                        document.getElementById('checkIcon').setAttribute('uk-icon', 'close'); // 設置屬性的值 X
                        document.getElementById('checkIcon').setAttribute('style', 'color:#cc0000');
                    }
                });

                // 以下零組件 ==========================================================

                function _setSelected(o) {
                    o.optText = o.optText || '';
                    o.el.find('option').removeAttr('selected');
                    if (o.isSelectedValue !== '') {
                        var options = o.el.find('option[value="' + o.isSelectedValue + '"]');
                        if (options.length > 1) {
                            options.each(function (index, opt) {
                                if ($(opt).text() === o.optText) {
                                    $(opt).prop('selected', true).attr('selected', 'selected');
                                }
                            });
                        } else {
                            options.prop('selected', true).attr('selected', 'selected');
                        }
                    }
                }

                function _showSelected(obj) {
                    var obj = obj || {};
                    obj.input = obj.input || {};
                    obj.HTML = obj.HTML || '';

                    if (obj.HTML !== '') {
                        $panelSelector.children('ul').html(obj.HTML);
                    } else {
                        $panelSelector.children('ul').html(liHtml);
                    }
                    $panelSelector.insertAfter(obj.input).css({
                        top: obj.input.outerHeight() + 'px',
                        'max-height': '50vh',
                    });
                    $panelSelector.removeClass('uk-hidden');
                }
            } catch (ex) {
                console.log(`[AutoComplete] _showSelected = `, { ex });
            }
        }, // WLS.AutoComplete();

        /** 
         * 函式說明：遮蔽個資或密碼顯示
         */ 
        MaskInput: function (inputId, toggleBtnId) {
            try {
                var targetInput = document.getElementById(inputId);
                var toggleBtn = document.getElementById(toggleBtnId);

                if (!targetInput || !toggleBtn) return;

                var originalType = targetInput.type.toLowerCase();
                if (originalType !== "text" && originalType !== "password"  && originalType !== "textarea") {
                    console.warn("[遮蔽個資] 錯誤：僅支援 text, password 或 textarea 類型的輸入欄位");
                    return;
                }

                var isPswdField = originalType === "password";
                var isVisible = false;

                function shouldMask(value) {
                    var idFormat = /^[A-Z][0-9]{9}$/;
                    var accountFormat = /^[0-9]{8}$/;

                    return idFormat.test(value) || accountFormat.test(value);
                }

                function maskValue(value) {
                    if (shouldMask(value)) {
                        // 只遮蔽後四位
                        return value.substring(0, value.length - 4) + "****";
                    }
                    return value;
                }

                if (!isPswdField) {
                    toggleBtn.style.display = "none";
                    targetInput.id = inputId + "_proxy";
                    targetInput.removeAttribute("name");

                    var cloneInput = targetInput.cloneNode(true);
                    cloneInput.style.display = "none";
                    cloneInput.type = "hidden";
                    cloneInput.id = inputId;
                    cloneInput.name = inputId;

                    targetInput.parentNode.insertBefore(cloneInput, targetInput.nextSibling);

                    if (shouldMask(targetInput.value)) {
                        cloneInput.value = targetInput.value;
                        targetInput.value = maskValue(targetInput.value);
                    }

                    targetInput.addEventListener("input", function () {
                        var val = this.value.toUpperCase();
                        cloneInput.value = val;
                        this.value = val;
                    });

                    targetInput.addEventListener("focus", function () {
                        if (cloneInput.value) {
                            this.value = cloneInput.value;
                        }
                    });
        
                    targetInput.addEventListener("blur", function () {
                        if (shouldMask(cloneInput.value)) {
                            this.value = maskValue(cloneInput.value);
                        }
                    });
                } else {
                    toggleBtn.addEventListener("click", function (e) {
                        e.preventDefault();
                        isVisible = !isVisible;

                        var cursorPos = targetInput.selectionStart;
                        var valueLength = targetInput.value.length;

                        if (isVisible) {
                            targetInput.type = "text";
                            this.style.backgroundImage = "url('/Images/open-eye.png')";
                        } else {
                            targetInput.type = "password";
                            this.style.backgroundImage = "url('/Images/close-eye.png')";
                        }

                        targetInput.focus();

                        setTimeout(function () {
                            if (cursorPos !== undefined && cursorPos <= valueLength) {
                                targetInput.setSelectionRange(cursorPos, cursorPos);
                            } else {
                                targetInput.setSelectionRange(valueLength, valueLength);
                            }
                        }, 0);
                    });

                    toggleBtn.addEventListener("mousedown", function (e) {
                        e.preventDefault();
                    });
                }

            } catch (error) {
                console.log("[遮蔽個資/密碼顯示] 錯誤：", error);
            }
        },
        maskInput: function (inputId, toggleBtnId) {
            this.MaskInput(inputId, toggleBtnId);
        },


        /**
         * 函式說明：個資遮蔽保留前兩碼和後兩碼(帳號)，中間使用星號替代，如無法成功遮蔽則直接返回原始值
         */
        MaskDisplayAcc: function (data) {
            try {
                data = data === undefined ? '' : data;
                if (!data && data !== 0) return data;
                var ogData = data;

                var str = typeof data === 'string' ? data : String(data);
                var trimString = str.trim();
                var stringLength = trimString.length;

                if (stringLength <= 4) return trimString;

                var stars = '';
                for (var i = 0; i < stringLength - 4; i++) {
                    stars += '*';
                }

                return trimString.substring(0, 2) + stars + trimString.substring(stringLength - 2);
            } catch (e) {
                console.error('[遮蔽個資]MaskDisplayAcc 錯誤:', e);
                return ogData;
            }
        },
        maskDisplayAcc: function (data) {
            return this.MaskDisplayAcc(data);
        },

        /**
         * 函式說明：個資遮蔽保留前兩碼和後兩碼(帳號)，中間使用星號替代，如無法成功遮蔽則直接返回原始值
         */
        MaskDisplayMobile: function (data) {
            try {
                data = data === undefined ? '' : data;
                if (!data && data !== 0) return data;
                var ogData = data;

                var str = typeof data === 'string' ? data : String(data);
                var trimString = str.trim();
                var stringLength = trimString.length;

                if (stringLength <= 4) return trimString;

                var stars = '';
                for (var i = 0; i < stringLength - 4; i++) {
                    stars += '*';
                }

                return trimString.substring(0, 2) + stars + trimString.substring(stringLength - 2);
            } catch (e) {
                console.error('[遮蔽個資]MaskDisplayMobile 錯誤:', e);
                return ogData;
            }
        },
        maskDisplayMobile: function (data) {
            return this.MaskDisplayMobile(data);
        },

        /**
         * 函式說明：個資遮蔽(Email)，將"@"前後兩碼遮蔽使用星號替代，並保留 "@"
         * 支援全形符號 "＠"
         * 例如: 1234567890@gmail.com → 12345678**@**ail.com
         * 例如: 1234567890＠gmail.com → 12345678**＠**ail.com
         * 多@例如: address123456@@domain.com → address1234**@@**main.com
         */
        MaskDisplayEmail: function (data) {
            try {
                data = data === undefined ? '' : data;
                if (!data && data !== 0) return data;
                var ogData = data;

                var str = typeof data === 'string' ? data : String(data);
                var trimString = str.trim();

                // 同時支援半形和全形 @ 符號
                var atIndex = trimString.indexOf('@');
                var fullWidthAtIndex = trimString.indexOf('＠');
                
                // 確定使用哪種 @ 符號和索引位置
                var useFullWidth = false;
                if (atIndex === -1 || (fullWidthAtIndex !== -1 && fullWidthAtIndex < atIndex)) {
                    atIndex = fullWidthAtIndex;
                    useFullWidth = true;
                }

                // 使用實際找到的 @ 符號
                var atSymbol = useFullWidth ? '＠' : '@';

                if (atIndex <= 0 || atIndex === trimString.length - 1) {
                    return trimString;
                }

                // 檢查是否有多個 @ 符號 (包括全形和半形)
                var restString = trimString.substring(atIndex + 1);
                var atIndex2 = restString.indexOf('@');
                var fullWidthAtIndex2 = restString.indexOf('＠');
                
                var hasMultipleAt = atIndex2 !== -1 || fullWidthAtIndex2 !== -1;
                
                if (hasMultipleAt) {
                    var firstPart = trimString.substring(0, atIndex);
                    
                    // 找到最後一個 @ 符號的位置 (半形或全形)
                    var lastAtIndex = trimString.lastIndexOf('@');
                    var lastFullWidthAtIndex = trimString.lastIndexOf('＠');
                    
                    if (lastFullWidthAtIndex > lastAtIndex) {
                        lastAtIndex = lastFullWidthAtIndex;
                    }
                    
                    var lastPart = trimString.substring(lastAtIndex + 1);
                    var middlePart = trimString.substring(atIndex, lastAtIndex + 1);

                    if (firstPart.length < 2 || lastPart.length < 2) {
                        return trimString;
                    }

                    var maskedFirstPart;
                    if (firstPart.length < 5) {
                        var stars = '';
                        for (var i = 0; i < firstPart.length; i++) {
                            stars += '*';
                        }
                        maskedFirstPart = stars;
                    } else {
                        maskedFirstPart = firstPart.substring(0, firstPart.length - 2) + '**';
                    }

                    var maskedLastPart = '**' + lastPart.substring(2);

                    return maskedFirstPart + middlePart + maskedLastPart;
                }

                var firstPart = trimString.substring(0, atIndex);
                var lastPart = trimString.substring(atIndex + 1);

                if (firstPart.length < 2 || lastPart.length < 2) {
                    return trimString;
                }

                var maskedFirstPart;
                if (firstPart.length < 5) {
                    var stars = '';
                    for (var i = 0; i < firstPart.length; i++) {
                        stars += '*';
                    }
                    maskedFirstPart = stars;
                } else {
                    maskedFirstPart = firstPart.substring(0, firstPart.length - 2) + '**';
                }

                var maskedLastPart = '**' + lastPart.substring(2);

                return maskedFirstPart + atSymbol + maskedLastPart;
            } catch (e) {
                console.error('[遮蔽個資]MaskDisplayEmail 錯誤:', e);
                return ogData;
            }
        },
        maskDisplayEmail: function (data) {
            return this.MaskDisplayEmail(data);
        },
    }; // END WLS obj
} catch (e) {
    console.log('功能異常[WLS object] ' + e);
}

// [Flow 3] 檢查JSB是否正確引入了
// 流程關卡1: onJSBReady => iOS是用 WKwebview，無法用JSB.xx()介面呼叫功能，所以要加工一下
// 流程關卡2: checkAppVersion
// 流程關卡3: checkJSB

try {
    if (UI.isAndroid) {
        onJSBReady(JSB);
    }

    if (UI.isIOS && UI.isWKwebview) {
        // 看盤的JSB
        if (getQueryString('from').toLocaleLowerCase() === 'native') {
            function _NativeJSB(functionName, params, params2, params3) {
                try {
                    var message = {
                        method: functionName,
                        param1: params !== null && params !== undefined ? params : '',
                        param2: params2 !== null && params2 !== undefined ? params2 : '',
                        param3: params3 !== null && params3 !== undefined ? params3 : '',
                    };
                    if (typeof webkit === 'object') {
                        webkit.messageHandlers.JSB.postMessage(message);
                    }
                } catch (e) {
                    console.log('IOS > !JSB && !webkit.messageHandlers--> ', e);
                }
            }

            var JSB = {
                // 功能說明:更新native看盤的自選股。註:android要用到params= GroupID,但ios不用這個參數
                UpdateSelfGroup: function (params) {
                    _NativeJSB(arguments.callee.name, params);
                },
                // 功能說明:關閉native看盤的新視窗
                CloseQuoteNewWindow: function () {
                    _NativeJSB(arguments.callee.name);
                },
                // 功能說明:開native走勢的新視窗
                OpenKline: function (params) {
                    _NativeJSB(arguments.callee.name, params);
                },
                // 功能說明:開native大盤的新視窗
                NewWindow: function (params, params2, params3) {
                    _NativeJSB(arguments.callee.name, params, params2, params3);
                },
            };
        }

        // vivi JSB
        else {
            function _NativeJSB(functionName, params, params2, params3, params4) {
                try {
                    if (typeof webkit !== 'object') {
                        return;
                    }
                    var message = {
                        method: functionName,
                        param1: params !== null && params !== undefined ? params : '',
                        param2: params2 !== null && params2 !== undefined ? params2 : '',
                        param3: params3 !== null && params3 !== undefined ? params3 : '',
                        param4: params4 !== null && params4 !== undefined ? params4 : '',
                    };
                    
                    webkit.messageHandlers.JSB.postMessage(message);
                } catch (e) {
                    console.log('IOS > !JSB && !webkit.messageHandlers--> ' + e);
                }
            }

            var JSB = {
                // 功能說明:主框導去其他頁面
                GoWebPage: function (params, params2, params3, params4) {
                    //alert('給vivi用的新JSB GoWebPage')
                    _NativeJSB(arguments.callee.name, params, params2, params3, params4);
                },
                // 功能說明:開新視窗
                NewWindow: function (params, params2, params3) {
                    //alert('給vivi用的新JSB NewWindow' + )
                    _NativeJSB(arguments.callee.name, params, params2, params3);
                },
                // 功能說明:關閉新視窗
                CloseNewWindow: function () {
                    // alert('給vivi用的新JSB CloseNewWindow')
                    _NativeJSB(arguments.callee.name);
                },
                // 功能說明:開啟左側Menu
                OpenMenu: function (params, params2) {
                    //alert('給vivi用的新JSB OpenMenu')
                    _NativeJSB(arguments.callee.name, params, params2);
                },
                // 功能說明:[2021新增] 左側Menu展開子項目，但左選單本身不打開
                SetMenu: function (params, params2) {
                    //alert('給vivi用的新JSB SetMenu')
                    _NativeJSB(arguments.callee.name, params, params2);
                },
                // 功能說明:另開新視窗，顯示Native APP登入畫面，登入成功後關閉視窗。
                Login: function (params, params2, params3) {
                    //alert('給vivi用的新JSB Login')
                    _NativeJSB(arguments.callee.name, params, params2, params3);
                },
                // 功能說明:登出，清空Token，並轉到登入頁面
                Logout: function () {
                    //alert('給vivi用的新JSB Logout')
                    _NativeJSB(arguments.callee.name);

                    // 2021/7/9解ios登出session問題，用網頁再次呼叫登出API，僅IOS使用。安卓Native呼叫Louout_Proc.ashx沒問題
                    $.ajax({
                        url: '/APP/EManager/Logout_Proc.ashx',
                    });
                },
                // 功能說明:Alert訊息
                Alert: function (params, params2) {
                    //alert('給vivi用的新JSB Alert')
                    _NativeJSB(arguments.callee.name, params, params2);
                },
                // 功能說明:打電話
                Tel: function (params) {
                    //alert('給vivi用的新JSB Tel')
                    _NativeJSB(arguments.callee.name, params);
                },
                // 功能說明:聲音
                Sound: function () {
                    //alert('給vivi用的新JSB Sound')
                    _NativeJSB(arguments.callee.name);
                },
                // 功能說明:震動
                Shock: function () {
                    //alert('給vivi用的新JSB Shock')
                    _NativeJSB(arguments.callee.name);
                },
                // 功能說明:另開憑證新視窗開啟Native CA視窗
                NewCAWindow: function () {
                    //alert('給vivi用的新JSB NewCAWindow')
                    _NativeJSB(arguments.callee.name);
                },
                // 功能說明:關閉登入視窗，不呼叫。由native登入後呼叫
                CloseLoginWindow: function () {
                    //alert('給vivi用的新JSB CloseLoginWindow')
                    _NativeJSB(arguments.callee.name);
                },
                // 功能說明:回傳APP的版本
                GetVersion: function () {
                    //alert('給vivi用的新JSB GetVersion')
                    return _NativeJSB(arguments.callee.name);
                },
                // 功能說明:登入後導去某功能
                Redirect: function (params, params2) {
                    //alert('給vivi用的新JSB Redirect')
                    _NativeJSB(arguments.callee.name, params, params2);
                },
                // 功能說明:開啟Safari
                OpenBrowser: function (params) {
                    //alert('給vivi用的新JSB OpenSafari')
                    _NativeJSB('OpenSafari', params);
                },
                // 功能說明:開啟其他APP (處理理財APP開啟其他APP scheme，不處理就無法開啟)
                OpenOtherAPP: function (params, params2) {
                    //alert('給vivi用的新JSB OpenOtherAPP')
                    _NativeJSB(arguments.callee.name, params, params2);
                },
                // 功能說明:證件照相機
                OpenCamera: function (params, params2, params3) {
                    //alert('給vivi用的新JSB OpenCamera')
                    _NativeJSB(arguments.callee.name, params, params2.toString(), params3);
                },
                // 功能說明:證件照相機(有OCR辨識 20220912)
                OpenCameraWithOCR: function (params, params2, params3, params4) {
                    //alert('給vivi用的新JSB OpenCameraWithOCR')
                    _NativeJSB(arguments.callee.name, params, params2.toString(), params3, params4);
                },
                // 功能說明:存摺照相機
                OpenPassBookCamera: function (params, params2, params3) {
                    //alert('給vivi用的新JSB OpenPassBookCamera')
                    _NativeJSB(arguments.callee.name, params, params2.toString(), params3);
                },
                // 功能說明:自拍照相機
                OpenSelfieCamera: function (params, params2, params3) {
                    //alert('給vivi用的新JSB OpenSelfieCamera')
                    _NativeJSB(arguments.callee.name, params, params2.toString(), params3);
                },
                // 功能說明:2021信用戶續約新增，user可以拍照/選檔上傳大頭照，拍照的話相機畫面不要有紅框，就用原生相機的畫面(2021模擬平台也要用到)
                OpenDefaultCamera: function (params, params2, params3) {
                    //alert('給vivi用的新JSB OpenDefaultCamera')
                    _NativeJSB(arguments.callee.name, params, params2.toString(), params3);
                },
                // 功能說明:開啟看盤
                OpenQuotation: function () {
                    //alert('給vivi用的新JSB OpenQuotation')
                    _NativeJSB(arguments.callee.name);
                },
                // 功能說明:憑證申請
                ApplyCA: function () {
                    //alert('給vivi用的新JSB ApplyCA\n\n')
                    _NativeJSB(arguments.callee.name);
                }, // 功能說明:憑證載入
                LoadCA: function () {
                    //alert('給vivi用的新JSB LoadCA\n\n')
                    _NativeJSB(arguments.callee.name);
                },
                // 功能說明:憑證簽章
                SignCA: function (params) {
                    //alert('給vivi用的新JSB SignCA1\n\n')
                    _NativeJSB(arguments.callee.name, params);
                },
                // 功能說明:訂閱中心-憑證簽章
                SignCAOrder: function (params, params2) {
                    //alert('給vivi用的新JSB SignCAOrder')
                    _NativeJSB(arguments.callee.name, params, params2);
                },
                // 功能說明:憑證簽章
                SignCAHome: function (params) {
                    //alert('給vivi用的新JSB SignCA1\n\n')
                    _NativeJSB(arguments.callee.name, params);
                },
                // 功能說明:憑證驗章
                VerifyCA: function () {
                    //alert('給vivi用的新JSB VerifyCA\n\n')
                    _NativeJSB(arguments.callee.name);
                },
                // 功能說明:取得憑證資訊
                GetCAInfo: function () {
                    //alert('給vivi用的新JSB GetCAInfo\n\n')
                    _NativeJSB(arguments.callee.name);
                },
                // 功能說明:[2020財神選股新增] 主頁右上角放大鏡/分享, 等等按紐
                FunctionImg: function (params) {
                    //alert('給vivi用的新JSB FunctionImg=' + params)
                    _NativeJSB(arguments.callee.name, params);
                },
                // 功能說明:[2020財神選股新增] 轉傳元件
                ShareTo: function (params, params2) {
                    //alert('給vivi用的新JSB ShareTo=' + params2)
                    _NativeJSB(arguments.callee.name, params, params2);
                },
                // 功能說明:詢問使用者後回應
                UserResponse: function (params, params2) {
                    //alert('給vivi用的新JSB UserResponse=' + params2)
                    _NativeJSB(arguments.callee.name, params, params2);
                },
                // 功能說明:自動登入並進到 APP 指定的內頁
                AutoLogin: function (params, params2, params3, params4) {
                    //alert('給vivi用的新JSB AutoLogin=' + params)
                    _NativeJSB(arguments.callee.name, params, params2, params3, params4);
                },
                // 功能說明:[2021模擬平台新增] JS呼叫AP其他專區的native頁面或功能
                StartMode: function (params) {
                    //alert('給vivi用的新JSB StartMode=' + params)
                    _NativeJSB(arguments.callee.name, params);
                },
                // 功能說明:[2021模擬平台新增] 登入後的主框，下方Tab可指定亮哪一顆
                ActivateTab: function (params, params2, params3) {
                    //alert('給vivi用的新JSB ActivateTab=' + params + '|' + params2 + '|' + params3 + '|')
                    _NativeJSB(arguments.callee.name, params, params2, params3);
                },
                // 功能說明:[2021模擬平台新增] 報價帶下單
                SetQuoteToTrade: function (params, params2) {
                    //alert('給vivi用的新JSB SetQuoteToTrade11=' + params + '|' + params2 + '|')
                    _NativeJSB(arguments.callee.name, params, params2);
                },
                // 功能說明:Native版競拍功能
                OpenSCAS: function () {
                    //alert('給vivi用的新JSB openSCAS=')
                    _NativeJSB(arguments.callee.name);
                },
                // 功能說明:關閉Native的 loading 控件
                CloseLoadingSpinner: function () {
                    //alert('給vivi用的新JSB CloseLoadingSpinner=')
                    _NativeJSB(arguments.callee.name);
                },
            }; // end JSB

            onJSBReady(JSB);
        }
    } // END if (UI.isIOS)
} catch (e) {
    console.log('功能異常[UI.isWKwebview] ' + e);
}

// [Flow 4 ] 特例 = iOS 主框screenstock.aspx跟新視窗 ==> reset 右上角的FunctionImg為空
if (UI.isIOS) {
    if (self === top) {
        fnFunctionImg({ type: '' });
    }
}

// [Flow 5] jquery dom ready
$(function () {
    //為了怕APP 畫面停太久造成Session不見,10分鐘會呼叫 CheckPage.aspx 頁
    if (typeof CheckPage !== 'function' && UI.isEManager) {
        CheckPage();
        function CheckPage() {
            $.ajax({
                url: '/APP/EManager/CheckPage.aspx',
                cache: false,
                dataType: 'html',
                type: 'GET',
            })
                .done(function () {})
                .fail(function (jqXHR, textStatus, errorThrown) {
                    try {
                    } catch (e) {
                        console.log('[UI] CheckPage log:' + e, 'jqXHR=', jqXHR, ', textStatus=', textStatus, ', errorThrown=', errorThrown);
                    }
                });

            setTimeout(CheckPage, 1000 * 60 * 10); // 這裡的1000表示1秒有1000毫秒,1分鐘有60秒,10表示總共10分鐘
        }
    }

    //行動裝置模擬 hover, active---------------------------------------------------
    if (UI.isMobile) {
        $('a, .listview-item, .toggle, .button').on('touchstart', function () {
            $(this)
                .addClass('hover')
                .on('touchend', function () {
                    $(this).removeClass('hover');
                });
        });
    }

    if (UI.isIOS) {
    }

    if (UI.isAndroid) {
        //停用webkit autofill功能 -------------------------------------------------------------
        var $iframe = $('iframe');
        if ($iframe.length) {
            $iframe.on('load', function () {
                var $contents = $iframe.contents(),
                    $body = $contents.find('body');
                $body.find('input[type=text], input[type=password], input[type=number], input[type=tel]').attr('autocomplete', 'off');
            });
        }

        //避免輸入框被虛擬鍵盤擋住而無法輸入 -------------------------------------------------------------
        $('.input')
            .on('click', function () {
                var $input = $(this);
                var _topBias = $input.offset().top + $input.outerHeight(true);
                var _bias = _topBias - 150;

                $('body').css({
                    'padding-bottom': _topBias + 'px',
                });
                $('html, body').scrollTop(_bias);
            })
            .on('blur', function () {
                $('body').css({
                    'padding-bottom': 0,
                });
            });

        // 解OS7 autoComplete造成  $body.scrollTop 回到0的怪狀況
        if (UI.isAndroid7) {
            $('.input').attr('autocomplete', 'off');
        }
    } // END UI.isAndroid

    // 左上角按鈕群共用事件 ---------------------------------------------------------
    $('.nav').on('click', '.toggle', function (e) {
        e.preventDefault();
        var $this = $(this);

        // 例外處理：有連結就開連結
        if ($this.attr('href') !== '' && $this.attr('href') !== '#') {
            setTimeout(function () {
                location.href = $this.attr('href');
            }, gSPEED);
        }
    });

    // 驅動 Tabs 組件  -----------------------------------------------------------------
    var $tabs = $('.tabs');
    if ($tabs.length > 0) {
        var $firstTabItem = $tabs.children('.tabs-tab').children('.tabs-tab-item').eq(0),
            $firstTabContent = $tabs.children('.tabs-content').children('.tabs-content-item').eq(0);

        // 防呆, 以免漏把第一顆tab加上active
        if (!$firstTabItem.hasClass('active') || !$firstTabContent.hasClass('active')) {
            if (url.indexOf('tab=') === -1) {
                fnTabs($('.tabs-tab-item').eq(0));
            }
        }

        $tabs.on('click', '.tabs-tab-item', function () {
            var $this = $(this),
                idx = $this.index(),
                $tabItemSiblings = $this.siblings('.tabs-tab-item'),
                $tabContent = $this.parent('.tabs-tab').siblings('.tabs-content');

            fnTabs($this);

            // UI reset: 如果內頁中有slidePanel組件，就把slidePanel恢復為預設狀態
            if ($tabContent.find('.tabs-content-item').find('.box-slidePanel').length > 0) {
                resetSlidePanel($tabContent.find('.tabs-content-item').find('.box-slidePanel'));
            }
        });
    }

    // 驅動 橫向Menu 組件  -----------------------------------------------------------------
    var $menus = $('.menus');
    if ($menus.length > 0) {
        var urlMenuKey = 'menu';
        var menuIndex = parseInt(getQueryString(urlMenuKey));
        pageTabsInit({ menu: isNaN(menuIndex) ? 0 : menuIndex });

        window.onpopstate = function (event) {
            console.log('location: ' + document.location + ', state: ' + JSON.stringify(event.state));
        };

        $menus.on('click', '.menus-item', function (e) {
            var $this = $(this),
                idx = $this.index(),
                $toggle = $this.children('a'),
                $menuContent = $this.parents('.menus-inner').siblings('.menus-content');

            // 塞pusgState，改變網址，要保留原本掛載在網址上的參數
            var __queryString = '';
            if (typeof param !== 'undefined') {
                try {
                    for (var index in param) {
                        if (param[index] !== '' && index !== 'menu') {
                            __queryString += '&' + index + '=' + param[index];
                        }
                    }
                } catch (e) {
                    __queryString = '?' + e.message;
                }
            }

            window.history.pushState({ menu: idx }, null, pageURL + '?' + urlMenuKey + '=' + idx + __queryString);

            // 例外處理：有連結就開連結, 沒連結才要做 fnManus()
            if ($toggle.attr('href') === '' || $toggle.attr('href') === '#') {
                e.preventDefault();
                fnMenus($this);

                // UI reset: 如果內頁中有slidePanel組件，就把slidePanel恢復為預設狀態
                if ($menuContent.find('.menus-content-item').find('.box-slidePanel').length > 0) {
                    resetSlidePanel($menuContent.find('.menus-content-item').find('.box-slidePanel'));
                }
            }
        });

        // tab的內容是iframe切換src: 就戳戳一下tab
        if ($menus.find('#appContent').length) {
            setTimeout(function () {
                $menus.find('.menus-item:eq(' + menuIndex + ')').trigger('click');
            }, 100);
        }
    }

    // 驅動 Listview 列表組件-----------------------------------------------------------
    var $boxSlidePanel = $('.box-slidePanel');
    if ($boxSlidePanel.length > 0) {
        $boxSlidePanel.on('click', ' > .box-list > .listview > .listview-item', function (e) {
            //列表點擊事件

            e.preventDefault();

            // 點擊按鈕時不要觸發組件事件
            if ($(e.target).hasClass('button')) {
                return false;
            }

            var $this = $(this),
                $body = $('body'),
                $bList = $this.parent('.listview').parent('.box-list'),
                $bSlidePanel = $bList.parent('.box-slidePanel'),
                $bContent = $bList.siblings('.box-content'),
                $toggle = $('.nav-function > .toggle'),
                $toggleInit = $('.nav-function.left > .toggle:visible'),
                $toggleBack = $('<a href="#" class="toggle toggleBack"><i class="icon icon-wls-chevron-left"></i></a>'),
                fx = ['slideInLeft', 'slideInRight'],
                winHeight = $(window).height(),
                navHeight = $('.nav').height(),
                offsetTop = ~~$this.offset().top; //轉整數

            // UI: mobile hover
            $this.addClass('active').siblings('.listview-item').removeClass('active');

            // UI: 頁面拉到頁頂
            $body.scrollTop(0);

            // UI: 列表移出視圖
            $bList.removeClass(fx[0]).css('display', 'none');

            // UI: 內容區移入視圖
            $bContent.addClass(fx[1]).css({
                display: 'block',
                opacity: '1',
            });

            // UI: 處理小米機多出overflow-x的問題
            if (UI.isMI) {
                setTimeout(function () {
                    $bContent.removeClass(fx[1]);
                }, 500);
                //500 = CSS animation's duration
            }

            // UI: 關閉NAV中的回首頁按鈕
            $toggleInit.css('display', 'none');

            $toggleBack.appendTo('.nav-function.left').on('click', function (e) {
                if ($this.parent('.listview').attr('id') !== 'eventList') {
                    e.preventDefault();

                    // UI: mobile hover
                    $this.removeClass('active');

                    // UI: 列表移入視圖
                    $bList.addClass(fx[0]).css('display', 'block');

                    // UI: 內容區移出視圖
                    $bContent.removeClass(fx[1]).css('display', 'none');

                    // UI: 關閉NAV中的回上頁箭頭
                    $toggleBack.remove();

                    // UI: 打開NAV中的回首頁按鈕
                    $toggleInit.css('display', 'block');

                    // UI: 日曆打開
                    if (typeof $('.datepicker') === 'object' && $('.toggleBack').length === 0) {
                        $('.datepicker, .right .toggleDatepicker').css('display', 'block');
                    }

                    // UI: tab復原到第一個
                    if (typeof $bContent.find('.tabs') === 'object') {
                        fnTabs($bContent.find('.tabs .tabs-tab .tabs-tab-item').eq(0));
                    }
                } else {
                    // 因為google map要 reload才能抓到新的經緯度, 所以包含google map的這一支檔案要reload
                    location.href = '/APP/Corporate/event.aspx';
                }
            }); // end click()

            // 日曆關閉
            if (typeof $('.datepicker') === 'object') {
                $('.datepicker, .right .toggleDatepicker').css('display', 'none');
            }
        }); // end .box-slidePanel click()
    }

    // 驅動 資料列 組件  -----------------------------------------------------------------
    var $view = $('.datalistView, .summaryView');
    var $toggleDatalistView = $('#toggleDatalistView');
    function openDatalistView(goOpen, parentView, button) {
        if (goOpen) {
            // 詳細區塊go打開
            parentView.children('.tbody').css('display', 'flex');
            button.data('display', 1).addClass('open');
        } else {
            // 詳細區塊go關上
            parentView.children('.tbody').css('display', 'none');
            button.data('display', 0).removeClass('open');
        }
    }
    function openDatalistViewToggle(goOpen) {
        if (goOpen) {
            // go打開
            $toggleDatalistView.data('display', 0).text('');
        } else {
            // go關上
            $toggleDatalistView.data('display', 1).text('');
        }
    }
    $('.wrapper').each(function () {
        var $self = $(this);
        $self.on('click', '.datalistView .row-display, .summaryView .row-display', function () {
            var $button = $(this),
                $parentView = $button.parents('.datalistView, .summaryView'),
                _listCount = $('.datalistView .row-display, .summaryView .row-display').length,
                _listOpenCount = $('.datalistView .row-display.open, .summaryView .row-display.open').length;

            if ($button.data('display') === 0) {
                // 詳細區塊打開
                openDatalistView(true, $parentView, $button);
                if ($toggleDatalistView.length) {
                    openDatalistViewToggle(!(_listCount - _listOpenCount === 1)); // (_listCount - _listOpenCount === 1) ===> true: 只剩我沒開，其他都開了的狀態，toggle go變全關 || false: 只剩我沒開，其他有任何一個沒開的狀態，toggle變全開
                }
            } else {
                // 詳細區塊關上
                openDatalistView(false, $parentView, $button);
                if ($toggleDatalistView.length) {
                    openDatalistViewToggle(_listOpenCount === 1);
                }
            }
        });
    });

    // 全開或全關
    if ($toggleDatalistView.length) {
        $toggleDatalistView.on('click', function (e) {
            e.preventDefault();
            var $o = $(this);
            //$img = $o.children("img");

            var $buttons = $('.datalistView .row-display, .summaryView .row-display');

            if ($o.data('display') === 0 || typeof $o.data('display') === 'undefined') {
                // 詳細區塊打開
                openDatalistViewToggle(false);
                openDatalistView(true, $view, $buttons);
            } else {
                // 詳細區塊關上
                openDatalistViewToggle(true);
                openDatalistView(false, $view, $buttons);
            }
        });
    }

    // 驅動 radioGroup 組件  -----------------------------------------------------------------
    var $radioGroup = $('.radioGroup');
    if ($radioGroup.length > 0) {
        $radioGroup.each(function () {
            var $g = $(this);

            //防呆: 沒設定active就訂在第一個
            if (!$g.children('.radio').hasClass('active')) {
                fnRadioGroup($g.children('.radio').eq(0));
            }

            //radio checked時  亮active
            $g.children('.radio')
                .children('input[type=radio]')
                .each(function () {
                    var $radio = $(this);
                    if ($radio.prop('checked') === true) {
                        fnRadioGroup($radio.parent('.radio'));
                    }
                });
        });
        $radioGroup.on('click', '.radio', function () {
            var $radio = $(this);
            fnRadioGroup($radio);
        });
    }

    // 是警告文字時不要觸發組件事件 ------------------------------------------------------
    $('ul').on('click', '> .listview-item', function (e) {
        if ($(e.target).hasClass('msg')) {
            return false;
        }
    });

    // UIkit 驅動按鈕 ------------------------------------------------------
    $('.uk-button-group').on('click', '> .uk-button', function (e) {
        $(this).addClass('uk-button-primary').siblings('.uk-button').removeClass('uk-button-primary');
        if ($('.wls-button-group-container').length) {
            $('.wls-button-group-container:eq(' + $(this).index() + ')')
                .removeClass('uk-hidden')
                .siblings('.wls-button-group-container')
                .addClass('uk-hidden');
        }
    });

    // 驅動 Searchbox 組件  -----------------------------------------------------------------
    var $SearchBox = $('.SearchBox');
    if ($SearchBox.length) {
        $SearchBox.closest('article.uk-flex-column').addClass('hasSearchBox');

        // 長出搜尋按紐
        $SearchBox.before(
            '<div id="searchFunction" class="uk-flex uk-flex-top isClose">' +
                '<div id="ibfs-condition" class="uk-width-expand"></div>' +
                '<div class="uk-width-auto"><a href="#" id="searchToggle"><img src="/APP/EManager/Images/icon-Search.svg"></a></div>' +
                '</div>'
        );
        $SearchBox.prepend('<div id="searchToggleClose"  uk-icon="icon: close; ratio: 1.2"></div>');
        $('.SearchBoxList').prepend(
            '<div class="uk-flex uk-flex-middle uk-margin-small">' +
                '<div class="uk-margin-small-right uk-text-danger uk-text-bold" uk-icon="icon: search;" ></div>' +
                '<div class="SearchBoxTitle uk-text-small"></div>' +
                '</div>'
        );

        // 展開或隱藏搜尋面版
        $('.wls-main')
            .on('touchend', '#searchToggle', function (e) {
                e.preventDefault();
                var $wrapper = $(this).closest('#searchFunction');
                if ($wrapper.hasClass('isClose')) {
                    $wrapper.removeClass('isClose').addClass('isOpen');
                }
            })
            .on('touchend', '#searchToggleClose', function (e) {
                e.preventDefault();
                var $wrapper = $(this).parent('.SearchBox').prev('#searchFunction');
                if ($wrapper.hasClass('isOpen')) {
                    $wrapper.removeClass('isOpen').addClass('isClose');
                }
            });

        // 搜尋區塊中的select-長出搜尋條件
        var _conditionHTML = '條件：';
        $SearchBox.find('select').each(function (index) {
            var $sel = $(this);
            _conditionHTML += '<span>' + $sel.children('option:selected').text() + '</span>';
            $sel.on('click', function () {
                $('#ibfs-condition')
                    .find('span:eq(' + index + ')')
                    .text($sel.children('option:selected').text());
            });
        });
        $SearchBox.find('input').each(function (index) {
            var $ipt = $(this);
            switch ($ipt.attr('type')) {
                case 'hidden':
                    break;
                case 'date':
                    if ($ipt.val() !== undefined && $ipt.val() !== null && $ipt.val() !== '') {
                        if ($ipt.attr('id') === 'seaStartDate') {
                            _conditionHTML += '<span class="ibfs-condition-startDate">' + $ipt.val() + '</span>';
                        }
                        if ($ipt.attr('id') === 'seaEndDate') {
                            _conditionHTML += '<span>' + $ipt.val() + '</span>';
                        }
                    }
                    break;
                case 'radio':
                case 'checkbox':
                    if ($ipt.prop('checked')) {
                        _conditionHTML += '<span>' + $ipt.parent('div').next('div').text() + '</span>';
                    }
                    break;
                default:
                    if ($ipt.val() !== undefined) {
                        _conditionHTML += '<span>' + $ipt.val() + '</span>';
                    }
                    break;
            }
        });

        $('#ibfs-condition').html(_conditionHTML);

        // 調整內容區塊的高
        _getArticleHasSearchBoxHeight();
    } // END if

    // 驅動 Searchbox 組件-單一選單
    var $SearchBoxSingle = $('.SearchBox-single');
    if ($SearchBoxSingle.length) {
        $SearchBoxSingle.closest('article.uk-flex-column').addClass('hasSearchBox');
        _getArticleHasSearchBoxHeight();
    }

    //input type=number maxlength要能生效
    $('body').on('input', 'input[type=number]', function () {
        var $input = $(this);
        var val = $input.val();
        var max = parseInt($input.attr('maxlength'));
        if (isNaN(max)) {
            return;
        }
        if (val.length > max) {
            $input.val(val.slice(0, max));
        }
    });

    // 計算menus-inner內容的高度: 在menus版型中才要執行
    function _getArticleHasSearchBoxHeight() {
        if (typeof $('.menus-inner-placeholder') !== 'undefined') {
            $('article.uk-flex-column.hasSearchBox').css('height', $(window).height() - $('.menus-inner-placeholder').height() + 'px');
        }
    }
}); // END ready()

/**
 * 由Native呼叫 捕捉上下左右swipe手勢，可以實做在各頁面
 * (iOS待實做)
 */
top.onNativeSwipeUp = function () {
    //alert('來自WEB: native swipe up done;')
};

top.onNativeSwipeDown = function () {
    //alert('來自WEB: native swipe Down done;')
};

top.onNativeSwipeLeft = function () {
    // alert('來自WEB: native swipe Left done;')
};

top.onNativeSwipeRight = function () {
    //alert('來自WEB: native swipe Right done;')
};

/**
 * 由Native呼叫 捕捉NewWindowClose的事件
 * ([特例]安卓：只能定義在新視窗url有 /EOpenStock 的頁面中才會生效)
 */
top.onNativeCloseNewWindow = function () {
    fnCloseNewWindow();
    //alert('來自WEB onNativeCloseNewWindow')
};

/**
 * 由Native呼叫 捕捉主框的事件
 * (安卓待實做)
 */
top.onNativeMainGetNotif = function () {
    //alert("來自WEB onNativeMainGetNotif")
};

/**
 * [安卓]由Native呼叫 因為安卓webview無法執行純web的 input type=file，所以改由web呼叫native-> native取照片-> native呼叫 web's js function並傳入binary
 * (IOS不用做)
 * @param {string} params - Native取到的檔案實體路徑
 */
top.onNativeGetFile = function (params) {
    //alert('來自WEB onNativeFileUpload=' + params)
};

/**
 * 定義GetUserSetting，由Native端呼叫並傳值
 * (IOS不用做)
 * @param {object} objSetting - Native取值後，透過呼叫GetUserSetting函式把值丟給web
 * {'CaptureEnable': true}
 */
top.GetUserSetting = function (objSetting) {};

/**
 * [雙平台]由Native呼叫，在新視窗中按左上角時，Native判斷有上一頁就回上一頁，沒上一頁就調用 onNativeNewWindowBack
 * 特例：如果 onNativeNewWindowBack 有執行 alert 的話，IOS會把右上角的【關閉按紐 x 】藏起來，所以需要再次呼叫把【關閉按紐 x 】 顯示出來
 */
top.onNativeNewWindowBack = function(){
    fnCloseNewWindow();
    //alert('來自WEB onNativeNewWindowBack')
}

/**
 * 函示說明：確認JSB存在後要做的事情 = 設定目前APP的版本
 * @param {object} JSB - JSB物件，來自Android的Native，或IOS的js 定義的 JSB物件
 */
function onJSBReady(JSB) {
    try {
        if (!UI.isEManager) {
            return;
        } // 非e管家時就跳走

        JSB = JSB || top.JSB;
        checkAppVersion(JSB);
    } catch (e) {
        alert('功能異常[onJSBReady], ' + e);
    }
}

/**
 * 函示說明：透過APP版本去得知目前的版本是否支援JSB.功能()
 * @param {object} appVer - 取得的版號
 */
function checkJSB(appVer) {
    try {
        const _html = document.querySelector('html');

        JSB = JSB || top.JSB;

        // 0.新視窗:
        _html.classList.add('JSBNewWindow');
        _html.classList.add('JSBCloseNewWindow');
        UI.JSBNewWindow_Proxy = JSB.NewWindow; // [特例]把 JSB.NewWindow 暫存起來，供iOS1.1.26+ 的 WLS.NewWindow 使用

        // 0.切主框頁面
        _html.classList.add('JSBGoWebPage');
        // 0.開左選單
        _html.classList.add('JSBOpenMenu');
        // 0.ios憑證升級:
        _html.classList.add('JSBSignCA');

        // 1.看盤:
        // ios       APP version >= 1.1.17 typeof (JSB.OpenQuotation) === 'function'
        // android   APP version >= 1.87
        if ((UI.isIOS && appVer.major >= 1 && appVer.minor >= 1 && appVer.build >= 17) || (UI.isAndroid && appVer.major >= 1 && appVer.minor >= 87) || typeof JSB.OpenQuotation === 'function') {
            _html.classList.add('JSBOpenQuotation');
            UI.JSBOpenQuotation = true;
        }

        // 2.分享:
        // ios       APP version >= 1.1.22
        // android   APP version >= 1.86
        if ((UI.isIOS && appVer.major >= 1 && appVer.minor >= 1 && appVer.build >= 22) || (UI.isAndroid && appVer.major >= 1 && appVer.minor >= 86) || typeof JSB.ShareTo === 'function') {
            _html.classList.add('JSBShareTo');
            UI.JSBShareTo = true;
        }

        // 3.Native抓取APP版本:
        // ios       用typeof (JSB.GetVersion)防衛 (APP version >= 1.18適用)
        // android   用typeof (JSB.GetVersion)防衛 (APP version >= 1.91適用)
        if (typeof JSB !== 'undefined' && typeof JSB.GetVersion === 'function') {
            _html.classList.add('JSBGetVersion');
            UI.JSBGetVersion = true;
        }

        // 4.登入後導去某功能:
        // ios       APP version >= 1.18
        // android   APP version >= 1.91
        if ((UI.isIOS && appVer.major >= 1 && appVer.minor >= 1 && appVer.build >= 18) || (UI.isAndroid && appVer.major >= 1 && appVer.minor >= 91) || typeof JSB.Redirect === 'function') {
            _html.classList.add('JSBRedirect');
            UI.JSBRedirect = true;
        }

        // 5.選股功能右上角的icon:
        // ios       APP version >= 1.1.22
        // android   APP version >= 2.0
        if ((UI.isIOS && appVer.major >= 1 && appVer.minor >= 1 && appVer.build >= 22) || (UI.isAndroid && appVer.major >= 2 && appVer.minor >= 0) || typeof JSB.FunctionImg === 'function') {
            _html.classList.add('JSBScreenStock');
            UI.JSBScreenStock = true;

            _html.classList.add('JSBFunctionImg');
            UI.JSBFunctionImg = true;
        }

        // 6.傳送user的設定值給native:
        // ios       APP version >= 1.1.22
        // android   APP version >= 1.96
        if ((UI.isIOS && appVer.major >= 1 && appVer.minor >= 1 && appVer.build >= 22) || (UI.isAndroid && appVer.major >= 1 && appVer.minor >= 96) || typeof JSB.UserResponse === 'function') {
            _html.classList.add('JSBUserResponse');
            UI.JSBUserResponse = true;
        }

        // 7.自動登入並導去指定頁面:
        // ios       APP version >= 1.1.27
        // android   APP version >= 2.20
        if ((UI.isIOS && appVer.major >= 1 && appVer.minor >= 1 && appVer.build >= 27) || (UI.isAndroid && appVer.major >= 2 && appVer.minor >= 20) || typeof JSB.AutoLogin === 'function') {
            _html.classList.add('JSBAutoLogin');
            UI.JSBAutoLogin = true;
        }

        // 8.拍照的gateway傳絕對網址給native:
        // ios       APP version >= 1.1.33 (沒有1.1.32了)
        // android   APP version >= 2.21 (2.21-2.23=> 開發版, 2.24才是隱私權更新的版本=需要收絕對網址)
        if ((UI.isIOS && appVer.major >= 1 && appVer.minor >= 1 && appVer.build >= 33) || (UI.isAndroid && appVer.major >= 2 && appVer.minor >= 21)) {
            if (typeof JSB.OpenCamera === 'function') {
                _html.classList.add('JSBOpenCamera');
                UI.JSBOpenCamera = true;
            }
            if (typeof JSB.OpenPassBookCamera === 'function') {
                _html.classList.add('JSBOpenPassBookCamera');
                UI.JSBOpenPassBookCamera = true;
            }
            if (typeof JSB.OpenSelfieCamera === 'function') {
                _html.classList.add('JSBOpenSelfieCamera');
                UI.JSBOpenSelfieCamera = true;
            }
            if (typeof JSB.OpenDefaultCamera === 'function') {
                _html.classList.add('JSBOpenDefaultCamera');
                UI.JSBOpenDefaultCamera = true;
            }
        }

        // 9.不展開左選單的前提下，背景展開子項目:
        // ios       APP version >= 1.1.33 (沒有1.1.32了)
        // android   APP version >= 2.25
        if ((UI.isIOS && appVer.major >= 1 && appVer.minor >= 1 && appVer.build >= 33) || (UI.isAndroid && appVer.major >= 2 && appVer.minor >= 25) || typeof JSB.SetMenu === 'function') {
            _html.classList.add('JSBSetMenu');
            UI.JSBSetMenu = true;
        }

        // 10.不展開左選單的前提下，背景展開子項目:
        // ios       APP version >= 1.1.37 (沒有1.1.32了)
        // android   APP version >= 2.25 -->等問畢洋
        if (UI.isIOS && appVer.major >= 1 && appVer.minor >= 1 && appVer.build >= 37) {
            _html.classList.add('JSBSignCAHome');
            UI.JSBSignCAHome = true;
        }

        // 11.[2021模擬平台] 切換平台/模擬底部的Tab亮暗/報價帶下單
        // ios       APP version >= 1.1.33
        // android   APP version >= 2.3
        if ((UI.isIOS && appVer.major >= 1 && appVer.minor >= 1 && appVer.build >= 33) || (UI.isAndroid && appVer.major >= 2 && appVer.minor >= 3)) {
            if (typeof JSB.StartMode === 'function') {
                _html.classList.add('JSBStartMode');
                UI.JSBStartMode = true;
            }

            if (typeof JSB.ActivateTab === 'function') {
                // 模擬平台才會呼叫，理財不會呼叫，純列出備用
                _html.classList.add('JSBActivateTab');
                UI.JSBActivateTab = true;
            }

            if (typeof JSB.SetQuoteToTrade === 'function') {
                // 模擬平台才會呼叫，理財不會呼叫，純列出備用
                _html.classList.add('JSBSetQuoteToTrade');
                UI.JSBSetQuoteToTrade = true;
            }
        }

        // 12.[系統設定] 20220801僅供安卓使用
        // ios       無
        // android   APP version >= 2.55
        if (UI.isAndroid && appVer.major >= 2 && appVer.minor >= 55) {
            if (typeof JSB.SetUserSetting === 'function') {
                _html.classList.add('JSBSetUserSetting');
                UI.JSBSetUserSetting = true;
            }
        }

        // 13.[證件照OCR辨識] 20220912
        // ios       APP version >= 1.1.47
        // android   APP version >= 2.58
        if ((UI.isIOS && appVer.major >= 1 && appVer.minor >= 1 && appVer.build >= 47) || (UI.isAndroid && appVer.major >= 2 && appVer.minor >= 58)) {
            if (typeof JSB.OpenCameraWithOCR === 'function') {
                _html.classList.add('JSBOpenCameraWithOCR');
                UI.JSBOpenCameraWithOCR = true;
            }
        }

        // 14.[Native版競拍功能] 20241204
        // ios       APP version >= 1.1.70
        // android   APP version >= 2.80
        if((UI.isIOS && appVer.major >= 1 && appVer.minor >= 1 && appVer.build >= 70) || (UI.isAndroid && appVer.major >= 2 && appVer.minor >= 80)) {
            if (typeof JSB.OpenSCAS === 'function') {
                _html.classList.add('JSBOpenSCAS');
                UI.JSBOpenSCAS = true;
            }
        }
        // 15.[Native關閉 loading 菊花圖的功能] 20241219
        // ios       APP version >= 1.1.70
        // android   APP version >= 2.80
        if((UI.isIOS && appVer.major >= 1 && appVer.minor >= 1 && appVer.build >= 70) || (UI.isAndroid && appVer.major >= 2 && appVer.minor >= 80)) {
            if (typeof JSB.CloseLoadingSpinner === 'function') {
                _html.classList.add('JSBCloseLoadingSpinner');
                UI.JSBCloseLoadingSpinner = true;
            }
        }

        // 16.[安卓專用] false = 左右上角的關閉按鈕不要做預設的關閉行為，而是由JS透過 onNativeCloseNewWindow 或 onNativeNewWindowBack 做別的事
        // ios       無
        // android   APP version >= 2.80
        if((UI.isAndroid && appVer.major >= 2 && appVer.minor >= 80)){
            if (typeof JSB.SetRightBtnClose === 'function') {
                _html.classList.add('JSBSetRightBtnClose');
                UI.JSBSetRightBtnClose = true;
            }

            if (typeof JSB.SetLeftBtnBack === 'function') {
                _html.classList.add('JSBSetLeftBtnBack');
                UI.JSBSetLeftBtnBack = true;
            }
        }

        
    } catch (e) {
        console.log('功能異常[checkJSB] ' + e);
    }
}

/**
 * 函示說明：取得APP version，會透過這個功能定義好 UI.appVersion 物件，並回傳
 * @param {object} JSB - JSB物件
 * @returns {Object} appVersion - as {"major":1,"minor":1,"build":23}
 */
function checkAppVersion(JSB) {
    try {
        var __appVersionObj = { major: 0, minor: 0, build: 0 };

        // TYPE 1 = 有JSB.GetVersion() 就用它抓version
        if (typeof JSB.GetVersion === 'function') {
            if (UI.isIOS && UI.isWKwebview) {
                var customUserAgent = navigator.userAgent.split('||'); 
                customUserAgent = customUserAgent[1] || ''; //'eManager/Default/1.1.60'

                if(customUserAgent !== undefined && customUserAgent !== null && customUserAgent !== '') {
                   var strVersion = customUserAgent.split('/');
                   strVersion = strVersion[2] || ''; //'1.1.60'
                   __appVersionObj = __genAppVerObj(strVersion);
                }

            } else {
                __appVersionObj = __genAppVerObj(JSB.GetVersion());
            }
        } else {
            // TYPE 2 = 不然就等登入後用session抓version
            if (typeof gAppVersion !== 'undefined' && gAppVersion !== '') {
                __appVersionObj = __genAppVerObj(gAppVersion);
            }
            // TYPE 3 = 沒session也沒有JSB.GetVersion()
            else {
                __appVersionObj = __appVersionObj;
            }
        }

        function __genAppVerObj(_appversion) {
            // 抓APP版本: 用session取得，使用情境為登入後 || 透過呼叫 JSB.GetVersion()取得，使用情境為登入前後皆可
            return {
                major: parseInt(_appversion.split('.')[0] || 0), //大版號
                minor: parseInt(_appversion.split('.')[1] || 0), //中版號
                build: parseInt(_appversion.split('.')[2] || 0), //小版號
            };
        }


        UI.appVersion = __appVersionObj;
        // 讓 IOS 的 appVersionIOS 執行完畢、取得版號後，才執行 checkJSB
        checkJSB(UI.appVersion);
        
    } catch (e) {
        //alert('功能異常[checkAppVersion] ' + e)
    }
}

/**
 * 函示說明：給ios WKwebview用的，由native呼叫[不能刪]
 * @param {string} data - 由native傳進來的版號資訊
 * @returns
 */
function appVersionIOS(data) {
    // document.write('appVersionIOS  data = ' + JSON.stringify(data))
    UI = UI || {};
    UI.appVersion = {
        major: parseInt(data.split('.')[0] || 0), //大版號
        minor: parseInt(data.split('.')[1] || 0), //中版號
        build: parseInt(data.split('.')[2] || 0), //小版號
    };

    checkJSB(UI.appVersion);
}

/**
 * 函示說明：用html5的 navigator.geolocation 抓裝置的經緯度
 * @param {function} successCallback - 成功時要執行的function
 * @param {function} errorCallback - 失敗時要執行的function
 */
function html5GetGeolocation(successCallback, errorCallback) {
    if (!!window.navigator.geolocation) {
        if (UI.isAndroid) {
            navigator.geolocation.getCurrentPosition(successCallback, errorCallback, { timeout: 3000 });
        } else {
            navigator.geolocation.getCurrentPosition(successCallback, errorCallback);
        }
    } else {
        alert('無法定位，因為您的裝置不支援GPS定位功能');
    }
}

/**
 * 函示說明：規劃路徑
 * @param {string} toLatitudem - 目的地的緯度
 * @param {string} toLongitude - 目的地的經度
 */
function startGooglePath(toLatitudem, toLongitude) {
    function successCallback(position) {
        var from = position.coords.latitude + ',' + position.coords.longitude,
            to = toLatitudem + ',' + toLongitude,
            url = 'https://www.google.com.tw/maps/dir/' + from + '/' + to + '&language=zh-tw';

        if (UI.isIOS && UI.inIframe) {
            //IOS的iframe子視窗無法讀JSB，所以也沒有JSB物件
            parent.NewWindow('規劃路線', url, 'N', 'Y');
        } else {
            JSB.NewWindow('規劃路線', url, 'N', 'Y');
        }
    }

    function errorCallback(error) {
        var from = '0,0',
            to = toLatitudem + ',' + toLongitude,
            url = 'https://www.google.com.tw/maps/dir/' + from + '/' + to + '&language=zh-tw';

        var errorType = {
            0: '無法取得您的定位資訊，請直接輸入出發地址', //不明原因錯誤
            1: '您的裝置尚未授權國票法人APP存取定位資訊，請直接輸入出發地址', //使用者拒絕提供位置資訊
            2: '無法取得您的定位資訊，請直接輸入出發地址', //無法取得位置資訊
            3: '無法取得您的定位資訊，請直接輸入出發地址', //位置查詢逾時
        };

        if (UI.isEManager_iOS_IFRAME_WITHOUT_JSB) {
            JSB.NewWindow('規劃路線', url, 'N', 'Y');
            setTimeout(function () {
                JSB.Alert('', errorType[error.code]);
            }, 1);
        }
    }

    html5GetGeolocation(successCallback, errorCallback);
}

/**
 * 函示說明：研究報告點下去跳到 nativeAPP 頁面
 * @param {object} $listviewItem - 是jQuery物件, 並非string
 * @description - 是$listviewItem列表頁中的li item，必須包含這3個屬性：data('id'), data('title'), data('url')。有這3個屬性才能跟 native APP溝通
 */
function showReportPDF($listviewItem) {
    var id = $listviewItem.data('id'),
        title = $listviewItem.data('title'),
        url = $listviewItem.data('url');

    if (!!id && !!title && !!url) {
        //location.href = "jsbridge://reportdetail?researchid=" + id + "&title=" + title + "&url=" + url;
        //待實做
    }
}

/**
 * 函示說明：簡報點下去跳到 nativeAPP 頁面
 * @param {object} $listviewItem - 是jQuery物件, 並非string
 * @description - 是$listviewItem列表頁中的li item，必須包含這2個屬性：data('title'), data('url')。有這2個屬性才能跟 native APP溝通
 */
function showNewWindow($listviewItem) {
    var title = $listviewItem.data('title'),
        url = $listviewItem.data('url');
    if (!!title && !!url) {
        try {
            JSB = JSB || top.JSB;

            if (typeof JSB !== 'undefined') {
                JSB.NewWindow(title, url, 'Y', 'Y');
            } else {
                location.href = url;
            }
        } catch (e) {
            alert(UI.errMsg + '錯誤訊息: ' + e.message);
        }
    } // END if
}

/**
 * 函示說明：[投顧研究報告專用]簡報點下去跳到 nativeAPP 頁面。因e管家中，iOS11,3+11.4的投顧頁面讀不到UI.isEManager_iOS_IFRAME_WITHOUT_JSB
 * @param {object} $listviewItem - 是jQuery物件, 並非string
 * @description - 是$listviewItem列表頁中的li item，必須包含這2個屬性：data('title'), data('url')。有這2個屬性才能跟 native APP溝通
 */
function showNewWindowTEST($listviewItem) {
    var title = $listviewItem.data('title'),
        url = $listviewItem.data('url');

    if (!!title && !!url) {
        try {
            JSB.NewWindow(title, url, 'Y', 'Y');
        } catch (e) {
            alert(UI.errMsg + '錯誤訊息: ' + e.message);
        }
    } // END if
}

/**
 * 函示說明：Tabs組件
 * @param {object} $activeTabItem - 是jQuery物件, 並非string。$activeTabItem是tab組件的tab item
 */
function fnTabs($activeTabItem) {
    var idx = $activeTabItem.index(),
        $tabItemSiblings = $activeTabItem.siblings('.tabs-tab-item'),
        $tabContent = $activeTabItem.parent('.tabs-tab').siblings('.tabs-content');
    $tabItemSiblings.removeClass('active');
    $tabContent.find('.tabs-content-item').removeClass('active');
    $activeTabItem.addClass('active');
    $tabContent.find('.tabs-content-item:eq(' + idx + ')').addClass('active');
}

/**
 * 函示說明：接收來自推撥的參數來顯示要show的Tab是哪一個
 * @param {number} TabParam -頁面必須只有一組Tabs組件
 */
function showTab(TabParam) {
    var $tabsTabItems = $('.tabs-tab-item');
    if (TabParam <= $tabsTabItems.length && !$tabsTabItems.hasClass('active')) {
        fnTabs($('.tabs-tab-item:eq(' + (TabParam - 1) + ')'));
    } else {
        fnTabs($('.tabs-tab-item').eq(0));
    }
}

/**
 * 函示說明：將slidePanel 組件恢復原狀
 * @param {object} $slidePanelObj - 是jQuery物件, 並非string。是列表頁跟內容頁的共同父元素，而且是最靠近他們的第一層父元素
 */
function resetSlidePanel($slidePanelObj) {
    $slidePanelObj.find('>.box-list').css('display', 'block');
    $slidePanelObj.find('>.box-content').css('display', 'none');
}

/**
 * 函示說明：Menus組件
 * @param {object} $activeMenuItem - 是jQuery物件, 並非string。$activeMenuItem是Menus組件的Menu item
 */
function fnMenus($activeMenuItem) {
    var idx = $activeMenuItem.index(),
        $MenuContent = $activeMenuItem.parents('.menus-inner').siblings('.menus-content');

    if ($activeMenuItem) {
        // nav區: 20190717新舊主版整合: 在pageTabsInit中用_menuItemGoActive去亮暗

        // 內容區
        $MenuContent.find('.menus-content-item').removeClass('active');
        $MenuContent.find('.menus-content-item:eq(' + idx + ')').addClass('active');
    }
}

/**
 * 函示說明：打開或關閉左側選單
 * @param {boolean} - true=打開, false=關閉
 */
function fnSidebar(isOpen) {
    var $sidebar = $('.box-sidebar');
    if (isOpen) {
        $sidebar.removeClass('menubar-close').addClass('menubar-open');
    } else {
        $sidebar.removeClass('menubar-open').addClass('menubar-close');
    }
}

/**
 * 函示說明：模擬radioUI物件
 * @param {object} $activeRadioItem - 是jQuery物件, 並非string，是美化後的radio物件。$activeRadioItem是radioGroup組件的radio item
 */
function fnRadioGroup($activeRadioItem) {
    var idx = $activeRadioItem.index(),
        $radioItemSiblings = $activeRadioItem.siblings('.radio'),
        $radioWrapper = $activeRadioItem.parent('.radioGroup'),
        $contentWrapper = $radioWrapper.siblings('.radioContent'),
        $hidden = $activeRadioItem.find('#hidden_' + $activeRadioItem.children('input[type=radio]').attr('id'));

    // radio區
    $radioItemSiblings.removeClass('active');
    $activeRadioItem.addClass('active');
    // 內容區
    if ($contentWrapper.length) {
        $contentWrapper.find('.radioContent-item').removeClass('active');
        $contentWrapper.find('.radioContent-item:eq(' + idx + ')').addClass('active');
    }

    // input hidden區
    $radioItemSiblings.find('input[id*=hidden_]').val('');
    $hidden.val(true);
}

/**
 * 函示說明：calling JSB
 * @param {string} phone - 電話號碼
 */
function Tel(phone) {
    try {
        if (UI.isIOS && UI.inIframe) {
            //IOS的iframe子視窗無法讀JSB，所以也沒有JSB物件
            parent.Tel(phone);
        } else {
            JSB.Tel(phone);
        }
    } catch (e) {
        alert(UI.errMsg + '錯誤訊息: ' + e.message);
    }
}

/**
 * 函示說明：驅動icheck
 * @param {object} $input = 是jQuery物件, 並非string，要被icheck的input
 */
function fniCheck($input) {
    //避免iCheck跟 wls radioGroup 衝到
    var $inputElem;

    if ($('.radio input[type=radio]').length) {
        //如果頁面有 wls radioGroup 組件時 iCheck不要套到.radio裡頭的input裡面
        $inputElem = $input || $('.radio input[type=radio]').parent('.radio').parent('.radioGroup').siblings('.radioContent').find('input');
    } else {
        $inputElem = $input || $('input');
    }

    $inputElem.iCheck({
        checkboxClass: 'icheckbox_square-red',
        radioClass: 'iradio_square-red',
        increaseArea: '20%', // optional
    });
}

/**
 * 函示說明：取得當前瀏覽器APP之bundle id
 */
function getBrowser() {
    var rtn = 'com.apple.mobilesafari';
    var userAgent = navigator.userAgent;
    if (userAgent.toLowerCase().indexOf('fxios') > -1) {
        rtn = 'org.mozilla.ios.Firefox';
    } else if (userAgent.toLowerCase().indexOf('crios') > -1) {
        rtn = 'com.google.chrome.ios';
    } else if (userAgent.toLowerCase().indexOf('line') > -1) {
        rtn = 'jp.naver.line';
    }
    return rtn;
}

/** 
 * 函示說明：開啟其他APP，或理財的 Deeplink 功能
 * @param {string} app - 各APP的簡稱, 預設為 eManager
 * @param {string|object} query - 要傳入APP的參數，原本接字串，開發 Deeplink 後可接 Object
 * 
 * 要確認以下網址，都能正常執行。
 * 確認的平台與系統包括：在PC/IOS(APP內+純web)/安卓(APP內+純web)
 
    1.理財 APP
    https://www.ibfs.com.tw/APP/launchApp.aspx
    https://www.ibfs.com.tw/APP/launchApp.aspx?app=emanager
    (短網址) https://www.ibfs.com.tw/S/E

    2.理財，點網址後開APP並把畫面切到特定功能(如同意書列表)
    https://www.ibfs.com.tw/APP/launchApp.aspx?App=emanager&LoginUrl=%2FAPP%2FEManager%2FAgreementnew.aspx&LoginTarget=main&LoginTitle=%E7%B7%9A%E4%B8%8A%E7%B0%BD%E7%BD%B2%E5%90%8C%E6%84%8F%E6%9B%B8
    (短網址) https://www.ibfs.com.tw/S/Ag

    3.任我贏 APP
    https://www.ibfs.com.tw/APP/launchApp.aspx?app=ismart
    (短網址) https://www.ibfs.com.tw/S/iSmart

    4.台網TWID  APP
    https://www.ibfs.com.tw/APP/launchApp.aspx?App=twid
    (短網址) https://www.ibfs.com.tw/S/TWID

    5.台網TWID-競拍
    https://www.ibfs.com.tw/APP/launchApp.aspx?App=twid&param=scas
    (短網址) https://www.ibfs.com.tw/S/競拍

    6.台網TWID-憑證
    https://www.ibfs.com.tw/APP/launchApp.aspx?App=twid&param=ca
    (短網址) https://www.ibfs.com.tw/S/TWID_CA

    7.國票超業 APP
    https://www.ibfs.com.tw/APP/launchApp.aspx?app=ya
    (短網址) https://www.ibfs.com.tw/S/TWID

    8.開LINE APP並導去 國票官方帳號
    https://www.ibfs.com.tw/APP/launchApp.aspx?app=line
    (短網址) https://www.ibfs.com.tw/S/TWID

    9.「開Facebook APP」 或開「Facebook網頁」中的國票紅財神粉絲團頁面都行
    https://www.ibfs.com.tw/APP/launchApp.aspx?app=fb
    (短網址) https://www.ibfs.com.tw/S/FB

 */
function fnOpenOtherAPP(app = 'emanager', query = {}) {
    try {
        const enumApp = {
            // 國票任我贏
            ismart: {
                android: {
                    // 因chrome版本有些不支援intent://，所以改用market://
                    market: 'market://launch?id=com.ibfs.ismart',
                    intent: 'intent://#Intent;scheme=wlsismart;package=com.ibfs.ismart;end',
                    scheme: 'wlsismart://',
                },
                ios: {
                    weburl: 'https://apps.apple.com/tw/app/%E5%9C%8B%E7%A5%A8%E4%BB%BB%E6%88%91%E8%B4%8F/id1663109947',
                    scheme: 'wlsismart://',
                },
                pc: {
                    weburl: '/',
                },
            },

            // 理財e管家APP
            emanager: {
                android: {
                    // 因chrome版本有些不支援intent://，所以改用market://
                    market: 'market://launch?id=tw.com.wls.eManager',
                    intent: 'intent://#Intent;scheme=wlsemanager;package=tw.com.wls.eManager;end',
                    scheme: 'wlsemanager://',
                },
                ios: {
                    weburl: 'https://itunes.apple.com/tw/app/%E7%90%86%E8%B2%A1e%E7%AE%A1%E5%AE%B6-%E5%9C%8B%E7%A5%A8%E8%AD%89%E5%88%B8/id1156779323?mt=8',
                    scheme: 'wlsemanager://',
                },
                pc: {
                    weburl: '/eManager-m/default.aspx',
                },
            },

            // 國票超業
            ya: {
                android: {
                    // 因chrome版本有些不支援intent://，所以改用market://
                    market: 'market://launch?id=com.mitake.wls',
                    intent: 'intent://#Intent;scheme=wls;package=com.mitake.wls;end',
                },
                ios: {
                    weburl: 'https://itunes.apple.com/tw/app/%E5%9C%8B%E7%A5%A8%E8%AD%89%E5%88%B8-%E5%9C%8B%E7%A5%A8%E8%B6%85ya/id976117049?mt=8',
                    scheme: 'touchstockwls://',
                },
                pc: {
                    weburl: '/YA-m/default.aspx',
                },
            },
            
            // 國票超好贏 (前一代是國票掌中期x3mobile )
            x4: {
                android: {
                    intent: 'intent://#Intent;scheme=ibff;package=com.ibff.x4;end',
                },
                ios: {
                    weburl: ' https://apps.apple.com/us/app/%E5%9C%8B%E7%A5%A8%E8%B6%85%E5%A5%BD%E8%B4%8F/id6654896529',
                    scheme: 'itms-apps://apps.apple.com/tw/app/id6654896529?mt=8',
                },
                pc: {
                    weburl: ' https://apps.apple.com/us/app/%E5%9C%8B%E7%A5%A8%E8%B6%85%E5%A5%BD%E8%B4%8F/id6654896529',
                },
            },

            // 國票掌中期 (202412轉址到國票超好贏)
            get x3mobile() {
                return this.x4;
            },

            // 國票紅財神粉絲團
            fb: {
                android: {
                    intent: 'intent://page/400554833326048#Intent;scheme=fb;package=com.facebook.katana;end',
                },
                ios: {
                    weburl: 'https://facebook.com/400554833326048',
                    scheme: 'fb://page?id=400554833326048',
                },
                pc: {
                    weburl: 'https://facebook.com/400554833326048',
                },
            },

            // LINE@ 國票證券官方帳號
            line: {
                android: {
                    intent: 'https://line.me/R/ti/p/%40nud7118f',
                },
                ios: {
                    weburl: 'https://itunes.apple.com/tw/app/line/id443904275',
                    scheme: 'https://line.me/R/ti/p/%40nud7118f',
                },
                pc: {
                    weburl: 'https://line.me/R/ti/p/%40nud7118f',
                },
            },

            // 台網 TWID APP
            twid: {
                android: {
                    intent: 'intent://#Intent;scheme=' + 'com.twca.twid.android.prod' + ';package=' + 'com.twca.twid.android.prod' + ';end',
                    bundleId: 'com.twca.twid.android.prod',
                },
                ios: {
                    weburl: 'https://itunes.apple.com/tw/app/twid/id971043141?mt=8',
                    scheme: 'com.twca.twid.ios.prod://',
                },
                pc: {
                    weburl: 'https://itunes.apple.com/tw/app/twid/id971043141?mt=8',
                },
                module: {
                    SCAS_URL: 'https://scas.twse.com.tw/SCAS/Account/Login',
                    SCAS_WEB_SN: '81', //競拍正式
                    //SCAS_WEB_SN: "141", //競拍測試
                    CA_URL: 'https://play.google.com/store/apps/details?id=com.twca.twid.android.prod&hl=zh_TW',
                    CA_WEB_SN: '181', //憑證正式
                    //CA_WEB_SN: "142" //憑證測試
                },
            },
        };

        const isEManager = typeof JSB === 'object';
        app = app.toLowerCase();
        const oAPP = enumApp[app];

        if (app === 'corp') {
            alert('法人業務APP已下架，謝謝您多年來的支持');
            return;
        }

        if (UI.isPC) {
            var _pc_twid_url;
            switch (app) {
                case 'twid':
                    switch (query) {
                        case 'scas': //到競拍頁面
                            _pc_twid_url = oAPP.module.SCAS_URL;
                            break;
                        case 'ca': //到憑證頁面
                            _pc_twid_url = oAPP.module.CA_URL;
                            break;
                        default:
                            _pc_twid_url = oAPP.pc.weburl;
                            break;
                    }
                    break;
                default:
                    _pc_twid_url = oAPP.pc.weburl;
                    break;
            } // END switch
            location.href = _pc_twid_url;
        } else if (UI.isIOS) {
            switch (app) {
                case 'twid':
                    var _ios_twid_url_i;
                    switch (query.param) {
                        case 'scas': //到競拍頁面
                            _ios_twid_url_i = oAPP.ios.scheme + 'webview?websn=' + oAPP.module.SCAS_WEB_SN;
                            break;
                        case 'ca': //到申請憑證頁面
                            _ios_twid_url_i = oAPP.ios.scheme + 'webview?websn=' + oAPP.module.CA_WEB_SN;
                            break;
                        default:
                            _ios_twid_url_i = oAPP.ios.scheme;
                            break;
                    }
                    // 大於等於iOS9 -->可用 universallink
                    if (UI.isIOSGt9) {
                        // 20220217 IOS15無法自動打開twid APP
                        var _iosurl = 'https://twid.twca.com.tw/universallink/download_twid_ios_app_prod.html' + '?' + _ios_twid_url_i + '.....' + getBrowser();

                        if (isEManager) {
                            JSB.OpenOtherAPP(oAPP.ios.scheme, _iosurl);
                        } else {
                            location.href = _iosurl;
                        }

                        // 202111124 IOS15開不了：
                        //location.href = "https://twid.twca.com.tw/universallink/download_twid_ios_app_prod.html" + "?" + _ios_twid_url_i + "....." + getBrowser();
                    } else {
                        location.href = _ios_twid_url_i;
                        setTimeout(function () {
                            location.href = oAPP.ios.weburl;
                        }, 500);
                    }
                    break;

                case 'line':
                    if (isEManager) {
                        JSB.OpenOtherAPP(oAPP.ios.scheme, oAPP.ios.weburl);
                    } else {
                        location.href = oAPP.pc.weburl;
                    }
                    break;

                case 'fb':
                    if (isEManager) {
                        JSB.Alert('提醒', '請確認是否安裝了Facebook APP');
                        JSB.OpenOtherAPP(oAPP.ios.scheme, oAPP.ios.scheme);
                    } else {
                        location.href = oAPP.ios.weburl;
                    }
                    break;

                case 'ya':
                    if (isEManager) {
                        JSB.OpenOtherAPP(oAPP.ios.scheme, oAPP.ios.weburl);
                    } else {
                        location.href = oAPP.ios.scheme;
                        setTimeout(function () {
                            if (confirm('是否要安裝或開啟國票超業APP')) {
                                location.href = oAPP.ios.weburl;
                            }
                        }, 1000);
                    }
                    break;

                case 'ismart':
                    try {
                        // 組出被encode的queryString
                        let strDeeplink = getEManagerFormattedQueryString(query);

                        // 沒有加任何參數
                        if (strDeeplink === '') {
                            strDeeplink = `${oAPP.ios.scheme}`;
                        } else {
                            strDeeplink = `${oAPP.ios.scheme}action/Login?${strDeeplink}`;
                        }

                        location.href = strDeeplink;

                        setTimeout(() => {
                            if (confirm(`是否要安裝或開啟理財e管家APP`)) {
                                location.href = oAPP.ios.weburl;
                            }
                        }, 1500);
                    } catch (error) {
                        console.log(`[UI]執行失敗\n\n${error}`);
                        location.href = oAPP.ios.scheme;
                        setTimeout(() => {
                            if (confirm(`是否要安裝或開啟國票任我贏APP`)) {
                                location.href = oAPP.ios.weburl;
                            }
                        }, 1000);
                    }
                    break;

                case 'emanager':
                    try {
                        // 組出被encode的queryString
                        let strDeeplink = getEManagerFormattedQueryString(query);

                        // 沒有加任何參數
                        if (strDeeplink === '') {
                            strDeeplink = `${oAPP.ios.scheme}`;
                        } else {
                            strDeeplink = `${oAPP.ios.scheme}action/Login?${strDeeplink}`;
                        }

                        // 寫入剪貼簿供理財IOS讀取: v1.1.67以下才需要剪貼簿，新版本不用
                        location.href = strDeeplink;

                        setTimeout(() => {
                            if (confirm(`是否要安裝或開啟理財e管家APP`)) {
                                location.href = oAPP.ios.weburl;
                            }
                        }, 1000);

                       
                    } catch (error) {
                        console.log(`[UI]執行失敗\n\n${error}`);
                        location.href = oAPP.ios.scheme;
                        setTimeout(() => {
                            if (confirm(`是否要安裝或開啟理財e管家APP`)) {
                                location.href = oAPP.ios.weburl;
                            }
                        }, 1000);
                    }
                    break;

                default:
                    if (isEManager) {
                        JSB.OpenOtherAPP(oAPP.ios.scheme, oAPP.ios.weburl);
                    } else {
                        location.href = oAPP.ios.scheme;
                        setTimeout(() => {
                            if (confirm('是否要安裝或開啟APP')) {
                                location.href = oAPP.ios.weburl;
                            }
                        }, 1000);
                    }
                    break;
            } // END switch
        } else if (UI.isAndroid) {
            switch (app) {
                case 'twid':
                    var _android_twid_url_i;
                    switch (query.param) {
                        case 'scas': //到競拍頁面
                            _android_twid_url_i = 'webview?websn=' + oAPP.module.SCAS_WEB_SN;
                            break;
                        case 'ca': //到申請憑證頁面
                            _android_twid_url_i = 'webview?websn=' + oAPP.module.CA_WEB_SN;
                            break;
                        default:
                            _android_twid_url_i = '';
                            break;
                    }
                    var _android_twid_url = 'intent://' + _android_twid_url_i + '#Intent;scheme=' + oAPP.android.bundleId + ';package=' + oAPP.android.bundleId + ';end';
                    if (isEManager) {
                        JSB.OpenOtherAPP(_android_twid_url, ' ');
                    } else {
                        location.href = _android_twid_url;
                    }
                    break;

                case 'line':
                    location.href = oAPP.android.intent;
                    break;

                case 'fb':
                    if (isEManager) {
                        JSB.Alert('提醒', '請確認是否安裝了Facebook APP');
                        JSB.OpenOtherAPP(oAPP.android.intent, ' ');
                    } else {
                        location.href = oAPP.pc.weburl;
                    }
                    break;

                case 'ya':
                    if (isEManager) {
                        JSB.OpenOtherAPP(oAPP.android.intent, ' ');
                    } else {
                        location.href = oAPP.android.intent;
                        var jsOpenApp = document.querySelector(('#jsOpenAPP'));

                        if(!jsOpenApp) return;

                        // 國票超業APP
                        jsOpenApp.textContent = '點我安裝或開啟國票超業APP';
                        jsOpenApp.classList.add('active');
                        jsOpenApp.addEventListener('click', function () {
                            location.href = oAPP.android.market;
                            JSB.OpenOtherAPP(oAPP.android.intent, ' ');
                        });
                    }
                    break;

                // 20211115因期貨給網址而非 intent，所以只能先開google play再由user手動點開App
                case 'x3mobile':
                    location.href = oAPP.android.intent;
                    break;

                case 'ismart':
                    try {
                        // 組出被encode的queryString
                        let strDeeplink = getEManagerFormattedQueryString(query);

                        // 沒有加任何參數
                        if (strDeeplink === ``) {
                            strDeeplink = `${oAPP.android.scheme}action/Login`;
                        } else {
                            strDeeplink = `${oAPP.android.scheme}action/Login?${strDeeplink}`;
                        }

                        location.href = strDeeplink;
                        var jsOpenApp = document.querySelector(('#jsOpenAPP'));

                        if(!jsOpenApp) return;

                        jsOpenApp.textContent = '點我安裝或開啟國票任我贏APP';
                        jsOpenApp.classList.add('active');
                        jsOpenApp.addEventListener('click', function () {
                            location.href = oAPP.android.market;
                            location.href = strDeeplink;
                        });
                    } catch (error) {
                        console.log(`[UI]執行失敗\n\n${error}`);
                        location.href = oAPP.android.intent;
                    }
                    break;

                case 'emanager':
                    try {
                        // 組出被encode的queryString
                        let strDeeplink = getEManagerFormattedQueryString(query);
                        // 沒有加任何參數
                        if (strDeeplink === ``) {
                            strDeeplink = `${oAPP.android.scheme}action/Login`;
                        } else {
                            strDeeplink = `${oAPP.android.scheme}action/Login?${strDeeplink}`;
                        }
                        location.href = strDeeplink;

                        var jsOpenApp = document.querySelector(('#jsOpenAPP'));

                        if(!jsOpenApp) return;

                        jsOpenApp.textContent = '點我安裝或開啟理財e管家APP';
                        jsOpenApp.classList.add('active');
                        jsOpenApp.addEventListener('click', function () {
                            location.href = oAPP.android.market;
                            location.href = strDeeplink;
                        });
                    } catch (error) {
                        console.log(`[UI]執行失敗\n\n${error}`);
                        location.href = oAPP.android.intent;
                    }
                    break;

                default:
                    if (isEManager) {
                        JSB.OpenOtherAPP(oAPP.android.intent, ' ');
                    } else {
                        location.href = oAPP.android.intent;
                    }
                    break;
            } // END switch
        }

        /**
         * 將網址參數整理成標準格式再傳遞給Native：只接收合法的Key、Value要被encodeURI
         * @param {object} query - 網址的query
         * @param {string} query.UnLoginTitle - 未登入時新視窗的頁面標題
         * @param {string} query.UnLoginUrl   - 未登入時新視窗的webview的網址
         * @param {string} query.LoginTitle   - 登入後頁面標題
         * @param {string} query.LoginUrl     - 登入後webview的網址
         * @param {string} query.LoginTarget  - 登入後要開在主框 main 還是新視窗sub
         *
         * 以下是Deeplink v1的參數，要兼容所以保留
         * @param {string} query.Target - 登入後要開在主框 main 還是新視窗sub
         * @param {string} query.Title  - 頁面標題
         * @param {string} query.Url    - webview的網址
         */
        function getEManagerFormattedQueryString(query = {}) {
            const queryKeysToFormat = {
                unlogintitle: 'UnLoginTitle',
                unloginurl: 'UnLoginUrl',
                logintitle: 'LoginTitle',
                loginurl: 'LoginUrl',
                logintarget: 'LoginTarget',
                target: 'Target',
                title: 'Title',
                url: 'Url',
            };

            const queryStringParts = [];

            for (let key in query) {
                // app, App是給web用的，不用傳遞給Native
                if (key.toLowerCase() === 'app') {
                    continue;
                }

                const formattedKey = queryKeysToFormat[key.toLowerCase()];
                if (formattedKey) {
                    const value = query[key];
                    queryStringParts.push(`${formattedKey}=${encodeURIComponent(value !== undefined && value !== null ? value : '')}`);
                }
            }

            const queryString = queryStringParts.join('&');
            return queryString;
        }
    } catch (e) {
        console.log(e);
        alert(UI.errMsg + '錯誤訊息:' + e.message);
    }
}

/**
 * 函示說明：在E管家裡開Line轉傳
 * @usage fnLineIt('歡迎來到理財e管家\n\n今天運勢大吉')
 * @param {string} dataurl - 要轉傳到line的字串是啥
 */
function fnLineIt(dataurl) {
    try {
        var url = '';
        if (UI.isIOS) {
            url = 'https://line.me/R/msg/text?' + dataurl;
        } else {
            url = ''; //JSB.Share2('要轉傳到哪個APP', '要轉傳的文字')
        }
        top.location.href = url;
    } catch (e) {
        alert('功能異常[fnLineIt] ' + e.message);
    }
}

/**
 * 函示說明：在E管家裡開原生的轉傳功能
 * @usage fnShareTo('', '歡迎來到理財e管家\n\n今天運勢大吉')
 * @param {string} dataapp - 要轉傳到哪個APP，空值等於開啟native的轉傳功能
 * @param {string} dataurl - 要轉傳到其他APP的字串是啥
 */
function fnShareTo(dataapp, dataurl) {
    try {
        JSB = JSB || top.JSB;

        dataapp = dataapp || '';
        dataurl = dataurl || '國票綜合證券';

        if (typeof JSB.ShareTo === 'function') {
            JSB.ShareTo(dataapp, dataurl);
        } else {
            if (typeof JSB !== 'undefined') {
                JSB.Alert('提醒', UI.updateMsg + ' [fnShareTo JSB]');
            } else {
                alert('提醒\n' + UI.updateMsg + ' [fnShareTo]');
            }
        }
    } catch (e) {
        fnLineIt(dataurl); //用line分享
        //alert('提醒\n' + UI.updateMsg + '\n' + e.message + '[fnShareTo ERROR]')
    }
}

/**
 * 函示說明：在E管家裡開呼叫電話APP
 * @usage fnTel('+88625851528')
 * @param {string} phonoNo - 電話號碼
 */
function fnTel(phonoNo) {
    phonoNo = phonoNo || '';
    try {
        JSB = JSB || top.JSB;

        if (typeof JSB.Tel === 'function') {
            JSB.Tel(phonoNo);
        } else {
            if (typeof JSB !== 'undefined') {
                JSB.Alert('提醒', UI.updateMsg + '[fnTel JSB]');
            } else {
                alert('提醒\n' + UI.updateMsg + '\n' + e.message + '[fnTel]');
            }
        }
    } catch (e) {
        location.href = 'tel://' + phonoNo;
        console.log('提醒\n' + UI.updateMsg + '\n' + e.message + '[fnTel ERROR]');
    }
}

/**
 * 函示說明：在E管家裡開新視窗，第四個參數可以輸入 YNR控制新視窗進入的動畫效果
 * @usage fnNewWindow('開戶', '/', 'N', 'R')
 * @param {string} title - 標題
 * @param {string} url - 網址
 * @param {string} scaling - 可否縮放: Y=可以(Deprecated), N=不行
 * @param {string} animation - 動畫出現方向： Y=下往上 / N='' / R=右往左。•
 *  預設是Y。
    Y:安卓特殊用法=用google服務直接開啟，像研究報告
    N: 安卓特殊用法=檔案下載到手機，像開戶文件(有個資的pdf不能用google api開啟，所以要下載回裝置再開)
    R: 新視窗動畫效果由右邊到左出現，否則一律使用預設值由下往上
 */
function fnNewWindow(title, url, scaling, animation) {

    title = title || (UI.isSimulation ? '模擬交易專區' : '理財e管家');
    url = url || '';
    scaling = scaling || 'Y';
    animation = animation || 'Y';

    try {
        JSB = JSB || top.JSB;

        if (typeof JSB.NewWindow === 'function') {
            if (typeof JSB !== 'undefined') {
                JSB.NewWindow(title, url, scaling, animation);
            } else {
                location.href = url;
            }
        } else {
            if (typeof JSB !== 'undefined') {
                JSB.Alert('提醒', UI.updateMsg + '[fnNewWindow JSB]');
            } else {
                location.href = url;
            }
        }
    } catch (e) {
        location.href = url;
        //alert('提醒\n' + UI.updateMsg + '\n' + e.message + '[fnNewWindow ERROR]')
    }
}

/**
 * 函示說明：在E管家裡開新視窗，關閉新視窗
 * @param 無
 */
function fnCloseNewWindow() {
    try {
        JSB = JSB || top.JSB;

        if (typeof JSB.CloseNewWindow === 'function') {
            if (typeof JSB !== 'undefined') {
                JSB.CloseNewWindow();
            }
        } else {
            if (typeof JSB !== 'undefined') {
                JSB.Alert('提醒', UI.updateMsg + '[fnCloseNewWindow JSB]');
            } else {
                alert('提醒\n' + UI.updateMsg + '\n' + e.message + '[fnCloseNewWindow]');
            }
        }
    } catch (e) {
        alert('提醒\n' + UI.updateMsg + '\n' + e.message + '[fnCloseNewWindow ERROR]');
    }
}

/**
 * 函示說明：讀憑證、壓簽
 * @usage fnSignCA("EOpenS_!!_CA");
 * @usage fnSignCA("EOpenS_!!_CA", IDNO, keyset);
 *
 * @param {string} Rawdata - 要送給Native壓簽的明文
 * @param {string} IDNO - [選填]取特定IDNO的憑證
 * @param {string} keyset - [選填]IDNO解密方式
 * @returns {string} JSB.SignCA(Rawdata) - native(安卓) 傳來的憑證結果
 * @returns {string} JSB.SignCA(Rawdata, IDNO, keyset) - native(安卓) 傳來的憑證結果
 */
function fnSignCA(Rawdata, IDNO, keyset) {
    //try {

    JSB = JSB || top.JSB;

    Rawdata = Rawdata || '';
    IDNO = IDNO || '';
    keyset = keyset || '';

    // 測試環境的例外狀況: 用桌機模擬e管家
    if (JSB === undefined) {
        alert('貼心提醒\n您所使用的功能必須在理財e管家APP才能執行[fnSignCA JSB]。');
        return;
    }

    if (typeof JSB.SignCA === 'function') {
        if (UI.isIOS && UI.isWKwebview) {
            if (IDNO === '' || keyset === '') {
                JSB.SignCA(Rawdata);
            } else {
                JSB.SignCA(Rawdata, IDNO, keyset);
            }
        }

        //安卓跟ios UIwebview保持不變
        else {
            var _caData = '';

            if (IDNO === '' || keyset === '') {
                _caData = JSB.SignCA(Rawdata);
            } else {
                _caData = JSB.SignCA(Rawdata, IDNO, keyset);
            }

            if (typeof top.SignCA_CallBack === 'function') {
                top.SignCA_CallBack(_caData);
            }
            //alert('[UI.js CA from JSB.SignCA]\n\n' + _caData)
            return _caData;
        }
    } else {
        if (typeof JSB !== 'undefined') {
            JSB.Alert('提醒', UI.updateMsg + '[fnSignCA JSB]');
        } else {
            alert('提醒\n' + UI.updateMsg + '[fnSignCA]');
        }
    }
    //} catch (e) {
    //    alert('提醒\n' + UI.updateMsg + '\n' + e.message + '[fnSignCA ERROR]');
    //}
}

/**
 * 函示說明：iOS憑證呼叫方式更新
 * @usage fnSignCAHome("EOpenS_!!_CA");
 * @param {string} config - 憑證呼叫方式
 * @returns {String} JSB.SignCA(config) - native(安卓跟ios UIwebview) 傳來的憑證結果
 */
function fnSignCAHome(config) {
    try {
        JSB = JSB || top.JSB;

        // 測試環境的例外狀況: 用桌機模擬e管家
        if (JSB === undefined) {
            return;
        }

        // IOS
        if (UI.isIOS) {
            if (UI.JSBSignCAHome) {
                //alert("JSBSignCAHome")
                // 有JSB.SignCAHome功能時-IOS-由native端呼叫SignCA_CallBackHome，所以web端不用呼叫了
                if (UI.isWKwebview) {
                    JSB.SignCAHome(config);
                }
            } else {
                //alert('old IOS version')
                //版本小於1.1.37
                fnSignCA(config);
            }
        }

        // 安卓
        // 有JSB.SignCAHome功能時-Android-要由web端呼叫callback，因為Native端沒有呼叫
        if (UI.isAndroid && typeof JSB.SignCAHome === 'function') {
            var _caData = JSB.SignCAHome(config);
            if (typeof SignCA_CallBackHome === 'function') {
                SignCA_CallBackHome(_caData);
            }
            return _caData;
        }
    } catch (e) {
        alert('提醒\n' + UI.updateMsg + '\n' + e.message + '[fnSignCAHome ERROR]');
    }
}

/**
 * 函示說明：ios訂閱中心=憑證呼叫方式更新
 * @usage fnSignCAOrder("6", "2")
 * @param {string} config  - 憑證呼叫方式
 * @param {string} modOrder - 記修改的順序
 */
function fnSignCAOrder(config, modOrder) {
    try {
        JSB = JSB || top.JSB;

        if (typeof JSB.SignCAOrder === 'function') {
            if (UI.isIOS && UI.isWKwebview) {
                JSB.SignCAOrder(config, modOrder);
            }
        } else {
            if (typeof JSB !== 'undefined') {
                JSB.Alert('提醒', UI.updateMsg + '[fnSignCAOrder JSB]');
            } else {
                alert('提醒\n' + UI.updateMsg + '[fnSignCAOrder]');
            }
        }
    } catch (e) {
        alert('提醒\n' + UI.updateMsg + '\n' + e.message + '[fnSignCAOrder ERROR]');
    }
}

/**
 * 函示說明：在E管家裡開看盤JSB
 * @param 無
 */
function fnOpenQuotation() {
    try {
        JSB = JSB || top.JSB;

        if (typeof JSB.OpenQuotation === 'function') {
            JSB.OpenQuotation();
        } else {
            if (typeof JSB !== 'undefined') {
                JSB.Alert('提醒', UI.updateMsg + '[fnOpenQuotation JSB]');
            } else {
                alert('提醒\n' + UI.updateMsg + '[fnOpenQuotation]');
            }
        }
    } catch (e) {
        // 特例：安卓連線主機失敗會從 native 拋出 err 給js
        if (UI.isAndroid && e.message.toLowerCase().indexOf('java exception') > -1) {
            return;
        }

        alert('提醒\n' + UI.updateMsg + '\n' + e.message + '[fnOpenQuotation ERROR]');
    }
}

/**
 * 函示說明：JS呼叫APP其他專區的native頁面或功能
 * @usage fnStartMode("Simulation")
 * @param {string} projectName - 專區的名稱
 */
function fnStartMode(projectName) {
    try {
        JSB = JSB || top.JSB;
        projectName = projectName || '';

        if (typeof JSB.StartMode === 'function') {
            JSB.StartMode(projectName);
        } else {
            if (typeof JSB !== 'undefined') {
                JSB.Alert('提醒', UI.updateMsg + '[fnStartMode JSB]');
            } else {
                alert('提醒\n' + UI.updateMsg + '[fnStartMode]');
            }
        }
    } catch (e) {
        alert('提醒\n' + UI.updateMsg + '\n' + e.message + '[fnStartMode ERROR]');
    }
}

/**
 * 函示說明：JS呼叫AP其他專區的native頁面或功能
 * @usage fnAutoLogin('A123456789','000','xxx.aspx', '分戶帳開戶')
 * @param {string} IDNO - 登入的身份證字號
 * @param {string} Pssaowrd - 登入密碼
 * @param {string} GotoUrl - 登入後主框要自動導去哪一頁
 * @param {string} pageTitle - 主框上方的桃紅底標題要顯示的文字
 //* @param {function} hookobj.onBeforeJSB - 做JSB.AutoLogin前要做的事情
 //* @param {function} hookobj.onAfterJSB - 做JSB.AutoLogin後要做的事情
 //* @param {function} hookobj.onNotSupport - 沒有JSB.AutoLogin時要做的事情
 */
function fnAutoLogin(IDNO, Pssaowrd, GotoUrl, pageTitle, hookobj) {
    try {
        JSB = JSB || top.JSB;
        IDNO = IDNO || '';
        Pssaowrd = Pssaowrd || '';
        GotoUrl = GotoUrl || '';
        pageTitle = pageTitle || '';
        //hookobj = hookobj || {};
        //hookobj.onBeforeJSB = hookobj.onBeforeJSB || function () { };
        //hookobj.onAfterJSB = hookobj.onAfterJSB || function () { };
        //hookobj.onNotSupport = hookobj.onNotSupport || function () { };

        if (UI.JSBAutoLogin) {
            if (typeof JSB.AutoLogin === 'function') {
                //hookobj.onBeforeJSB();
                JSB.AutoLogin(IDNO, Pssaowrd, GotoUrl, pageTitle);
                //hookobj.onAfterJSB();
            }
        } else {
            // 沒JSB時要執行的事情
            // hookobj.onNotSupport();
        }
    } catch (e) {
        alert('提醒\n' + UI.updateMsg + '\n' + e.message + '[fnAutoLogin ERROR]');
    }
}

/**
 * 函示說明：登出
 * @usage fnLogout()
 */
function fnLogout() {
    try {
        JSB = JSB || top.JSB;

        if(typeof JSB === 'undefined') {
            window.location.href = '/Member/Logout.aspx';
            return;
        }

        if (typeof JSB.Logout === 'function') {
            JSB.Logout();
        } else {
            // 2021/7/9解ios登出session問題，用網頁再次呼叫登出API，僅IOS使用。安卓Native呼叫Louout_Proc.ashx沒問題
            $.ajax({
                url: '/APP/EManager/Logout_Proc.ashx',
            });
        }
    } catch (e) {
        alert('提醒\n' + UI.updateMsg + '\n' + e.message + '[fnLogout ERROR]');
    }
}

/**
 * 函示說明：斷session的UI流程
 * @usage fnSessionDie()
 */
function fnSessionDie() {
    try {
        WLS.Modal(
            '貼心提醒',
            '閒置時間過久，請重新登入！',
            function () {
                fnLogout();
            },
            {
                labels: { cancel: '好' },
            }
        );
    } catch (e) {
        alert('提醒\n' + UI.updateMsg + '\n' + e.message + '[fnSessionDie ERROR]');
    }
}

/**
 * 函示說明：去KYC
 * @usage fnCheckKYC(true, '定期定額')
 *
 * @param {string} strFunc - 要送給KYC的功能名稱
 */
function fnCheckKYC(strFunc) {
    try {
        strFunc = strFunc || '';

        WLS.Modal('親愛的客戶您好', '<div style="text-align:center;">您要新簽署<br/>' + strFunc + '，<br/>請先更新<span style="color:red;">KYC</span>，<br/>即可繼續簽署</div>', () => {
            if (UI.isPC) {
                location.href = '/KYC/FormFull.aspx?BusinessNote=' + strFunc;
            } else {
                fnNewWindow('客戶審核KYC', '/APP/EManager/KYC/Default.aspx?O=Y&Strong=Y&BusinessNote=' + encodeURIComponent(strFunc), 'Y', 'Y');
            }
        });
    } catch (e) {
        alert('提醒\n' + UI.updateMsg + '\n' + e.message + '[fnCheckKYC ERROR]');
    }
}

/**
 * 函示說明：檢查是否外部連結
 * @usage fnCheckOutlink('https://www.google.com.tw')
 *
 * @param {string} strUrl - 要檢查的url
 * returns {boolean} 有或無
 */
function fnCheckOutlink(strUrl = '') {
    try {
        var __href = strUrl;

        if (__href === undefined || __href === '') {
            return false;
        }

        __href = __href.toLowerCase();
        if (
            //$a.attr('target') === '_blank' &&           // 外開視窗
            __href.substr(0, 4) === 'http' &&
            (__href.indexOf('https:') > -1 || __href.indexOf('http:') > -1) && // 絕對網址
            __href.indexOf('ibf.com.tw') === -1 && // 非金控
            __href.indexOf('ibfs.com.tw') === -1 && // 非證券
            __href.indexOf('ibff.com.tw') === -1 && // 非期貨
            __href.indexOf('ibfic.com.tw') === -1 && // 非投顧
            __href.indexOf('ibf-vc.com.tw') === -1 && // 非創投
            __href.indexOf('ibfc.com.tw') === -1 // 非票券
        ) {
            return true;
        } else {
            return false;
        }
    } catch (e) {
        console.log('fnCheckOutlink=', e);
    }
}

/**
 * 函示說明：沒開借貸戶的UI提醒
 * @usage fnEopenCashCallback()
 */
function fnEopenCashCallback() {
    try {
        WLS.Modal(
            '您尚未開立借貸戶',
            '<div style="text-align:center;">借貸業務<br>點股成金，撥款快速<br>免賣股票，還款自由<br>靈活理財的好選擇</div>' +
                (UI.isMobile ? '<div class="uk-text-danger uk-text-bold uk-text-center ibfs-em">請使用電腦進入【國票證券官網】<br>進行線上開戶</div>' : ''),
            function () {
                if (UI.isMobile) {
                    if (UI.isEManager) {
                        $(top.document).find('.menus-menu > .menus-item').eq(0).trigger('click');
                    } else {
                        UIkit.modal('.uk-modal').hide();
                    }
                } else {
                    location.href = '/my/cash/default.aspx';
                }
            },
            {
                multibutton: UI.isMobile ? false : true,
                labels: {
                    cancel: UI.isMobile ? '確定' : '取消',
                    ok: UI.isMobile ? '知道了' : '線上開戶',
                },
                onOK: function () {
                    location.href = '/cash/onlineFormFull.aspx';
                },
            }
        );
    } catch (e) {
        alert('提醒\n' + UI.updateMsg + '\n' + e.message + '[fnEopenCashCallback ERROR]');
    }
}

/**
 * 函示說明：在E管家裡抓取APP版本 JSB.GetVersion()
 * @param 無
 */
function fnGetVersion() {
    try {
        JSB = JSB || top.JSB;

        if (UI.isIOS) {
            if (UI.JSBGetVersion) {
                return JSB.GetVersion();
            } else {
                if (typeof JSB !== 'undefined') {
                    JSB.Alert('提醒', UI.updateMsg + '[fnGetVersion JSB]');
                } else {
                    alert('提醒\n' + UI.updateMsg + '[fnGetVersion]');
                }
            }
        } else if (UI.isAndroid) {
            //待開發
            return '0';
        }
    } catch (e) {
        alert('提醒\n' + UI.updateMsg + '\n' + e.message + '[fnGetVersion ERROR]');
    }
}

/** 
 * 函示說明：在E管家裡登入後導去某功能
 * @usage fnRedirect("EOpenLedger", 
 *                   "/APP/EManager/EOpenLedger/FormFull.aspx", 
 *                   {
                        onLoginDone: true,
                        alertMsg: '請登入理財e管家\n至e櫃台→\n 點選「開戶」→\n進行「舊戶加開分戶帳戶」申請作業',
                        onAlert: true,
                     });
 * @param {string}  id  - 要導去的功能id
 * @param {string}  url - 登入後要導去的網址路徑，只可接受證券官網的相對路徑或https開頭的絕對網址。空值就不動作
 * @param {boolean} opt.onLoginDone - 要不要檢查需要登入嗎
 * @param {string}  opt.alertMsg - 錯誤事件發生時 要跳的提示
 * @param {boolean} opt.onAlert - JSB.Redirect失效/不能用十，是否要跳警示，預設為不跳=沒有任何事件發生
 */
function fnRedirect(id, url, opt) {
    try {
        JSB = JSB || top.JSB;

        id = id || '';
        url = url || '';
        opt = opt || {};

        opt.onLoginDone = opt.onLoginDone || false;
        opt.onAlert = opt.onAlert || false;
        opt.alertMsg = opt.alertMsg || '';

        // 能用JSB.Redirect() 就用
        if (typeof JSB.Redirect === 'function') {
            if (opt.onLoginDone) {
                if (confirm('本功能僅提供國票客戶登入後使用。')) {
                    JSB.Redirect(id, url);
                }
            } else {
                JSB.Redirect(id, url);
            }
        }

        // 不能用就看要不要跳警示
        else {
            if (opt.onAlert) {
                if (typeof JSB !== 'undefined' && UI.isAndroid) {
                    JSB.Alert('提醒', opt.alertMsg === '' ? UI.updateMsg : opt.alertMsg + '[fnRedirect JSB]');
                } else {
                    alert(opt.alertMsg === '' ? UI.updateMsg : opt.alertMsg);
                }
            }
        }
    } catch (e) {
        if (opt.onAlert) {
            alert(opt.alertMsg === '' ? UI.updateMsg : opt.alertMsg);
        }
        //alert('提醒\n' + UI.updateMsg + '\n' + e.message + '[fnRedirect ERROR]');
    }
}

/**
 * 函示說明：在主框中開啟左選單面版並展開子項目
 * @usage fnOpenMenu('menuScreenStock', 'subScreenStock_01');
 * @param {string} ID  - 左選單主項目的ID
 * @param {string} submenuID - 主項目下的子項目ID
 */
function fnOpenMenu(ID, submenuID) {
    try {
        JSB = JSB || top.JSB;

        if (typeof JSB.OpenMenu === 'function') {
            JSB.OpenMenu(ID, submenuID);
        } else {
            if (typeof JSB !== 'undefined') {
                JSB.Alert('提醒', UI.updateMsg + '[fnOpenMenu JSB]');
            } else {
                alert('提醒\n' + UI.updateMsg + '[fnOpenMenu]');
            }
        }
    } catch (e) {
        top.location = 'menu.aspx';
    }
}

/**
 * 函示說明：在主框中呼叫去展開左選單的子項目，但左選單面板不要開啟
 * @usage fnSetMenu('menuScreenStock', 'subScreenStock_01');
 * @param {string} ID  - 左選單主項目的ID
 * @param {string} submenuID - 主項目下的子項目ID
 */
function fnSetMenu(ID, submenuID) {
    try {
        JSB = JSB || top.JSB;

        if (typeof JSB.SetMenu === 'function') {
            JSB.SetMenu(ID, submenuID);
        } else {
            /*
            // 20210929 IOS要先版更，所以關掉安卓提示版更的alert
            if (typeof JSB !== 'undefined') {
                JSB.Alert('提醒', UI.updateMsg + '[SetMenu JSB]');
            } else {
                alert('提醒\n' + UI.updateMsg + '[SetMenu]');
            }
            */
        }
    } catch (e) {
        console.log('[提醒] 執行 fnSetMenu 失敗');
        //top.location = 'menu.aspx';
    }
}

/**
 * 函示說明：在主畫面中開啟某連結
 * @usage fnGoWebPage('ScreenStock', '主框標題', '/', 'M');
 * @param {string} id  - 網頁的編號（先用不到，塞進去備用）
 * @param {string} title - 標題
 * @param {string} url - 網頁的網址
 * @param {string} func - Y: 需檢查登入 || N: 不用檢查登入 || M: 在新視窗中呼叫GoWebPage時，關閉新視窗，並把主畫面導去url(2020/10增)
 */
function fnGoWebPage(id, title, url, func) {
    try {
        JSB = JSB || top.JSB;

        if (typeof JSB.GoWebPage === 'function') {
            JSB.GoWebPage(id, title, url, func);
        } else {
            if (typeof JSB !== 'undefined') {
                JSB.Alert('提醒', UI.updateMsg + '[fnGoWebPage JSB]');
            } else {
                alert('提醒\n' + UI.updateMsg + '[fnGoWebPage]');
            }
        }
    } catch (e) {
        top.location = url;
    }
}

/**
 * 啟用右上角的ISON
 * @usage fnFunctionImg({ type: 'search', onClick: function(){} }); 
 * @param {string} o.type - 右上角native按鈕的樣式 close-window=關閉的x || search=放大鏡 || share=分享 || list-columnar=列表 || list-block=區塊 || share-image=截圖並分享(安卓要實做分享JSB.ShareTo('share-image')，ios不用)
 * @param {string} o.onClick - native的按鈕點下去要做的事，由呼叫 fnFunctionImg(o) 時，透過傳入參數的方式定義實際要做的內容
 */
function fnFunctionImg(o) {
    o = o || {};
    o.type = o.type || '';
    o.onClick = o.onClick || function () {};

    try {
        JSB = JSB || top.JSB;

        if (typeof JSB.FunctionImg === 'function') {
            JSB.FunctionImg(o.type);
            // [必須]要定義 ClickFunctionImg 讓native呼叫用
            top.ClickFunctionImg = o.onClick;
        } else {
            if (typeof JSB !== 'undefined') {
                //1.1.20會閃退不知未麼 先關掉
                // 2020/12/16 ios在load UI.js進來後會先執行 FunctionImg 導致home.aspx會跳以下alert, 也要先關掉
                // alert('提醒\n' + UI.updateMsg + ' [fnFunctionImg JSB]');
            } else {
                //alert('提醒\n' + UI.updateMsg + ' [fnFunctionImg]');
            }
        }
    } catch (e) {
        if (UI.isPC) {
            // 桌機不支援FunctionImg
        } else {
            //alert('提醒\n' + UI.updateMsg + '\n' + e.message + ' [fnFunctionImg ERROR]');
        }
    }
}


/**
 * 函示說明：在 E管家中外開瀏覽器
 * @usage fnOpenBrowser('https://www.ibfs.com.tw')
 * @param {string} url - 要用 User 預設瀏覽器開啟的網址
 */
    function fnOpenBrowser(url) {
        url = url || 'https://www.ibfs.com.tw';
    
        try {
            JSB = JSB || top.JSB;
    
            if (JSB !== undefined && typeof JSB.OpenBrowser === 'function') {
                JSB.OpenBrowser(url);
            } else {
                window.open(url);
            }
        } catch (e) {
            window.open(url);
        }
    }

/**
 * @deprecated
 *
 * 啟用右上角的ISON
 * @usage fnScreenStock({ type: 'search', onClick: function(){} });
 * @param {object} o - 等於fnFunctionImg
 */
function fnScreenStock(o) {
    fnFunctionImg(o);
}

/**
 * 傳送user的回應給native
 * @usage fnUserResponse('privacy', 'Y');
 * @param {string} req - 要求項目  (ex: privacy …….)
 * @param {string} ask - 使用者回覆, Y: 同意 || N: 不同意，可自訂其他值回傳給Native
 */
function fnUserResponse(req, ask) {
    req = req.toLocaleLowerCase() || '';
    ask = ask || '';

    try {
        JSB = JSB || top.JSB;

        if (typeof JSB.UserResponse === 'function') {
            JSB.UserResponse(req, ask);
        } else {
            if (typeof JSB !== 'undefined') {
                JSB.Alert('提醒', UI.updateMsg + '[fnUserResponse JSB]');
            } else {
                alert('提醒\n' + UI.updateMsg + '[fnUserResponse]');
            }
        }
    } catch (e) {
        top.location = url;
    }
}

/**
 * 函示說明：拍證件照，兼容瀏覽器+理財e管家
 * @param {string} o.ApplySGID - [後端必須]CUST_ID
 * @param {string} o.photoID - [後端必須]要上傳到後端的photoID
 * @param {string} o.gateway - [後端必須]要上傳到後端的url
 * @param {object} o.file - [前端必須] input file 這個節點的id
 * @param {object} o.onSelected(imgSrc) - 瀏覽器選取檔案後要做的事，接收圖片的base64(imgSrc)當路徑
 * @param {object} o.onDone(res) - ajax成功
 * @param {object} o.onFail(res) - ajax失敗
 * @param {object} o.onAlways() - ajax成功或失敗都一定要做
 * @param {object} o.photo() - vue的photo物件
 * @param {string} o.uploadWay  - 在理財中要用JSB拍照上傳=JSB，還是用HTML5上傳=HTML5
 * @param {string} o.acceptType - 用HTML5 web上傳時，接受的副檔名
 */
function fnOpenCamera(o) {
    try {
        //console.log(`[UI] fnOpenCamera o =`, o)

        o = o || {};
        o.ApplySGID = o.ApplySGID || '';
        o.gateway = o.gateway || '';
        o.photoID = o.photoID.toString() || '';
        o.file = o.file || {};
        o.onSelected = o.onSelected || function () {};
        o.onDone = o.onDone || function () {};
        o.onFail = o.onFail || function () {};
        o.onAlways = o.onAlways || function () {};
        o.photo = o.photo || {};
        o.uploadWay = o.uploadWay || 'JSB';
        o.acceptType = o.acceptType || FILE_UPLOAD_ACCEPT_TYPE.IMAGE;

        JSB = JSB || top.JSB;

        if (UI.isEManager && o.uploadWay === 'JSB') {
            // 收到相對路徑時 加上domain (活在開戶裡面的aspx，所呼叫的API)
            if (top.UI.JSBOpenCamera && o.gateway !== '' && o.gateway.substr(0, 1) === '/') {
                var __gateway = 'https://www' + (UI.WebEnvironment === 'TEST' ? '-dev' : '') + '.ibfs.com.tw' + o.gateway;
            } else {
                var __gateway = o.gateway;
            }

            JSB.OpenCamera(o.ApplySGID, o.photoID, __gateway);
        } else {
            if (document.getElementById(o.file) !== null) {
                fnPhotoToBase64({
                    ApplySGID: o.ApplySGID,
                    photoID: o.photoID,
                    gateway: o.gateway,
                    file: document.getElementById(o.file).files[0],
                    acceptType: o.acceptType,
                    onSelected: o.onSelected,
                    onDone: o.onDone,
                    onFail: o.onFail,
                    onAlways: o.onAlways,
                });
            } else {
                console.log('file有誤請再次確認');
            }
        }
    } catch (e) {
        alert('提醒\n' + UI.updateMsg + '\n' + e.message + ' [fnOpenCamera ERROR]');
    }
}

/**
 * 函示說明：拍證件照，兼容瀏覽器+理財e管家，有OCR辨識功能
 * @param {string} o.ApplySGID - [後端必須]CUST_ID
 * @param {string} o.photoID - [後端必須]要上傳到後端的photoID
 * @param {string} o.gateway - [後端必須]要上傳到後端的url
 * @param {object} o.file - [前端必須] input file 這個節點的id
 * @param {object} o.onSelected(imgSrc) - 瀏覽器選取檔案後要做的事，接收圖片的base64(imgSrc)當路徑
 * @param {object} o.onDone(res) - ajax成功
 * @param {object} o.onFail(res) - ajax失敗
 * @param {object} o.onAlways() - ajax成功或失敗都一定要做
 * @param {object} o.photo() - vue的photo物件
 * @param {boolean} o.isFront() - 要拍的照片是正面 ，傳給Native去做全景辨識用
 * @param {string} o.uploadWay  - 在理財中要用JSB拍照上傳=JSB，還是用HTML5上傳=HTML5
 * @param {string} o.acceptType - 用HTML5 web上傳時，接受的副檔名
 */
function fnOpenCameraWithOCR(o) {
    try {
        // console.log(`[UI] fnOpenCameraWithOCR o =`, o)

        o = o || {};
        o.ApplySGID = o.ApplySGID || '';
        o.gateway = o.gateway || '';
        o.photoID = o.photoID.toString() || '';
        o.file = o.file || {};
        o.onSelected = o.onSelected || function () {};
        o.onDone = o.onDone || function () {};
        o.onFail = o.onFail || function () {};
        o.onAlways = o.onAlways || function () {};
        o.photo = o.photo || {};
        o.uploadWay = o.uploadWay || 'JSB';
        o.acceptType = o.acceptType || FILE_UPLOAD_ACCEPT_TYPE.IMAGE;

        // Native不收這三個值以外的東西
        if (o.isFront !== '0' && o.isFront !== '1' && o.isFront !== '') {
            o.isFront = '-1';
        }

        JSB = JSB || top.JSB;

        if (UI.isEManager && o.uploadWay === 'JSB') {
            // 收到相對路徑時 加上domain (活在開戶裡面的aspx，所呼叫的API)
            if (top.UI.JSBOpenCameraWithOCR && o.gateway !== '' && o.gateway.substr(0, 1) === '/') {
                var __gateway = 'https://www' + (UI.WebEnvironment === 'TEST' ? '-dev' : '') + '.ibfs.com.tw' + o.gateway;
            } else {
                var __gateway = o.gateway;
            }

            // 20220912向下兼容不支援OCR的理財
            if (UI.JSBOpenCameraWithOCR) {
                JSB.OpenCameraWithOCR(o.ApplySGID, o.photoID, __gateway, o.isFront);
            } else {
                JSB.OpenCamera(o.ApplySGID, o.photoID, __gateway);
            }
        } else {
            //OCR 放寬檔案大小限制，壓縮比率
            if (document.getElementById(o.file) !== null) {
                fnPhotoToBase64({
                    ApplySGID: o.ApplySGID,
                    photoID: o.photoID,
                    gateway: o.gateway,
                    file: document.getElementById(o.file).files[0],
                    acceptType: o.acceptType,
                    onSelected: o.onSelected,
                    onDone: o.onDone,
                    onFail: o.onFail,
                    onAlways: o.onAlways,
                    photoLimit: 3,
                    photoCompressibility: 3000,
                    ocr: true,
                });
            } else {
                console.log('file有誤請再次確認');
            }
        }
    } catch (e) {
        alert('提醒\n' + UI.updateMsg + '\n' + e.message + ' [fnOpenCameraWithOCR ERROR]');
    }
}

/**
 * 函示說明：拍存摺照，兼容瀏覽器+理財e管家
 * @param {string} o.ApplySGID - [後端必須]CUST_ID
 * @param {string} o.photoID - [後端必須]要上傳到後端的photoID
 * @param {string} o.gateway - [後端必須]要上傳到後端的url
 * @param {object} o.file - [前端必須] input file 這個節點的id
 * @param {object} o.onSelected(imgSrc) - 瀏覽器選取檔案後要做的事，接收圖片的base64(imgSrc)當路徑
 * @param {object} o.onDone(res) - ajax成功
 * @param {object} o.onFail(res) - ajax失敗
 * @param {object} o.onAlways() - ajax成功或失敗都一定要做
 * @param {object} o.photo() - vue的photo物件
 * @param {string} o.uploadWay  - 在理財中要用JSB拍照上傳=JSB，還是用HTML5上傳=HTML5
 * @param {string} o.acceptType - 用HTML5 web上傳時，接受的副檔名
 */
function fnOpenPassBookCamera(o) {
    try {
        // console.log(`[UI] fnOpenPassBookCamera o =`, o)

        o = o || {};
        o.ApplySGID = o.ApplySGID || '';
        o.gateway = o.gateway || '';
        o.photoID = o.photoID + '' || '';
        o.file = o.file || {};
        o.type = o.type || '';
        o.heicFile = o.heicFile || '';
        o.onSelected = o.onSelected || function () {};
        o.onDone = o.onDone || function () {};
        o.onFail = o.onFail || function () {};
        o.onAlways = o.onAlways || function () {};
        o.photo = o.photo || {};
        o.uploadWay = o.uploadWay || 'JSB';
        o.acceptType = o.acceptType || FILE_UPLOAD_ACCEPT_TYPE.IMAGE;
        o.timeout = o.timeout || '';

        JSB = JSB || top.JSB;

        if (UI.isEManager && o.uploadWay === 'JSB') {
            // 收到相對路徑時 加上domain (活在開戶裡面的aspx，所呼叫的API)
            if (top.UI.JSBOpenPassBookCamera && o.gateway !== '' && o.gateway.substr(0, 1) === '/') {
                var __gateway = 'https://www' + (UI.WebEnvironment === 'TEST' ? '-dev' : '') + '.ibfs.com.tw' + o.gateway;
            } else {
                var __gateway = o.gateway;
            }

            JSB.OpenPassBookCamera(o.ApplySGID, o.photoID, __gateway);
        } else {
            fnPhotoToBase64({
                ApplySGID: o.ApplySGID,
                photoID: o.photoID,
                gateway: o.gateway,
                type: o.type,
                heicFile: o.heicFile,
                file: document.getElementById(o.file).files[0],
                acceptType: o.acceptType,
                onSelected: o.onSelected,
                onDone: o.onDone,
                onFail: o.onFail,
                onAlways: o.onAlways,
                timeout: o.timeout,
                type: o.type,
                heicFile: o.heicFile,
            });
        }
    } catch (e) {
        alert('提醒\n' + UI.updateMsg + '\n' + e.message + ' [fnOpenPassBookCamera ERROR]');
    }
}

/**
 * 函示說明：拍自拍，兼容瀏覽器+理財e管家
 * @param {string} o.ApplySGID - [後端必須]CUST_ID
 * @param {string} o.photoID - [後端必須]要上傳到後端的photoID
 * @param {string} o.gateway - [後端必須]要上傳到後端的url
 * @param {object} o.file - [前端必須] input file 這個節點的id
 * @param {object} o.onSelected(imgSrc) - 瀏覽器選取檔案後要做的事，接收圖片的base64(imgSrc)當路徑
 * @param {object} o.onDone(res) - ajax成功
 * @param {object} o.onFail(res) - ajax失敗
 * @param {object} o.onAlways() - ajax成功或失敗都一定要做
 * @param {object} o.photo() - vue的photo物件
 * @param {string} o.uploadWay  - 在理財中要用JSB拍照上傳=JSB，還是用HTML5上傳=HTML5
 * @param {string} o.acceptType - 用HTML5 web上傳時，接受的副檔名
 */
function fnOpenSelfieCamera(o) {
    try {
        o = o || {};
        o.ApplySGID = o.ApplySGID || '';
        o.gateway = o.gateway || '';
        o.photoID = o.photoID.toString() || '';
        o.file = o.file || {};
        o.onSelected = o.onSelected || function () {};
        o.onDone = o.onDone || function () {};
        o.onFail = o.onFail || function () {};
        o.onAlways = o.onAlways || function () {};
        o.photo = o.photo || {};
        o.uploadWay = o.uploadWay || 'JSB';
        o.acceptType = o.acceptType || FILE_UPLOAD_ACCEPT_TYPE.IMAGE;
        o.timeout = o.timeout || ''; //客製timeout時間

        JSB = JSB || top.JSB;

        if (UI.isEManager && o.uploadWay === 'JSB') {
            // 收到相對路徑時 加上domain (活在開戶裡面的aspx，所呼叫的API)
            if (top.UI.JSBOpenSelfieCamera && o.gateway !== '' && o.gateway.substr(0, 1) === '/') {
                var __gateway = 'https://www' + (UI.WebEnvironment === 'TEST' ? '-dev' : '') + '.ibfs.com.tw' + o.gateway;
            } else {
                var __gateway = o.gateway;
            }
            JSB.OpenSelfieCamera(o.ApplySGID, o.photoID, __gateway);
        } else {
            fnPhotoToBase64({
                ApplySGID: o.ApplySGID,
                photoID: o.photoID,
                gateway: o.gateway,
                file: document.getElementById(o.file).files[0],
                acceptType: o.acceptType,
                onSelected: o.onSelected,
                onDone: o.onDone,
                onFail: o.onFail,
                onAlways: o.onAlways,
                timeout: o.timeout,
            });
        }
    } catch (e) {
        alert('提醒\n' + UI.updateMsg + '\n' + e.message + ' [fnOpenSelfieCamera ERROR]');
    }
}

/**
 * 函示說明：[模擬平台] 的user可以拍照/選檔上傳大頭照，拍照的話相機畫面不要有紅框，就用原生相機的畫面
 * @param {string} o.ApplySGID - [後端必須]CUST_ID
 * @param {string} o.photoID - [後端必須]要上傳到後端的photoID
 * @param {string} o.gateway - [後端必須]要上傳到後端的url
 * @param {object} o.file - [前端必須] input file 這個節點的id
 * @param {object} o.onSelected(imgSrc) - 瀏覽器選取檔案後要做的事，接收圖片的base64(imgSrc)當路徑
 * @param {object} o.onDone(res) - ajax成功
 * @param {object} o.onFail(res) - ajax失敗
 * @param {object} o.onAlways() - ajax成功或失敗都一定要做
 * @param {object} o.photo() - vue的photo物件
 * @param {string} o.uploadWay  - 在理財中要用JSB拍照上傳=JSB，還是用HTML5上傳=HTML5
 * @param {string} o.acceptType - 用HTML5 web上傳時，接受的副檔名
 */
function fnOpenDefaultCamera(o) {
    try {
        //  console.log(`[UI] fnOpenDefaultCamera o =`, o)

        o = o || {};
        o.ApplySGID = o.ApplySGID || '';
        o.gateway = o.gateway || '';
        o.photoID = o.photoID === undefined ? '' : o.photoID.toString() || '';
        o.file = o.file || {};
        o.onSelected = o.onSelected || function () {};
        o.onDone = o.onDone || function () {};
        o.onFail = o.onFail || function () {};
        o.onAlways = o.onAlways || function () {};
        o.photo = o.photo || {};
        o.uploadWay = o.uploadWay || 'JSB';
        o.acceptType = o.acceptType || FILE_UPLOAD_ACCEPT_TYPE.IMAGE;

        JSB = JSB || top.JSB;

        if (UI.isEManager && o.uploadWay === 'JSB') {
            // 收到相對路徑時 加上domain (活在開戶裡面的aspx，所呼叫的API)
            if (top.UI.JSBOpenDefaultCamera && o.gateway !== '' && o.gateway.substr(0, 1) === '/') {
                var __gateway = 'https://www' + (UI.WebEnvironment === 'TEST' ? '-dev' : '') + '.ibfs.com.tw' + o.gateway;
            } else {
                var __gateway = o.gateway;
            }

            JSB.OpenDefaultCamera(o.ApplySGID, o.photoID, __gateway);
        } else {
            if (document.getElementById(o.file) !== null) {
                fnPhotoToBase64({
                    ApplySGID: o.ApplySGID,
                    photoID: o.photoID,
                    gateway: o.gateway,
                    file: document.getElementById(o.file).files[0],
                    acceptType: o.acceptType,
                    onSelected: o.onSelected,
                    onDone: o.onDone,
                    onFail: o.onFail,
                    onAlways: o.onAlways,
                });
            } else {
                console.log('file有誤請再次確認');
            }
        }
    } catch (e) {
        alert('提醒\n' + UI.updateMsg + '\n' + e.message + ' [fnOpenDefaultCamera ERROR]');
    }
}

/**
 * 函示說明：調用 Native 版的競拍
 */
function fnOpenSCAS() {
    try {

        JSB = JSB || top.JSB;

        if (UI.isEManager && top.UI.JSBOpenSCAS) {
            JSB.OpenSCAS();
        } else {
            fnOpenOtherAPP("TWID", { param: "scas"}); 
        }
    } catch (e) {
        alert('提醒\n' + UI.updateMsg + '\n' + e.message + ' [fnOpenSCAS ERROR]');
    }
}

/**
 * 函示說明：調用 Native 去關 loading spinner
 */
function fnCloseLoadingSpinner(){
    try {
        JSB = JSB || top.JSB;

        if (UI.isEManager && top.UI.JSBCloseLoadingSpinner) {
            JSB.CloseLoadingSpinner();
        } else {
            
        }
    } catch (e) {
        alert('提醒\n' + UI.updateMsg + '\n' + e.message + ' [fnCloseLoadingSpinner ERROR]');
    }
}

/**
 * 函示說明：通知 Native 點右上角的關閉按鈕時，false = 不要做預設行為(關視窗)
 * 
 */
function fnSetRightBtnClose(nativeTriggerClose = true){
    try {
        JSB = JSB || top.JSB;

        if (UI.isEManager && top.UI.JSBSetRightBtnClose) {
            JSB.SetRightBtnClose(String(nativeTriggerClose));
        } else {
            
        }
    } catch (e) {
        alert('提醒\n' + UI.updateMsg + '\n' + e.message + ' [fnSetRightBtnClose ERROR]');
    }
}

/**
 * 函示說明：通知 Native 點左上角的關閉按鈕時，false = 不要做預設行為(關視窗)
 * 
 */
function fnSetLeftBtnBack(nativeTriggerClose = true){
    try {
        JSB = JSB || top.JSB;

        if (UI.isEManager && top.UI.JSBSetLeftBtnBack) {
            JSB.SetLeftBtnBack(String(nativeTriggerClose));
        } else {
            
        }
    } catch (e) {
        alert('提醒\n' + UI.updateMsg + '\n' + e.message + ' [fnSetLeftBtnBack ERROR]');
    }
}




/**
 * 函示說明：[模擬平台] 登入後的主框，下方Tab可指定亮哪一顆
 * @param {string} Index - tab的index，從1開始
 * @param {string} GoToUrl - webview要導去哪個頁面
 * @param {string} PageTitle - 頁面的標題
 */
function fnActivateTab(Index, GoToUrl, PageTitle) {
    try {
        Index = Index.toString() || '1';

        JSB = JSB || top.JSB;

        if (UI.isEManager) {
            // 因為安卓只實做第一個參數
            if (UI.isAndroid) {
                fnGoWebPage('ID_fnActivateTab_' + PageTitle, PageTitle, GoToUrl);
            }
            JSB.ActivateTab(Index, GoToUrl, PageTitle);
        } else {
            console.log('非E管家不用執行 ActivateTab');
        }
    } catch (e) {
        alert('提醒\n' + UI.updateMsg + '\n' + e.message + ' [fnActivateTab ERROR], tab=' + Index);
    }
}

/**
 * 函示說明：[模擬平台] 報價帶下單
 * @param {string} StockNo - 股票代號
 * @param {string} Price - 價格
 */

function fnSetQuoteToTrade(StockNo, Price) {
    try {
        JSB = JSB || top.JSB;

        if (UI.isEManager) {
            JSB.SetQuoteToTrade(StockNo, Price);
        } else {
            console.log('非E管家不用執行 fnSetQuoteToTrade');
        }
    } catch (e) {
        alert('提醒\n' + UI.updateMsg + '\n' + e.message + ' [fnSetQuoteToTrade ERROR], StockNo=' + StockNo);
    }
}

/**
 * 函示說明：把瀏覽器上傳的照片(透過 input file 或 拖拉方式取得的照片檔案物件)，轉成 base64傳給後端
 * @param {string} o.ApplySGID - [後端必須]CUST_ID
 * @param {string} o.photoID - [後端必須]要上傳到後端的photoID
 * @param {string} o.gateway - [後端必須]要上傳到後端的url
 * @param {object} o.file - [前端必須]file 物件
 * @param {object} o.onSelected(imgSrc) - 瀏覽器選取檔案後要做的事，接收圖片的base64(imgSrc)當路徑
 * @param {object} o.onDone(res) - ajax成功
 * @param {object} o.onFail(res) - ajax失敗
 * @param {object} o.onAlways() - ajax成功或失敗都一定要做
 * @param {object} o.photo() - vue的photo物件
 * @param {string} o.acceptType - 用HTML5 web上傳時，接受的副檔名
 */
function fnPhotoToBase64(o) {
    console.log(`[UI] fnPhotoToBase64 o =`, o)
    
    o = o || {};
    o.ApplySGID = o.ApplySGID || '';
    o.gateway = o.gateway || '';
    o.photoID = o.photoID.toString() || '';
    o.file = o.file || {};
    o.onSelected = o.onSelected || function () {};
    o.onDone = o.onDone || function () {};
    o.onFail = o.onFail || function () {};
    o.onAlways = o.onAlways || function () {};
    o.photo = o.photo || {};
    o.isSelfie = o.isSelfie || false;
    o.acceptType = o.acceptType || FILE_UPLOAD_ACCEPT_TYPE.IMAGE;
    o.photoLimit = o.photoLimit || 0; //上傳檔案大小限制
    o.photoCompressibility = o.photoCompressibility || 0; //上傳檔案壓縮比率
    o.ocr = o.ocr || false; //是不是OCR，後續壓縮規則不一樣
    o.timeout = o.timeout || ''; //上傳圖片timeout客制

    var $test = $('#testmsg');
    var t1 = new Date();
    var __fileReader = new FileReader();
    __fileReader.onload = (function () {
        return function (e) {
            var __src = e.target.result;
            if(o.type === 'heic') {
                __src = o.heicFile; // base64 format, content = JPG
            }
            
            var t2 = new Date();
            if ($test.length) {
                $test.append('<div>' + (t2 - t1) + 'ms</div>');
            }

            // 檢查圖片格式 必須是 __aryAcceptType中的陣列
            var MIMEType = '';
            var __imgMIMEType = o.file.type.toLowerCase();
            
            //console.log(`[UI] fnPhotoToBase64 __fileReader.onload __imgMIMEType = ${__imgMIMEType}`)
            var arry__imgMIMEType = '';
            if (__imgMIMEType.length > 0) {
                arry__imgMIMEType = __imgMIMEType.split('/');
            }
            

            var __imgMIMETypeOK = true;

            if (!o.acceptType.toLowerCase().includes(arry__imgMIMEType[1]?.toLowerCase())) {
                __imgMIMETypeOK = false;
            }
            //  console.log(`[UI] fnPhotoToBase64 __fileReader.onload __imgMIMETypeOK = `, __imgMIMETypeOK)

            if (__imgMIMEType !== undefined && __imgMIMEType !== '' && __imgMIMETypeOK || o.type === 'heic') {
                // PDF時不用特殊處理，直接上傳
                if (__imgMIMEType.indexOf('pdf') > -1) {
                    MIMEType = 'pdf';
                    __upload(__src, __src, o.photoID, MIMEType);
                    return;
                }

                MIMEType = 'png,jpg,jpeg,gif,bmp';

                // 超過2MB才要把照片等比例裁剪到1000px * 1000px以內，往後端送檔案才不會太大
                //20230825 預設2MB，ocr 改為(10MB)
                var limit = o.photoLimit > 0 ? o.photoLimit : 2;
                var maxSize = 1024 * 1024 * limit;

                if ($test.length) {
                    $test.append('<div>' + o.file.size + 'MB</div><div>' + maxSize + '(MAX)</div>');
                }

                if (o.file.size >= maxSize) {
                    if ($test.length) {
                        $test.append('<div>照片過大ㄟ</div>');
                    }

                    // 1.產生 img物件，才能壓縮
                    var img = new Image();

                    // 2.在圖片載入後要進行的操作 ...
                    img.onload = function () {
                        var t3 = new Date();

                        if ($test.length) {
                            $test.append('<div>' + (t3 - t2) + 'ms</div>');
                        }
                        if (o.ocr) {
                            //與ocr壓縮規則一樣
                            __upload(__ocrCompress(img, o.photoCompressibility), __src, o.photoID, MIMEType, o.timeout);
                        } else {
                            __upload(__compress(img, o.photoCompressibility), __src, o.photoID, MIMEType, o.timeout);
                        }
                    };

                    img.src = __src;
                } else {
                    __upload(__src, __src, o.photoID, MIMEType, o.timeout);
                }
            } else {
                alert('請上傳正確的檔案格式：副檔名為 ' + o.acceptType);
            }
        };
    })();

    if (o.file instanceof Blob) {
        __fileReader.readAsDataURL(o.file);
    }

    // ajax上傳
    function __upload(__src, __fileUrl, __photoID, __MIMEType, __timeout) {
        o.onSelected(__fileUrl);

        // 取 base64檔案本身的資訊，去掉mimetype, base64編碼
        if (__src.indexOf(',') > -1) {
            __src = __src.split(',')[1];
        }

        //console.log(__src)
        let ajaxset = {
            type: 'POST',
            url: o.gateway,
            data: { CUST_ID: o.ApplySGID, fileID: o.photoID, Source: 'WEB', fileImg: __src, t: Math.random() * 10, MimeType: __MIMEType, fileType: o.file.type },
        };

        if (__timeout !== null && __timeout !== undefined && typeof __timeout === 'number' && __timeout > 0) {
            ajaxset.timeout = __timeout;
        }

        $.ajax(ajaxset)
            .done(function (res) {
                switch (res.substr(0, 3)) {
                    case '000':
                        o.onDone(res);
                        break;
                    case '999':
                    default:
                        WLS.Modal('', res);
                        break;
                }
            })
            .fail(function (res) {
                console.log(typeof res.readyState, JSON.stringify(res) + ' UI.js裡面的失敗字串');

                if (res.readyState === 4) {
                    if (res.responseText.indexOf('超出最大的要求長度') > -1 || res.responseText.indexOf('您尋找的資源已移除、名稱已變更，或暫時無法使用。') > -1) {
                        alert('[提醒]上傳檔案不能超過4MB');
                    } else {
                        WLS.Modal('', res);
                    }
                }

                o.onFail(res);
            })
            .always(function () {
                o.onAlways();
            });

        // callback
    }

    // 壓縮圖
    function __compress(img, maxSize) {
        maxSize = maxSize || 0; //上傳檔案壓縮尺寸
        var initSize = img.src.length;
        var width = img.width;
        var height = img.height;
        var jpegCompressRate = 0.99;

        // 壓縮圖片的程式
        var canvas = document.createElement('canvas');
        var ctx = canvas.getContext('2d');

        //如果沒有自定義參數，預設圖片大於100萬畫素(1000px * 1000px)，計算壓縮比並將大小壓至100萬以下
        maxSize = maxSize > 0 ? maxSize * maxSize : 1000000;

        var ratio;
        if ((ratio = (width * height) / maxSize) > 1) {
            ratio = Math.sqrt(ratio);
            width /= ratio;
            height /= ratio;
        } else {
            ratio = 1;
        }

        canvas.width = width;
        canvas.height = height;

        // 鋪底色，防png轉jpg後透明底變黑底
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, width, height); // =0,0,300, 150
        ctx.drawImage(img, 0, 0, width, height);

        /*
        // 瓦片canvas - 舊iOS才要用把canvas切割成小塊小塊再去拼起來，太重度演算了就關掉
        var tCanvas = document.createElement("canvas");
        var tctx = tCanvas.getContext("2d");
        ctx.fillStyle = "#fff";
        ctx.fillRect(0, 0, tCanvas.width, tCanvas.height); // =0,0,300, 150
        ctx.drawImage(img, 0, 0, width, height);
        // 如果圖片畫素大於1000萬(10000 * 10000)則使用瓦片繪製
        var count;
        if ((count = width * height / 100000000) > 1) {
            count = ~~(Math.sqrt(count)); //計算要分成多少塊瓦片
            // 計算每塊瓦片的寬和高
            var nw = ~~(width / count);
            var nh = ~~(height / count);
            tCanvas.width = nw;
            tCanvas.height = nh;
            for (var i = 0; i < count; i) {
                for (var j = 0; j < count; j) {
                    tctx.drawImage(img, i * nw * ratio, j * nh * ratio, nw * ratio, nh * ratio, 0, 0, nw, nh);
                    ctx.drawImage(tCanvas, i * nw, j * nh, nw, nh);
                }
            }
        } else {
            ctx.drawImage(img, 0, 0, width, height);
        }
        */

        //進行最小壓縮
        var ndata = canvas.toDataURL('image/jpeg', jpegCompressRate);
        canvas.width = canvas.height = 0;
        return ndata;
    }

    // OCR壓縮圖
    function __ocrCompress(img, maxSize) {
        maxSize = maxSize || 0;
        var initSize = img.src.length;
        var width = img.width;
        var height = img.height;
        var jpegCompressRate = 80;

        // 壓縮圖片的程式
        var canvas = document.createElement('canvas');
        var ctx = canvas.getContext('2d');

        //OCR 計算壓縮比3000px * 3000px
        var ratio;

        ratio = Math.min(maxSize / width, maxSize / height);
        if (ratio < 1) {
            canvas.width = width * ratio;
            canvas.height = height * ratio;
        } else {
            canvas.width = width;
            canvas.height = height;
        }

        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, canvas.width, canvas.width);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        //進行最小壓縮
        var ndata = canvas.toDataURL('image/jpeg', jpegCompressRate); //質量参数
        canvas.width = canvas.height = 0;
        return ndata;
    }
}

/**
 * 驅動橫向選單
 * @usage pageTabsInit({ menu: 2 });
 * @param {number} config.menu - 主選單要亮哪一顆
 */
function pageTabsInit(config) {
    config = config || {};

    var o = this;
    var $pageTabsWrapper = $('.menus-inner'); // 橫選單Wrapper overflowX = auto
    var $pageTabsMenu = $pageTabsWrapper.children('.menus-menu'); // 橫選單物件
    var pageTabsWidth = 0; // $pageTabsMenu的總寬度
    var menusScrollHTML = ''; // li的字串HTML

    // 1. 準備
    $pageTabsMenu.find('li').each(function (index, el) {
        // 1.每個li記下自己的offset().left
        $(el).attr('offset', pageTabsWidth);
        // 2.$pageTabsMenu計算總寬度用
        pageTabsWidth += $(el).width();
        // 3.畫子項目 HTML
        menusScrollHTML += '<span class="pagePanel-item ' + ($(el).hasClass('uk-active') ? 'uk-active' : '') + '">' + $(el).text() + '</span>';
    });
    $pageTabsWrapper.addClass('fixed').after('<div class="menus-inner-placeholder" style="height:' + $pageTabsWrapper.height() + 'px"></div>');
    $pageTabsMenu.css('width', pageTabsWidth + 'px');

    // 2.事件綁定: 主選單li
    _menuItemGoActive({ activeIndex: typeof config.menu === 'undefined' ? 0 : config.menu });
    $pageTabsMenu.on('click', ' > li', function () {
        _menuItemGoActive({
            activeIndex: $(this).index(),
        });

        if ($('#pagePanelToggle').length) {
            _pagePanelItemGoActive({
                activeIndex: $(this).index(),
            });
        }
    });

    // 3.長出選單的快捷面版
    if (pageTabsWidth > $(window).width() && !$('#pagePanelToggle').length) {
        // 1. 畫 toggle跟面版的HTML
        var HTML =
            '<div id="pagePanelToggle">' +
            '<span uk-icon="icon:chevron-down"></span></div>' +
            '<div id="pagePanelContent">' +
            '<div id="pagePanelTitle"></div>' +
            '<div id="pagePanelContentInner">' +
            menusScrollHTML +
            '</div>' +
            '</div>';
        $(HTML).appendTo('body');
        setTimeout(function () {
            var pagePanelToggleWidth = $('#pagePanelToggle').width() * 3;
            $pageTabsMenu.css('width', parseInt($pageTabsMenu.css('width')) + pagePanelToggleWidth + 'px');
        }, 100);

        // 2. toggle事件綁定: 面版顯示或隱藏
        $('#pagePanelToggle').on('touchstart', function () {
            _pagePanelToggle();
        });

        // 3. 子項目事件綁定: 子項目誰要亮, 亮了之後要幹嘛
        _pagePanelItemGoActive({
            activeIndex: typeof config.menu === 'undefined' ? 0 : config.menu,
        });

        $('.pagePanel-item').on('touchend', function (e) {
            e.preventDefault();
            var $o = $(this);
            var oIndex = $o.index();

            // 避免iOS 點擊穿透到主內容的帳號select或type=date或按鈕，導致觸發了不想發生的事
            if ($(e.target).hasClass('pagePanel-item')) {
                // 自己亮
                _pagePanelItemGoActive({
                    activeIndex: oIndex,
                });
                // 主選單對應的按鈕亮
                _menuItemGoActive({
                    activeIndex: oIndex,
                    onActive: function () {
                        // 把面版收起來
                        _pagePanelToggle({
                            onActive: function () {
                                // 觸發主選單的事件，這邊要follow account.aspx中，綁定的主選單的event type
                                var $li = $pageTabsMenu.find(' > li:eq(' + oIndex + ')');
                                var alink = $li.find('a').attr('href');
                                var isNotAlink = alink === '' || alink.indexOf('#') === 0;
                                if (isNotAlink) {
                                    $li.trigger('click');
                                } else {
                                    location.href = alink;
                                }
                            },
                        });
                    },
                }); // END _menuItemGoActive
            } // END if
        }); // END touchend
    } // END if
}

/**
 * 主選單的li亮暗狀態
 * @usage _menuItemGoActive({ activeIndex: 2, onActive:function(){} });
 * @param {number} config.activeIndex - 要亮的項目的index
 * @param {function} config.onActive - 亮了之後要做的事
 */
function _menuItemGoActive(config) {
    config = config || {};
    config.activeIndex = config.activeIndex || 0;

    var $pageTabsWrapper = $('.menus-inner');
    var $menuli = $pageTabsWrapper.children('ul').children('li:eq(' + config.activeIndex + ')');

    $menuli.addClass('uk-active').siblings().removeClass('uk-active');
    $pageTabsWrapper.animate({ scrollLeft: $menuli.attr('offset') }, 300); // 主選單滑動

    typeof config.onActive === 'function' ? config.onActive() : '';

    if ($pageTabsWrapper.siblings('.menus-content').length) {
        _contentItemGoActive(config);
    }
}

/**
 * 選單的快捷面版顯示隱藏狀態
 * @usage _pagePanelToggle({ onActive: function(){} });
 * @param {function} config.onActive - 亮了之後要做的事
 */
function _pagePanelToggle(config) {
    config = config || {};

    var $o = $('#pagePanelToggle'),
        $panel = $o.next('#pagePanelContent');

    if ($panel.hasClass('open')) {
        $o.removeClass('open');
        $panel.removeClass('open');
    } else {
        $o.addClass('open');
        $panel.addClass('open');
    }
    setTimeout(function () {
        typeof config.onActive === 'function' ? config.onActive() : '';
    }, 300);
}

/**
 * 選單的快捷面版亮暗狀態
 * @usage _pagePanelItemGoActive({ activeIndex: 2, onActive: function(){} });
 * @param {number} config.activeIndex - 要亮的項目的index
 * @param {function} config.onActive - 亮了之後要做的事
 */
function _pagePanelItemGoActive(config) {
    $('#pagePanelContentInner .pagePanel-item:eq(' + config.activeIndex + ')')
        .addClass('uk-active')
        .siblings()
        .removeClass('uk-active');
    typeof config.onActive === 'function' ? config.onActive() : '';
}

/**
 * 主選單的li相對應的div顯示隱藏狀態
 * @usage _contentItemGoActive({ activeIndex: 1 });
 * @param {number} config.activeIndex - 要顯示的div的index
 */
function _contentItemGoActive(config) {
    config = config || {};
    config.activeIndex = config.activeIndex || 0;

    var $pageTabsWrapper = $('.menus-content');
    $pageTabsWrapper
        .children('.menus-content-item:eq(' + config.activeIndex + ')')
        .show()
        .siblings()
        .hide();
}

/**
 * 函示說明：取網址參數
 * @usage getQueryString('menu');
 * @param {string} name - querystring的key
 */
function getQueryString(name) {
    switch (name) {
        case 'menu':
            if (typeof gmenu !== 'undefined') {
                // [防衛] 後端沒定義全域變數給前端用時
                if (gmenu === '') {
                    // [防衛] 後端給來的全域變數是空時(=網址沒有指定?menu的key)
                    return '0'; // [防衛] 前端預設menu在第一顆=0
                } else {
                    return gmenu;
                }
            } else {
                return '0';
            }
            break;
        case 'submenu':
            if (typeof gsubmenu !== 'undefined') {
                if (gsubmenu === '') {
                    return '0';
                } else {
                    return gsubmenu;
                }
            } else {
                return '0';
            }
            break;
        case 'from':
            if (typeof gfrom !== 'undefined') {
                if (gfrom === '') {
                    return '';
                } else {
                    return gfrom;
                }
            } else {
                return '';
            }
            break;

        default:
            break;
    }
}

function isValidValue(value) {
    return value !== undefined && value !== '' && value !== null;
}

/**
 * 神測埋點
 * @param {string} event - 自訂義事件
 * @param {object} data - 要記錄的資訊
 * @example
    _trackByGoogle({
        event: 'BuyProduct',
        data: {
            ProductName: "MacBook Pro",
            ProductPrice: 123.45,
            IsAddedToFav: false,
        }
    })
 *
 */

/**
 * GA埋點
 * param {string} objParams.client - 用甚麼工具追蹤
 *
 */
function _trackByGoogle({}) {}


/**
 * 函示說明：根據宿主環境回傳來源別
 * @param  無
 * @returns  {string}
 */
function getAppCode() {
    let appCode = '';
    if (UI.isEManager) {
        if (UI.isIOS) { appCode = 'm' }
        if (UI.isAndroid) { appCode = 'k' }
    }
    else if (UI.isISmart) {
        if (UI.isIOS) { appCode = 'T' }
        if (UI.isAndroid) { appCode = 'U' }
    }
    else {
        appCode = 'IBFS'
    }

    return appCode
}