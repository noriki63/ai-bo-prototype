import React from 'react';
import { GOOGLE_LOCATIONS, GOOGLE_AUTH_OPTIONS } from '../../../data/aiProviderData';

/**
 * Google Vertex AI固有の設定コンポーネント
 * 
 * @param {Object} props
 * @param {Object} props.settings - 現在の設定値
 * @param {Function} props.onChange - 設定変更時のコールバック関数
 * @param {boolean} props.showAdvancedSettings - 詳細設定を表示するかどうか
 * @param {boolean} props.isExpertMode - 専門家AI設定モードかどうか
 * @param {Object} props.fileInputRef - ファイル入力のrefオブジェクト
 * @param {Function} props.handleFileChange - ファイル選択時のハンドラ
 * @param {Function} props.handleGoogleAuth - Google認証ボタンクリック時のハンドラ
 */
const GoogleSettings = ({ 
  settings, 
  onChange, 
  showAdvancedSettings = false,
  isExpertMode = false,
  fileInputRef,
  handleFileChange,
  handleGoogleAuth
}) => {
  // フィールドの更新ハンドラ
  const handleChange = (e) => {
    const { name, value } = e.target;
    onChange(name, value);
  };
  
  return (
    <div className="google-settings">
      {/* プロジェクトID入力 */}
      <div className="form-group">
        <label htmlFor="googleProjectId">Google Cloud プロジェクトID:</label>
        <input
          type="text"
          id="googleProjectId"
          name="googleProjectId"
          value={settings.googleProjectId || ''}
          onChange={handleChange}
          placeholder="プロジェクトIDを入力してください"
        />
      </div>
      
      {/* ロケーション選択 */}
      <div className="form-group">
        <label htmlFor="googleLocation">ロケーション:</label>
        <select
          id="googleLocation"
          name="googleLocation"
          value={settings.googleLocation || 'us-central1'}
          onChange={handleChange}
        >
          {GOOGLE_LOCATIONS.map(location => (
            <option key={location.value} value={location.value}>
              {location.name}
            </option>
          ))}
        </select>
      </div>
      
      {/* 認証方法 */}
      <div className="form-group">
        <label htmlFor="googleAuthType">認証方法:</label>
        <select
          id="googleAuthType"
          name="googleAuthType"
          value={settings.googleAuthType || 'keyFile'}
          onChange={handleChange}
        >
          {GOOGLE_AUTH_OPTIONS.map(option => (
            <option key={option.value} value={option.value}>
              {option.name}
            </option>
          ))}
        </select>
      </div>
      
      {/* サービスアカウントキー */}
      {(settings.googleAuthType === 'keyFile' || !settings.googleAuthType) && (
        <div className="form-group">
          <label htmlFor="googleKeyFile">サービスアカウントキー (JSON):</label>
          <div className="file-input-container">
            <input
              type="file"
              id="googleKeyFile"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".json"
              style={{ display: 'none' }}
            />
            <div className="file-input-display">
              <input
                type="text"
                value={settings.googleKeyFile || ''}
                placeholder="JSONキーファイルを選択"
                readOnly
              />
              <button
                type="button"
                className="file-browse-button"
                onClick={() => fileInputRef.current && fileInputRef.current.click()}
              >
                選択
              </button>
            </div>
          </div>
          <div className="field-hint">
            Google Cloud Consoleからダウンロードしたサービスアカウントキーファイルをアップロードしてください
          </div>
        </div>
      )}
      
      {/* OAuth認証 */}
      {settings.googleAuthType === 'oauth' && (
        <div className="form-group">
          <button 
            type="button" 
            className="google-auth-button"
            onClick={handleGoogleAuth}
          >
            <i className="fab fa-google"></i>
            Google認証で接続
          </button>
          <div className="field-hint">
            Googleアカウントで認証して、AIモデルにアクセスします
          </div>
        </div>
      )}
      
      {/* 詳細設定 */}
      {showAdvancedSettings && (
        <>
          <div className="form-group">
            <label htmlFor="googleQuotaProject">
              クォータプロジェクト:
              <span className="optional-label">（オプション）</span>
            </label>
            <input
              type="text"
              id="googleQuotaProject"
              name="googleQuotaProject"
              value={settings.googleQuotaProject || ''}
              onChange={handleChange}
              placeholder="クォータプロジェクトID（オプション）"
            />
            <div className="field-hint">
              APIクォータを使用するプロジェクトID（未指定時はプロジェクトIDを使用）
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default GoogleSettings;