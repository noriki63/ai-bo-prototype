import React, { useState } from 'react';
import AIProviderSelector from './AIProviderSelector';
import ModelSettings from './ModelSettings';
import ErrorHandlingSettings from './ErrorHandlingSettings';
import CustomModelSettings from './CustomModelSettings';
import OpenAISettings from './ProviderSettings/OpenAISettings';
import AnthropicSettings from './ProviderSettings/AnthropicSettings';
import AzureSettings from './ProviderSettings/AzureSettings';
import GoogleSettings from './ProviderSettings/GoogleSettings';
import OpenRouterSettings from './ProviderSettings/OpenRouterSettings';
import LocalModelSettings from './ProviderSettings/LocalModelSettings';
import './AISettings.css';

/**
 * AISettings - AI設定共通コンポーネント
 * 
 * このコンポーネントは、すべてのAI設定オプションを提供する共通インターフェースです。
 * Settings.js と ExpertAISettings.js の両方で使用され、一貫性のある設定UXを提供します。
 * 
 * @param {Object} props
 * @param {Object} props.settings - 現在の設定値
 * @param {Function} props.onChange - 設定変更時のコールバック関数
 * @param {boolean} props.isExpertMode - 専門家AI設定モードかどうか
 * @param {Object} props.fileInputRef - ファイル入力のrefオブジェクト（Googleキーファイル用）
 * @param {Function} props.handleFileChange - ファイル選択時のハンドラ
 * @param {Function} props.testConnection - 接続テスト実行関数
 * @param {boolean} props.isTesting - テスト中かどうか
 * @param {Object} props.testResult - テスト結果（success, message）
 * @param {Object} props.options - 追加オプション
 */
const AISettings = ({
  settings,
  onChange,
  isExpertMode = false,
  fileInputRef,
  handleFileChange,
  testConnection,
  isTesting = false,
  testResult = null,
  options = {}
}) => {
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [showErrorHandling, setShowErrorHandling] = useState(false);
  
  // 設定更新のためのヘルパー関数
  const updateSettings = (name, value) => {
    onChange({
      ...settings,
      [name]: value
    });
  };
  
  // エラーハンドリング設定更新のためのヘルパー関数
  const updateErrorHandling = (field, value) => {
    onChange({
      ...settings,
      errorHandling: {
        ...settings.errorHandling,
        [field]: value
      }
    });
  };
  
  // Google認証ボタンのクリックハンドラー
  const handleGoogleAuth = () => {
    // Google OAuth認証フローを開始
    alert('この機能は現在開発中です。将来のバージョンで実装予定です。');
  };

  // 現在のプロバイダーに基づいて適切な設定コンポーネントをレンダリング
  const renderProviderSettings = () => {
    const commonProps = {
      settings,
      onChange: updateSettings,
      showAdvancedSettings,
      fileInputRef: fileInputRef,
      handleFileChange: handleFileChange,
      handleGoogleAuth: handleGoogleAuth,
      isExpertMode: isExpertMode
    };

    switch (settings.aiProvider) {
      case 'openai':
        return <OpenAISettings {...commonProps} />;
      case 'anthropic':
        return <AnthropicSettings {...commonProps} />;
      case 'azure':
        return <AzureSettings {...commonProps} />;
      case 'google':
        return <GoogleSettings {...commonProps} />;
      case 'openrouter':
        return <OpenRouterSettings {...commonProps} />;
      case 'local':
        return <LocalModelSettings {...commonProps} />;
      default:
        return null;
    }
  };

  return (
    <div className="ai-settings-container">
      {/* プロバイダー選択 */}
      <AIProviderSelector 
        value={settings.aiProvider}
        onChange={(value) => updateSettings('aiProvider', value)}
        testConnection={testConnection}
        isTesting={isTesting}
        testResult={testResult}
        isExpertMode={isExpertMode}
      />
      
      {/* プロバイダー固有の設定 */}
      {renderProviderSettings()}
      
      {/* 詳細設定トグル */}
      <div className="form-group toggle-container">
        <button 
          type="button" 
          className="toggle-button"
          onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
        >
          {showAdvancedSettings ? '詳細設定を隠す ▲' : '詳細設定を表示 ▼'}
        </button>
      </div>
      
      {/* モデル設定（温度、トークン数など） */}
      <ModelSettings 
        settings={settings}
        onChange={updateSettings}
        isExpertMode={isExpertMode}
        showAdvancedSettings={showAdvancedSettings}
      />
      
      {/* カスタムモデル設定 */}
      {settings.aiProvider !== 'azure' && 
       settings.aiProvider !== 'openrouter' && 
       showAdvancedSettings && (
        <CustomModelSettings 
          models={settings.customModels || []}
          onChange={(models) => updateSettings('customModels', models)}
        />
      )}
      
      {/* エラーハンドリング設定トグル */}
      {showAdvancedSettings && (
        <div className="form-group toggle-container">
          <button 
            type="button" 
            className="toggle-button"
            onClick={() => setShowErrorHandling(!showErrorHandling)}
          >
            {showErrorHandling ? 'エラーハンドリング設定を隠す ▲' : 'エラーハンドリング設定を表示 ▼'}
          </button>
        </div>
      )}
      
      {/* エラーハンドリング設定 */}
      {showAdvancedSettings && showErrorHandling && (
        <ErrorHandlingSettings 
          errorHandling={settings.errorHandling || {}}
          onChange={updateErrorHandling}
          currentProvider={settings.aiProvider}
        />
      )}
    </div>
  );
};

export default AISettings;