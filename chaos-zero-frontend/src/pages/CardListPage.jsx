import { useState, useEffect } from 'react';
import { cardApi } from '../api/cardApi';
import { uploadApi } from '../api/uploadApi';  // 추가!
import './CardListPage.css';

function CardListPage({ selectedCharacter, onBack }) {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchCards();
  }, [selectedCharacter]);

  const fetchCards = async () => {
    try {
      setLoading(true);
      
      if (selectedCharacter) {
        // 선택된 캐릭터가 있으면: 캐릭터 전용 카드 + 중립 카드
        const [characterResponse, neutralResponse] = await Promise.all([
          cardApi.getCardsByCharacter(selectedCharacter.id),
          cardApi.getNeutralCards()
        ]);
        
        // 두 배열 합치기
        setCards([...characterResponse.data, ...neutralResponse.data]);
      } else {
        // 선택된 캐릭터 없으면: 전체 카드
        const response = await cardApi.getAllCards();
        setCards(response.data);
      }
      
      setError(null);
    } catch (err) {
      console.error('카드 로딩 실패:', err);
      setError('카드를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 검색 필터링
  const filteredCards = cards.filter(card => 
    card.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="loading">로딩 중...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="card-list-page">
      {/* 뒤로가기 버튼 (캐릭터 선택 시에만) */}
      {selectedCharacter && (
        <button className="back-button" onClick={onBack}>
          ← 캐릭터 선택으로 돌아가기
        </button>
      )}

      <h1>
        {selectedCharacter 
          ? `${selectedCharacter.name}의 카드` 
          : '전체 카드 목록'}
      </h1>
      
      {/* 검색창 */}
      <div className="search-bar">
        <input
          type="text"
          placeholder="카드 이름 검색..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        {searchTerm && (
          <button 
            className="clear-button"
            onClick={() => setSearchTerm('')}
          >
            ✕
          </button>
        )}
      </div>
      
      <p>총 {filteredCards.length}개의 카드</p>
      
      <div className="card-grid">
        {filteredCards.map((card) => (
          <div key={card.id} className="card-item">
            <div className="card-cost">{card.cost}</div>
            
            {/* 중립 카드 표시 */}
            {card.isNeutral && (
              <div className="neutral-badge">중립</div>
            )}
            
            <h3>{card.name}</h3>
            <p className="card-description">{card.description}</p>
            
            <div className="card-footer">
              <span className="card-type">{card.cardType}</span>
              <span className={`card-rarity ${card.rarity.toLowerCase()}`}>
                {card.rarity}
              </span>
            </div>
            
            {/* PT 점수 표시 */}
            <div className="card-pt">
              PT: {card.ptValue}
            </div>
          </div>
        ))}
      </div>

      {filteredCards.length === 0 && cards.length > 0 && (
        <p className="no-cards">검색 결과가 없습니다.</p>
      )}

      {cards.length === 0 && (
        <p className="no-cards">등록된 카드가 없습니다.</p>
      )}
    </div>
  );
}

export default CardListPage;