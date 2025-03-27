import React from 'react';

/**
 * カスタムモデル設定コンポーネント
 * 
 * ユーザー定義のカスタムAIモデルを追加・編集・削除するためのインターフェースを提供します。
 * 
 * @param {Object} props
 * @param {Array} props.models - カスタムモデルの配列
 * @param {Function} props.onChange - モデル変更時のコールバック関数
 */
const CustomModelSettings = ({ models = [], onChange }) => {
  // 新しいカスタムモデルを追加
  const addCustomModel = () => {
    onChange([...models, { id: Date.now(), name: '', value: '' }]);
  };
  
  // 既存のカスタムモデルを更新
  const updateCustomModel = (id, field, value) => {
    onChange(models.map(model => 
      model.id === id ? { ...model, [field]: value } : model
    ));
  };
  
  // カスタムモデルを削除
  const removeCustomModel = (id) => {
    onChange(models.filter(model => model.id !== id));
  };
  
  return (
    <div className="custom-model-settings">
      <div className="section-header">
        <h4>カスタムモデル</h4>
        <button 
          type="button" 
          className="add-model-button" 
          onClick={addCustomModel}
        >
          + 追加
        </button>
      </div>
      
      {models.length > 0 ? (
        <div className="custom-models-list">
          {models.map(model => (
            <div key={model.id} className="custom-model-item">
              <div className="model-inputs">
                <input
                  type="text"
                  placeholder="モデル表示名"
                  value={model.name}
                  onChange={(e) => updateCustomModel(model.id, 'name', e.target.value)}
                />
                <input
                  type="text"
                  placeholder="モデルID (API識別子)"
                  value={model.value}
                  onChange={(e) => updateCustomModel(model.id, 'value', e.target.value)}
                />
              </div>
              <button 
                type="button" 
                className="remove-model-button"
                onClick={() => removeCustomModel(model.id)}
              >
                削除
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="no-models-message">
          カスタムモデルはまだ追加されていません
        </div>
      )}
      
      <div className="form-hint">
        <p>カスタムモデルを追加すると、標準のモデル選択肢に加えて表示されます。新しいモデルがリリースされた場合や、ファインチューニングしたモデルを使用する場合に便利です。</p>
      </div>
    </div>
  );
};

export default CustomModelSettings;