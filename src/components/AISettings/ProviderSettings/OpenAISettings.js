import React from 'react';
import { PROVIDER_REQUIRED_FIELDS, PROVIDER_ADVANCED_FIELDS } from '../../../data/aiProviderData';

/**
 * OpenAI固有の設定コンポーネント
 * 
 * @param {Object} props
 * @param {Object} props.settings - 現在の設定値
 * @param {Function} props.onChange - 設定変更時のコールバック関数
 * @param {boolean} props.showAdvancedSettings - 詳細設定を表示するかどうか
 * @param {boolean} props.isExpertMode - 専門家AI設定モードかどうか
 */
const OpenAISettings = ({ 
  settings, 
  onChange, 
  showAdvancedSettings = false,
  isExpertMode = false
}) => {
  // フィールドの更新ハンドラ
  const handleChange = (e) => {
    const { name, value } = e.target;
    onChange(name, value);
  };

  // 必須フィールド
  const requiredFields = PROVIDER_REQUIRED_FIELDS.openai;
  
  // 詳細設定フィールド
  const advancedFields = PROVIDER_ADVANCED_FIELDS.openai;

  return (
    <div className="openai-settings">
      {/* APIキー入力 */}
      <div className="form-group">
        <label htmlFor="apiKey">OpenAI API キー:</label>
        <input
          type="password"
          id="apiKey"
          name="apiKey"
          value={settings.apiKey}
          onChange={handleChange}
          placeholder="OpenAI APIキーを入力してください"
        />
        <div className="field-hint">
          OpenAIのAPIキーは"sk-"で始まります
        </div>
      </div>
      
      {/* APIエンドポイント */}
      <div className="form-group">
        <label htmlFor="apiEndpoint">
          API エンドポイント:
          <span className="optional-label">（オプション）</span>
        </label>
        <input
          type="text"
          id="apiEndpoint"
          name="apiEndpoint"
          value={settings.apiEndpoint}
          onChange={handleChange}
          placeholder="デフォルトのエンドポイントを使用する場合は空白"
        />
      </div>
      
      {/* 詳細設定 - 組織ID */}
      {showAdvancedSettings && (
        <div className="form-group">
          <label htmlFor="openaiOrgId">
            組織ID:
            <span className="optional-label">（オプション）</span>
          </label>
          <input
            type="text"
            id="openaiOrgId"
            name="openaiOrgId"
            value={settings.openaiOrgId || ''}
            onChange={handleChange}
            placeholder="空白の場合はデフォルト組織を使用"
          />
          <div className="field-hint">
            複数のOpenAI組織に所属している場合に指定します
          </div>
        </div>
      )}
    </div>
  );
};

export default OpenAISettings;