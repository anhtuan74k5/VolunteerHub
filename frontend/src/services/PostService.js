import { http } from "../utils/BaseUrl";

// ✅ Fix: Đổi từ /posts/event/:eventId sang /posts/:eventId
export const GetEventPosts = async (eventId) => {
  return await http.get(`/posts/${eventId}`);
};

export const CreatePost = async (eventId, content) => {
  return await http.post(`/posts/${eventId}`, { content });
};

export const DeletePost = async (postId) => {
  return await http.delete(`/posts/${postId}`);
};

export const ToggleLikePost = async (postId) => {
  return await http.post(`/actions/like`, { postId });
};
