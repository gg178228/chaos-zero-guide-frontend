import { useState } from 'react';
import CardListPage from './pages/CardListPage';
import CharacterListPage from './pages/CharacterListPage';
import DeckSimulatorPage from './pages/DeckSimulatorPage';
import AdminPage from './pages/AdminPage';
import './App.css';

function App() {
  const [currentPage, setCurrentPage] = useState('characters');
  const [selectedCharacter, setSelectedCharacter] = useState(null);

  const handleSelectCharacter = (character) => {
    setSelectedCharacter(character);
    setCurrentPage('deck-simulator');
  };

  const handleBack = () => {
    setSelectedCharacter(null);
    setCurrentPage('characters');
  };

  return (
    <div className="app">
      <nav className="navigation">
        <h1 className="site-title">카오스 제로 나이트메어 공략</h1>
        <div className="nav-buttons">
          <button 
            className={currentPage === 'characters' ? 'active' : ''}
            onClick={() => {
              setCurrentPage('characters');
              setSelectedCharacter(null);
            }}
          >
            캐릭터
          </button>
          <button 
            className={currentPage === 'cards' ? 'active' : ''}
            onClick={() => {
              setCurrentPage('cards');
              setSelectedCharacter(null);
            }}
          >
            전체 카드
          </button>
          <button 
            className={currentPage === 'admin' ? 'active' : ''}
            onClick={() => {
              setCurrentPage('admin');
              setSelectedCharacter(null);
            }}
          >
            관리자
          </button>
        </div>
      </nav>

      <main className="main-content">
        {currentPage === 'characters' && (
          <CharacterListPage onSelectCharacter={handleSelectCharacter} />
        )}
        {currentPage === 'cards' && (
          <CardListPage 
            selectedCharacter={selectedCharacter} 
            onBack={handleBack}
          />
        )}
        {currentPage === 'deck-simulator' && selectedCharacter && (
          <DeckSimulatorPage 
            character={selectedCharacter}
            onBack={handleBack}
          />
        )}
        {currentPage === 'admin' && <AdminPage />}
      </main>
    </div>
  );
}

export default App;