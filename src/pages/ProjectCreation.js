import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import ProjectContext from '../context/ProjectContext';
import './ProjectCreation.css';

const ProjectCreation = () => {
  const navigate = useNavigate();
  const { project, setProject } = useContext(ProjectContext);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // フォーム入力の状態
  const [formData, setFormData] = useState({
    name: project.name || '',
    specification: project.specification || '',
    techStack: false,
    architecture: false,
    database: false,
    security: false,
    performance: false
  });

  // 入力変更ハンドラ
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  // 詳細設定の表示切り替え
  const toggleAdvanced = () => {
    setShowAdvanced(!showAdvanced);
  };

  // プロジェクト作成ハンドラ
  const handleCreateProject = (e) => {
    e.preventDefault();
    setIsProcessing(true);
    
    // プロジェクト情報を更新
    setProject({
      ...project,
      name: formData.name,
      specification: formData.specification,
      advancedSettings: {
        techStack: formData.techStack,
        architecture: formData.architecture,
        database: formData.database,
        security: formData.security,
        performance: formData.performance
      },
      currentPhase: 'requirements'
    });
    
    // 処理のシミュレーション
    setTimeout(() => {
      setIsProcessing(false);
      navigate('/requirements');
    }, 1500);
  };

  return (
    <div className="project-creation-container">
      <h2>新規プロジェクト作成</h2>
      
      <form onSubmit={handleCreateProject} className="project-form card">
        <div className="form-group">
          <label htmlFor="projectName">プロジェクト名:</label>
          <input
            type="text"
            id="projectName"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="プロジェクト名を入力してください"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="projectSpec">プロジェクト概要（どんなシステムを作りたいか）:</label>
          <textarea
            id="projectSpec"
            name="specification"
            value={formData.specification}
            onChange={handleChange}
            placeholder="作りたいシステムの概要を自由に記述してください"
            required
          />
        </div>
        
        <div className="advanced-settings">
          <button 
            type="button" 
            className="toggle-advanced secondary"
            onClick={toggleAdvanced}
          >
            {showAdvanced ? '詳細設定を隠す ▲' : '詳細設定を表示 ▼'}
          </button>
          
          {showAdvanced && (
            <div className="advanced-options">
              <p>以下のオプションを選択すると、より詳細な設定が可能になります：</p>
              <div className="checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    name="techStack"
                    checked={formData.techStack}
                    onChange={handleChange}
                  />
                  技術スタック指定
                </label>
                
                <label>
                  <input
                    type="checkbox"
                    name="architecture"
                    checked={formData.architecture}
                    onChange={handleChange}
                  />
                  アーキテクチャ指定
                </label>
                
                <label>
                  <input
                    type="checkbox"
                    name="database"
                    checked={formData.database}
                    onChange={handleChange}
                  />
                  データベース要件
                </label>
                
                <label>
                  <input
                    type="checkbox"
                    name="security"
                    checked={formData.security}
                    onChange={handleChange}
                  />
                  セキュリティ要件
                </label>
                
                <label>
                  <input
                    type="checkbox"
                    name="performance"
                    checked={formData.performance}
                    onChange={handleChange}
                  />
                  パフォーマンス要件
                </label>
              </div>
            </div>
          )}
        </div>
        
        <div className="button-group">
          <button 
            type="submit" 
            className="create-button"
            disabled={isProcessing || !formData.name || !formData.specification}
          >
            {isProcessing ? '処理中...' : 'プロジェクト作成'}
          </button>
        </div>
        
        {isProcessing && (
          <div className="loading-indicator">
            <div className="loading"></div>
            <p>プロジェクトを初期化しています...</p>
          </div>
        )}
      </form>
    </div>
  );
};

export default ProjectCreation;
