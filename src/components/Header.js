import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import ProjectContext from '../context/ProjectContext';
import './Header.css';

const Header = () => {
  const { project } = useContext(ProjectContext);
  const location = useLocation();

  // 現在のフェーズに基づいてナビゲーションを強調表示
  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  // 現在進行中のプロジェクトがあるかどうかを判定
  const hasActiveProject = project.name && project.name.length > 0;

  return (
    <header className="app-header">
      <div className="logo">
        <h1>AI棒</h1>
      </div>
      
      {hasActiveProject && (
        <div className="project-info">
          <h2>{project.name}</h2>
        </div>
      )}
      
      <nav className="main-navigation">
        <ul>
          {/* プロジェクト作成は常に表示する */}
          <li className={isActive('/')}>
            <Link to="/">プロジェクト作成</Link>
          </li>
          
          {/* その他のリンクはプロジェクトがアクティブな時のみ表示 */}
          {hasActiveProject && (
            <>
              <li className={isActive('/requirements')}>
                <Link to="/requirements">要件定義</Link>
              </li>
              <li className={isActive('/design')}>
                <Link to="/design">設計</Link>
              </li>
              <li className={isActive('/implementation')}>
                <Link to="/implementation">実装</Link>
              </li>
            </>
          )}
          
          <li className={isActive('/settings')}>
            <Link to="/settings" className="settings-link">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-gear-fill" viewBox="0 0 16 16">
                <path d="M9.405 1.05c-.413-1.4-2.397-1.4-2.81 0l-.1.34a1.464 1.464 0 0 1-2.105.872l-.31-.17c-1.283-.698-2.686.705-1.987 1.987l.169.311c.446.82.023 1.841-.872 2.105l-.34.1c-1.4.413-1.4 2.397 0 2.81l.34.1a1.464 1.464 0 0 1 .872 2.105l-.17.31c-.698 1.283.705 2.686 1.987 1.987l.311-.169a1.464 1.464 0 0 1 2.105.872l.1.34c.413 1.4 2.397 1.4 2.81 0l.1-.34a1.464 1.464 0 0 1 2.105-.872l.31.17c1.283.698 2.686-.705 1.987-1.987l-.169-.311a1.464 1.464 0 0 1 .872-2.105l.34-.1c1.4-.413 1.4-2.397 0-2.81l-.34-.1a1.464 1.464 0 0 1-.872-2.105l.17-.31c.698-1.283-.705-2.686-1.987-1.987l-.311.169a1.464 1.464 0 0 1-2.105-.872l-.1-.34z"/>
              </svg>
              設定
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;