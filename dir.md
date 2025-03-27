ai-bo-prototype/
│
├── public/
│   ├── index.html
│   ├── electron.js        # Electronメインプロセス
│   ├── preload.js         # Electronプリロードスクリプト
│   └── ...
│
├── src/
│   ├── components/        # 再利用可能なコンポーネント
│   │   ├── Header.js
│   │   ├── Header.css
│   │   ├── Footer.js
│   │   └── Footer.css
│   │
│   ├── context/           # Reactコンテキスト
│   │   └── ProjectContext.js
│   │
│   ├── data/              # モックデータ
│   │   └── mockData.js
│   │
│   ├── pages/             # ページコンポーネント
│   │   ├── ProjectCreation.js
│   │   ├── ProjectCreation.css
│   │   ├── RequirementsPhase.js
│   │   ├── RequirementsPhase.css
│   │   ├── DesignPhase.js
│   │   ├── DesignPhase.css
│   │   ├── ImplementationPhase.js
│   │   ├── ImplementationPhase.css
│   │   ├── Settings.js
│   │   └── Settings.css
│   │
│   ├── App.js             # メインアプリケーションコンポーネント
│   ├── App.css            # グローバルスタイル
│   ├── index.js           # エントリーポイント
│   └── index.css
│
├── assets/                # アイコンなどのアセット
│
├── package.json
└── README.md