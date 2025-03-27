import React from 'react';
import { FALLBACK_OPTIONS, AI_PROVIDERS } from '../../data/aiProviderData';

/**
 * エラーハンドリング設定コンポーネント
 * 
 * API呼び出し時のエラー処理戦略を設定するためのインターフェースを提供します。
 * 
 * @param {Object} props
 * @param {Object} props.errorHandling - エラーハンドリング設定
 * @param {Function} props.onChange - 設定変更時のコールバック関数
 * @param {string} props.currentProvider - 現在選択されているプロバイダーID
 */
const ErrorHandlingSettings = ({ 
  errorHandling = {}, 
  onChange,
  currentProvider
}) => {
  // デフォルト値の設定
  const fallbackStrategy = errorHandling.fallbackStrategy || 'retry';
  const retryCount = errorHandling.retryCount || 3;
  const retryDelay = errorHandling.retryDelay || 1000;
  const alternateModel = errorHandling.alternateModel || '';
  const alternateProvider = errorHandling.alternateProvider || '';
  
  // フィールド更新ハンドラ
  const handleChange = (field, value) => {
    onChange(field, value);
  };
  
  return (
    <div className="error-handling-settings">
      <h4>エラーハンドリング設定</h4>
      
      <div className="form-group">
        <label htmlFor="fallbackStrategy">フォールバック戦略:</label>
        <select
          id="fallbackStrategy"
          value={fallbackStrategy}
          onChange={(e) => handleChange('fallbackStrategy', e.target.value)}
        >
          {FALLBACK_OPTIONS.map(option => (
            <option key={option.value} value={option.value}>
              {option.name}
            </option>
          ))}
        </select>
      </div>
      
      {/* 再試行オプション */}
      {(fallbackStrategy === 'retry' || !fallbackStrategy) && (
        <>
          <div className="form-group">
            <label htmlFor="retryCount">再試行回数:</label>
            <input
              type="number"
              id="retryCount"
              min="1"
              max="5"
              value={retryCount}
              onChange={(e) => handleChange('retryCount', parseInt(e.target.value))}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="retryDelay">再試行間隔 (ミリ秒):</label>
            <input
              type="number"
              id="retryDelay"
              min="500"
              max="10000"
              step="500"
              value={retryDelay}
              onChange={(e) => handleChange('retryDelay', parseInt(e.target.value))}
            />
          </div>
        </>
      )}
      
      {/* 代替モデル */}
      {fallbackStrategy === 'alternateModel' && (
        <div className="form-group">
          <label htmlFor="alternateModel">代替モデル:</label>
          <input
            type="text"
            id="alternateModel"
            placeholder="代替モデル名"
            value={alternateModel}
            onChange={(e) => handleChange('alternateModel', e.target.value)}
          />
          <div className="field-hint">
            同じプロバイダー内の別モデル名を指定
          </div>
        </div>
      )}
      
      {/* 代替プロバイダー */}
      {fallbackStrategy === 'alternateProvider' && (
        <div className="form-group">
          <label htmlFor="alternateProvider">代替プロバイダー:</label>
          <select
            id="alternateProvider"
            value={alternateProvider}
            onChange={(e) => handleChange('alternateProvider', e.target.value)}
          >
            {AI_PROVIDERS.map(provider => (
              <option 
                key={provider.id} 
                value={provider.id}
                disabled={provider.id === currentProvider}
              >
                {provider.name}
              </option>
            ))}
          </select>
        </div>
      )}
      
      <div className="form-hint">
        <p>エラーハンドリング設定は、API呼び出しが失敗した場合の挙動を制御します。適切な設定により、一時的なエラーからの回復力が向上します。</p>
      </div>
    </div>
  );
};

export default ErrorHandlingSettings;