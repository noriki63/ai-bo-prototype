import React from 'react';
import { PROVIDER_REQUIRED_FIELDS, PROVIDER_ADVANCED_FIELDS } from '../../../data/aiProviderData';

/**
 * Anthropic固有の設定コンポーネント
 * 
 * @param {Object} props
 * @param {Object} props.settings - 現在の設定値
 * @param {Function} props.onChange - 設定変更時のコールバック関数
 * @param {boolean} props.showAdvancedSettings - 詳細設定を表示するかどうか
 * @param {boolean} props.isExpertMode - 専門家AI設定モードかどうか
 */
const AnthropicSettings = ({ 
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

  return (
    <div className="anthropic-settings">
      {/* APIキー入力 */}
      <div className="form-group">
        <label htmlFor="anthropicApiKey">Anthropic API キー:</label>
        <input
          type="password"
          id="anthropicApiKey"
          name="anthropicApiKey"
          value={settings.anthropicApiKey || ''}
          onChange={handleChange}
          placeholder="Anthropic APIキーを入力してください"
        />
        <div className="field-hint">
          AnthropicのAPIキーは"sk-ant-"で始まります
        </div>
      </div>
      
      {/* APIエンドポイント */}
      <div className="form-group">
        <label htmlFor="anthropicApiEndpoint">
          API エンドポイント:
          <span className="optional-label">（オプション）</span>
        </label>
        <input
          type="text"
          id="anthropicApiEndpoint"
          name="anthropicApiEndpoint"
          value={settings.anthropicApiEndpoint || ''}
          onChange={handleChange}
          placeholder="デフォルトのエンドポイントを使用する場合は空白"
        />
      </div>
      
      {/* 詳細設定 - ベースURL */}
      {showAdvancedSettings && (
        <div className="form-group">
          <label htmlFor="anthropicBaseUrl">
            ベースURL:
            <span className="optional-label">（オプション）</span>
          </label>
          <input
            type="text"
            id="anthropicBaseUrl"
            name="anthropicBaseUrl"
            value={settings.anthropicBaseUrl || ''}
            onChange={handleChange}
            placeholder="空白の場合はデフォルトベースURLを使用"
          />
          <div className="field-hint">
            デフォルトのベースURLを上書きする場合に指定します
          </div>
        </div>
      )}
      
      {/* 詳細設定 - その他のパラメータ */}
      {showAdvancedSettings && (
        <div className="form-group">
          <label htmlFor="anthropicVersion">
            APIバージョン:
            <span className="optional-label">（オプション）</span>
          </label>
          <input
            type="text"
            id="anthropicVersion"
            name="anthropicVersion"
            value={settings.anthropicVersion || ''}
            onChange={handleChange}
            placeholder="例: 2023-06-01"
          />
          <div className="field-hint">
            特定のAPIバージョンを指定する場合のみ入力
          </div>
        </div>
      )}
    </div>
  );
};

export default AnthropicSettings;