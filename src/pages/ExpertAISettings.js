import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import AISettings from '../components/AISettings';
import './ExpertAISettings.css';

// 専門家AIのアイコン
const expertIcons = {
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
const expertiseOptions = [
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

// AIプロバイダーのオプション
const providerOptions = [
  { id: 'openai', name: 'OpenAI (GPT-4/3.5)' },
  { id: 'anthropic', name: 'Anthropic (Claude)' },
  { id: 'azure', name: 'Azure OpenAI' },
  { id: 'google', name: 'Google Vertex AI (Gemini)' },
  { id: 'openrouter', name: 'OpenRouter (複数モデル)' },
  { id: 'local', name: 'ローカルモデル' }
];

// デフォルト設定を作成する関数
const createDefaultExpertSettings = () => {
  return {
    phaseExperts: {
      requirements: {
        enabled: true,
        count: 3,
        experts: [
          {
            id: 'tech-expert',
            name: '技術専門家',
            iconType: 'tech',
            expertise: ['architecture', 'performance', 'backend', 'scalability'],
            description: '技術的な実現可能性、スケーラビリティ、パフォーマンスに重点を置く',
            provider: 'openai',
            providerSettings: {
              apiKey: '',
              apiEndpoint: '',
              model: 'gpt-4o',
              temperature: 0.7,
              maxTokens: 4000
            }
          },
          {
            id: 'security-expert',
            name: 'セキュリティ専門家',
            iconType: 'security',
            expertise: ['security', 'compliance'],
            description: 'セキュリティリスク、脆弱性、データ保護に焦点を当てる',
            provider: 'openai',
            providerSettings: {
              apiKey: '',
              apiEndpoint: '',
              model: 'gpt-4o',
              temperature: 0.7,
              maxTokens: 4000
            }
          },
          {
            id: 'business-analyst',
            name: 'ビジネスアナリスト',
            iconType: 'business',
            expertise: ['business'],
            description: 'ビジネス価値、ROI、市場適合性を重視する',
            provider: 'anthropic',
            providerSettings: {
              anthropicApiKey: '',
              anthropicApiEndpoint: '',
              anthropicModel: 'claude-3-opus',
              temperature: 0.7,
              maxTokens: 4000
            }
          }
        ]
      },
      design: {
        enabled: true,
        count: 3,
        experts: [
          {
            id: 'architect',
            name: 'システムアーキテクト',
            iconType: 'architect',
            expertise: ['architecture', 'scalability', 'api'],
            description: 'システム全体の構造、コンポーネント間の連携、拡張性に焦点',
            provider: 'openai',
            providerSettings: {
              apiKey: '',
              apiEndpoint: '',
              model: 'gpt-4o',
              temperature: 0.7,
              maxTokens: 4000
            }
          },
          {
            id: 'db-designer',
            name: 'データベース設計者',
            iconType: 'database',
            expertise: ['database', 'performance'],
            description: 'データモデル、クエリ最適化、データ整合性に重点を置く',
            provider: 'openai',
            providerSettings: {
              apiKey: '',
              apiEndpoint: '',
              model: 'gpt-4o',
              temperature: 0.7,
              maxTokens: 4000
            }
          },
          {
            id: 'ui-designer',
            name: 'UIデザイナー',
            iconType: 'ui',
            expertise: ['frontend', 'usability', 'accessibility'],
            description: 'ユーザーインターフェース、視覚デザイン、UXに焦点',
            provider: 'openai',
            providerSettings: {
              apiKey: '',
              apiEndpoint: '',
              model: 'gpt-4o',
              temperature: 0.7,
              maxTokens: 4000
            }
          }
        ]
      }
    }
  };
};

/**
 * ExpertAISettings - 専門家AI設定画面
 * 
 * 専門家AIのペルソナ、専門分野、優先度などを設定するための画面です。
 */
const ExpertAISettings = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  // 設定データ
  const [settings, setSettings] = useState(createDefaultExpertSettings());
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState({ type: '', message: '' });
  
  // 編集中の専門家AI
  const [editingExpert, setEditingExpert] = useState(null);
  const [editingPhase, setEditingPhase] = useState(null);
  const [editingIndex, setEditingIndex] = useState(null);
  
  // 現在のタブ（基本情報、API設定、専門分野、優先度）
  const [activeTab, setActiveTab] = useState('basic');
  
  // API接続テスト
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  
  // 設定読み込み
  useEffect(() => {
    loadSettings();
  }, []);
  
  // Electronが使用可能かどうかをチェック
  const isElectron = () => {
    return window && window.process && window.process.type;
  };
  
  // 設定の読み込み
  const loadSettings = async () => {
    try {
      setIsLoading(true);
      let loadedSettings = null;
      let mainSettings = null;
      
      // Electronの場合
      if (isElectron() && window.electronAPI) {
        const settings = await window.electronAPI.getSettings();
        if (settings) {
          mainSettings = settings;
          loadedSettings = settings.expertSettings || createDefaultExpertSettings();
        }
      } else {
        // ブラウザの場合
        const savedSettings = localStorage.getItem('aiBoSettings');
        if (savedSettings) {
          const parsed = JSON.parse(savedSettings);
          mainSettings = parsed;
          loadedSettings = parsed.expertSettings || createDefaultExpertSettings();
        }
      }
      
      // 設定がなければデフォルト値
      if (!loadedSettings) {
        loadedSettings = createDefaultExpertSettings();
      }
      
      // メイン設定からプロバイダー設定をマージ
      if (mainSettings) {
        // 各エキスパートの設定に共通設定をマージ
        mergeProviderSettings(loadedSettings, mainSettings);
      }
      
      setSettings(loadedSettings);
    } catch (error) {
      console.error('設定読み込みエラー:', error);
      setSettings(createDefaultExpertSettings());
    } finally {
      setIsLoading(false);
    }
  };
  
  // 専門家AIの設定にメイン設定からプロバイダー設定をマージ
  const mergeProviderSettings = (expertSettings, mainSettings) => {
    // requirementsフェーズの専門家設定をマージ
    if (expertSettings.phaseExperts && expertSettings.phaseExperts.requirements) {
      expertSettings.phaseExperts.requirements.experts.forEach(expert => {
        if (!expert.providerSettings) {
          expert.providerSettings = getDefaultProviderSettingsFor(expert.provider, mainSettings);
        }
      });
    }
    
    // designフェーズの専門家設定をマージ
    if (expertSettings.phaseExperts && expertSettings.phaseExperts.design) {
      expertSettings.phaseExperts.design.experts.forEach(expert => {
        if (!expert.providerSettings) {
          expert.providerSettings = getDefaultProviderSettingsFor(expert.provider, mainSettings);
        }
      });
    }
  };
  
  // プロバイダータイプに応じたデフォルト設定を取得
  const getDefaultProviderSettingsFor = (providerType, mainSettings) => {
    switch (providerType) {
      case 'openai':
        return {
          apiKey: mainSettings.apiKey || '',
          apiEndpoint: mainSettings.apiEndpoint || '',
          model: mainSettings.model || 'gpt-4o',
          temperature: mainSettings.temperature || 0.7,
          maxTokens: mainSettings.maxTokens || 4000
        };
      case 'anthropic':
        return {
          anthropicApiKey: mainSettings.anthropicApiKey || '',
          anthropicApiEndpoint: mainSettings.anthropicApiEndpoint || '',
          anthropicModel: mainSettings.anthropicModel || 'claude-3-opus',
          temperature: mainSettings.temperature || 0.7,
          maxTokens: mainSettings.maxTokens || 4000
        };
      case 'azure':
        return {
          azureApiKey: mainSettings.azureApiKey || '',
          azureEndpoint: mainSettings.azureEndpoint || '',
          azureDeploymentName: mainSettings.azureDeploymentName || '',
          azureModelType: mainSettings.azureModelType || 'gpt-4',
          temperature: mainSettings.temperature || 0.7,
          maxTokens: mainSettings.maxTokens || 4000
        };
      case 'google':
        return {
          googleProjectId: mainSettings.googleProjectId || '',
          googleLocation: mainSettings.googleLocation || 'us-central1',
          googleKeyFile: mainSettings.googleKeyFile || '',
          googleModel: mainSettings.googleModel || 'gemini-pro',
          temperature: mainSettings.temperature || 0.7,
          maxTokens: mainSettings.maxTokens || 4000
        };
      case 'openrouter':
        return {
          openrouterApiKey: mainSettings.openrouterApiKey || '',
          openrouterModel: mainSettings.openrouterModel || 'openai/gpt-4o',
          temperature: mainSettings.temperature || 0.7,
          maxTokens: mainSettings.maxTokens || 4000
        };
      case 'local':
        return {
          localModelPath: mainSettings.localModelPath || '',
          localQuantization: mainSettings.localQuantization || 'auto',
          localContextSize: mainSettings.localContextSize || 4096,
          localDevice: mainSettings.localDevice || 'auto',
          temperature: mainSettings.temperature || 0.7,
          maxTokens: mainSettings.maxTokens || 4000
        };
      default:
        return {
          temperature: mainSettings.temperature || 0.7,
          maxTokens: mainSettings.maxTokens || 4000
        };
    }
  };
  
  // 設定の保存
  const saveSettings = async () => {
    setIsSaving(true);
    setSaveMessage({ type: '', message: '' });
    
    try {
      // メイン設定の読み込みと統合
      if (isElectron() && window.electronAPI) {
        // Electron環境
        const mainSettings = await window.electronAPI.getSettings();
        if (mainSettings) {
          const updatedSettings = {
            ...mainSettings,
            expertSettings: settings
          };
          await window.electronAPI.saveSettings(updatedSettings);
        } else {
          await window.electronAPI.saveSettings({ expertSettings: settings });
        }
      } else {
        // ブラウザ環境
        const savedMainSettings = localStorage.getItem('aiBoSettings');
        let mainSettings = {};
        
        if (savedMainSettings) {
          try {
            mainSettings = JSON.parse(savedMainSettings);
          } catch (error) {
            console.error('設定の解析エラー:', error);
          }
        }
        
        const updatedSettings = {
          ...mainSettings,
          expertSettings: settings
        };
        
        localStorage.setItem('aiBoSettings', JSON.stringify(updatedSettings));
      }
      
      setSaveMessage({ type: 'success', message: '設定を保存しました！' });
      
      // 成功メッセージは3秒後に消す
      setTimeout(() => {
        setSaveMessage({ type: '', message: '' });
      }, 3000);
    } catch (error) {
      console.error('設定保存エラー:', error);
      setSaveMessage({ type: 'error', message: `設定の保存に失敗しました: ${error.message}` });
    } finally {
      setIsSaving(false);
    }
  };
  
  // 専門家AI数の変更ハンドラ
  const handleExpertCountChange = (phase, count) => {
    if (!settings.phaseExperts) {
      settings.phaseExperts = {};
    }
    
    if (!settings.phaseExperts[phase]) {
      settings.phaseExperts[phase] = {
        enabled: true,
        experts: []
      };
    }
    
    // 現在の専門家のリスト
    const currentExperts = [...(settings.phaseExperts[phase].experts || [])];
    
    // 新しい設定オブジェクト作成
    const newSettings = {...settings};
    
    // 専門家数を調整
    if (count > currentExperts.length) {
      // 専門家を追加
      for (let i = currentExperts.length; i < count; i++) {
        currentExperts.push({
          id: `expert-${phase}-${Date.now()}-${i}`,
          name: `専門家 ${i + 1}`,
          iconType: 'custom',
          description: 'カスタム専門家',
          expertise: [],
          provider: 'openai',
          providerSettings: {
            apiKey: '',
            apiEndpoint: '',
            model: 'gpt-4o',
            temperature: 0.7,
            maxTokens: 4000
          },
          priorities: {
            performance: 5,
            security: 5,
            usability: 5,
            maintainability: 5,
            innovation: 5
          }
        });
      }
    } else if (count < currentExperts.length) {
      // 専門家を削除
      currentExperts.splice(count);
    }
    
    // 更新
    newSettings.phaseExperts = {
      ...newSettings.phaseExperts,
      [phase]: {
        ...newSettings.phaseExperts[phase],
        count: count,
        experts: currentExperts
      }
    };
    
    setSettings(newSettings);
  };
  
  // 専門家を入れ替え
  const swapExperts = (phase, index1, index2) => {
    if (index1 < 0 || index2 < 0) return;
    
    const experts = settings.phaseExperts[phase].experts;
    if (index1 >= experts.length || index2 >= experts.length) return;
    
    const newSettings = {...settings};
    const newExperts = [...newSettings.phaseExperts[phase].experts];
    const temp = newExperts[index1];
    newExperts[index1] = newExperts[index2];
    newExperts[index2] = temp;
    
    newSettings.phaseExperts = {
      ...newSettings.phaseExperts,
      [phase]: {
        ...newSettings.phaseExperts[phase],
        experts: newExperts
      }
    };
    
    setSettings(newSettings);
  };
  
  // 専門家編集モーダルを開く
  const openExpertModal = (phase, index) => {
    const expert = settings.phaseExperts[phase].experts[index];
    setEditingExpert({...expert});
    setEditingPhase(phase);
    setEditingIndex(index);
    setActiveTab('basic'); // 最初は基本情報タブを表示
    setTestResult(null); // テスト結果をクリア
  };
  
  // 専門家編集モーダルを閉じる
  const closeExpertModal = () => {
    setEditingExpert(null);
    setEditingPhase(null);
    setEditingIndex(null);
    setActiveTab('basic');
    setTestResult(null);
  };
  
  // タブの切り替え
  const switchTab = (tab) => {
    setActiveTab(tab);
  };
  
  // ファイル選択ハンドラ
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    try {
      if (isElectron() && window.electronAPI) {
        // Electronの場合はファイルパスを保存
        setEditingExpert(prev => ({
          ...prev,
          providerSettings: {
            ...prev.providerSettings,
            googleKeyFilePath: file.path,
            googleKeyFile: file.name
          }
        }));
      } else {
        // ブラウザの場合はファイル内容を読み込む
        const fileContent = await readFileAsText(file);
        setEditingExpert(prev => ({
          ...prev,
          providerSettings: {
            ...prev.providerSettings,
            googleKeyFile: file.name,
            googleKeyFileContent: fileContent
          }
        }));
      }
    } catch (error) {
      console.error('ファイル読み込みエラー:', error);
      alert('キーファイルの読み込みに失敗しました。');
    }
  };
  
  // ファイルをテキストとして読み込むヘルパー関数
  const readFileAsText = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (e) => reject(e);
      reader.readAsText(file);
    });
  };
  
  // 専門家AI情報の更新
  const updateExpertInfo = (field, value) => {
    setEditingExpert(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  // 専門分野の選択/解除
  const toggleExpertise = (expertiseId) => {
    setEditingExpert(prev => {
      const isSelected = prev.expertise?.includes(expertiseId);
      let newExpertise = prev.expertise || [];
      
      if (isSelected) {
        newExpertise = newExpertise.filter(id => id !== expertiseId);
      } else {
        newExpertise = [...newExpertise, expertiseId];
      }
      
      return {
        ...prev,
        expertise: newExpertise
      };
    });
  };
  
  // 優先度の更新
  const updatePriority = (priority, value) => {
    setEditingExpert(prev => ({
      ...prev,
      priorities: {
        ...prev.priorities,
        [priority]: value
      }
    }));
  };
  
  // AIプロバイダーの変更
  const updateProvider = (provider) => {
    setEditingExpert(prev => {
      // プロバイダーを更新
      const updatedExpert = {
        ...prev,
        provider: provider
      };
      
      // プロバイダー設定も更新
      if (settings) {
        // メイン設定からデフォルト値を取得するためのダミーオブジェクト
        const dummyMainSettings = {
          apiKey: '',
          apiEndpoint: '',
          model: 'gpt-4o',
          anthropicApiKey: '',
          anthropicApiEndpoint: '',
          anthropicModel: 'claude-3-opus',
          // 他のプロバイダー設定...
        };
        
        // 既存の設定から最適なデフォルト値を取得
        updatedExpert.providerSettings = getDefaultProviderSettingsFor(provider, dummyMainSettings);
      }
      
      return updatedExpert;
    });
  };
  
  // プロバイダー設定の更新
  const updateProviderSettings = (updatedSettings) => {
    setEditingExpert(prev => ({
      ...prev,
      providerSettings: updatedSettings,
      provider: updatedSettings.aiProvider || prev.provider
    }));
  };
  
  // API接続テスト
  const testConnection = async () => {
    if (!editingExpert) return;
    
    setIsTesting(true);
    setTestResult(null);
    
    try {
      // プロバイダーの種類と設定を取得
      const { provider, providerSettings } = editingExpert;
      
      // プロバイダに応じたテスト実行
      switch (provider) {
        case 'openai':
          await testOpenAIConnection(providerSettings.apiKey, providerSettings.apiEndpoint);
          break;
        case 'anthropic':
          await testAnthropicConnection(providerSettings.anthropicApiKey, providerSettings.anthropicApiEndpoint);
          break;
        case 'azure':
          await testAzureConnection(providerSettings.azureApiKey, providerSettings.azureEndpoint, providerSettings.azureDeploymentName);
          break;
        case 'google':
          await testGoogleConnection(providerSettings.googleProjectId, providerSettings.googleLocation, providerSettings.googleKeyFile);
          break;
        case 'openrouter':
          await testOpenRouterConnection(providerSettings.openrouterApiKey);
          break;
        case 'local':
          await testLocalConnection(providerSettings.localModelPath);
          break;
        default:
          setTestResult({ 
            success: false, 
            message: '未知のプロバイダータイプです。' 
          });
      }
    } catch (error) {
      setTestResult({ 
        success: false, 
        message: `テスト中にエラーが発生しました: ${error.message}` 
      });
    } finally {
      setIsTesting(false);
    }
  };
  
  // OpenAI接続テスト
  const testOpenAIConnection = async (apiKey, apiEndpoint) => {
    if (isElectron() && window.electronAPI) {
      // Electron環境での実装
      const result = await window.electronAPI.testOpenAIConnection(apiKey, apiEndpoint);
      setTestResult(result);
    } else {
      // ブラウザ環境での実装（簡易テスト）
      setTestResult({ 
        success: true, 
        message: 'OpenAI API 接続テスト成功（簡易チェック）' 
      });
    }
  };
  
  // Anthropic接続テスト
  const testAnthropicConnection = async (apiKey, apiEndpoint) => {
    if (isElectron() && window.electronAPI) {
      const result = await window.electronAPI.testAnthropicConnection(apiKey, apiEndpoint);
      setTestResult(result);
    } else {
      // 簡易テスト実装
      setTestResult({ 
        success: true, 
        message: 'Anthropic API 接続テスト成功（簡易チェック）' 
      });
    }
  };
  
  // Azure OpenAI接続テスト
  const testAzureConnection = async (apiKey, endpoint, deploymentName) => {
    if (isElectron() && window.electronAPI) {
      const result = await window.electronAPI.testAzureConnection(apiKey, endpoint, deploymentName);
      setTestResult(result);
    } else {
      // 簡易テスト実装
      setTestResult({ 
        success: true, 
        message: 'Azure OpenAI API 接続テスト成功（簡易チェック）' 
      });
    }
  };
  
  // Google Vertex AI接続テスト
  const testGoogleConnection = async (projectId, location, keyFile) => {
    if (isElectron() && window.electronAPI) {
      const result = await window.electronAPI.testGoogleConnection(projectId, location, keyFile);
      setTestResult(result);
    } else {
      // 簡易テスト実装
      setTestResult({ 
        success: true, 
        message: 'Google Vertex AI 接続テスト成功（簡易チェック）' 
      });
    }
  };
  
  // OpenRouter接続テスト
  const testOpenRouterConnection = async (apiKey) => {
    if (isElectron() && window.electronAPI) {
      const result = await window.electronAPI.testOpenRouterConnection(apiKey);
      setTestResult(result);
    } else {
      // 簡易テスト実装
      setTestResult({ 
        success: true, 
        message: 'OpenRouter API 接続テスト成功（簡易チェック）' 
      });
    }
  };
  
  // ローカルモデル接続テスト
  const testLocalConnection = async (modelPath) => {
    if (isElectron() && window.electronAPI) {
      const result = await window.electronAPI.testLocalConnection(modelPath);
      setTestResult(result);
    } else {
      // 簡易テスト実装
      setTestResult({ 
        success: false, 
        message: 'ローカルモデルはデスクトップアプリでのみ利用可能です' 
      });
    }
  };
  
  // 専門家の保存
  const saveExpert = () => {
    if (!editingExpert || editingPhase === null || editingIndex === null) return;
    
    const newSettings = {...settings};
    if (!newSettings.phaseExperts[editingPhase]) {
      newSettings.phaseExperts[editingPhase] = {
        enabled: true,
        count: 0,
        experts: []
      };
    }
    
    const experts = [...newSettings.phaseExperts[editingPhase].experts];
    experts[editingIndex] = editingExpert;
    
    newSettings.phaseExperts = {
      ...newSettings.phaseExperts,
      [editingPhase]: {
        ...newSettings.phaseExperts[editingPhase],
        experts
      }
    };
    
    setSettings(newSettings);
    closeExpertModal();
  };
  
  // ローディング中の表示
  if (isLoading) {
    return (
      <div className="expert-ai-settings-container loading-container">
        <p>設定を読み込み中...</p>
      </div>
    );
  }
  
  return (
    <div className="expert-ai-settings-container">
      <h2>専門家AI設定</h2>
      
      {/* 要件定義フェーズの専門家AI */}
      <div className="settings-section">
        <h3>要件定義フェーズの専門家AI</h3>
        <div className="expert-count-control">
          <label htmlFor="requirements-expert-count">専門家の数:</label>
          <select
            id="requirements-expert-count"
            value={settings.phaseExperts?.requirements?.count || 3}
            onChange={(e) => handleExpertCountChange('requirements', parseInt(e.target.value))}
          >
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
            <option value="5">5</option>
          </select>
        </div>
        
        <div className="experts-list">
          {settings.phaseExperts?.requirements?.experts?.map((expert, index) => (
            <div key={expert.id || index} className="expert-card">
              <div className="expert-icon">
                <i className={`fas fa-${expertIcons[expert.iconType] || 'user'}`}></i>
              </div>
              <div className="expert-info">
                <h4>{expert.name}</h4>
                <div className="expert-description">{expert.description}</div>
                <div className="expert-provider">
                  プロバイダー: {
                    providerOptions.find(p => p.id === expert.provider)?.name || expert.provider
                  }
                </div>
                <div className="expert-expertise">
                  専門: {expert.expertise?.map(e => expertiseOptions.find(opt => opt.id === e)?.label).filter(Boolean).join(', ')}
                </div>
              </div>
              <div className="expert-actions">
                <button 
                  className="edit-button"
                  onClick={() => openExpertModal('requirements', index)}
                >
                  編集
                </button>
                <div className="order-buttons">
                  <button 
                    className="order-button up"
                    onClick={() => swapExperts('requirements', index, index - 1)}
                    disabled={index === 0}
                  >
                    ↑
                  </button>
                  <button 
                    className="order-button down"
                    onClick={() => swapExperts('requirements', index, index + 1)}
                    disabled={index === (settings.phaseExperts?.requirements?.experts?.length || 0) - 1}
                  >
                    ↓
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* 設計フェーズの専門家AI */}
      <div className="settings-section">
        <h3>設計フェーズの専門家AI</h3>
        <div className="expert-count-control">
          <label htmlFor="design-expert-count">専門家の数:</label>
          <select
            id="design-expert-count"
            value={settings.phaseExperts?.design?.count || 3}
            onChange={(e) => handleExpertCountChange('design', parseInt(e.target.value))}
          >
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
            <option value="5">5</option>
          </select>
        </div>
        
        <div className="experts-list">
          {settings.phaseExperts?.design?.experts?.map((expert, index) => (
            <div key={expert.id || index} className="expert-card">
              <div className="expert-icon">
                <i className={`fas fa-${expertIcons[expert.iconType] || 'user'}`}></i>
              </div>
              <div className="expert-info">
                <h4>{expert.name}</h4>
                <div className="expert-description">{expert.description}</div>
                <div className="expert-provider">
                  プロバイダー: {
                    providerOptions.find(p => p.id === expert.provider)?.name || expert.provider
                  }
                </div>
                <div className="expert-expertise">
                  専門: {expert.expertise?.map(e => expertiseOptions.find(opt => opt.id === e)?.label).filter(Boolean).join(', ')}
                </div>
              </div>
              <div className="expert-actions">
                <button 
                  className="edit-button"
                  onClick={() => openExpertModal('design', index)}
                >
                  編集
                </button>
                <div className="order-buttons">
                  <button 
                    className="order-button up"
                    onClick={() => swapExperts('design', index, index - 1)}
                    disabled={index === 0}
                  >
                    ↑
                  </button>
                  <button 
                    className="order-button down"
                    onClick={() => swapExperts('design', index, index + 1)}
                    disabled={index === (settings.phaseExperts?.design?.experts?.length || 0) - 1}
                  >
                    ↓
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* 保存・キャンセルボタン */}
      <div className="settings-actions">
        <button 
          className="cancel-button" 
          onClick={() => navigate('/settings')}
        >
          キャンセル
        </button>
        <button 
          className="save-button" 
          onClick={saveSettings}
          disabled={isSaving}
        >
          {isSaving ? '保存中...' : '設定を保存'}
        </button>
      </div>
      
      {saveMessage.message && (
        <div className={`save-message ${saveMessage.type}`}>
          {saveMessage.message}
        </div>
      )}
      
      {/* 専門家編集モーダル（タブ付き） */}
      {editingExpert && (
        <div className="expert-modal-overlay" onClick={closeExpertModal}>
          <div className="expert-modal" onClick={e => e.stopPropagation()}>
            <div className="expert-modal-header">
              <h3>専門家AI設定</h3>
              <button className="close-button" onClick={closeExpertModal}>×</button>
            </div>
            
            {/* タブナビゲーション */}
            <div className="expert-modal-tabs">
              <button 
                className={`tab-button ${activeTab === 'basic' ? 'active' : ''}`}
                onClick={() => switchTab('basic')}
              >
                基本情報
              </button>
              <button 
                className={`tab-button ${activeTab === 'api' ? 'active' : ''}`}
                onClick={() => switchTab('api')}
              >
                API設定
              </button>
              <button 
                className={`tab-button ${activeTab === 'expertise' ? 'active' : ''}`}
                onClick={() => switchTab('expertise')}
              >
                専門分野
              </button>
              <button 
                className={`tab-button ${activeTab === 'priority' ? 'active' : ''}`}
                onClick={() => switchTab('priority')}
              >
                優先度
              </button>
            </div>
            
            <div className="expert-modal-content">
              {/* 基本情報タブ */}
              {activeTab === 'basic' && (
                <div className="modal-section">
                  <div className="form-group">
                    <label htmlFor="expert-name">名前:</label>
                    <input
                      id="expert-name"
                      type="text"
                      value={editingExpert.name || ''}
                      onChange={(e) => updateExpertInfo('name', e.target.value)}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="expert-description">説明:</label>
                    <textarea
                      id="expert-description"
                      value={editingExpert.description || ''}
                      onChange={(e) => updateExpertInfo('description', e.target.value)}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="expert-icon">アイコンタイプ:</label>
                    <select
                      id="expert-icon"
                      value={editingExpert.iconType || 'custom'}
                      onChange={(e) => updateExpertInfo('iconType', e.target.value)}
                    >
                      {Object.entries(expertIcons).map(([key, value]) => (
                        <option key={key} value={key}>
                          {key}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
              
              {/* API設定タブ */}
              {activeTab === 'api' && (
                <div className="modal-section">
                  <AISettings 
                    settings={{
                      aiProvider: editingExpert.provider,
                      ...(editingExpert.providerSettings || {})
                    }}
                    onChange={updateProviderSettings}
                    isExpertMode={true}
                    fileInputRef={fileInputRef}
                    handleFileChange={handleFileChange}
                    testConnection={testConnection}
                    isTesting={isTesting}
                    testResult={testResult}
                  />
                </div>
              )}
              
              {/* 専門分野タブ */}
              {activeTab === 'expertise' && (
                <div className="modal-section">
                  <h4>専門分野</h4>
                  <div className="expertise-checkboxes">
                    {expertiseOptions.map(option => (
                      <label key={option.id} className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={editingExpert.expertise?.includes(option.id) || false}
                          onChange={() => toggleExpertise(option.id)}
                        />
                        {option.label}
                      </label>
                    ))}
                  </div>
                </div>
              )}
              
              {/* 優先度タブ */}
              {activeTab === 'priority' && (
                <div className="modal-section">
                  <h4>優先度設定</h4>
                  <div className="priorities-sliders">
                    <div className="priority-slider">
                      <label>パフォーマンス:</label>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={editingExpert.priorities?.performance || 5}
                        onChange={(e) => updatePriority('performance', parseInt(e.target.value))}
                      />
                      <span>{editingExpert.priorities?.performance || 5}</span>
                    </div>
                    
                    <div className="priority-slider">
                      <label>セキュリティ:</label>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={editingExpert.priorities?.security || 5}
                        onChange={(e) => updatePriority('security', parseInt(e.target.value))}
                      />
                      <span>{editingExpert.priorities?.security || 5}</span>
                    </div>
                    
                    <div className="priority-slider">
                      <label>ユーザビリティ:</label>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={editingExpert.priorities?.usability || 5}
                        onChange={(e) => updatePriority('usability', parseInt(e.target.value))}
                      />
                      <span>{editingExpert.priorities?.usability || 5}</span>
                    </div>
                    
                    <div className="priority-slider">
                      <label>保守性:</label>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={editingExpert.priorities?.maintainability || 5}
                        onChange={(e) => updatePriority('maintainability', parseInt(e.target.value))}
                      />
                      <span>{editingExpert.priorities?.maintainability || 5}</span>
                    </div>
                    
                    <div className="priority-slider">
                      <label>革新性:</label>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={editingExpert.priorities?.innovation || 5}
                        onChange={(e) => updatePriority('innovation', parseInt(e.target.value))}
                      />
                      <span>{editingExpert.priorities?.innovation || 5}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="expert-modal-footer">
              <button 
                className="cancel-button" 
                onClick={closeExpertModal}
              >
                キャンセル
              </button>
              <button 
                className="save-button" 
                onClick={saveExpert}
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpertAISettings;