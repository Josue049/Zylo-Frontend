export default function HeaderBusiness() {
  return (
    <header className="bg-[#f9f6f5] flex justify-between items-center px-6 py-4 w-full sticky top-0 z-50 shadow-[0_1px_0_rgba(47,47,46,0.06)]">
      <div className="flex items-center gap-3">
        {/* <span className="material-symbols-outlined text-primary hover:opacity-80 transition-opacity active:scale-95 cursor-pointer">
          menu
        </span> */}
        <h1 className="font-headline font-extrabold tracking-tight text-2xl text-primary italic">
          Zylo
        </h1>
      </div>
      <div className="flex items-center gap-4">
        <div className="hidden md:flex gap-6 items-center mr-4">
          <span className="text-primary font-semibold cursor-pointer">
            Explore
          </span>
          <span className="text-[#2f2f2e] hover:opacity-80 transition-opacity cursor-pointer">
            Bookings
          </span>
          <span className="text-[#2f2f2e] hover:opacity-80 transition-opacity cursor-pointer">
            Saved
          </span>
        </div>
        <div className="w-10 h-10 rounded-full bg-[#e4e2e1] overflow-hidden cursor-pointer active:scale-95 transition-transform">
          <img
            alt="User Profile"
            className="w-full h-full object-cover"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCHB8zkpZoN2kISrq7RUrRbk-PO9ktsAo-GH3qPDc41v0iPazhrvoxrMld9BBBjZpYs9ibMGEIAd7hItedp2Riw2NB1zAgtTOwYhURnqGj4P1VnGZnFMqwWCiLjEDIxqIzr8Xxwnkvbga10rYvxGzJpVsepqEffLGw7zz2A-vMPokoDDN-4lYuXHQIZvz-dTSoUFbZP-ElIFZyoiNz8h_HlJ3pVwSlF2u7lyUkrCxsO4-3tTyuKJKwwSC_KW14iXMiMld68YKHRImwR"
          />
        </div>
      </div>
    </header>
  );
}
