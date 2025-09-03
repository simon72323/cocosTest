const OFF = 'off';
const ERROR = 'error';
const WARNING = 'warn';
const IS_PROD = process.env.NODE_ENV === 'production';

module.exports = {
    extends: [
        'eslint:recommended', // ESLint 推薦的基本規則
        'plugin:import/typescript' // TypeScript import 相關規則
    ],
    settings: {
        'import/resolver': {
            alias: {
                map: [
                    ['@', './assets'], // 設定 @ 別名指向 assets 目錄
                    ['db://assets', './assets'], // Cocos Creator 的 db:// 協議別名
                    ['common', './assets/common'], // common 目錄別名
                    ['games', './assets/games'], // games 目錄別名
                    ['loading', './assets/loading'], // loading 目錄別名
                    ['resources', './assets/resources'] // resources 目錄別名
                ],
                extensions: ['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs'] // 支援的檔案副檔名
            }
        }
    },
    parser: '@typescript-eslint/parser', // 使用 TypeScript 解析器
    parserOptions: {
        ecmaVersion: 2020 // 使用 ES2020 語法
    },
    env: { 
        node: true, // Node.js 環境
        browser: true, // 瀏覽器環境
        es2021: true // ES2021 環境
    },
    plugins: [
        '@typescript-eslint', // TypeScript 相關規則
        'import', // import/export 相關規則
        'no-relative-import-paths', // 禁止相對路徑 import
        '@stylistic' // 程式碼風格相關規則
    ],
    rules: {
        // ==================== 箭頭函數相關規則 ====================
        'arrow-body-style': [ERROR, 'as-needed'], // 箭頭函數體風格：需要時才使用大括號
        'arrow-parens': [ERROR, 'as-needed'], // 箭頭函數參數括號：需要時才使用括號

        // ==================== 逗號相關規則 ====================
        'comma-dangle': [ERROR, 'never'], // 禁止尾隨逗號

        // ==================== 類別成員相關規則 ====================
        'lines-between-class-members': [
            ERROR,
            'always', // 類別成員之間必須有空行
            { exceptAfterSingleLine: true } // 但單行成員後可以沒有空行
        ],

        // ==================== 除錯相關規則 ====================
        'no-console': IS_PROD ? ERROR : OFF, // 生產環境禁止 console，開發環境允許
        'no-debugger': IS_PROD ? ERROR : OFF, // 生產環境禁止 debugger，開發環境允許

        // ==================== 參數重新賦值規則 ====================
        'no-param-reassign': [ERROR, { props: false }], // 禁止重新賦值參數，但允許修改參數屬性

        // ==================== 禁止的語法 ====================
        'no-restricted-syntax': [
            ERROR,
            'ForInStatement', // 禁止 for...in 語句
            'LabeledStatement', // 禁止標籤語句
            'WithStatement' // 禁止 with 語句
        ],

        // ==================== 物件相關規則 ====================
        'object-shorthand': WARNING, // 建議使用物件簡寫語法
        'object-curly-spacing': [ERROR, 'always'], // 物件大括號內必須有空格
        'object-curly-newline': [ERROR, { 'multiline': true, 'consistent': true }], // 多行物件的大括號換行規則

        // ==================== 引號和分號規則 ====================
        quotes: [ERROR, 'single'], // 強制使用單引號
        semi: ERROR, // 強制使用分號

        // ==================== 空語句規則 ====================
        'no-empty': [ERROR, { allowEmptyCatch: true }], // 禁止空語句，但允許空的 catch 語句

        // ==================== Import 排序規則 ====================
        'import/order': [
            ERROR,
            {
                groups: [
                    'builtin', // 內建模組 (Node.js 原生模組) 優先
                    'external', // 外部模組 (npm 套件)
                    'internal', // 內部模組 (絕對路徑)
                    ['sibling', 'parent'], // 相對路徑 (同級和父級)
                    'index', // index 檔案
                    'unknown' // 未知類型
                ],
                'newlines-between': 'always-and-inside-groups', // 不同群組之間必須有空行
                alphabetize: {
                    order: 'asc', // 按字母順序升序排列
                    caseInsensitive: true // 忽略大小寫
                },
                pathGroups: [
                    {
                        pattern: '@/**', // @ 別名路徑
                        group: 'external',
                        position: 'after'
                    },
                    {
                        pattern: 'common/**', // common 目錄
                        group: 'external',
                        position: 'after'
                    },
                    {
                        pattern: 'games/**', // games 目錄
                        group: 'external',
                        position: 'after'
                    }
                ]
            }
        ],

        // ==================== 相對路徑 Import 規則 ====================
        'no-relative-import-paths/no-relative-import-paths': [
            ERROR,
            {
                rootDir: 'assets', // 根目錄
                prefix: '@' // 使用 @ 作為前綴
            }
        ],

        // ==================== 空格相關規則 ====================
        'no-trailing-spaces': [ERROR, { ignoreComments: true }], // 禁止尾隨空格，但忽略註解

        // ==================== Import 相關規則 ====================
        'import/extensions': [
            ERROR,
            'ignorePackages',
            {
                ts: 'never', // TypeScript 檔案不需要副檔名
                tsx: 'never', // TSX 檔案不需要副檔名
                js: 'always', // JavaScript 檔案需要副檔名
                jsx: 'never' // JSX 檔案不需要副檔名
            }
        ],
        'import/prefer-default-export': OFF, // 不強制使用預設匯出
        'import/no-dynamic-require': OFF, // 允許動態 require
        'import/no-extraneous-dependencies': OFF, // 不檢查外部依賴
        'import/no-unresolved': OFF, // 不檢查模組解析 (Cocos Creator 特殊需求)

        // ==================== 關閉 ESLint 規則，改用 TypeScript-ESLint ====================
        'no-unused-vars': OFF, // 關閉 ESLint 的未使用變數檢查
        camelcase: OFF, // 關閉駝峰命名檢查
        'no-dupe-class-members': OFF, // 關閉重複類別成員檢查
        'no-use-before-define': OFF, // 關閉使用前定義檢查
        'no-redeclare': OFF, // 關閉重複宣告檢查

        // ==================== 縮排規則 ====================
        '@stylistic/indent': [
            ERROR,
            4, // 使用 4 個空格縮排
            {
                SwitchCase: 1, // switch case 縮排 1 級
                MemberExpression: 1 // 成員表達式縮排 1 級
            }
        ],

        // ==================== TypeScript 未使用變數規則 ====================
        '@typescript-eslint/no-unused-vars': [
            ERROR,
            {
                args: 'after-used', // 參數使用後才檢查
                destructuredArrayIgnorePattern: '^_', // 忽略以 _ 開頭的解構陣列元素
                argsIgnorePattern: '^_' // 忽略以 _ 開頭的參數
            }
        ],

        // ==================== TypeScript 命名規則 ====================
        '@typescript-eslint/naming-convention': [
            ERROR,
            {
                selector: 'property',
                format: null // 屬性名稱不限制格式
            }
        ],

        // ==================== TypeScript 類別成員規則 ====================
        '@typescript-eslint/no-dupe-class-members': ERROR, // 禁止重複的類別成員
        '@typescript-eslint/no-use-before-define': [
            ERROR,
            {
                ignoreTypeReferences: true, // 忽略類型引用
                typedefs: false, // 不忽略類型定義
                functions: false, // 不忽略函數
                variables: false // 不忽略變數
            }
        ],

        // ==================== TypeScript 介面規則 ====================
        '@typescript-eslint/no-empty-interface': [
            ERROR,
            { allowSingleExtends: true } // 允許單一繼承的空介面
        ],
        '@typescript-eslint/no-redeclare': [ERROR], // 禁止重複宣告

        // ==================== 關閉的規則 ====================
        'max-len': OFF, // 關閉行長度限制
        'no-undef': OFF, // 關閉未定義變數檢查
        'no-alert': OFF, // 關閉 alert 檢查
        'no-shadow': OFF, // 關閉變數遮蔽檢查
        'no-bitwise': OFF, // 關閉位運算檢查
        'global-require': OFF, // 關閉全域 require 檢查
        'no-mixed-operators': OFF, // 關閉混合運算子檢查
        'no-case-declarations': OFF, // 關閉 case 宣告檢查
        'no-underscore-dangle': OFF, // 關閉底線檢查 (Cocos Creator 使用 _decorator)
        'class-methods-use-this': OFF, // 關閉類別方法 this 檢查 (Cocos Creator 組件方法)
        'no-async-promise-executor': OFF, // 關閉非同步 Promise 執行器檢查
        '@typescript-eslint/no-this-alias': OFF, // 關閉 this 別名檢查
        '@typescript-eslint/no-var-requires': OFF, // 關閉 var require 檢查
        '@typescript-eslint/no-explicit-any': OFF, // 關閉 any 類型檢查 (Cocos Creator 常用)
        '@typescript-eslint/no-non-null-assertion': OFF, // 關閉非空斷言檢查
        '@typescript-eslint/explicit-module-boundary-types': OFF // 關閉模組邊界類型檢查
    },
    ignorePatterns: [
        'build/**', // 忽略建置目錄
        'library/**', // 忽略 Cocos Creator 庫目錄
        'temp/**', // 忽略臨時目錄
        'node_modules/**', // 忽略 node_modules
        '*.js', // 忽略根目錄的 JS 檔案
        'dist', // 忽略分發目錄
        'coverage', // 忽略覆蓋率報告目錄
        'pnpm-lock.yaml', // 忽略 pnpm 鎖定檔案
        'tools' // 忽略工具目錄
    ]
};
