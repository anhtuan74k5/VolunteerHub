import React, { Component } from "react";
import { Search } from "lucide-react";

class FilterBar extends Component {
  render() {
    return (
      <div className="flex flex-wrap items-center justify-center gap-4 mb-8">
        <select className="border border-gray-300 rounded-md px-3 py-2">
          <option>Loại sự kiện</option>
          <option>Tình nguyện</option>
          <option>Quyên góp</option>
        </select>

        <select className="border border-gray-300 rounded-md px-3 py-2">
          <option>Trạng thái</option>
          <option>Chưa tham gia</option>
          <option>Đã tham gia</option>
        </select>

        <button className="bg-[#DCBA58] text-white px-5 py-2 rounded-md font-medium hover:bg-[#CDA550]">
          Lọc
        </button>

        <div className="flex items-center border border-gray-300 rounded-full px-3 py-2 w-96">
          <input
            type="text"
            placeholder="Tìm kiếm sự kiện, địa điểm..."
            className="flex-1 outline-none"
          />
          <Search size={18} className="text-gray-500" />
        </div>
      </div>
    );
  }
}

export default FilterBar;
