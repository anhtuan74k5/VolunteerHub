import http from "../utils/BaseUrl";

const StatsService = {
  getAllEvents: () => http.get("/statistics/events"),
  getEventPosts: (eventId) => http.get(`/posts/event/${eventId}`),
};

export default StatsService;
