import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const characterApi = {
  // 모든 캐릭터 가져오기
  getAllCharacters: () => {
    return apiClient.get('/characters');
  },

  // 캐릭터 상세 가져오기
  getCharacterById: (id) => {
    return apiClient.get(`/characters/${id}`);
  },

  // 캐릭터 생성
  createCharacter: (characterData) => {
    return apiClient.post('/characters', characterData);
  },
    // 수정 API 추가
  updateCharacter: (id, characterData) => {
    return apiClient.put(`/characters/${id}`, characterData);
  },

  // 삭제 API 추가
  deleteCharacter: (id) => {
    return apiClient.delete(`/characters/${id}`);
  },
};