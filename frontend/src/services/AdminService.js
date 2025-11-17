import { http } from "../utils/BaseUrl";

//User
export const GetUsers = () => http.get(`/admin/users`)
export const UpdateUserStatus = (userId, status) => http.put(`/admin/users/${userId}/status`, { status })
export const UpdateUserRole = (userId, role) => http.put(`/admin/users/${userId}/role`, { role })

//Event
export const GetEvents = () => http.get(`/admin/events/all`)
export const GetPendingEvents = () => http.get(`/admin/events/pending`)
export const ApproveEvent = (eventId) => http.put(`/admin/events/${eventId}/approve`)
export const DeleteEvent = (eventId) => http.delete(`admin/events/${eventId}`)