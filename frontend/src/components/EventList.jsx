import React, { Component } from "react";
import EventCard from "./EventCard";

class EventList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      events: [
        {
          image: "NuCuoi",
          title: "Tặng 80 nụ cười cho các em bé mang dị tật hàm mặt",
          date: "10/01/2024",
          location: "Tây Nguyên",
          joined: 23,
          capacity: 50,
          description: "Mỗi năm có khoảng 3.000 trẻ em sinh ra mắc dị tật hàm mặt...",
          likes: 65,
          shares: 59,
        },
        {
          image: "LySua",
          title: "Tặng 72.000 ly sữa cho các em học nghèo hiếu học tại Lạng Sơn",
          date: "05/03/2024",
          location: "Lạng Sơn",
          joined: 32,
          capacity: 50,
          description: "Một trong những tỉnh miền núi phía Đông Bắc giàu truyền thống...",
          likes: 45,
          shares: 25,
        },
        {
          image: "BuaSang",
          title: "Đóng góp 'Một bữa sáng' vì động vật hoang dã có nguy cơ tuyệt chủng",
          date: "06/03/2024",
          location: "Hồ Chí Minh",
          joined: 47,
          capacity: 50,
          description: "Mỗi loài động vật đều có vai trò quan trọng trong cân bằng sinh học...",
          likes: 39,
          shares: 42,
        },
      ],
    };
  }

  render() {
    return (
      <div className="flex flex-wrap justify-center gap-8">
        {this.state.events.map((event, index) => (
          <EventCard key={index} event={event} />
        ))}
      </div>
    );
  }
}

export default EventList;
