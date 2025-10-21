import React, { Component } from "react";
import Header from "../components/Header";
import FilterBar from "../components/FilterBar";
import EventList from "../components/EventList";

class VolunteerActivities extends Component {
  render() {
    return (
      <div>
        <div className="container mx-auto px-6 py-10">
          <h1 className="text-3xl font-semibold text-[#DCBA58] mb-8 text-center">
            Hoạt Động Tình Nguyện Của Bạn
          </h1>

          <FilterBar />

          <div className="mt-10">
            <EventList />
          </div>
        </div>
      </div>
    );
  }
}

export default VolunteerActivities;
