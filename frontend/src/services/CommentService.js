import { http } from "../utils/BaseUrl";

export const CreateComment = (postId, content) => {
  console.log('🚀 CreateComment called with:', { postId, content }); // ✅ Debug log
  return http.post('/comments', { postId, content });
};

export const GetComments = (postId) => {
  return http.get(`/comments/${postId}`);
};

export const DeleteComment = (commentId) => {
  return http.delete(`/comments/${commentId}`);
};
