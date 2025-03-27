import React from 'react';
import { getModelOptionsForProvider } from '../../data/aiProviderData';

/**
 * モデル設定コンポーネント
 * 
 * 選択されたAIプロバイダーに応じたモデル選択と
 * 共通設定（Temperature、トークン数など）を表示します。
 * 
 * @param {Object} props
 * @param {Object} props.settings - 現在の設定値
 * @param {Function} props.onChange - 設定変更時のコールバック関数
 * @param {boolean} props.isExpertMode - 専門家AI設定モードかどうか
 * @param {boolean} props.showAdvancedSettings - 詳細設定を表示するかどうか
 */
const ModelSettings = ({ 
  settings, 
  onChange,
  isExpertMode = false,
  showAdvancedSettings = false
}) => {
  // 現在のプロバイダーに対応するモデルオプションを取得
  const modelOptions = getModelOptionsForProvider(settings.aiProvider);
  
  // モデル選択が有効かどうかを確認
  const isModelSelectDisabled = 
    settings.aiProvider === 'azure' || 
    settings.aiProvider === 'openrouter';
  
  // 適切なモデル設定フィールド名を取得
  const getModelFieldName = () => {
    switch (settings.aiProvider) {
      case 'anthropic':
        return 'anthropicModel';
      case 'google':
        return 'googleModel';
      case 'openrouter':
        return 'openrouterModel';
      default:
        return 'model';
    }
  };
  
  // フィールド更新ハンドラ
  const handleModelChange = (e) => {
    onChange(getModelFieldName(), e.target.value);
  };
  
  // フィールド値を取得
  const getModelValue = () => {
    switch (settings.aiProvider) {
      case 'anthropic':
        return settings.anthropicModel || settings.model;
      case 'google':
        return settings.googleModel || settings.model;
      case 'openrouter':
        return settings.openrouterModel;
      default:
        return settings.model;
    }
  };
  
  return (
    <div className="model-settings">
      <h4>モデル設定</h4>
      
      {/* モデル選択 */}
      {!isModelSelectDisabled && (
        <div className="form-group">
          <label htmlFor="model">デフォルトモデル:</label>
          <select
            id="model"
            name="model"
            value={getModelValue()}
            onChange={handleModelChange}
            disabled={isModelSelectDisabled}
          >
            {modelOptions.map(model => (
              <option key={model.value} value={model.value}>
                {model.name}
              </option>
            ))}
          </select>
          
          {isModelSelectDisabled && (
            <div className="field-hint">
              {settings.aiProvider === 'azure' 
                ? 'Azureモードではデプロイメント名が使用されます'
                : 'OpenRouterモードでは別途モデルが選択されます'}
            </div>
          )}
        </div>
      )}
      
      {/* Temperature設定 */}
      <div className="form-group slider-group">
        <label htmlFor="temperature">
          Temperature:
          <span className="slider-value">{settings.temperature}</span>
        </label>
        <input
          type="range"
          id="temperature"
          name="temperature"
          min="0"
          max="2"
          step="0.1"
          value={settings.temperature}
          onChange={(e) => onChange('temperature', parseFloat(e.target.value))}
        />
        <div className="slider-labels">
          <span>精確 (0)</span>
          <span>標準 (1)</span>
          <span>創造的 (2)</span>
        </div>
      </div>
      
      {/* 最大トークン数設定 */}
      <div className="form-group slider-group">
        <label htmlFor="maxTokens">
          最大トークン数:
          <span className="slider-value">{settings.maxTokens}</span>
        </label>
        <input
          type="range"
          id="maxTokens"
          name="maxTokens"
          min="1000"
          max="8000"
          step="500"
          value={settings.maxTokens}
          onChange={(e) => onChange('maxTokens', parseInt(e.target.value))}
        />
      </div>
      
      {/* プロンプトプレフィックス (詳細設定時のみ表示) */}
      {showAdvancedSettings && (
        <div className="form-group">
          <label htmlFor="promptPrefix">プロンプトプレフィックス:</label>
          <textarea
            id="promptPrefix"
            name="promptPrefix"
            value={settings.promptPrefix || ''}
            onChange={(e) => onChange('promptPrefix', e.target.value)}
            placeholder="すべてのプロンプトの先頭に追加されるテキスト"
            rows={3}
          />
          <div className="field-hint">
            各リクエストの先頭に追加される指示文（システムメッセージ）
          </div>
        </div>
      )}
    </div>
  );
};

export default ModelSettings;