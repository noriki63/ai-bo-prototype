// モック専門家AI
export const expertAIs = [
  {
    id: 'tech-expert',
    name: '技術専門家',
    icon: 'laptop-code',
    status: 'completed',
    expertise: ['アーキテクチャ', 'スケーラビリティ', 'パフォーマンス']
  },
  {
    id: 'security-expert',
    name: 'セキュリティ専門家',
    icon: 'shield-alt',
    status: 'completed',
    expertise: ['データ保護', '認証・認可', '脆弱性対策']
  },
  {
    id: 'business-analyst',
    name: 'ビジネスアナリスト',
    icon: 'chart-line',
    status: 'completed',
    expertise: ['業務フロー', 'ROI分析', '市場トレンド']
  },
  {
    id: 'end-user-rep',
    name: 'エンドユーザー代表',
    icon: 'user',
    status: 'completed',
    expertise: ['ユーザビリティ', 'アクセシビリティ', 'UX']
  },
  {
    id: 'maintenance-expert',
    name: '保守担当者',
    icon: 'tools',
    status: 'completed',
    expertise: ['持続可能性', 'アップグレード容易性', '長期運用']
  }
];

// モック質問データ
export const mockQuestions = {
  userRequired: [
    {
      id: 'q1',
      question: '対象ユーザーは企業内ユーザーですか、それとも一般ユーザーですか？',
      context: 'セキュリティ要件とユーザー認証方式の決定に必要です',
      priority: 'HIGH',
      expertId: 'security-expert',
      answered: false,
      answer: ''
    },
    {
      id: 'q2',
      question: '想定する同時アクセスユーザー数は最大どのくらいですか？',
      context: 'システムのスケーラビリティとパフォーマンス要件に影響します',
      priority: 'MEDIUM',
      expertId: 'tech-expert',
      answered: false,
      answer: ''
    },
    {
      id: 'q3',
      question: 'このシステムに関連する法的規制やコンプライアンス要件はありますか？',
      context: 'セキュリティとデータ保護の要件に影響します',
      priority: 'HIGH',
      expertId: 'security-expert',
      answered: false,
      answer: ''
    }
  ],
  autoAnswered: [
    {
      id: 'a1',
      question: 'モバイル対応は必要ですか？',
      answer: 'はい、モバイル対応が必要です。',
      confidence: 'HIGH',
      rationale: '現代のWebアプリケーションでは標準的に必要な機能であり、要求仕様から幅広いアクセス性が読み取れるため。',
      expertId: 'end-user-rep'
    },
    {
      id: 'a2',
      question: 'バックアップ頻度はどうあるべきか？',
      answer: '日次バックアップを推奨します。',
      confidence: 'MEDIUM',
      rationale: '一般的なビジネスアプリケーションの標準的な設定として推奨。データの重要度によっては調整が必要かもしれません。',
      expertId: 'maintenance-expert'
    },
    {
      id: 'a3',
      question: 'システムの主要言語は何にすべきか？',
      answer: '要件から見るとJavaScript/TypeScriptとReactフレームワークが適切です。',
      confidence: 'MEDIUM',
      rationale: 'Webアプリケーションの性質と要求される機能から判断しました。ただし、他の技術スタックも検討可能です。',
      expertId: 'tech-expert'
    }
  ]
};

// モック要件
export const mockRequirements = [
  {
    id: 'FR-001',
    category: '機能要件',
    description: 'ユーザー認証システムの実装',
    priority: 'MUST',
    status: 'approved',
    details: 'ユーザーがシステムにログインし、適切な権限で操作できるようにする。'
  },
  {
    id: 'FR-002',
    category: '機能要件',
    description: 'データの作成・読取・更新・削除機能',
    priority: 'MUST',
    status: 'approved',
    details: 'ユーザーがデータに対してCRUD操作を行えるようにする。'
  },
  {
    id: 'FR-003',
    category: '機能要件',
    description: 'レポート生成機能',
    priority: 'SHOULD',
    status: 'approved',
    details: 'システム内のデータを元に、様々な形式のレポートを生成できるようにする。'
  },
  {
    id: 'NFR-001',
    category: '非機能要件',
    description: 'レスポンシブデザイン対応',
    priority: 'MUST',
    status: 'approved',
    details: 'さまざまなデバイスサイズに対応するレスポンシブなUIを実装する。'
  },
  {
    id: 'NFR-002',
    category: '非機能要件',
    description: 'ページロード時間の最適化',
    priority: 'SHOULD',
    status: 'discussion',
    details: 'ページの初期ロード時間を3秒以内に抑える。'
  },
  {
    id: 'NFR-003',
    category: '非機能要件',
    description: 'データバックアップシステム',
    priority: 'MUST',
    status: 'approved',
    details: '日次でのデータバックアップを自動実行する。'
  }
];
