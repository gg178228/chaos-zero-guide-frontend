import { useState, useEffect } from 'react';
import { cardApi } from '../../api/cardApi';
import { uploadApi } from '../../api/uploadApi';
import { characterApi } from '../../api/characterApi';
import './CardAdmin.css';

function CardAdmin() {
  const [cards, setCards] = useState([]);
  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  
  // 폼 데이터
  const [formData, setFormData] = useState({
    id: null,
    characterId: '',
    name: '',
    description: '',
    cost: 0,
    cardType: 'ATTACK',
    rarity: 'COMMON',
    imageUrl: '',
    isBasicCard: false,
    isNeutral: false,
    ptValue: 0
  });

  useEffect(() => {
    fetchCards();
    fetchCharacters();
  }, []);

  const fetchCards = async () => {
    try {
      setLoading(true);
      const response = await cardApi.getAllCards();
      setCards(response.data);
    } catch (err) {
      console.error('카드 로딩 실패:', err);
      alert('카드를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const fetchCharacters = async () => {
    try {
      const response = await characterApi.getAllCharacters();
      setCharacters(response.data);
    } catch (err) {
      console.error('캐릭터 로딩 실패:', err);
    }
  };

  // 폼 열기 (새로 추가)
  const openAddForm = () => {
    setFormData({
      id: null,
      characterId: '',
      name: '',
      description: '',
      cost: 0,
      cardType: 'ATTACK',
      rarity: 'COMMON',
      imageUrl: '',
      isBasicCard: false,
      isNeutral: false,
      ptValue: 0
    });
    setPreviewImage(null);  // 추가!
    setShowForm(true);
  };

  // 폼 열기 (수정)
const openEditForm = (card) => {
  setFormData(card);
  if (card.imageUrl) {
    setPreviewImage(uploadApi.getImageUrl(card.imageUrl));
  } else {
    setPreviewImage(null);
  }
  setShowForm(true);
};

  // 폼 닫기
const closeForm = () => {
  setShowForm(false);
  setPreviewImage(null); 
};

  // 입력 변경
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // 파일 선택 핸들러
const handleFileChange = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  if (!file.type.startsWith('image/')) {
    alert('이미지 파일만 업로드 가능합니다.');
    return;
  }

  if (file.size > 10 * 1024 * 1024) {
    alert('파일 크기는 10MB 이하여야 합니다.');
    return;
  }

  try {
    setUploading(true);

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewImage(reader.result);
    };
    reader.readAsDataURL(file);

    // 카드 이미지 업로드 (캐릭터와 다름!)
    const response = await uploadApi.uploadCardImage(file);
    const imageUrl = response.data.url;

    setFormData(prev => ({ ...prev, imageUrl }));

    alert('이미지 업로드 성공!');
  } catch (err) {
    console.error('업로드 실패:', err);
    alert('이미지 업로드에 실패했습니다.');
    setPreviewImage(null);
  } finally {
    setUploading(false);
  }
};
  

  // 저장
const handleSubmit = async (e) => {
  e.preventDefault();
  
  if (!formData.name.trim()) {
    alert('카드 이름을 입력하세요.');
    return;
  }

  try {
    const submitData = {
      ...formData,
      characterId: formData.characterId === '' ? null : parseInt(formData.characterId),
      cost: parseInt(formData.cost),
      ptValue: parseInt(formData.ptValue)
    };

    if (formData.id) {
      // 수정
      await cardApi.updateCard(formData.id, submitData);
      alert('카드가 수정되었습니다!');
    } else {
      // 추가
      await cardApi.createCard(submitData);
      alert('카드가 추가되었습니다!');
    }
    fetchCards();
    closeForm();
  } catch (err) {
    console.error('저장 실패:', err);
    alert('저장에 실패했습니다.');
  }
};


  // 삭제 
const handleDelete = async (id) => {
  if (!window.confirm('정말 삭제하시겠습니까?')) return;
  
  try {
    await cardApi.deleteCard(id);
    alert('카드가 삭제되었습니다!');
    fetchCards();
  } catch (err) {
    console.error('삭제 실패:', err);
    alert('삭제에 실패했습니다.');
  }
};

  // 캐릭터 이름 가져오기
  const getCharacterName = (characterId) => {
    if (!characterId) return '중립';
    const character = characters.find(c => c.id === characterId);
    return character ? character.name : '알 수 없음';
  };

  if (loading) {
    return <div className="loading">로딩 중...</div>;
  }

  return (
    <div className="card-admin">
      <div className="admin-section-header">
        <h2>카드 관리</h2>
        <button className="add-button" onClick={openAddForm}>
          + 카드 추가
        </button>
      </div>

      {/* 카드 목록 */}
      <div className="card-admin-list">
        <table className="card-table">
          <thead>
            <tr>
              <th>이름</th>
              <th>캐릭터</th>
              <th>코스트</th>
              <th>타입</th>
              <th>등급</th>
              <th>PT</th>
              <th>동작</th>
            </tr>
          </thead>
          <tbody>
            {cards.map(card => (
              <tr key={card.id}>
                <td className="card-name-cell">
                  <strong>{card.name}</strong>
                  {card.isNeutral && <span className="neutral-tag">중립</span>}
                </td>
                <td>{getCharacterName(card.characterId)}</td>
                <td>{card.cost}</td>
                <td>{card.cardType}</td>
                <td>
                  <span className={`rarity-badge ${card.rarity.toLowerCase()}`}>
                    {card.rarity}
                  </span>
                </td>
                <td><strong>{card.ptValue}</strong></td>
                <td>
                  <div className="action-buttons">
                    <button className="edit-btn" onClick={() => openEditForm(card)}>
                      수정
                    </button>
                    <button className="delete-btn" onClick={() => handleDelete(card.id)}>
                      삭제
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 폼 모달 */}
      {showForm && (
        <div className="modal-overlay" onClick={closeForm}>
          <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
            <h2>{formData.id ? '카드 수정' : '카드 추가'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>카드 이름 *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="미카의 일격"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>캐릭터</label>
                  <select
                    name="characterId"
                    value={formData.characterId}
                    onChange={handleInputChange}
                  >
                    <option value="">중립 카드</option>
                    {characters.map(char => (
                      <option key={char.id} value={char.id}>
                        {char.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>설명</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="적에게 10의 피해를 줍니다"
                  rows="3"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>코스트 *</label>
                  <input
                    type="number"
                    name="cost"
                    value={formData.cost}
                    onChange={handleInputChange}
                    min="0"
                    max="10"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>타입 *</label>
                  <select
                    name="cardType"
                    value={formData.cardType}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="ATTACK">ATTACK (공격)</option>
                    <option value="SKILL">SKILL (스킬)</option>
                    <option value="POWER">POWER (파워)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>등급 *</label>
                  <select
                    name="rarity"
                    value={formData.rarity}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="COMMON">COMMON (일반)</option>
                    <option value="RARE">RARE (레어)</option>
                    <option value="EPIC">EPIC (에픽)</option>
                    <option value="LEGENDARY">LEGENDARY (전설)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>PT 점수 *</label>
                  <input
                    type="number"
                    name="ptValue"
                    value={formData.ptValue}
                    onChange={handleInputChange}
                    min="0"
                    max="100"
                    required
                  />
                </div>
              </div>

          <div className="form-group">
            <label>이미지</label>
            
            {previewImage && (
              <div className="image-preview">
                <img src={previewImage} alt="미리보기" />
              </div>
            )}
            
            <div className="file-upload-section">
              <input
                type="file"
                id="card-image"
                accept="image/*"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
              <label htmlFor="card-image" className="file-upload-button">
                {uploading ? '업로드 중...' : '이미지 선택'}
              </label>
              {formData.imageUrl && (
                <span className="file-name">✓ 이미지 업로드됨</span>
              )}
            </div>

            <details className="url-input-toggle">
              <summary>또는 URL 직접 입력</summary>
              <input
                type="text"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleInputChange}
                placeholder="https://example.com/card.jpg"
              />
            </details>
          </div>

              <div className="form-row">
                <div className="form-group checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      name="isBasicCard"
                      checked={formData.isBasicCard}
                      onChange={handleInputChange}
                    />
                    기본 카드
                  </label>
                </div>

                <div className="form-group checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      name="isNeutral"
                      checked={formData.isNeutral}
                      onChange={handleInputChange}
                    />
                    중립 카드
                  </label>
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="cancel-button" onClick={closeForm}>
                  취소
                </button>
                <button type="submit" className="submit-button">
                  {formData.id ? '수정' : '추가'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default CardAdmin;