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
import Favorites from "./pages/User/Favorites";

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/home" element={<Home />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/businessProfile/:id" element={<BusinessProfile />} />
      <Route path="/businessHome" element={<BusinessHome />} />
      <Route path="/favorites" element={<Favorites />} />
    </Routes>
  );
}