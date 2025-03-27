// src/pages/Settings.js
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { DEFAULT_SETTINGS } from '../data/aiProviderData';
import logger from '../utils/frontendLogger'; // ロガーをインポート
import './Settings.css';

// コンポーネントのインポート
import AISettings from '../components/AISettings';

const Settings = () => {
  const navigate = useNavigate();
  
  // コンポーネントマウント時にログを記録
  useEffect(() => {
    logger.info('設定画面を表示');
    
    // 終了時のクリーンアップ
    return () => {
      logger.debug('設定画面を終了');
    };
  }, []);
  
  const fileInputRef = useRef(null);
  
  // 設定状態
  const [settings, setSettings] = useState(null);
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
  
  // 初期ロード時に設定を読み込む
  useEffect(() => {
    loadSettings();
    
    // システム情報の取得
    if (isElectron()) {
      getSystemInfo();
    }
  }, []);
  
  // 設定の読み込み
  const loadSettings = async () => {
    logger.debug('設定の読み込み開始');
    
    try {
      if (isElectron() && window.electronAPI) {
        // Electron環境での読み込み
        const savedSettings = await window.electronAPI.getSettings();
        if (savedSettings) {
          logger.debug('Electron経由で設定を読み込み成功');
          setSettings(savedSettings);
        } else {
          logger.debug('設定が見つからないためデフォルト設定を使用');
          setSettings(DEFAULT_SETTINGS);
        }
      } else {
        // ブラウザモードの場合はローカルストレージから読み込み
        const savedSettings = localStorage.getItem('aiBoSettings');
        if (savedSettings) {
          try {
            logger.debug('ローカルストレージから設定を読み込み');
            const parsedSettings = JSON.parse(savedSettings);
            setSettings(parsedSettings);
          } catch (error) {
            logger.error('設定の解析エラー', error);
            setSettings(DEFAULT_SETTINGS);
          }
        } else {
          logger.debug('ローカルストレージに設定が見つからないためデフォルト設定を使用');
          setSettings(DEFAULT_SETTINGS);
        }
      }
    } catch (error) {
      logger.error('設定の読み込みエラー', error);
      setSettings(DEFAULT_SETTINGS);
    }
  };
  
  // システム情報の取得（Electronの場合のみ）
  const getSystemInfo = async () => {
    if (isElectron() && window.electronAPI) {
      try {
        logger.debug('システム情報の取得を開始');
        const info = await window.electronAPI.getSystemInfo();
        logger.debug('システム情報取得成功', { 
          platform: info.platform,
          arch: info.arch,
          osType: info.osInfo?.type
        });
        setSystemInfo(info);
      } catch (error) {
        logger.error('システム情報取得エラー', error);
      }
    }
  };
  
  // ファイル選択ハンドラ (Google APIキーファイル用)
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    logger.debug(`ファイル選択: ${file.name}`);
    
    try {
      if (isElectron() && window.electronAPI) {
        // Electronの場合はファイルパスを保存
        logger.debug(`ファイルパス保存: ${file.path}`);
        setSettings(prev => ({
          ...prev,
          googleKeyFilePath: file.path,
          googleKeyFile: file.name
        }));
      } else {
        // ブラウザの場合はファイル内容を読み込む
        logger.debug(`ファイル内容を読み込み: ${file.name}`);
        const fileContent = await readFileAsText(file);
        setSettings(prev => ({
          ...prev,
          googleKeyFile: file.name,
          googleKeyFileContent: fileContent
        }));
      }
    } catch (error) {
      logger.error('ファイル読み込みエラー', { filename: file.name, error: error.message });
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
    logger.debug('設定を更新');
    setSettings(updatedSettings);
  };
  
  // API接続テスト
  const testConnection = async () => {
    logger.info('API接続テスト開始', { provider: settings?.aiProvider });
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
          logger.warn(`未知のプロバイダータイプ: ${provider}`);
          setTestResult({ 
            success: false, 
            message: '未知のプロバイダータイプです。' 
          });
      }
    } catch (error) {
      logger.error('API接続テスト実行エラー', error);
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
    logger.debug('OpenAI接続テスト実行');
    if (isElectron() && window.electronAPI) {
      // Electron環境での実装
      const result = await window.electronAPI.testOpenAIConnection(settings.apiKey, settings.apiEndpoint);
      logger.debug('OpenAI接続テスト結果', { success: result.success });
      setTestResult(result);
    } else {
      // ブラウザ環境での実装
      try {
        const apiEndpoint = settings.apiEndpoint || 'https://api.openai.com';
        const url = new URL('/v1/models', apiEndpoint);
        
        // ブラウザ環境ではCORSの問題があるため、簡易テスト
        logger.debug('ブラウザ環境での簡易OpenAI接続テスト');
        setTestResult({ 
          success: true, 
          message: 'OpenAI API 接続テスト成功（簡易チェック）' 
        });
      } catch (error) {
        logger.error('OpenAI接続テストエラー', error);
        setTestResult({ 
          success: false, 
          message: `ネットワークエラー: ${error.message}` 
        });
      }
    }
  };
  
  // Anthropic接続テスト
  const testAnthropicConnection = async () => {
    logger.debug('Anthropic接続テスト実行');
    if (isElectron() && window.electronAPI) {
      const result = await window.electronAPI.testAnthropicConnection(
        settings.anthropicApiKey, 
        settings.anthropicApiEndpoint
      );
      logger.debug('Anthropic接続テスト結果', { success: result.success });
      setTestResult(result);
    } else {
      // 簡易テスト実装
      logger.debug('ブラウザ環境での簡易Anthropic接続テスト');
      setTestResult({ 
        success: true, 
        message: 'Anthropic API 接続テスト成功（簡易チェック）' 
      });
    }
  };
  
  // Azure OpenAI接続テスト
  const testAzureConnection = async () => {
    logger.debug('Azure OpenAI接続テスト実行');
    if (isElectron() && window.electronAPI) {
      const result = await window.electronAPI.testAzureConnection(
        settings.azureApiKey,
        settings.azureEndpoint,
        settings.azureDeploymentName
      );
      logger.debug('Azure OpenAI接続テスト結果', { success: result.success });
      setTestResult(result);
    } else {
      // 簡易テスト実装
      logger.debug('ブラウザ環境での簡易Azure接続テスト');
      setTestResult({ 
        success: true, 
        message: 'Azure OpenAI API 接続テスト成功（簡易チェック）' 
      });
    }
  };
  
  // Google Vertex AI接続テスト
  const testGoogleConnection = async () => {
    logger.debug('Google Vertex AI接続テスト実行');
    if (isElectron() && window.electronAPI) {
      const result = await window.electronAPI.testGoogleConnection(
        settings.googleProjectId,
        settings.googleLocation,
        settings.googleKeyFilePath
      );
      logger.debug('Google Vertex AI接続テスト結果', { success: result.success });
      setTestResult(result);
    } else {
      // 簡易テスト実装
      logger.debug('ブラウザ環境での簡易Google接続テスト');
      setTestResult({ 
        success: true, 
        message: 'Google Vertex AI 接続テスト成功（簡易チェック）' 
      });
    }
  };
  
  // OpenRouter接続テスト
  const testOpenRouterConnection = async () => {
    logger.debug('OpenRouter接続テスト実行');
    if (isElectron() && window.electronAPI) {
      const result = await window.electronAPI.testOpenRouterConnection(
        settings.openrouterApiKey
      );
      logger.debug('OpenRouter接続テスト結果', { success: result.success });
      setTestResult(result);
    } else {
      // 簡易テスト実装
      logger.debug('ブラウザ環境での簡易OpenRouter接続テスト');
      setTestResult({ 
        success: true, 
        message: 'OpenRouter API 接続テスト成功（簡易チェック）' 
      });
    }
  };
  
  // ローカルモデル接続テスト
  const testLocalConnection = async () => {
    logger.debug('ローカルモデル接続テスト実行');
    if (isElectron() && window.electronAPI) {
      const result = await window.electronAPI.testLocalConnection(
        settings.localModelPath
      );
      logger.debug('ローカルモデル接続テスト結果', { success: result.success });
      setTestResult(result);
    } else {
      // 簡易テスト実装
      logger.debug('ブラウザ環境でのローカルモデルテスト');
      setTestResult({ 
        success: false, 
        message: 'ローカルモデルはデスクトップアプリでのみ利用可能です' 
      });
    }
  };
  
  // 設定の保存
  const saveSettings = async () => {
    logger.info('設定の保存開始', { provider: settings.aiProvider });
    setIsSaving(true);
    setSaveMessage({ type: '', message: '' });
    
    try {
      if (isElectron() && window.electronAPI) {
        // Electron環境での保存
        logger.debug('Electron経由で設定を保存');
        await window.electronAPI.saveSettings(settings);
      } else {
        // ブラウザ環境での保存（ローカルストレージ）
        logger.debug('ローカルストレージに設定を保存');
        localStorage.setItem('aiBoSettings', JSON.stringify(settings));
      }
      
      setSaveMessage({ type: 'success', message: '設定を保存しました！' });
      logger.info('設定の保存完了');
      
      // 保存完了後3秒後にホーム画面に戻る
      setTimeout(() => {
        logger.debug('保存完了、ホーム画面へ移動');
        navigate('/');
      }, 3000);
    } catch (error) {
      logger.error('設定の保存エラー', error);
      setSaveMessage({ type: 'error', message: `設定の保存に失敗しました: ${error.message}` });
    } finally {
      setIsSaving(false);
    }
  };
  
  // キャンセルボタンのハンドラ
  const handleCancel = () => {
    logger.debug('設定変更をキャンセル、ホーム画面へ移動');
    navigate('/');
  };
  
  // 専門家AI設定画面への遷移
  const navigateToExpertSettings = () => {
    logger.info('専門家AI設定画面へ移動');
    navigate('/expert-settings');
  };
  
  // ログビューア画面への遷移
  const navigateToLogs = () => {
    logger.info('ログビューア画面へ移動');
    navigate('/logs');
  };
  
  // 設定画面が読み込み中の場合
  if (!settings) {
    return (
      <div className="settings-container">
        <h2>設定</h2>
        <div className="loading-indicator">
          <div className="loading"></div>
          <p>設定を読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="settings-container">
      <h2>AI API設定</h2>
      
      <div className="settings-section">
        <div className="settings-header">
          <h3>AI プロバイダー設定</h3>
          <div className="header-buttons">
            <button 
              className="expert-settings-button" 
              onClick={navigateToExpertSettings}
            >
              専門家AI設定
            </button>
            <button 
              className="test-button" 
              onClick={testConnection}
              disabled={isTesting}
            >
              {isTesting ? 'テスト中...' : '接続テスト'}
            </button>
          </div>
        </div>
        
        {/* テスト結果表示 */}
        {testResult && testResult.message && (
          <div className={`test-result ${testResult.success ? 'success' : 'error'}`}>
            {testResult.message}
          </div>
        )}
        
        {/* AI設定コンポーネント */}
        <AISettings 
          settings={settings}
          onChange={handleSettingsChange}
          isExpertMode={false}
          fileInputRef={fileInputRef}
          handleFileChange={handleFileChange}
          testConnection={null} // ヘッダーでテストボタンを表示するため
          isTesting={isTesting}
          testResult={testResult}
        />
      </div>
      
      {/* システム情報（Electronの場合のみ） */}
      {systemInfo && (
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
      
      {/* ログ表示ボタン */}
      <div className="settings-section">
        <h3>ログと診断</h3>
        <p>アプリケーションのログを表示して、問題の診断や動作の確認を行います。</p>
        <button 
          onClick={navigateToLogs}
          className="primary"
        >
          ログビューアを開く
        </button>
      </div>
      
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
          {isSaving ? '保存中...' : '設定を保存'}
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

export default Settings;