import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const cardApi = {
  // 모든 카드 가져오기
  getAllCards: () => {
    return apiClient.get('/cards');
  },

  // 카드 상세 가져오기
  getCardById: (id) => {
    return apiClient.get(`/cards/${id}`);
  },

  // 캐릭터별 카드 가져오기 (추가!)
  getCardsByCharacter: (characterId) => {
    return apiClient.get(`/cards/character/${characterId}`);
  },

  // 중립 카드 가져오기 (추가!)
  getNeutralCards: () => {
    return apiClient.get('/cards/neutral');
  },

  // 카드 생성
  createCard: (cardData) => {
    return apiClient.post('/cards', cardData);
  },
    // 수정 API 추가
  updateCard: (id, cardData) => {
    return apiClient.put(`/cards/${id}`, cardData);
  },

  // 삭제 API 추가
  deleteCard: (id) => {
    return apiClient.delete(`/cards/${id}`);
  },
};
