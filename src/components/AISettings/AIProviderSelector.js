import React from 'react';
import { AI_PROVIDERS } from '../../data/aiProviderData';

/**
 * AIプロバイダー選択コンポーネント
 * 
 * AIプロバイダーのドロップダウン選択と接続テストボタンを表示します。
 * 
 * @param {Object} props
 * @param {string} props.value - 現在選択されているプロバイダーID
 * @param {Function} props.onChange - 選択変更時のコールバック関数
 * @param {Function} props.testConnection - 接続テスト実行関数
 * @param {boolean} props.isTesting - テスト中かどうか
 * @param {Object} props.testResult - テスト結果（success, message）
 * @param {boolean} props.isExpertMode - 専門家AI設定モードかどうか
 * @param {Function} props.onOpenExpertSettings - 専門家AI設定を開くボタンクリック時のコールバック
 */
const AIProviderSelector = ({
  value,
  onChange,
  testConnection,
  isTesting = false,
  testResult = null,
  isExpertMode = false,
  onOpenExpertSettings
}) => {
  const handleChange = (e) => {
    onChange(e.target.value);
  };

  return (
    <div className="ai-provider-selector">
      <div className="selector-header">
        {isExpertMode ? (
          <h4>AIプロバイダー選択</h4>
        ) : (
          <h3>AI APIプロバイダー設定</h3>
        )}
        
        <div className="header-buttons">
          {!isExpertMode && onOpenExpertSettings && (
            <button 
              className="expert-settings-button" 
              onClick={onOpenExpertSettings}
            >
              専門家AI設定
            </button>
          )}
          
          {testConnection && (
            <button 
              className="test-button" 
              onClick={testConnection}
              disabled={isTesting}
            >
              {isTesting ? 'テスト中...' : '接続テスト'}
            </button>
          )}
        </div>
      </div>

      {/* テスト結果表示 */}
      {testResult && testResult.message && (
        <div className={`test-result ${testResult.success ? 'success' : 'error'}`}>
          {testResult.message}
        </div>
      )}

      <div className="form-group">
        <label htmlFor="aiProvider">AI プロバイダー:</label>
        <select
          id="aiProvider"
          name="aiProvider"
          value={value}
          onChange={handleChange}
        >
          {AI_PROVIDERS.map(provider => (
            <option key={provider.id} value={provider.id}>
              {provider.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default AIProviderSelector;