export default function HeaderBusiness() {
  return (
    <header className="bg-[#f9f6f5] flex justify-between items-center px-6 py-4 w-full fixed top-0 z-50 shadow-[0_1px_0_rgba(47,47,46,0.06)]">
      <div className="flex items-center gap-4">
        {/* <span className="material-symbols-outlined text-primary cursor-pointer">
          menu
        </span> */}
        <span className="font-headline font-extrabold text-2xl text-primary italic tracking-tight">
          Zylo
        </span>
      </div>
      <div className="flex items-center gap-4">
        <div className="hidden md:flex items-center gap-8 mr-8">
          <a
            href="#"
            className="text-primary font-semibold hover:opacity-80 transition-opacity"
          >
            Dashboard
          </a>
          {["Schedule", "Clients"].map((l) => (
            <a
              key={l}
              href="#"
              className="text-[#2f2f2e] font-semibold hover:opacity-80 transition-opacity"
            >
              {l}
            </a>
          ))}
        </div>
        <div className="w-10 h-10 rounded-full bg-[#e4e2e1] overflow-hidden">
          <img
            alt="User Profile"
            className="w-full h-full object-cover"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBHs5C4K4pnPEFGLhQzFx964g_j3yT3Sa8V3Cfi-5iODayL26eSFSrk_lViSvmCZrOXdBri3IzmsJV7tDXUggwXCRtafp9N0Uq9aZj-ePoZ7Fl0ESlrv1XZCbKYb5RlBahqICpSx7-qJzj6v3YFOulNpEa6gyb2wRRw9yeHIgM472KwGmSys_SWeewXwoQ7HaH_IiUtD5nJpk4NgHNmgIQn02Yc1NA3cohUy9YO6iiq8EzQhHu1NQtoU7y0y_yTTVcBfvfXcN3e52Zj"
          />
        </div>
      </div>
    </header>
  );
}
