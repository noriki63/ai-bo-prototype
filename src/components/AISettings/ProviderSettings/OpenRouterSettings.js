import React from 'react';
import { OPENROUTER_MODELS } from '../../../data/aiProviderData';

/**
 * OpenRouter固有の設定コンポーネント
 * 
 * @param {Object} props
 * @param {Object} props.settings - 現在の設定値
 * @param {Function} props.onChange - 設定変更時のコールバック関数
 * @param {boolean} props.showAdvancedSettings - 詳細設定を表示するかどうか
 * @param {boolean} props.isExpertMode - 専門家AI設定モードかどうか
 */
const OpenRouterSettings = ({ 
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
    <div className="openrouter-settings">
      {/* APIキー入力 */}
      <div className="form-group">
        <label htmlFor="openrouterApiKey">OpenRouter API キー:</label>
        <input
          type="password"
          id="openrouterApiKey"
          name="openrouterApiKey"
          value={settings.openrouterApiKey || ''}
          onChange={handleChange}
          placeholder="OpenRouter APIキーを入力してください"
        />
        <div className="field-hint">
          OpenRouterのAPIキーは"sk-or-"で始まります
        </div>
      </div>
      
      {/* モデル選択 */}
      <div className="form-group">
        <label htmlFor="openrouterModel">使用モデル:</label>
        <select
          id="openrouterModel"
          name="openrouterModel"
          value={settings.openrouterModel || 'openai/gpt-4o'}
          onChange={handleChange}
        >
          {OPENROUTER_MODELS.map(model => (
            <option key={model.value} value={model.value}>
              {model.name}
            </option>
          ))}
        </select>
        <div className="field-hint">
          OpenRouter経由で利用可能なモデルを選択します
        </div>
      </div>
      
      {/* 詳細設定 */}
      {showAdvancedSettings && (
        <>
          <div className="form-group">
            <label htmlFor="openrouterBaseUrl">
              ベースURL:
              <span className="optional-label">（オプション）</span>
            </label>
            <input
              type="text"
              id="openrouterBaseUrl"
              name="openrouterBaseUrl"
              value={settings.openrouterBaseUrl || ''}
              onChange={handleChange}
              placeholder="デフォルトのエンドポイントを使用する場合は空白"
            />
            <div className="field-hint">
              デフォルトURLを上書きする場合のみ指定します
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="openrouterSiteInfo">
              site_info:
              <span className="optional-label">（オプション）</span>
            </label>
            <input
              type="text"
              id="openrouterSiteInfo"
              name="openrouterSiteInfo"
              value={settings.openrouterSiteInfo || ''}
              onChange={handleChange}
              placeholder="アプリ名/サイト名（オプション）"
            />
            <div className="field-hint">
              リクエスト元の情報を提供します（モデルプロバイダーに転送）
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="openrouterRouting">
              ルーティング方法:
            </label>
            <select
              id="openrouterRouting"
              name="openrouterRouting"
              value={settings.openrouterRouting || 'fallback'}
              onChange={handleChange}
            >
              <option value="fallback">フォールバック（デフォルト）</option>
              <option value="lowest-latency">最低レイテンシ</option>
              <option value="lowest-cost">最低コスト</option>
              <option value="highest-quality">最高品質</option>
            </select>
            <div className="field-hint">
              モデルプロバイダーのルーティング方法を指定します
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default OpenRouterSettings;