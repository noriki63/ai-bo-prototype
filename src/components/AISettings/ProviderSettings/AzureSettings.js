import React from 'react';
import { AZURE_MODELS, AZURE_AUTH_OPTIONS } from '../../../data/aiProviderData';

/**
 * Azure OpenAI固有の設定コンポーネント
 * 
 * @param {Object} props
 * @param {Object} props.settings - 現在の設定値
 * @param {Function} props.onChange - 設定変更時のコールバック関数
 * @param {boolean} props.showAdvancedSettings - 詳細設定を表示するかどうか
 * @param {boolean} props.isExpertMode - 専門家AI設定モードかどうか
 */
const AzureSettings = ({ 
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
    <div className="azure-settings">
      {/* APIキー入力 */}
      <div className="form-group">
        <label htmlFor="azureApiKey">Azure OpenAI API キー:</label>
        <input
          type="password"
          id="azureApiKey"
          name="azureApiKey"
          value={settings.azureApiKey}
          onChange={handleChange}
          placeholder="Azure OpenAI APIキーを入力してください"
        />
      </div>
      
      {/* エンドポイント */}
      <div className="form-group">
        <label htmlFor="azureEndpoint">Azure エンドポイント:</label>
        <input
          type="text"
          id="azureEndpoint"
          name="azureEndpoint"
          value={settings.azureEndpoint}
          onChange={handleChange}
          placeholder="https://your-resource-name.openai.azure.com/"
        />
        <div className="field-hint">
          フォーマット: https://[リソース名].openai.azure.com/
        </div>
      </div>
      
      {/* デプロイメント名 */}
      <div className="form-group">
        <label htmlFor="azureDeploymentName">デプロイメント名:</label>
        <input
          type="text"
          id="azureDeploymentName"
          name="azureDeploymentName"
          value={settings.azureDeploymentName}
          onChange={handleChange}
          placeholder="デプロイメント名を入力してください"
        />
        <div className="field-hint">
          Azureでデプロイしたモデルのデプロイメント名
        </div>
      </div>
      
      {/* 詳細設定 */}
      {(showAdvancedSettings || isExpertMode) && (
        <>
          {/* モデルタイプ */}
          <div className="form-group">
            <label htmlFor="azureModelType">モデルタイプ:</label>
            <select
              id="azureModelType"
              name="azureModelType"
              value={settings.azureModelType || 'gpt-4'}
              onChange={handleChange}
            >
              {AZURE_MODELS.map(model => (
                <option key={model.value} value={model.value}>
                  {model.name}
                </option>
              ))}
            </select>
            <div className="field-hint">
              Azure上でデプロイした基盤モデルのタイプ
            </div>
          </div>
          
          {/* APIバージョン */}
          <div className="form-group">
            <label htmlFor="azureApiVersion">APIバージョン:</label>
            <input
              type="text"
              id="azureApiVersion"
              name="azureApiVersion"
              value={settings.azureApiVersion || '2023-05-15'}
              onChange={handleChange}
              placeholder="例: 2023-05-15"
            />
          </div>
          
          {/* 認証タイプ */}
          <div className="form-group">
            <label htmlFor="azureAuthType">認証タイプ:</label>
            <select
              id="azureAuthType"
              name="azureAuthType"
              value={settings.azureAuthType || 'apiKey'}
              onChange={handleChange}
            >
              {AZURE_AUTH_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.name}
                </option>
              ))}
            </select>
          </div>
          
          {/* Azure AD認証の場合のテナントID */}
          {settings.azureAuthType === 'azureAD' && (
            <div className="form-group">
              <label htmlFor="azureTenantId">テナントID:</label>
              <input
                type="text"
                id="azureTenantId"
                name="azureTenantId"
                value={settings.azureTenantId || ''}
                onChange={handleChange}
                placeholder="Azure ADテナントID"
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AzureSettings;