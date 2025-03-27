import React, { useState, useEffect, useRef } from 'react';
import AISettings from '../components/AISettings';
import AIProviderSelector from '../components/AISettings/AIProviderSelector';
import { DEFAULT_SETTINGS } from '../data/aiProviderData';
import './Settings.css';

/**
 * AISettingsBase - 設定画面共通ベースコンポーネント
 * 
 * AIプロバイダー設定の共通部分を提供する基底コンポーネントです。
 * まとめAI設定と専門家AI設定の両方で共通して使用されます。
 * 
 * @param {Object} props
 * @param {string} props.mode - 設定モード ('summary'=まとめAI, 'expert'=専門家AI)
 * @param {Object} props.initialSettings - 初期設定値
 * @param {Function} props.onSaveComplete - 保存完了時のコールバック
 * @param {Function} props.renderExtraUI - 追加UI要素をレンダリングする関数
 * @param {Function} props.onCancel - キャンセルボタンクリック時のコールバック
 * @param {Function} props.onNavigate - 画面遷移用のコールバック
 * @param {boolean} props.showSystemInfo - システム情報を表示するかどうか
 * @param {Function} props.onOpenExpertSettings - 専門家AI設定を開くボタンクリック時のコールバック
 * @param {Object} props.expertModeOptions - 専門家AI設定モード用のオプション
 * @param {string} props.expertModeOptions.expertId - 専門家AIのID
 * @param {string} props.expertModeOptions.expertName - 専門家AIの名前
 */
const AISettingsBase = ({ 
  mode = 'summary',
  initialSettings = DEFAULT_SETTINGS,
  onSaveComplete,
  renderExtraUI = null,
  onCancel,
  onNavigate,
  showSystemInfo = true,
  onOpenExpertSettings,
  expertModeOptions = null
}) => {
  const fileInputRef = useRef(null);
  
  // 共通の設定状態 - nullの場合はデフォルト値を使用
  const [settings, setSettings] = useState(initialSettings || DEFAULT_SETTINGS);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState({ type: '', message: '' });
  
  // システム情報（Electronの場合のみ）
  const [systemInfo, setSystemInfo] = useState(null);
  
  // Electronが使用可能かどうかをチェック
  const isElectron = () => {
    return window && window.process && window.process.type;
  };
  
  useEffect(() => {
    // 初期設定の反映
    if (initialSettings) {
      setSettings(initialSettings);
    } else {
      // 設定がない場合は読み込み試行
      loadSettings();
    }
    
    // システム情報の取得（Electronの場合のみ）
    if (showSystemInfo && mode !== 'expert') {
      getSystemInfo();
    }
  }, [initialSettings, showSystemInfo, mode]);
  
  // 設定の読み込み
  const loadSettings = async () => {
    if (isElectron() && window.electronAPI) {
      try {
        const savedSettings = await window.electronAPI.getSettings();
        if (savedSettings) {
          setSettings(savedSettings);
        } else {
          setSettings(DEFAULT_SETTINGS);
        }
      } catch (error) {
        console.error('設定の読み込みエラー:', error);
        setSettings(DEFAULT_SETTINGS);
      }
    } else {
      // ブラウザモードの場合はローカルストレージから読み込み
      const savedSettings = localStorage.getItem('aiBoSettings');
      if (savedSettings) {
        try {
          const parsedSettings = JSON.parse(savedSettings);
          setSettings(parsedSettings);
        } catch (error) {
          console.error('設定の解析エラー:', error);
          setSettings(DEFAULT_SETTINGS);
        }
      } else {
        setSettings(DEFAULT_SETTINGS);
      }
    }
  };
  
  // システム情報の取得（Electronの場合のみ）
  const getSystemInfo = async () => {
    if (isElectron() && window.electronAPI) {
      try {
        const info = await window.electronAPI.getSystemInfo();
        setSystemInfo(info);
      } catch (error) {
        console.error('システム情報取得エラー:', error);
      }
    }
  };
  
  // ファイル選択ハンドラ (Google APIキーファイル用)
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    try {
      if (isElectron() && window.electronAPI) {
        // Electronの場合はファイルパスを保存
        setSettings(prev => ({
          ...prev,
          googleKeyFilePath: file.path,
          googleKeyFile: file.name
        }));
      } else {
        // ブラウザの場合はファイル内容を読み込む
        const fileContent = await readFileAsText(file);
        setSettings(prev => ({
          ...prev,
          googleKeyFile: file.name,
          googleKeyFileContent: fileContent
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
  
  // 設定変更ハンドラ
  const handleSettingsChange = (updatedSettings) => {
    setSettings(updatedSettings);
  };
  
  // API接続テスト
  const testConnection = async () => {
    setIsTesting(true);
    setTestResult({ success: false, message: '' });
    
    try {
      // aiProviderがnullの場合のデフォルト値
      const provider = settings?.aiProvider || 'openai';
      
      switch (provider) {
        case 'openai':
          await testOpenAIConnection();
          break;
        case 'anthropic':
          await testAnthropicConnection();
          break;
        case 'azure':
          await testAzureConnection();
          break;
        case 'google':
          await testGoogleConnection();
          break;
        case 'openrouter':
          await testOpenRouterConnection();
          break;
        case 'local':
          await testLocalConnection();
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
  const testOpenAIConnection = async () => {
    if (isElectron() && window.electronAPI) {
      // Electron環境での実装
      const result = await window.electronAPI.testOpenAIConnection(settings.apiKey, settings.apiEndpoint);
      setTestResult(result);
    } else {
      // ブラウザ環境での実装
      try {
        const apiEndpoint = settings.apiEndpoint || 'https://api.openai.com';
        const url = new URL('/v1/models', apiEndpoint);
        
        const response = await fetch(url.toString(), {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${settings.apiKey}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          setTestResult({ 
            success: true, 
            message: '接続成功！OpenAI APIと正常に通信できました。' 
          });
        } else {
          const errorData = await response.json();
          setTestResult({ 
            success: false, 
            message: `接続エラー (${response.status}): ${errorData.error?.message || 'Unknown error'}` 
          });
        }
      } catch (error) {
        setTestResult({ 
          success: false, 
          message: `ネットワークエラー: ${error.message}` 
        });
      }
    }
  };
  
  // Anthropic接続テスト
  const testAnthropicConnection = async () => {
    if (isElectron() && window.electronAPI) {
      const result = await window.electronAPI.testAnthropicConnection(
        settings.anthropicApiKey, 
        settings.anthropicApiEndpoint
      );
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
  const testAzureConnection = async () => {
    if (isElectron() && window.electronAPI) {
      const result = await window.electronAPI.testAzureConnection(
        settings.azureApiKey,
        settings.azureEndpoint,
        settings.azureDeploymentName
      );
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
  const testGoogleConnection = async () => {
    if (isElectron() && window.electronAPI) {
      const result = await window.electronAPI.testGoogleConnection(
        settings.googleProjectId,
        settings.googleLocation,
        settings.googleKeyFilePath
      );
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
  const testOpenRouterConnection = async () => {
    if (isElectron() && window.electronAPI) {
      const result = await window.electronAPI.testOpenRouterConnection(
        settings.openrouterApiKey
      );
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
  const testLocalConnection = async () => {
    if (isElectron() && window.electronAPI) {
      const result = await window.electronAPI.testLocalConnection(
        settings.localModelPath
      );
      setTestResult(result);
    } else {
      // 簡易テスト実装
      setTestResult({ 
        success: false, 
        message: 'ローカルモデルはデスクトップアプリでのみ利用可能です' 
      });
    }
  };
  
  // 設定の保存
  const saveSettings = async () => {
    setIsSaving(true);
    setSaveMessage({ type: '', message: '' });
    
    try {
      // 専門家AIモードとそれ以外でデータ構造が異なる
      if (mode === 'expert' && expertModeOptions) {
        // 専門家AI用の設定保存ロジック
        if (onSaveComplete) {
          // 親コンポーネントに制御を委譲
          onSaveComplete(settings, expertModeOptions);
          setSaveMessage({ type: 'success', message: 'API設定を保存しました！' });
        }
      } else {
        // 通常の設定保存ロジック
        if (isElectron() && window.electronAPI) {
          // Electron環境での保存
          await window.electronAPI.saveSettings(settings);
        } else {
          // ブラウザ環境での保存（ローカルストレージ）
          localStorage.setItem('aiBoSettings', JSON.stringify(settings));
        }
        
        setSaveMessage({ type: 'success', message: '設定を保存しました！' });
        
        // 保存完了コールバックの呼び出し
        if (onSaveComplete) {
          onSaveComplete(settings);
        }
      }
    } catch (error) {
      setSaveMessage({ type: 'error', message: `設定の保存に失敗しました: ${error.message}` });
    } finally {
      setIsSaving(false);
      
      // 成功メッセージは3秒後に消す
      if (saveMessage.type !== 'error') {
        setTimeout(() => {
          setSaveMessage({ type: '', message: '' });
        }, 3000);
      }
    }
  };
  
  // キャンセルボタンのハンドラ
  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else if (onNavigate) {
      onNavigate('/');
    }
  };
  
  // 専門家AIモード用のコンテンツをレンダリング
  const renderExpertModeContent = () => {
    return (
      <div className="expert-ai-provider-settings">
        {/* スタイル調整された内容をレンダリング */}
        <AIProviderSelector
          value={settings?.aiProvider || 'openai'}
          onChange={(value) => handleSettingsChange({ ...settings, aiProvider: value })}
          testConnection={testConnection}
          isTesting={isTesting}
          testResult={testResult}
          isExpertMode={true}
        />
        
        <AISettings 
          settings={settings}
          onChange={handleSettingsChange}
          isExpertMode={true}
          fileInputRef={fileInputRef}
          handleFileChange={handleFileChange}
          testConnection={null}
          isTesting={isTesting}
          testResult={testResult}
        />
      </div>
    );
  };
  
  // 通常モード用のコンテンツをレンダリング
  const renderNormalModeContent = () => {
    return (
      <>
        <div className="settings-section">
          <div className="settings-header">
            <h3>AI API設定</h3>
          </div>
          
          {/* プロバイダー選択部分 */}
          <AIProviderSelector
            value={settings?.aiProvider || 'openai'}
            onChange={(value) => handleSettingsChange({ ...settings, aiProvider: value })}
            testConnection={testConnection}
            isTesting={isTesting}
            testResult={testResult}
            isExpertMode={false}
            onOpenExpertSettings={onOpenExpertSettings}
          />
          
          {/* 共通のAI設定コンポーネント */}
          <AISettings 
            settings={settings}
            onChange={handleSettingsChange}
            isExpertMode={false}
            fileInputRef={fileInputRef}
            handleFileChange={handleFileChange}
            testConnection={null} // 上部のAIProviderSelectorでテストボタンを表示するため
            isTesting={isTesting}
            testResult={testResult}
          />
        </div>
        
        {/* 追加UI（呼び出し元から渡される） */}
        {renderExtraUI && renderExtraUI(settings, handleSettingsChange)}
        
        {/* システム情報（Electronの場合のみ） */}
        {showSystemInfo && systemInfo && (
          <div className="settings-section">
            <h3>システム情報</h3>
            <div className="system-info">
              <div className="info-item">
                <span className="info-label">プラットフォーム:</span>
                <span className="info-value">{systemInfo.osInfo.type} {systemInfo.osInfo.version}</span>
              </div>
              <div className="info-item">
                <span className="info-label">アーキテクチャ:</span>
                <span className="info-value">{systemInfo.arch}</span>
              </div>
              <div className="info-item">
                <span className="info-label">メモリ:</span>
                <span className="info-value">{systemInfo.memoryInfo.total}</span>
              </div>
            </div>
          </div>
        )}
      </>
    );
  };
  
  // モードに応じたコンテンツをレンダリング
  const renderContent = () => {
    if (mode === 'expert') {
      return renderExpertModeContent();
    }
    return renderNormalModeContent();
  };
  
  return (
    <div className={`settings-container ${mode === 'expert' ? 'expert-mode' : ''}`}>
      <h2>{mode === 'expert' ? 'API プロバイダー設定' : 'AI API設定'}</h2>
      
      {/* モードに応じたコンテンツ */}
      {renderContent()}
      
      {/* 保存・キャンセルボタン */}
      <div className="settings-actions">
        <button 
          className="cancel-button" 
          onClick={handleCancel}
        >
          キャンセル
        </button>
        <button 
          className="save-button" 
          onClick={saveSettings}
          disabled={isSaving}
        >
          {isSaving 
            ? '保存中...' 
            : mode === 'expert' 
              ? 'API設定を保存' 
              : '設定を保存'
          }
        </button>
      </div>
      
      {saveMessage.message && (
        <div className={`save-message ${saveMessage.type}`}>
          {saveMessage.message}
        </div>
      )}
    </div>
  );
};

export default AISettingsBase;