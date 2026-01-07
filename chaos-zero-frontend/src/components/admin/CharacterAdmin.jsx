import { useState, useEffect } from 'react';
import { characterApi } from '../../api/characterApi';
import { uploadApi } from '../../api/uploadApi';
import './CharacterAdmin.css';

function CharacterAdmin() {
  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const [uploading, setUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  // 폼 데이터
  const [formData, setFormData] = useState({
    id: null,
    name: '',
    description: '',
    imageUrl: ''
  });




  useEffect(() => {
    fetchCharacters();
  }, []);

  const fetchCharacters = async () => {
    try {
      setLoading(true);
      const response = await characterApi.getAllCharacters();
      setCharacters(response.data);
    } catch (err) {
      console.error('캐릭터 로딩 실패:', err);
      alert('캐릭터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 폼 열기 (새로 추가)
  const openAddForm = () => {
    setFormData({ id: null, name: '', description: '', imageUrl: '' });
    setShowForm(true);
  };

  // 폼 열기 (수정)
const openEditForm = (character) => {
  setFormData(character);
  // 기존 이미지가 있으면 미리보기 설정
  if (character.imageUrl) {
    setPreviewImage(uploadApi.getImageUrl(character.imageUrl));
  } else {
    setPreviewImage(null);
  }
  setShowForm(true);
};
  
  

  // 폼 닫기
const closeForm = () => {
  setShowForm(false);
  setFormData({ id: null, name: '', description: '', imageUrl: '' });
  setPreviewImage(null);  // 추가!
};

  // 입력 변경
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  const handleFileChange = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  // 이미지 파일인지 확인
  if (!file.type.startsWith('image/')) {
    alert('이미지 파일만 업로드 가능합니다.');
    return;
  }

  // 파일 크기 확인 (10MB)
  if (file.size > 10 * 1024 * 1024) {
    alert('파일 크기는 10MB 이하여야 합니다.');
    return;
  }

  try {
    setUploading(true);

    // 미리보기 설정
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewImage(reader.result);
    };
    reader.readAsDataURL(file);

    // 서버에 업로드
    const response = await uploadApi.uploadCharacterImage(file);
    const imageUrl = response.data.url;

    // formData에 URL 저장
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
      alert('캐릭터 이름을 입력하세요.');
      return;
    }
 try {
    if (formData.id) {
      // 수정
      await characterApi.updateCharacter(formData.id, formData);
      alert('캐릭터가 수정되었습니다!');
    } else {
      // 추가
      await characterApi.createCharacter(formData);
      alert('캐릭터가 추가되었습니다!');
    }
    fetchCharacters();
    closeForm();
  } catch (err) {
    console.error('저장 실패:', err);
    alert('저장에 실패했습니다.');
  }
};

// handleDelete 함수 수정
const handleDelete = async (id) => {
  if (!window.confirm('정말 삭제하시겠습니까?')) return;
  
  try {
    await characterApi.deleteCharacter(id);
    alert('캐릭터가 삭제되었습니다!');
    fetchCharacters();
  } catch (err) {
    console.error('삭제 실패:', err);
    alert('삭제에 실패했습니다.');
  }
};

  if (loading) {
    return <div className="loading">로딩 중...</div>;
  }

  return (
    <div className="character-admin">
      <div className="admin-section-header">
        <h2>캐릭터 관리</h2>
        <button className="add-button" onClick={openAddForm}>
          + 캐릭터 추가
        </button>
      </div>

      {/* 캐릭터 목록 */}
      <div className="character-list">
        {characters.map(character => (
          <div key={character.id} className="character-admin-item">
            <div className="character-admin-info">
              {character.imageUrl ? (
                <img src={character.imageUrl} alt={character.name} className="character-thumbnail" />
              ) : (
                <div className="character-thumbnail-placeholder">{character.name[0]}</div>
              )}
              <div className="character-admin-details">
                <h3>{character.name}</h3>
                <p>{character.description}</p>
              </div>
            </div>
            <div className="character-admin-actions">
              <button className="edit-button" onClick={() => openEditForm(character)}>
                수정
              </button>
              <button className="delete-button" onClick={() => handleDelete(character.id)}>
                삭제
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 폼 모달 */}
      {showForm && (
        <div className="modal-overlay" onClick={closeForm}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{formData.id ? '캐릭터 수정' : '캐릭터 추가'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>이름 *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="캐릭터 이름"
                  required
                />
              </div>

              <div className="form-group">
                <label>설명</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="캐릭터 설명"
                  rows="3"
                />
              </div>

<div className="form-group">
  <label>이미지</label>
  
  {/* 미리보기 */}
  {previewImage && (
    <div className="image-preview">
      <img src={previewImage} alt="미리보기" />
    </div>
  )}
  
  {/* 파일 선택 버튼 */}
  <div className="file-upload-section">
    <input
      type="file"
      id="character-image"
      accept="image/*"
      onChange={handleFileChange}
      style={{ display: 'none' }}
    />
    <label htmlFor="character-image" className="file-upload-button">
      {uploading ? '업로드 중...' : '이미지 선택'}
    </label>
    {formData.imageUrl && (
      <span className="file-name">✓ 이미지 업로드됨</span>
    )}
  </div>

  {/* URL 직접 입력 (선택사항) */}
  <details className="url-input-toggle">
    <summary>또는 URL 직접 입력</summary>
    <input
      type="text"
      name="imageUrl"
      value={formData.imageUrl}
      onChange={handleInputChange}
      placeholder="https://example.com/image.jpg"
    />
  </details>
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

export default CharacterAdmin;