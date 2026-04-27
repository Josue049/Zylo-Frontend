import { Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import "./App.css";
import "./index.css";
import Register from "./pages/Register";
import Home from "./pages/User/Home";
import Profile from "./pages/User/Profile";
import BusinessProfile from "./pages/Business/BusinessProfile";
import BusinessHome from "./pages/Business/BusinessHome";
import Messages from "./pages/Messages";
import Favorites from "./pages/User/Favorites";
import BusinessMessages from "./pages/Business/BusinessMessages";
import BusinessUserProfile from "./pages/Business/BusinessUserProfile";
import Booking from "./pages/Business/Booking";

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/home" element={<Home />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/businessProfile/:id" element={<BusinessProfile />} />
      <Route path="/booking/:id" element={<Booking />} />
      <Route path="/businessUserProfile" element={<BusinessUserProfile />} />
      <Route path="/businessHome" element={<BusinessHome />} />
      <Route path="/messages" element={<Messages />} />
      <Route path="/favorites" element={<Favorites />} />
      <Route path="/business-messages" element={<BusinessMessages />} />
    </Routes>
  );
}