import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

export const uploadApi = {
  // 캐릭터 이미지 업로드
  uploadCharacterImage: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    return axios.post(`${API_BASE_URL}/upload/character`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // 카드 이미지 업로드
  uploadCardImage: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    return axios.post(`${API_BASE_URL}/upload/card`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // 이미지 URL 생성 (상대 경로 -> 절대 경로)
  getImageUrl: (relativeUrl) => {
    if (!relativeUrl) return null;
    if (relativeUrl.startsWith('http')) return relativeUrl;
    return `http://localhost:8080${relativeUrl}`;
  },
};