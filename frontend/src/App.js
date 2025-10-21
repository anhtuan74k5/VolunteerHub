import React, { Component } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import HomePage from "./components/HomePage";
import Footer from "./components/Footer";
import VolunteerActivities from "./pages/VolunteerActivities";
import Donation from "./pages/Donation";

class App extends Component {
  render() {
    return (
      <Router>
        <Header />
        <div className="pt-20"> {/* thêm padding để tránh header che */}
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/hoat-dong" element={<VolunteerActivities />} />
            <Route path="/quyen-gop" element={<Donation />} />
          </Routes>
        </div>
        <Footer />
      </Router>
    );
  }
}

export default App;
