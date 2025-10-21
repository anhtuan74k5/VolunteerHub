import React, { Component } from "react";
import { Calendar, Users, MapPin } from "lucide-react";

class EventCard extends Component {
  render() {
    const { image, title, date, location, joined, capacity, description, likes, shares } = this.props.event;

    return (
      <div className="bg-white rounded-2xl shadow-md overflow-hidden w-80 hover:shadow-lg transition">
        <img src={image} alt={title} className="h-48 w-full object-cover" />
        <div className="p-4">
          <h2 className="font-semibold text-lg line-clamp-2">{title}</h2>

          <div className="text-sm text-gray-600 mt-3 flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <Calendar size={16} /> <span>{date}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users size={16} /> <span>{joined}/{capacity}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin size={16} /> <span>{location}</span>
            </div>
          </div>

          <p className="text-gray-700 mt-3 text-sm line-clamp-3 border-l-4 border-yellow-500 pl-2">
            {description}
          </p>

          <div className="flex items-center justify-between mt-4">
            <div className="flex gap-4 text-gray-600 text-sm">
              <span>🤍 {likes}</span>
              <span>🔗 {shares}</span>
            </div>
            <button className="bg-[#DCBA58] text-white px-4 py-2 rounded-md font-medium hover:bg-[#CDA550]">
              Chi Tiết
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default EventCard;
