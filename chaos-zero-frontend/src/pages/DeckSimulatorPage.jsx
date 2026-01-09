import { useState, useEffect } from 'react';
import { cardApi } from '../api/cardApi';
import { uploadApi } from '../api/uploadApi';
import './DeckSimulatorPage.css';

function DeckSimulatorPage({ character, onBack }) {
const [availableCards, setAvailableCards] = useState([]);
const [deck, setDeck] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);
const [searchTerm, setSearchTerm] = useState('');
const [deckMetadata, setDeckMetadata] = useState({
  removeCount: 0,
  duplicateCount: 0,
  startCardRemoveCount: 0,
  divineGlimmerDuplicateCount: 0,
  tierLevel: 1
});

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
    // 이미 있으면 수량 증가 (복제로 간주)
    setDeck(deck.map(dc => 
      dc.id === card.id 
        ? { ...dc, quantity: dc.quantity + 1, duplicateCount: (dc.duplicateCount || 0) + 1 }
        : dc
    ));
    
    // 복제 메타데이터 업데이트
    setDeckMetadata(prev => ({
      ...prev,
      duplicateCount: prev.duplicateCount + 1,
      divineGlimmerDuplicateCount: card.isDivineGlimmer 
        ? prev.divineGlimmerDuplicateCount + 1 
        : prev.divineGlimmerDuplicateCount
    }));
  } else {
    // 없으면 새로 추가
    setDeck([...deck, { ...card, quantity: 1, duplicateCount: 0 }]);
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

// 총 PT 점수 계산 (기존 - 유지)
const totalPT = deck.reduce((sum, card) => sum + (card.ptValue * card.quantity), 0);


// 1. 카드 획득 비용 계산
const calculateCardAcquisitionPT = () => {
  return deck.reduce((sum, card) => {
    const cardPT = card.calculatedPT || card.ptValue || 20;
    return sum + (cardPT * card.quantity);
  }, 0);
};

// 2. 카드 제거 비용 계산
const calculateRemovePT = () => {
  const { removeCount, startCardRemoveCount } = deckMetadata;
  let removePT = 0;
  
  for (let i = 1; i < removeCount; i++) {
    if (i === 1) removePT += 10;
    else if (i === 2) removePT += 30;
    else if (i === 3) removePT += 50;
    else removePT += 70;
  }
  
  removePT += startCardRemoveCount * 20;
  return removePT;
};

// 3. 카드 복제 비용 계산
const calculateDuplicatePT = () => {
  const { duplicateCount, divineGlimmerDuplicateCount } = deckMetadata;
  let duplicatePT = 0;
  
  for (let i = 1; i < duplicateCount; i++) {
    if (i === 1) duplicatePT += 10;
    else if (i === 2) duplicatePT += 30;
    else if (i === 3) duplicatePT += 50;
    else duplicatePT += 70;
  }
  
  duplicatePT += divineGlimmerDuplicateCount * 20;
  return duplicatePT;
};

// 4. 티어별 PT 한계
const getTierLimit = (tier) => {
  return 20 + (tier * 10);
};

// 5. 티어 변경 함수
const changeTier = (newTier) => {
  if (newTier >= 1 && newTier <= 15) {
    setDeckMetadata(prev => ({ ...prev, tierLevel: newTier }));
  }
};

// 6. 실제 계산된 값들
const cardAcquisitionPT = calculateCardAcquisitionPT();
const removePT = calculateRemovePT();
const duplicatePT = calculateDuplicatePT();
const totalCalculatedPT = cardAcquisitionPT + removePT + duplicatePT;
const tierLimit = getTierLimit(deckMetadata.tierLevel);

// 7. 카드 카테고리별 통계
const cardStats = deck.reduce((stats, card) => {
  const category = card.cardCategory || 'NEUTRAL';
  if (!stats[category]) {
    stats[category] = { count: 0, pt: 0 };
  }
  const cardPT = card.calculatedPT || card.ptValue || 20;
  stats[category].count += card.quantity;
  stats[category].pt += cardPT * card.quantity;
  return stats;
}, {});

const neutralCount = cardStats.NEUTRAL?.count || 0;
const monsterCount = cardStats.MONSTER?.count || 0;
const forbiddenCount = cardStats.FORBIDDEN?.count || 0;

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

<div className="card-grid">
  {filteredCards.map((card) => {
    // PT 계산 (인게임과 동일)
    const cardPT = (() => {
      let basePT = card.cardCategory === 'MONSTER' ? 80 : 20;
      if (card.isGlimmer) basePT += 10;
      if (card.isDivineGlimmer) basePT += 20;
      return basePT;
    })();

    return (
      <div 
        key={card.id} 
        className="card-item"
        onClick={() => addCardToDeck(card)}
      >
        {/* 코스트 (왼쪽 상단) */}
        <div className="card-cost">{card.cost}</div>
        
        {/* PT 표시 (오른쪽 상단 - 인게임처럼) */}
        <div className="card-pt-badge">{cardPT} pt</div>
        
        {/* 카드 카테고리 아이콘 */}
        <div className="card-badges">
          {card.cardCategory === 'NEUTRAL' && <span className="badge neutral">🔵 중립</span>}
          {card.cardCategory === 'MONSTER' && <span className="badge monster">🔴 몬스터</span>}
          {card.cardCategory === 'FORBIDDEN' && <span className="badge forbidden">🚫 금지</span>}
          {card.isGlimmer && <span className="badge glimmer">✨</span>}
          {card.isDivineGlimmer && <span className="badge divine">💫</span>}
          {card.isStartCard && <span className="badge start">🎯</span>}
        </div>
        
        <h3>{card.name}</h3>
        <p className="card-description">{card.description}</p>
        
        <div className="card-footer">
          <span className="card-type">{card.cardType}</span>
          <span className={`card-rarity ${card.rarity.toLowerCase()}`}>
            {card.rarity}
          </span>
        </div>
        
        <div className="click-hint">클릭해서 추가</div>
      </div>
    );
  })}
</div>
        </div>

{/* 오른쪽: 내 덱 */}
<div className="deck-section">
  <h2>내 덱</h2>
  
  {/* 티어 선택 */}
  <div className="tier-selector">
    <label>티어 선택:</label>
    <select 
      value={deckMetadata.tierLevel} 
      onChange={(e) => changeTier(parseInt(e.target.value))}
      className="tier-select"
    >
      {[...Array(15)].map((_, i) => (
        <option key={i + 1} value={i + 1}>
          티어 {i + 1} ({getTierLimit(i + 1)} PT)
        </option>
      ))}
    </select>
  </div>

  {/* PT 계산기 */}
  <div className="pt-calculator">
    <h3>📊 PT 계산 내역</h3>
    
    {/* 카드 획득 비용 */}
    <div className="pt-section">
      <h4>카드 획득 비용</h4>
      {neutralCount > 0 && (
        <div className="pt-item">
          <span>🔵 중립 x{neutralCount}</span>
          <span>{cardStats.NEUTRAL.pt} PT</span>
        </div>
      )}
      {monsterCount > 0 && (
        <div className="pt-item">
          <span>🔴 몬스터 x{monsterCount}</span>
          <span>{cardStats.MONSTER.pt} PT</span>
        </div>
      )}
      {forbiddenCount > 0 && (
        <div className="pt-item">
          <span>🚫 금지 x{forbiddenCount}</span>
          <span>{cardStats.FORBIDDEN.pt} PT</span>
        </div>
      )}
      <div className="pt-subtotal">
        <span>소계:</span>
        <span>{cardAcquisitionPT} PT</span>
      </div>
    </div>

    {/* 덱 편집 비용 */}
    {(deckMetadata.removeCount > 0 || deckMetadata.duplicateCount > 0) && (
      <div className="pt-section">
        <h4>덱 편집 비용</h4>
        {deckMetadata.removeCount > 0 && (
          <div className="pt-item">
            <span>🗑️ 제거 ({deckMetadata.removeCount}회)</span>
            <span>{removePT} PT</span>
          </div>
        )}
        {deckMetadata.duplicateCount > 0 && (
          <div className="pt-item">
            <span>📋 복제 ({deckMetadata.duplicateCount}회)</span>
            <span>{duplicatePT} PT</span>
          </div>
        )}
        <div className="pt-subtotal">
          <span>소계:</span>
          <span>{removePT + duplicatePT} PT</span>
        </div>
      </div>
    )}

    {/* 총 PT */}
    <div className="pt-total">
      <div className="total-line">
        <span>총 PT 비용:</span>
        <span className="highlight">{totalCalculatedPT} PT</span>
      </div>
      <div className="tier-info">
        <span>티어 {deckMetadata.tierLevel} 한계:</span>
        <span>{tierLimit} PT</span>
      </div>
      {totalCalculatedPT > tierLimit ? (
        <div className="pt-warning">
          ❌ {totalCalculatedPT - tierLimit} PT 초과!
        </div>
      ) : (
        <div className="pt-success">
          ✅ {tierLimit - totalCalculatedPT} PT 여유
        </div>
      )}
    </div>
  </div>

  {/* 간단한 통계 */}
  <div className="deck-stats-simple">
    <div className="stat-item">
      <span>총 카드:</span>
      <span>{totalCards}장</span>
    </div>
  </div>

  {/* 덱 초기화 버튼 */}
  {deck.length > 0 && (
    <button className="clear-deck-button" onClick={clearDeck}>
      🔄 덱 초기화
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
              <span className="deck-card-pt">
                PT: {card.calculatedPT || card.ptValue}
              </span>
            </div>
          </div>
          <div className="deck-card-controls">
            <span className="deck-card-quantity">x{card.quantity}</span>
            <button 
              className="remove-button"
              onClick={() => removeCardFromDeck(card.id)}
              title="카드 제거"
            >
              −
            </button>
            <button 
              className="add-button"
              onClick={() => addCardToDeck(card)}
              title="카드 복제"
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