export default function Navbar() {
  return (
    <nav className="fixed top-0 w-full z-50 glass-nav shadow-[0_40px_40px_rgba(47,47,46,0.06)]">
      <div className="flex justify-between items-center w-full px-8 py-4 max-w-screen-2xl mx-auto">
        <div className="flex items-center gap-8">
          <span className="text-2xl font-black text-[#2f2f2e] tracking-tighter font-headline">
            Zylo
          </span>
          <div className="hidden md:flex items-center gap-6">
            <a
              className="font-headline font-semibold text-sm tracking-tight text-[#2f2f2e] hover:text-[#ab2d00] hover:scale-[0.98] transition-all duration-200"
              href="#explorar-negocios"
            >
              Explorar negocios
            </a>
            <a
              className="font-headline font-semibold text-sm tracking-tight text-[#2f2f2e] hover:text-[#ab2d00] hover:scale-[0.98] transition-all duration-200"
              href="#categorias"
            >
              Categorías
            </a>
            <a
              className="font-headline font-semibold text-sm tracking-tight text-[#2f2f2e] hover:text-[#ab2d00] hover:scale-[0.98] transition-all duration-200"
              href="#como-funciona"
            >
              Cómo funciona
            </a>
            <a
              className="font-headline font-semibold text-sm tracking-tight text-[#2f2f2e] hover:text-[#ab2d00] hover:scale-[0.98] transition-all duration-200"
              href="#para-empresas"
            >
              Para empresas
            </a>
            <a
              className="font-headline font-semibold text-sm tracking-tight text-[#2f2f2e] hover:text-[#ab2d00] hover:scale-[0.98] transition-all duration-200"
              href="#nosotros"
            >
              Nosotros
            </a>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <a href="/login">
            <button className="hidden md:block font-headline font-semibold text-sm tracking-tight text-[#2f2f2e] hover:text-[#ab2d00] transition-colors">
              Login
            </button>
          </a>
          <a href="/register">
            <button className="btn-primary signature-gradient text-[#ffefeb] px-6 py-2.5 rounded-full font-headline font-semibold text-sm tracking-tight hover:scale-[0.98] active:scale-95 transition-all">
              Join Now
            </button>
          </a>
        </div>
      </div>
    </nav>
  );
}
