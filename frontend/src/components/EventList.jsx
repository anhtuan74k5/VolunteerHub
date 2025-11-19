import React, { useEffect, useState } from "react";
import { Calendar, Users, MapPin, Heart, Share2, Search } from "lucide-react";
import { GetEvents } from "../services/EventService";
import { GetMyEvent } from "../services/UserService";

export default function EventList() {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [debouncedQuery, setDebouncedQuery] = useState("");

  const [filters, setFilters] = useState({
    category: "",
    status: "",
    query: "",
    dateOrder: "", // Thêm filter ngày
  });

  const [appliedFilters, setAppliedFilters] = useState({
    category: "",
    status: "",
    dateOrder: "",
  });

  const [tab, setTab] = useState("all");
  const [myEvents, setMyEvents] = useState([]);

  useEffect(() => {
    async function fetchEvents() {
      try {
        const res = await GetEvents();
        if (res.status === 200) {
          setEvents(res.data);
          setFilteredEvents(res.data);
        }
      } catch (err) {
        console.error("Lỗi lấy sự kiện:", err);
      }
      setLoading(false);
    }
    fetchEvents();
  }, []);

  useEffect(() => {
    async function fetchMyEvents() {
      try {
        const res = await GetMyEvent();
        if (res.status === 200) {
          setMyEvents(res.data);
        }
      } catch (error) {
        console.error("Lỗi lấy sự kiện đã tham gia:", error);
      }
    }
    fetchMyEvents();
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(filters.query);
    }, 300);
    return () => clearTimeout(handler);
  }, [filters.query]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const removeVietnameseTones = (str) =>
    str
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/Đ/g, "D")
      .toLowerCase();

  const softMatch = (source, keyword) => {
    source = removeVietnameseTones(source);
    keyword = removeVietnameseTones(keyword);

    if (source.includes(keyword)) return true;

    let diff = 0;
    let minLen = Math.min(source.length, keyword.length);

    for (let i = 0; i < minLen; i++) {
      if (source[i] !== keyword[i]) diff++;
      if (diff > 2) return false;
    }
    return true;
  };

  useEffect(() => {
    let filtered = [...events]; // sao chép dữ liệu gốc

    // 1. Lọc theo tab
    if (tab === "joined") {
      const joinedEventIds = new Set(myEvents.map((item) => item.event._id));
      filtered = filtered.filter((event) => joinedEventIds.has(event._id));
    } else if (tab === "notJoined") {
      const joinedEventIds = new Set(myEvents.map((item) => item.event._id));
      filtered = filtered.filter((event) => !joinedEventIds.has(event._id));
    }

    // 2. Lọc theo category và status
    if (appliedFilters.category) {
      filtered = filtered.filter((event) => event.category === appliedFilters.category);
    }
    if (appliedFilters.status) {
      filtered = filtered.filter((event) => event.status === appliedFilters.status);
    }

    // 3. Lọc theo tìm kiếm
    if (debouncedQuery) {
      filtered = filtered.filter(
        (event) =>
          softMatch(event.name, debouncedQuery) ||
          softMatch(event.location, debouncedQuery)
      );
    }

    // 4. Lọc theo thời gian
    if (appliedFilters.dateOrder === "asc") {
      filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
    } else if (appliedFilters.dateOrder === "desc") {
      filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
    } else {
      // Khi không chọn gì, giữ thứ tự gốc theo events
      filtered = filtered.sort((a, b) => events.findIndex(e => e._id === a._id) - events.findIndex(e => e._id === b._id));
    }

    setFilteredEvents(filtered);
  }, [events, appliedFilters, debouncedQuery, tab, myEvents]);


  const applyFilter = () => {
    setAppliedFilters({
      category: filters.category,
      status: filters.status,
      dateOrder: filters.dateOrder,
    });
  };

  if (loading) return <p className="text-center text-lg">Đang tải...</p>;

  return (
    <div>
      {/* FILTER UI */}
      <div className="flex flex-wrap items-left gap-4 mb-8">
        <select
          name="category"
          className="border border-gray-300 rounded-md px-3 py-2"
          value={filters.category}
          onChange={handleFilterChange}
        >
          <option value="">Loại sự kiện</option>
          <option value="Từ thiện">Từ thiện</option>
          <option value="Tình nguyện">Tình nguyện</option>
          <option value="Quyên góp">Quyên góp</option>
        </select>

        <select
          name="status"
          className="border border-gray-300 rounded-md px-3 py-2"
          value={filters.status}
          onChange={handleFilterChange}
        >
          <option value="">Trạng thái</option>
          <option value="approved">Đã duyệt</option>
          <option value="pending">Chờ duyệt</option>
          <option value="rejected">Từ chối</option>
        </select>

        {/* Lọc theo ngày */}
        <select
          name="dateOrder"
          className="border border-gray-300 rounded-md px-3 py-2"
          value={filters.dateOrder}
          onChange={handleFilterChange}
        >
          <option value="">Thời gian</option>
          <option value="asc">Gần đến xa</option>
          <option value="desc">Xa đến gần</option>
        </select>

        <button
          className="bg-[#DCBA58] text-white px-6 py-2.5 rounded-lg font-medium hover:bg-[#caa445]"
          onClick={applyFilter}
        >
          Lọc
        </button>

        <div className="flex w-[44vw] items-center border border-gray-300 rounded-full px-3 py-2 ml-10 shadow shadow-md">
          <input
            type="text"
            name="query"
            value={filters.query}
            placeholder="Tìm kiếm tên sự kiện hoặc địa điểm..."
            className="flex-1 outline-none"
            onChange={handleFilterChange}
          />
          <Search size={18} className="text-gray-500" />
        </div>
      </div>

      {/* TAB TAG */}
      <div className="flex gap-12 border-b-2 border-gray-600 text-xl font-medium text-gray-600 mb-6 pl-4 mt-10">
        {[
          { key: "all", label: "Tất Cả" },
          { key: "notJoined", label: "Chưa Tham Gia" },
          { key: "joined", label: "Đã Tham Gia" },
          { key: "liked", label: "Đã Yêu Thích" },
          { key: "forYou", label: "Dành Cho Bạn" },
        ].map(({ key, label }) => {
          let count = 0;
          if (key === "all") count = events.length;
          else if (key === "joined") count = myEvents.length;
          else if (key === "notJoined") count = events.length - myEvents.length;

          const isActive = tab === key;
          return (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`relative pb-2 ${isActive
                ? "text-[#DDB958] font-semibold"
                : "hover:text-gray-900"
                }`}
            >
              {label} ({count})
              {isActive && (
                <span
                  className="absolute bottom-0 left-0 w-full h-[3px] bg-[#DDB958]"
                  style={{ borderRadius: "10px 10px 0 0" }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* EVENT LIST */}
      <div className="flex flex-wrap justify-center gap-4">
        {filteredEvents.map((event) => (
          <div
            key={event._id}
            className="bg-white rounded-2xl shadow-md overflow-hidden w-[400px] hover:shadow-xl transition mt-4 h-[750px] flex flex-col"
          >
            <img
              src={
                event.coverImage?.startsWith("http")
                  ? event.coverImage
                  : `http://localhost:5000${event.coverImage}`
              }
              alt={event.name}
              className="h-[420px] w-full object-cover"
            />

            <div className="px-6 py-5 flex-1 flex flex-col justify-between">
              <h2 className="font-semibold text-xl leading-6 mb-4 line-clamp-2 h-[3rem]">
                {event.name}
              </h2>

              <div className="flex gap-6 items-start flex-1">
                <div className="flex flex-col text-gray-700 text-[15px] gap-4 w-[140px] min-h-[120px]">
                  <div className="flex gap-2 items-center border-b pb-2">
                    <Calendar size={18} />
                    <span>{new Date(event.date).toLocaleDateString("vi-VN")}</span>
                  </div>

                  <div className="flex gap-2 items-center border-b pb-2">
                    <Users size={18} />
                    <span>
                      {event.currentParticipants || 0}/{event.maxParticipants || 50}
                    </span>
                  </div>

                  <div className="flex gap-2 items-center">
                    <MapPin size={18} />
                    <span>{event.location}</span>
                  </div>
                </div>

                <div className="text-gray-700 leading-6 border-l-[2px] border-[#DDB958] pl-2 w-[190px] min-h-[120px]">
                  <div
                    className="prose prose-lg max-w-none text-[15px] line-clamp-6"
                    dangerouslySetInnerHTML={{ __html: event.description }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between mt-6">
                <div className="flex items-center gap-6 text-[15px]">
                  <span className="flex items-center gap-2 text-red-600 font-medium">
                    <Heart size={20} strokeWidth={1.5} /> {event.likes || 0}
                  </span>
                  <span className="flex items-center gap-2 text-blue-500 font-medium">
                    <Share2 size={20} strokeWidth={1.5} /> {event.shares || 0}
                  </span>
                </div>

                <button
                  className="bg-[#DCBA58] text-white px-6 py-2.5 rounded-lg font-medium text-[15px] hover:bg-[#caa445]"
                  onClick={() => (window.location.href = `/su-kien/${event._id}`)}
                >
                  Chi Tiết
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
