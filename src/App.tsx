import { Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import "./App.css";
import "./index.css";
import Register from "./pages/Register";
import Home from "./pages/User/Home";
import Profile from "./pages/User/Profile";
import BusinessPublic from "./pages/Business/BusinessPublic";
import BusinessHome from "./pages/Business/BusinessHome";
import Messages from "./pages/Messages";
import Favorites from "./pages/User/Favorites";

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/home" element={<Home />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/businessPublic/:id" element={<BusinessPublic />} />
      <Route path="/businessHome" element={<BusinessHome />} />
      <Route path="/messages" element={<Messages />} />
      <Route path="/favorites" element={<Favorites />} />
    </Routes>
  );
}