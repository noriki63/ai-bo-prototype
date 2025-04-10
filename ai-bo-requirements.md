# AI棒 プロジェクト要件定義書 (更新版)

## 1. プロジェクト概要

### 1.1 目的
AI棒は、ユーザーの要求仕様から完全なシステム構築までをAIがサポートするジェネレーターである。要件定義から設計、実装、環境構築、テスト、ビルド、デプロイまでの全工程をAIが支援し、技術的知識が限られたユーザーでも高品質なシステム開発を実現することを目的とする。

### 1.2 システム概念
- 複数のAI（専門家AI、まとめAI）による並列処理と統合アプローチ
- ユーザーのローカル端末で動作し、ローカル環境への構築を自動化
- 段階的な承認プロセスによる品質管理
- イテレーション式の繰り返し処理による要件・設計の精緻化

### 1.3 ステークホルダー
- エンドユーザー（開発者、技術的知識の少ないビジネスユーザー）
- システム管理者
- プロジェクトマネージャー

## 2. システムアーキテクチャ

### 2.1 全体構成
- フロントエンドUI（操作・可視化インターフェース）
- AIエンジン（専門家AI、まとめAI）
- ナレッジベース（パターン・テンプレート・過去の成功事例）
- コード生成・管理システム
- 環境構築エンジン

### 2.2 実行環境
- デスクトップアプリケーション形式（Electron）
- ローカル端末で実行し、必要に応じてAI APIと連携
- 環境構築やテストはローカル端末上で実行

### 2.3 処理フロー
1. 要求仕様入力（最小限の情報から開始）
2. 要件定義フェーズ（複数AIによる並列分析と統合、イテレーション処理）
3. 設計フェーズ（要件をもとにした詳細設計、イテレーション処理）
4. 実装・環境構築フェーズ（タスク分割と並列実装）
5. テストフェーズ（自動テスト生成と実行）
6. ビルド・デプロイフェーズ（目的環境への展開）
7. メンテナンスモード（既存システムの拡張・更新）

## 3. 機能要件

### 3.1 要件定義フェーズ

#### 3.1.1 専門家AI
- **FR-001**: 専門家AIの数を1〜5名の間でユーザーが設定可能とすること
- **FR-002**: 専門家AI用のペルソナをカスタマイズ可能とすること
- **FR-003**: テンプレートペルソナ（技術専門家、ビジネスアナリスト、セキュリティ専門家など）を提供すること
- **FR-004**: 各専門家AIに使用するAIモデルを個別に設定可能とすること
- **FR-005**: 各専門家AIが要求仕様に対する解釈・疑問点・要件提案を生成すること
- **FR-006**: 各専門家AIが生成した質問にユーザー回答が必要かどうかを判定すること

#### 3.1.2 まとめAI
- **FR-007**: 各専門家AIの意見を収集し統合すること
- **FR-008**: 要件間の依存関係を分析・可視化すること
- **FR-009**: 要件の優先順位付けをMoSCoW法などで行うこと
- **FR-010**: 対立する要件を検出し解決策を提案すること
- **FR-011**: 疑問点をカテゴリ別に整理し、優先度を設定すること
- **FR-012**: ユーザー回答が不要な質問に自動的に回答すること
- **FR-013**: 自動回答の信頼度を示し、ユーザーによる確認・修正を可能にすること
- **FR-014**: ユーザー必須の質問と自動回答済みの質問を区別して表示すること
- **FR-015**: 専門家AIの意見の一致度を計算し表示すること

#### 3.1.3 要件管理
- **FR-016**: 要件定義の反復プロセスを管理すること（質問→回答→再検討→合意）
- **FR-017**: 現在のイテレーション回数と総イテレーション回数を表示すること
- **FR-018**: 要件定義ドキュメントをMarkdown形式で生成・表示すること
- **FR-019**: ユーザーのフィードバックと承認プロセスを提供すること
- **FR-020**: 承認された要件を次フェーズに受け渡すこと
- **FR-021**: 「要件を追加してやり直す」機能を提供し、追加要件の入力インターフェースを表示すること
- **FR-022**: 追加要件入力後にイテレーションをリセットし、再度検討プロセスを開始すること

### 3.2 設計フェーズ

#### 3.2.1 専門家AI（設計）
- **FR-023**: 設計フェーズでも専門家AIの数を1〜5名の間でユーザーが設定可能とすること
- **FR-024**: 設計専門のペルソナ（システムアーキテクト、データベース設計者、UIデザイナーなど）を提供すること
- **FR-025**: 各設計専門家AIに使用するAIモデルを個別に設定可能とすること
- **FR-026**: 要件定義に基づき、各領域の最適設計を担当AIが提案すること

#### 3.2.2 まとめAI（設計）
- **FR-027**: 各専門設計の整合性を検証・調整すること
- **FR-028**: 設計間の矛盾・衝突を検出し解決すること
- **FR-029**: 要件定義との適合性を確認すること
- **FR-030**: 実装の現実性・実現可能性を評価すること
- **FR-031**: 設計専門家AIの意見の一致度を計算し表示すること

#### 3.2.3 設計プロセス管理
- **FR-032**: 設計の反復プロセスを管理すること
- **FR-033**: 現在のイテレーション回数と総イテレーション回数を表示すること
- **FR-034**: 「設計を追加してやり直す」機能を提供し、追加設計要望の入力インターフェースを表示すること
- **FR-035**: 追加設計要望入力後にイテレーションをリセットし、再度設計プロセスを開始すること

#### 3.2.4 設計成果物
- **FR-036**: システム設計書をMarkdown形式で生成すること
- **FR-037**: データモデル図をMermaid記法で生成すること
- **FR-038**: アーキテクチャ図をMermaid記法で生成すること
- **FR-039**: 画面設計/ワイヤーフレームを適切な形式で生成すること
- **FR-040**: API仕様書を生成すること
- **FR-041**: 非機能要件に関する設計（性能、セキュリティなど）を含めること

### 3.3 実装・環境構築フェーズ

#### 3.3.1 タスク分割
- **FR-042**: 設計書を解析し実装タスクを最適な粒度で分割すること
- **FR-043**: タスク間の依存関係を特定しグラフ化すること
- **FR-044**: 各タスクの難易度と工数を見積もること
- **FR-045**: タスクの性質（フロントエンド、バックエンド、DB等）を自動分析すること
- **FR-046**: 各タスクに最適な専門家AIペルソナを自動割り当てること
- **FR-047**: 複合的なタスクには複数ペルソナの協働体制を構築すること

#### 3.3.2 コード生成
- **FR-048**: 分割されたタスクに基づき並列でコード生成を行うこと
- **FR-049**: タスクに割り当てられた最適ペルソナによる専門的実装を行うこと
- **FR-050**: 生成コードを統合し整合性を確保すること
- **FR-051**: インターフェース定義の厳格な検証を行うこと
- **FR-052**: 名前空間/変数名の衝突を検出・解決すること
- **FR-053**: ペルソナ間の知識共有と協調実装を可能にすること

#### 3.3.3 環境構築
- **FR-054**: ユーザーのOS・環境を自動検出すること
- **FR-055**: 必要な言語、フレームワーク、ライブラリを特定すること
- **FR-056**: 環境構築用のスクリプトを自動生成すること
- **FR-057**: Docker/仮想環境の構築オプションを提供すること
- **FR-058**: クロスプラットフォーム対応（Windows/Mac/Linux）を確保すること
- **FR-059**: インフラ・環境構築専門のペルソナを活用すること

### 3.4 テストフェーズ

#### 3.4.1 テスト計画と設計
- **FR-060**: 要件定義と設計に基づくテスト項目を自動生成すること
- **FR-061**: 機能要件と非機能要件のテストケースを作成すること
- **FR-062**: テスト優先順位と実行順序を最適化すること

#### 3.4.2 テスト実行
- **FR-063**: 単体テスト（コードレベル）を自動生成・実行すること
- **FR-064**: 結合テスト（コンポーネント間）を実行すること
- **FR-065**: UIテスト（画面・操作フロー）を実行すること
- **FR-066**: 性能テスト（負荷・ストレス）を実行すること
- **FR-067**: セキュリティテスト（脆弱性検査）を実行すること

#### 3.4.3 テスト結果管理
- **FR-068**: テスト結果を収集・分析・可視化すること
- **FR-069**: 失敗したテストの原因を分析すること
- **FR-070**: エラーの種類に応じた対応経路を決定すること
  - 軽微なエラー：テストフェーズ内で修正
  - 中程度のエラー：部分的に実装フェーズに戻る
  - 重大なエラー：実装フェーズ全体に立ち返る
- **FR-071**: テスト報告書とカバレッジレポートを生成すること

### 3.5 ビルド・デプロイフェーズ

#### 3.5.1 ビルドプロセス
- **FR-072**: プロジェクト特性に応じた最適なビルド構成を生成すること
- **FR-073**: 言語/フレームワーク別のビルドツールを選定・実行すること
- **FR-074**: ビルドログを解析し問題点を自動修正すること
- **FR-075**: 成果物（バイナリ/パッケージ）を生成・検証すること

#### 3.5.2 デプロイ環境管理
- **FR-076**: 複数のデプロイ環境オプションを提供すること
  - クラウドサービス（AWS/Azure/GCP/Heroku）
  - コンテナオーケストレーション
  - 仮想サーバー/ベアメタル
  - サーバーレス
  - 静的ホスティング
- **FR-077**: 既存環境の自動検出と再利用提案を行うこと
- **FR-078**: 必要なアクセス権と認証情報を管理すること

#### 3.5.3 デプロイ自動化
- **FR-079**: IaC（Infrastructure as Code）テンプレートを自動作成すること
- **FR-080**: 環境固有の設定ファイルを生成すること
- **FR-081**: シークレット管理の提案を行うこと
- **FR-082**: 段階的デプロイプランを作成すること
- **FR-083**: ロールバック戦略を自動設計すること
- **FR-084**: カナリアリリース/ブルーグリーンデプロイのオプションを提供すること

#### 3.5.4 運用監視
- **FR-085**: 主要指標（KPI）の自動検出と監視設定を行うこと
- **FR-086**: アラート閾値の推奨設定を提供すること
- **FR-087**: ログ収集/分析の構成を自動化すること

### 3.6 メンテナンスモード

#### 3.6.1 既存システム分析
- **FR-088**: 既存コードの構造を自動マッピングすること
- **FR-089**: コードスタイルと命名規則を学習・適応すること
- **FR-090**: 技術スタックを自動検出すること
- **FR-091**: ドキュメント不足時に設計を逆推論すること

#### 3.6.2 更新・拡張
- **FR-092**: 変更の波及効果をシミュレーションすること
- **FR-093**: 変更リスクを評価すること
- **FR-094**: 段階的機能追加の支援を行うこと
- **FR-095**: 後方互換性を維持した拡張設計を提供すること
- **FR-096**: 技術的負債を検出し改善提案を行うこと

#### 3.6.3 統合管理
- **FR-097**: AI生成コードと手書きコードの共存を可能にすること
- **FR-098**: 既存スタイルに適応した生成を行うこと
- **FR-099**: 段階的置き換え計画を策定すること
- **FR-100**: 問題発生時のロールバック戦略を提供すること

### 3.7 AI API設定

#### 3.7.1 プロバイダー管理
- **FR-101**: 複数のAIプロバイダーをサポートすること
  - OpenAI (GPT-4/GPT-3.5)
  - Anthropic (Claude)
  - Azure OpenAI
  - Google VertexAI (Gemini)
  - OpenRouter
  - ローカルモデル
- **FR-102**: 各プロバイダーの認証情報を設定・保存すること
- **FR-103**: API接続テスト機能を提供すること

#### 3.7.2 モデル設定
- **FR-104**: 各プロバイダーの利用可能なモデルを選択できること
- **FR-105**: AIパラメータ（温度、最大トークン数など）を調整できること
- **FR-106**: カスタムモデルの追加ができること
- **FR-107**: 専門家AIごとに異なるモデルを割り当て可能にすること

### 3.8 ロギングとデバッグ機能

#### 3.8.1 ログ管理
- **FR-110**: アプリケーション実行中のすべての処理をログとして記録すること
- **FR-111**: ログを重要度別（DEBUG, INFO, WARN, ERROR, FATAL）に分類すること
- **FR-112**: ログファイルを自動ローテーションすること（最大サイズ5MB）
- **FR-113**: エラーログを別ファイルに分離して管理すること

#### 3.8.2 ログビューア
- **FR-114**: ログファイルの内容を表示するビューアを提供すること
- **FR-115**: 表示行数を調整可能にすること（50, 100, 500, 1000行）
- **FR-116**: 自動更新機能を提供すること（無効, 5秒, 10秒, 30秒, 1分）
- **FR-117**: ログレベルをUIから変更可能にすること
- **FR-118**: ログファイル一覧を表示し、メタデータ（サイズ、更新日時）を確認できること

### 3.9 システム診断と情報表示

#### 3.9.1 システム情報収集
- **FR-119**: OS情報（プラットフォーム、バージョン）を自動検出すること
- **FR-120**: ハードウェア情報（プロセッサ、メモリ）を自動検出すること
- **FR-121**: 検出したシステム情報を設定画面に表示すること

#### 3.9.2 診断機能
- **FR-122**: API接続テスト機能を各プロバイダーごとに提供すること
- **FR-123**: テスト結果を視覚的にわかりやすく表示すること
- **FR-124**: Electron環境の初期化状態を診断する機能を提供すること
- **FR-125**: APIの状態確認と診断結果のログ出力を行うこと

## 4. 非機能要件

### 4.1 ユーザビリティ
- **NFR-001**: 最小限の入力（プロジェクト概要のみ）で開始できること
- **NFR-002**: 直感的なユーザーインターフェースを提供すること
- **NFR-003**: 進行状況をリアルタイムで可視化すること
- **NFR-004**: 各フェーズの切り替えをスムーズに行うこと
- **NFR-005**: 技術的知識に関わらず使用できること
- **NFR-006**: 専門家AIのペルソナ設定を視覚的に行えること
- **NFR-007**: 要件定義フェーズの初期応答を30秒以内に開始し、処理状況を可視化すること
- **NFR-033**: 処理の進行状況をリアルタイムで表示し、ユーザーに適切なフィードバックを提供すること
- **NFR-034**: 各フェーズでの実行モード（実APIモード/シミュレーションモード）を切り替え可能にすること
- **NFR-035**: モバイル・タブレット環境を考慮したレスポンシブデザインを実装すること

### 4.2 パフォーマンス
- **NFR-007**: 要件定義フェーズの初期応答を30秒以内に開始すること
- **NFR-008**: ローカル実行のための最適化を行うこと
- **NFR-009**: リソース使用量をユーザーに表示・制御可能にすること
- **NFR-010**: 大規模プロジェクトでも安定して動作すること

### 4.3 拡張性
- **NFR-011**: 新しい言語・フレームワークのサポートを容易に追加できること
- **NFR-012**: サードパーティツールとの統合インターフェースを提供すること
- **NFR-013**: プラグインによる機能拡張を可能にすること
- **NFR-014**: 新しいAIプロバイダーを追加できるアーキテクチャを提供すること

### 4.4 可用性
- **NFR-015**: オフライン環境でも基本機能を使用可能にすること
- **NFR-016**: クラッシュからの自動復旧機能を提供すること
- **NFR-017**: 長時間処理の中断・再開を可能にすること

### 4.5 セキュリティ
- **NFR-018**: 生成コードのセキュリティ検証を自動実行すること
- **NFR-019**: ユーザーデータをローカルに保持し、外部漏洩を防止すること
- **NFR-020**: API認証情報を安全に管理すること
- **NFR-021**: 生成コードの脆弱性を検出し修正提案を行うこと

### 4.6 互換性
- **NFR-022**: 主要OS（Windows、macOS、Linux）で動作すること
- **NFR-023**: 一般的な開発環境・ツールと連携可能であること
- **NFR-024**: 業界標準の形式・プロトコルに準拠すること

### 4.7 リソース要件
- **NFR-025**: ライトモード：CPU 4コア、RAM 8GB以上で動作すること
- **NFR-026**: スタンダードモード：CPU 8コア、RAM 16GB以上で推奨動作すること
- **NFR-027**: プロフェッショナルモード：CPU 12コア、RAM 32GB以上で最適動作すること
- **NFR-028**: ハードウェアに応じた機能制限・拡張を自動調整すること

### 4.8 障害耐性とエラーハンドリング
- **NFR-029**: API接続エラー時に自動再試行機能を提供すること
- **NFR-030**: エラー発生時にシミュレーションモードへの切り替えを可能にすること
- **NFR-031**: エラーメッセージを適切に表示し、ユーザーに対処方法を提案すること
- **NFR-032**: 重要なコンポーネントの初期化失敗時にフォールバック機能を提供すること
- **NFR-033**: 障害からの復旧が可能なAPIデザインを実装すること

## 5. 技術要件

### 5.1 多言語・多フレームワーク対応
- **TR-001**: Tier 1言語（完全サポート）：JavaScript/TypeScript, Python, Java, C#
- **TR-002**: Tier 1フレームワーク：React, Vue, Angular, Django, Spring Boot, .NET Core
- **TR-003**: Tier 2言語（標準サポート）：PHP, Ruby, Go, Kotlin, Swift
- **TR-004**: Tier 2フレームワーク：Laravel, Rails, Gin, Flutter
- **TR-005**: Tier 3（基本サポート）：その他主要言語・フレームワーク

### 5.2 バージョン管理統合
- **TR-006**: Git連携基盤を実装すること
- **TR-007**: 複数VCS（Git, Mercurial, SVN）対応を行うこと
- **TR-008**: 主要クラウドサービス（GitHub, GitLab, Bitbucket）との連携を提供すること
- **TR-009**: 意味のあるコミット・ブランチ戦略を自動化すること

### 5.3 ドキュメント生成
- **TR-010**: 段階別ドキュメント（要件、設計、実装、運用）を自動生成すること
- **TR-011**: 多様な出力形式（Markdown, HTML, PDF）をサポートすること
- **TR-012**: コードドキュメンテーションを言語別規約に従い生成すること
- **TR-013**: API仕様書をOpenAPI/Swagger形式で提供すること

### 5.4 ライセンス管理
- **TR-014**: デフォルトでMITライセンスを適用すること
- **TR-015**: 商用/オープンソース用の複数ライセンスオプションを提供すること
- **TR-016**: 依存OSSのライセンス追跡と互換性チェックを行うこと
- **TR-017**: ライセンス情報の透明化（ヘッダー、ファイル生成）を行うこと

### 5.5 デスクトップアプリケーション実装
- **TR-018**: Electronを用いたデスクトップアプリケーションとして実装すること
- **TR-019**: ローカルファイルシステムへのアクセス機能を提供すること
- **TR-020**: プロセス実行やシェルコマンド発行機能を提供すること
- **TR-021**: システム情報（OS、メモリ、CPU）を検出し活用すること
- **TR-022**: Electronベースのアプリケーションでプロセス間通信を最適化すること
- **TR-023**: メインプロセスとレンダラープロセス間の安全な通信を確保すること
- **TR-024**: システムファイル操作とユーザーファイル操作のセキュリティを確保すること
- **TR-025**: アプリケーションの起動処理を最適化し、起動時間を短縮すること
- **TR-026**: 適切なプリロードスクリプトを実装し、セキュアなコンテキスト分離を実現すること

## 6. 制約条件

### 6.1 開発制約
- **CON-001**: ローカル端末での実行を前提とすること
- **CON-002**: クロスプラットフォーム（Windows, macOS, Linux）で動作すること
- **CON-003**: オフライン動作の基本機能を確保すること

### 6.2 インターフェース制約
- **CON-004**: 主要なドキュメントはMarkdown形式で提供すること
- **CON-005**: 図表表現にはMermaid記法を活用すること
- **CON-006**: UIは直感的で学習コストの低いデザインとすること

### 6.3 API制約
- **CON-007**: API認証情報はローカルに暗号化保存すること
- **CON-008**: API利用量とコストを監視・表示する機能を提供すること
- **CON-009**: API障害時の代替動作を提供すること

## 7. 用語集

- **専門家AI**: 特定ドメインや役割の視点から要件・設計を分析するAI
- **まとめAI**: 複数の専門家AIの意見を集約・統合するAI
- **ペルソナ**: AIが分析時に採用する特定の役割や視点
- **Tierレベル**: 言語・フレームワークのサポート程度を示す区分
- **MoSCoW法**: Must have, Should have, Could have, Won't haveの優先度分類法
- **一致度**: 専門家AI間の意見の合意度合いを示す指標
- **イテレーション**: 要件定義や設計の反復サイクル
- **シミュレーションモード**: 実際のAPI呼び出しをせずに動作をシミュレートするモード
- **ログローテーション**: ログファイルが一定サイズに達した際に自動的に新しいファイルを作成する機能