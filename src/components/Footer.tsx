const links = [
  "Política de Privacidad",
  "Términos de Servicio",
  "Programa de Socios",
  "Soporte",
  "Carreras",
];

export default function Footer() {
  return (
    <footer className="w-full footer-wave mt-20 bg-[#f3f0ef]">
      <div className="flex flex-col md:flex-row justify-between items-center w-full px-12 py-16 gap-8 max-w-screen-2xl mx-auto">
        <div className="flex flex-col gap-4 items-center md:items-start">
          <span className="text-xl font-black text-[#2f2f2e] font-headline">
            Zylo
          </span>
          <p className="text-[#2f2f2e]/70 font-body text-sm text-center md:text-left">
            © 2026 Mercado Zylo. Proyecto para UTP.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-x-8 gap-y-4">
          {links.map((link) => (
            <a
              key={link}
              className="text-[#2f2f2e]/70 font-body text-sm hover:text-[#FF5722] transition-colors"
              href="#"
            >
              {link}
            </a>
          ))}
        </div>
        {/* <div className="flex gap-4">
          {" "}
          <span className="material-symbols-outlined text-[#2f2f2e] opacity-50 cursor-pointer hover:opacity-100 transition-opacity">
            language
          </span>{" "}
          <span className="material-symbols-outlined text-[#2f2f2e] opacity-50 cursor-pointer hover:opacity-100 transition-opacity">
            public
          </span>{" "}
        </div> */}
      </div>
    </footer>
  );
}
