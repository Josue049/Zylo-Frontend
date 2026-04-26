import { NavLink, useNavigate } from "react-router-dom";

export default function HeaderBusiness() {
  const navigate = useNavigate();
  const navItems = [
    { label: "Dashboard", to: "/businessHome" },
    { label: "Reservas", to: "/reservations" },
    { label: "Clientes", to: "/profile" },
  ];

  return (
    <header className="bg-[#f9f6f5] flex justify-between items-center px-6 py-4 w-full fixed top-0 z-50 shadow-[0_1px_0_rgba(47,47,46,0.06)]">
      <button
        onClick={() => navigate("/businessHome")}
        className="flex items-center gap-4"
      >
        <span className="font-headline font-extrabold text-2xl text-primary italic tracking-tight">
          Zylo
        </span>
      </button>
      <div className="flex items-center gap-4">
        <nav className="hidden md:flex items-center gap-8 mr-8">
          {navItems.map((item) => (
            <NavLink
              key={item.label}
              to={item.to}
              className={({ isActive }) =>
                `font-semibold transition-opacity hover:opacity-80 ${
                  isActive ? "text-primary" : "text-[#2f2f2e]"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <button
          onClick={() => navigate("/profile")}
          className="w-10 h-10 rounded-full bg-[#e4e2e1] overflow-hidden"
        >
          <img
            alt="User Profile"
            className="w-full h-full object-cover"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBHs5C4K4pnPEFGLhQzFx964g_j3yT3Sa8V3Cfi-5iODayL26eSFSrk_lViSvmCZrOXdBri3IzmsJV7tDXUggwXCRtafp9N0Uq9aZj-ePoZ7Fl0ESlrv1XZCbKYb5RlBahqICpSx7-qJzj6v3YFOulNpEa6gyb2wRRw9yeHIgM472KwGmSys_SWeewXwoQ7HaH_IiUtD5nJpk4NgHNmgIQn02Yc1NA3cohUy9YO6iiq8EzQhHu1NQtoU7y0y_yTTVcBfvfXcN3e52Zj"
          />
        </button>
      </div>
    </header>
  );
}