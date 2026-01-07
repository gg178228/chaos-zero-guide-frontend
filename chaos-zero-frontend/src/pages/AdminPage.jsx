import { useState } from 'react';
import CharacterAdmin from '../components/admin/CharacterAdmin';
import CardAdmin from '../components/admin/CardAdmin';
import './AdminPage.css';

function AdminPage() {
  const [activeTab, setActiveTab] = useState('characters'); // 'characters' or 'cards'

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1>관리자 페이지</h1>
        <p className="admin-subtitle">캐릭터와 카드를 관리할 수 있습니다</p>
      </div>

      {/* 탭 */}
      <div className="admin-tabs">
        <button
          className={activeTab === 'characters' ? 'active' : ''}
          onClick={() => setActiveTab('characters')}
        >
          캐릭터 관리
        </button>
        <button
          className={activeTab === 'cards' ? 'active' : ''}
          onClick={() => setActiveTab('cards')}
        >
          카드 관리
        </button>
      </div>

      {/* 콘텐츠 */}
      <div className="admin-content">
        {activeTab === 'characters' && <CharacterAdmin />}
        {activeTab === 'cards' && <CardAdmin />}
      </div>
    </div>
  );
}

export default AdminPage;