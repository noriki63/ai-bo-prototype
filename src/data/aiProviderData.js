/**
 * AI棒 - AIプロバイダー定義ファイル
 * このファイルには、アプリケーション全体で使用されるすべてのAIプロバイダー関連の定数が含まれています。
 * 新しいモデルやプロバイダーを追加する場合は、このファイルを更新してください。
 */

// AIプロバイダーのオプション
export const AI_PROVIDERS = [
    { id: 'openai', name: 'OpenAI (GPT-4/3.5)' },
    { id: 'anthropic', name: 'Anthropic (Claude)' },
    { id: 'azure', name: 'Azure OpenAI' },
    { id: 'google', name: 'Google Vertex AI (Gemini)' },
    { id: 'openrouter', name: 'OpenRouter (複数モデル)' },
    { id: 'local', name: 'ローカルモデル' }
  ];
  
  // プロバイダー別モデルオプション
  export const OPENAI_MODELS = [
    { value: 'gpt-4o', name: 'GPT-4o' },
    { value: 'gpt-4-turbo', name: 'GPT-4 Turbo' },
    { value: 'gpt-4', name: 'GPT-4' },
    { value: 'gpt-4-32k', name: 'GPT-4 32k' },
    { value: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo' },
    { value: 'gpt-3.5-turbo-16k', name: 'GPT-3.5 Turbo 16k' }
  ];
  
  export const ANTHROPIC_MODELS = [
    { value: 'claude-3-opus', name: 'Claude 3 Opus' },
    { value: 'claude-3-sonnet', name: 'Claude 3 Sonnet' },
    { value: 'claude-3-haiku', name: 'Claude 3 Haiku' },
    { value: 'claude-3.5-sonnet', name: 'Claude 3.5 Sonnet' },
    { value: 'claude-2', name: 'Claude 2' }
  ];
  
  export const GOOGLE_MODELS = [
    { value: 'gemini-pro', name: 'Gemini Pro' },
    { value: 'gemini-ultra', name: 'Gemini Ultra' },
    { value: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro' },
    { value: 'palm2', name: 'PaLM 2' }
  ];
  
  export const AZURE_MODELS = [
    { value: 'gpt-4o', name: 'GPT-4o' },
    { value: 'gpt-4', name: 'GPT-4' },
    { value: 'gpt-4-turbo', name: 'GPT-4 Turbo' },
    { value: 'gpt-4-32k', name: 'GPT-4 32k' },
    { value: 'gpt-35-turbo', name: 'GPT-3.5 Turbo' },
    { value: 'gpt-35-turbo-16k', name: 'GPT-3.5 Turbo 16k' },
    { value: 'o3-mini', name: 'o3-mini' }
  ];
  
  export const OPENROUTER_MODELS = [
    { value: 'openai/gpt-4o', name: 'OpenAI GPT-4o' },
    { value: 'openai/gpt-4-turbo', name: 'OpenAI GPT-4 Turbo' },
    { value: 'openai/gpt-4', name: 'OpenAI GPT-4' },
    { value: 'openai/gpt-3.5-turbo', name: 'OpenAI GPT-3.5 Turbo' },
    { value: 'anthropic/claude-3-opus', name: 'Anthropic Claude 3 Opus' },
    { value: 'anthropic/claude-3-sonnet', name: 'Anthropic Claude 3 Sonnet' },
    { value: 'anthropic/claude-3-haiku', name: 'Anthropic Claude 3 Haiku' },
    { value: 'anthropic/claude-3.5-sonnet', name: 'Anthropic Claude 3.5 Sonnet' },
    { value: 'google/gemini-pro', name: 'Google Gemini Pro' },
    { value: 'google/gemini-1.5-pro', name: 'Google Gemini 1.5 Pro' },
    { value: 'mistralai/mistral-medium', name: 'Mistral Medium' },
    { value: 'mistralai/mistral-large', name: 'Mistral Large' },
    { value: 'meta-llama/llama-3-8b-instruct', name: 'Meta Llama 3 8B Instruct' },
    { value: 'meta-llama/llama-3-70b-instruct', name: 'Meta Llama 3 70B Instruct' },
    { value: 'cohere/command-r-plus', name: 'Cohere Command R+' }
  ];
  
  // オプション設定
  export const FALLBACK_OPTIONS = [
    { value: 'retry', name: '再試行' },
    { value: 'alternateModel', name: '代替モデル' },
    { value: 'alternateProvider', name: '代替プロバイダー' },
    { value: 'none', name: 'なし' }
  ];
  
  export const GOOGLE_LOCATIONS = [
    { value: 'us-central1', name: 'us-central1 (アイオワ)' },
    { value: 'us-west1', name: 'us-west1 (オレゴン)' },
    { value: 'us-east1', name: 'us-east1 (サウスカロライナ)' },
    { value: 'europe-west1', name: 'europe-west1 (ベルギー)' },
    { value: 'europe-west2', name: 'europe-west2 (ロンドン)' },
    { value: 'europe-west4', name: 'europe-west4 (オランダ)' },
    { value: 'asia-east1', name: 'asia-east1 (台湾)' },
    { value: 'asia-northeast1', name: 'asia-northeast1 (東京)' },
    { value: 'asia-southeast1', name: 'asia-southeast1 (シンガポール)' }
  ];
  
  export const LOCAL_QUANTIZATION_OPTIONS = [
    { value: 'auto', name: '自動検出' },
    { value: 'none', name: 'なし (FP16)' },
    { value: 'q8_0', name: '8-bit (Q8_0)' },
    { value: 'q4_0', name: '4-bit (Q4_0)' },
    { value: 'q4_k_m', name: '4-bit (Q4_K_M)' }
  ];
  
  export const LOCAL_DEVICE_OPTIONS = [
    { value: 'auto', name: '自動検出' },
    { value: 'cpu', name: 'CPU' },
    { value: 'gpu', name: 'GPU' },
    { value: 'mps', name: 'MPS (Mac M1/M2)' }
  ];
  
  export const AZURE_AUTH_OPTIONS = [
    { value: 'apiKey', name: 'APIキー' },
    { value: 'azureAD', name: 'Azure AD' }
  ];
  
  export const GOOGLE_AUTH_OPTIONS = [
    { value: 'keyFile', name: 'サービスアカウントキー' },
    { value: 'oauth', name: 'OAuth認証' }
  ];
  
  // デフォルト設定
  export const DEFAULT_SETTINGS = {
    // 基本設定
    aiProvider: 'openai',
    temperature: 0.7,
    maxTokens: 4000,
    promptPrefix: '',
    
    // プロバイダー固有の設定
    // OpenAI
    apiKey: '',
    apiEndpoint: '',
    model: 'gpt-4o',
    openaiOrgId: '',
    
    // Anthropic
    anthropicApiKey: '',
    anthropicApiEndpoint: '',
    anthropicModel: 'claude-3-opus',
    
    // Azure
    azureApiKey: '',
    azureEndpoint: '',
    azureDeploymentName: '',
    azureModelType: 'gpt-4',
    azureApiVersion: '2023-05-15',
    azureAuthType: 'apiKey',
    azureTenantId: '',
    
    // Google
    googleProjectId: '',
    googleLocation: 'us-central1',
    googleKeyFile: '',
    googleKeyFilePath: '',
    googleAuthType: 'keyFile',
    googleModel: 'gemini-pro',
    
    // OpenRouter
    openrouterApiKey: '',
    openrouterModel: 'openai/gpt-4o',
    
    // ローカルモデル
    localModelPath: '',
    localQuantization: 'auto',
    localContextSize: 4096,
    localDevice: 'auto',
    
    // エラーハンドリング
    errorHandling: {
      fallbackStrategy: 'retry',
      retryCount: 3,
      retryDelay: 1000,
      alternateModel: '',
      alternateProvider: 'anthropic'
    },
    
    // カスタムモデル
    customModels: []
  };
  
  // 専門家AIのアイコン
  export const EXPERT_ICONS = {
    'tech': 'laptop-code',
    'security': 'shield-alt',
    'business': 'chart-line',
    'user': 'user',
    'maintenance': 'tools',
    'architect': 'drafting-compass',
    'database': 'database',
    'ui': 'palette',
    'devops': 'server',
    'qa': 'bug',
    'custom': 'cogs'
  };
  
  // 専門分野のオプション
  export const EXPERTISE_OPTIONS = [
    { id: 'architecture', label: 'アーキテクチャ' },
    { id: 'security', label: 'セキュリティ' },
    { id: 'performance', label: 'パフォーマンス' },
    { id: 'usability', label: 'ユーザビリティ' },
    { id: 'database', label: 'データベース' },
    { id: 'frontend', label: 'フロントエンド' },
    { id: 'backend', label: 'バックエンド' },
    { id: 'mobile', label: 'モバイル' },
    { id: 'api', label: 'API設計' },
    { id: 'testing', label: 'テスト' },
    { id: 'devops', label: 'DevOps' },
    { id: 'business', label: 'ビジネス要件' },
    { id: 'compliance', label: 'コンプライアンス' },
    { id: 'accessibility', label: '​アクセシビリティ' },
    { id: 'maintenance', label: '保守性' },
    { id: 'scalability', label: 'スケーラビリティ' }
  ];
  
  // ヘルパー関数
  export const getModelOptionsForProvider = (providerId) => {
    switch (providerId) {
      case 'openai':
        return OPENAI_MODELS;
      case 'anthropic':
        return ANTHROPIC_MODELS;
      case 'azure':
        return AZURE_MODELS;
      case 'google':
        return GOOGLE_MODELS;
      case 'openrouter':
        return OPENROUTER_MODELS;
      case 'local':
        return [{ value: 'local-model', name: 'ローカルモデル' }];
      default:
        return [];
    }
  };
  
  export const getDefaultModelForProvider = (providerId) => {
    switch (providerId) {
      case 'openai':
        return 'gpt-4o';
      case 'anthropic':
        return 'claude-3-opus';
      case 'google':
        return 'gemini-pro';
      case 'openrouter':
        return 'openai/gpt-4o';
      case 'local':
        return 'local-model';
      default:
        return '';
    }
  };
  
  // 特定のプロバイダーに表示する必須設定項目
  export const PROVIDER_REQUIRED_FIELDS = {
    openai: ['apiKey'],
    anthropic: ['apiKey'],
    azure: ['azureApiKey', 'azureEndpoint', 'azureDeploymentName'],
    google: ['googleProjectId', 'googleLocation'],
    openrouter: ['openrouterApiKey', 'openrouterModel'],
    local: ['localModelPath']
  };
  
  // 特定のプロバイダーに表示する詳細設定項目
  export const PROVIDER_ADVANCED_FIELDS = {
    openai: ['openaiOrgId', 'promptPrefix'],
    anthropic: ['promptPrefix'],
    azure: ['azureModelType', 'azureApiVersion', 'azureAuthType', 'azureTenantId', 'promptPrefix'],
    google: ['googleAuthType', 'promptPrefix'],
    openrouter: ['promptPrefix'],
    local: ['localQuantization', 'localContextSize', 'localDevice', 'promptPrefix']
  };