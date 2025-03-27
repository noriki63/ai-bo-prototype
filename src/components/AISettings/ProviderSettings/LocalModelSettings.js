import React from 'react';
import { LOCAL_QUANTIZATION_OPTIONS, LOCAL_DEVICE_OPTIONS } from '../../../data/aiProviderData';

/**
 * ローカルモデル固有の設定コンポーネント
 * 
 * @param {Object} props
 * @param {Object} props.settings - 現在の設定値
 * @param {Function} props.onChange - 設定変更時のコールバック関数
 * @param {boolean} props.showAdvancedSettings - 詳細設定を表示するかどうか
 * @param {boolean} props.isExpertMode - 専門家AI設定モードかどうか
 */
const LocalModelSettings = ({ 
  settings, 
  onChange, 
  showAdvancedSettings = false,
  isExpertMode = false
}) => {
  // Electronが使用可能かどうかをチェック
  const isElectron = () => {
    return window && window.process && window.process.type;
  };
  
  // フィールドの更新ハンドラ
  const handleChange = (e) => {
    const { name, value } = e.target;
    onChange(name, value);
  };
  
  // モデルパスの選択ダイアログを開く (Electronの場合のみ)
  const selectModelPath = async () => {
    if (isElectron() && window.electronAPI) {
      try {
        const result = await window.electronAPI.selectModelPath();
        if (result && result.filePath) {
          onChange('localModelPath', result.filePath);
        }
      } catch (error) {
        console.error('モデルパス選択エラー:', error);
      }
    } else {
      // ブラウザ環境の場合はメッセージ表示
      alert('ローカルモデル機能はデスクトップアプリ版でのみ利用可能です');
    }
  };
  
  return (
    <div className="local-model-settings">
      <div className="form-hint">
        <strong>注意:</strong> ローカルモデル機能はデスクトップアプリ版でのみ利用可能です。
        ダウンロード済みのモデルファイル（GGUF/GGML）を指定して使用します。
      </div>
      
      {/* モデルパス入力 */}
      <div className="form-group">
        <label htmlFor="localModelPath">モデルファイルパス:</label>
        <div className="file-input-display">
          <input
            type="text"
            id="localModelPath"
            name="localModelPath"
            value={settings.localModelPath || ''}
            onChange={handleChange}
            placeholder="モデルファイルへのパスを入力または選択"
            readOnly={isElectron()}
          />
          {isElectron() && (
            <button
              type="button"
              className="file-browse-button"
              onClick={selectModelPath}
            >
              選択
            </button>
          )}
        </div>
      </div>
      
      {/* 量子化オプション */}
      <div className="form-group">
        <label htmlFor="localQuantization">量子化タイプ:</label>
        <select
          id="localQuantization"
          name="localQuantization"
          value={settings.localQuantization || 'auto'}
          onChange={handleChange}
          disabled={!isElectron()}
        >
          {LOCAL_QUANTIZATION_OPTIONS.map(option => (
            <option key={option.value} value={option.value}>
              {option.name}
            </option>
          ))}
        </select>
        <div className="field-hint">
          低い量子化レベルでは精度が向上しますがメモリ使用量が増加します
        </div>
      </div>
      
      {/* コンテキストサイズ */}
      <div className="form-group">
        <label htmlFor="localContextSize">コンテキストサイズ:</label>
        <input
          type="number"
          id="localContextSize"
          name="localContextSize"
          value={settings.localContextSize || 4096}
          onChange={handleChange}
          placeholder="コンテキストウィンドウサイズ"
          min="1024"
          max="32768"
          step="1024"
          disabled={!isElectron()}
        />
        <div className="field-hint">
          モデルの最大入力トークン数（大きいほど多くの情報を処理できますがメモリを消費します）
        </div>
      </div>
      
      {/* GPU/CPU設定 */}
      <div className="form-group">
        <label htmlFor="localDevice">実行デバイス:</label>
        <select
          id="localDevice"
          name="localDevice"
          value={settings.localDevice || 'auto'}
          onChange={handleChange}
          disabled={!isElectron()}
        >
          {LOCAL_DEVICE_OPTIONS.map(option => (
            <option key={option.value} value={option.value}>
              {option.name}
            </option>
          ))}
        </select>
        <div className="field-hint">
          自動検出では利用可能なGPUを優先し、なければCPUにフォールバックします
        </div>
      </div>
      
      {/* 詳細設定 */}
      {showAdvancedSettings && (
        <>
          <div className="form-group">
            <label htmlFor="localThreads">
              スレッド数:
            </label>
            <input
              type="number"
              id="localThreads"
              name="localThreads"
              value={settings.localThreads || 4}
              onChange={handleChange}
              min="1"
              max="32"
              disabled={!isElectron()}
            />
            <div className="field-hint">
              CPU使用時の並列スレッド数（0=自動検出）
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="localBatchSize">
              バッチサイズ:
            </label>
            <input
              type="number"
              id="localBatchSize"
              name="localBatchSize"
              value={settings.localBatchSize || 512}
              onChange={handleChange}
              min="1"
              max="2048"
              disabled={!isElectron()}
            />
            <div className="field-hint">
              生成時のバッチサイズ（大きいほど高速ですが、メモリ使用量が増加します）
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default LocalModelSettings;