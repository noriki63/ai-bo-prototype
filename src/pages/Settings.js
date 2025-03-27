import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AISettingsBase from './AISettingsBase';
import { DEFAULT_SETTINGS } from '../data/aiProviderData';
import './Settings.css';

/**
 * Settings - AI棒のメイン設定画面
 * 
 * AIプロバイダーの設定、システム情報の表示、設定の保存などを処理します。
 * 共通のAISettingsBaseコンポーネントを使用して実装されています。
 */
const Settings = () => {
  const navigate = useNavigate();
  const [saveError, setSaveError] = useState(null);
  
  // 初期設定の読み込み
  const [initialSettings, setInitialSettings] = useState(() => {
    // ブラウザの場合はローカルストレージから読み込み
    if (!(window && window.process && window.process.type)) {
      const savedSettings = localStorage.getItem('aiBoSettings');
      if (savedSettings) {
        try {
          return JSON.parse(savedSettings);
        } catch (error) {
          console.error('設定の解析エラー:', error);
        }
      }
    }
    return DEFAULT_SETTINGS;
  });
  
  // 設定保存完了時の処理
  const handleSaveComplete = (savedSettings) => {
    // 設定保存が完了したら、3秒後にホーム画面に戻る
    setTimeout(() => {
      navigate('/');
    }, 3000);
  };
  
  // 画面遷移用のハンドラ
  const handleNavigate = (path) => {
    navigate(path);
  };
  
  // 専門家AI設定画面への遷移
  const navigateToExpertSettings = () => {
    navigate('/expert-settings');
  };
  
  return (
    <AISettingsBase 
      mode="summary"
      initialSettings={initialSettings}
      onSaveComplete={handleSaveComplete}
      onNavigate={handleNavigate}
      showSystemInfo={true}
      onOpenExpertSettings={navigateToExpertSettings}
    />
  );
};

export default Settings;