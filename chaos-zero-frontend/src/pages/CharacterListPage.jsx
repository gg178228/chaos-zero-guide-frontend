import { useState, useEffect } from 'react';
import { characterApi } from '../api/characterApi';
import { uploadApi } from '../api/uploadApi';  
import './CharacterListPage.css';


function CharacterListPage({ onSelectCharacter }) {  // props 
  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCharacters();
  }, []);

  const fetchCharacters = async () => {
    try {
      setLoading(true);
      const response = await characterApi.getAllCharacters();
      setCharacters(response.data);
      setError(null);
    } catch (err) {
      console.error('캐릭터 로딩 실패:', err);
      setError('캐릭터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">로딩 중...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="character-list-page">
      <h1>캐릭터 선택</h1>
      <p className="subtitle">덱을 구성할 캐릭터를 선택하세요</p>
      
      <div className="character-grid">
        {characters.map((character) => (
          <div key={character.id} className="character-card">
            <div className="character-image-placeholder">
              {character.imageUrl ? (
                <img 
                  src={uploadApi.getImageUrl(character.imageUrl)} 
                  alt={character.name} 
                />
              ) : (
                <div className="no-image">{character.name[0]}</div>
              )}
            </div>
            
            <div className="character-info">
              <h2>{character.name}</h2>
              <p className="character-description">{character.description}</p>
            </div>
            
            <button 
              className="select-button"
              onClick={() => onSelectCharacter(character)}  // 클릭 이벤트 추가!
            >
              카드 보기
            </button>
          </div>
        ))}
      </div>

      {characters.length === 0 && (
        <p className="no-characters">등록된 캐릭터가 없습니다.</p>
      )}
    </div>
  );
}

export default CharacterListPage;