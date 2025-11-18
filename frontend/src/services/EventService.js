import { http } from "../utils/BaseUrl";

export const GetEvents = () => http.get(`/events/public`)
export const GetEventDetail = (eventId) => http.get(`/events/public/${eventId}`)

