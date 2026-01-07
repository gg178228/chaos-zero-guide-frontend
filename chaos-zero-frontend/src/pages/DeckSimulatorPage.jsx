import { useState, useEffect } from 'react';
import { cardApi } from '../api/cardApi';
import { uploadApi } from '../api/uploadApi';
import './DeckSimulatorPage.css';

function DeckSimulatorPage({ character, onBack }) {
  const [availableCards, setAvailableCards] = useState([]); // 선택 가능한 카드
  const [deck, setDeck] = useState([]); // 내 덱
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchCards();
  }, [character]);

   const fetchCards = async () => {
    try {
      setLoading(true);
      const [characterResponse, neutralResponse] = await Promise.all([
        cardApi.getCardsByCharacter(character.id),
        cardApi.getNeutralCards()
      ]);
      
      setAvailableCards([...characterResponse.data, ...neutralResponse.data]);
      setError(null);
    } catch (err) {
      console.error('카드 로딩 실패:', err);
      setError('카드를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 카드를 덱에 추가
  const addCardToDeck = (card) => {
    const existingCard = deck.find(dc => dc.id === card.id);
    
    if (existingCard) {
      // 이미 있으면 수량 증가
      setDeck(deck.map(dc => 
        dc.id === card.id 
          ? { ...dc, quantity: dc.quantity + 1 }
          : dc
      ));
    } else {
      // 없으면 새로 추가
      setDeck([...deck, { ...card, quantity: 1 }]);
    }
  };

  // 카드를 덱에서 제거 (1장씩)
  const removeCardFromDeck = (cardId) => {
    const existingCard = deck.find(dc => dc.id === cardId);
    
    if (existingCard.quantity > 1) {
      // 수량이 2 이상이면 1 감소
      setDeck(deck.map(dc => 
        dc.id === cardId 
          ? { ...dc, quantity: dc.quantity - 1 }
          : dc
      ));
    } else {
      // 수량이 1이면 완전 제거
      setDeck(deck.filter(dc => dc.id !== cardId));
    }
  };

  // 덱 초기화
  const clearDeck = () => {
    setDeck([]);
  };

  // 총 카드 수 계산
  const totalCards = deck.reduce((sum, card) => sum + card.quantity, 0);

  // 총 PT 점수 계산
  const totalPT = deck.reduce((sum, card) => sum + (card.ptValue * card.quantity), 0);

  // 검색 필터링
  const filteredCards = availableCards.filter(card => 
    card.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="loading">로딩 중...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="deck-simulator-page">
      {/* 헤더 */}
      <div className="simulator-header">
        <button className="back-button" onClick={onBack}>
          ← 캐릭터 선택으로
        </button>
        <h1>{character.name}의 덱 빌더</h1>
      </div>

      {/* 메인 레이아웃 */}
      <div className="simulator-layout">
        
        {/* 왼쪽: 카드 목록 */}
        <div className="cards-section">
          <h2>사용 가능한 카드</h2>
          
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

          <p className="card-count">총 {filteredCards.length}개의 카드</p>

          {/* 카드 그리드 */}
          <div className="card-grid">
            {filteredCards.map((card) => (
              <div 
                key={card.id} 
                className="card-item"
                onClick={() => addCardToDeck(card)}
              >
                <div className="card-cost">{card.cost}</div>
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
                <div className="card-pt">PT: {card.ptValue}</div>
                <div className="click-hint">클릭해서 추가</div>
              </div>
            ))}
          </div>
        </div>

        {/* 오른쪽: 내 덱 */}
        <div className="deck-section">
          <h2>내 덱</h2>
          
          {/* 덱 통계 */}
          <div className="deck-stats">
            <div className="stat-item">
              <span className="stat-label">총 카드:</span>
              <span className="stat-value">{totalCards}장</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">총 PT:</span>
              <span className="stat-value highlight">{totalPT}점</span>
            </div>
          </div>

          {/* 덱 초기화 버튼 */}
          {deck.length > 0 && (
            <button className="clear-deck-button" onClick={clearDeck}>
              덱 초기화
            </button>
          )}

          {/* 덱 카드 목록 */}
          <div className="deck-list">
            {deck.length === 0 ? (
              <p className="empty-deck">카드를 클릭해서 덱에 추가하세요</p>
            ) : (
              deck.map((card) => (
                <div key={card.id} className="deck-card-item">
                  <div className="deck-card-info">
                    <div className="deck-card-header">
                      <span className="deck-card-name">{card.name}</span>
                      <span className="deck-card-cost">코스트: {card.cost}</span>
                    </div>
                    <div className="deck-card-details">
                      <span className="deck-card-type">{card.cardType}</span>
                      <span className="deck-card-pt">PT: {card.ptValue}</span>
                    </div>
                  </div>
                  <div className="deck-card-controls">
                    <span className="deck-card-quantity">x{card.quantity}</span>
                    <button 
                      className="remove-button"
                      onClick={() => removeCardFromDeck(card.id)}
                    >
                      −
                    </button>
                    <button 
                      className="add-button"
                      onClick={() => addCardToDeck(card)}
                    >
                      +
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DeckSimulatorPage;