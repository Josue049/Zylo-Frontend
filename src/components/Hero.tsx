import Carousel from './Carousel'

export default function Hero() {
  return (
    <section id="explorar-negocios" className="heroLanding relative pt-32 pb-20 md:pt-48 md:pb-32 px-6 overflow-hidden">
      {/* Background glows */}
      <div className="absolute top-20 -left-32 w-96 h-96 rounded-full bg-primary/6 blur-3xl pointer-events-none" />
      {/* <div className="absolute bottom-10 right-0 w-72 h-72 rounded-full bg-[#ff785133] blur-3xl pointer-events-none" /> */}

      <div className="max-w-screen-2xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
        {/* Left copy */}
        <div className="relative z-10">
          <div className="reveal reveal-1">
            <span className="inline-block bg-primary/10 text-primary text-xs font-bold tracking-widest uppercase px-4 py-1.5 rounded-full mb-6 font-label">
              🔥 +10k reservas hoy
            </span>
          </div>
          <h1 className="reveal reveal-2 font-headline text-5xl md:text-7xl font-extrabold tracking-tighter text-[#2f2f2e] mb-6 leading-[1.08]">
            Haz tu<br />
            <span className="text-primary">próxima reserva</span>
          </h1>
          <p className="reveal reveal-3 text-[#5c5b5b] max-w-xl mb-10 leading-relaxed text-lg">
            Zylo es el destino único para descubrir y reservar los mejores servicios locales en toda Latinoamérica. Desde spas relajantes hasta los gimnasios más exigentes.
          </p>
          <div className="reveal reveal-4 flex flex-col sm:flex-row gap-4">
            <button className="btn-primary signature-gradient text-white px-8 py-4 rounded-full font-headline font-bold text-lg hover:scale-[0.98] active:scale-95 transition-all shadow-xl shadow-primary/20">
              Explorar negocios
            </button>
            {/* <button className="bg-[#dfdcdc] text-[#2f2f2e] px-8 py-4 rounded-full font-headline font-bold text-lg hover:scale-[0.98] active:scale-95 transition-all">
              Ver promociones
            </button> */}
          </div>
          <div className="reveal reveal-5 mt-12 flex items-center gap-4">
            <div className="imgPersonas flex -space-x-3">
              {[
                'https://lh3.googleusercontent.com/aida-public/AB6AXuDpQb5hYarVUV90M-2fNoPoNZhdJT_WjHAv6ghvbbhgc8ToNfW5CAVECppWFOg3WjinvAguIw7tQYA7Duutxd5yOd_tfKgr9urxkV41I4k2yjplqJxOAlLxGUoySciq2HDDDgZk5Hf3eR-1xSpLpGp5LGFCtTwyM6uXNtdi-Cx3D2bghRgXxQ9Ab4BMNU5RtkMs0ZTH7sOowX3eSsjtPybCXEV2vOcrZasiz-MO3ExrL7pLzsMjfvDweHI7pr58jgrvvdeWr0smPcRl',
                'https://lh3.googleusercontent.com/aida-public/AB6AXuDCX-Prhq5U85Ogbkg0ItwWDiBar7J5qEpdOgG9IVQWNN6cfmasarbTOkFlS4JWYv1ETPKna6fWW5lDz3cr0SZ8Zwll0eT7uxHRtwInX0XZg4Zdrv08qF0_Dn4md2fQ7eC1ueE5AIOBm3LXgmKpug9YIBu4EOaIhTexgXnObDgzHcEjUyTmztEs2FoCJ7NOXz85CtrqkdVxaQctX_vD1r7yv6QohrOUjeK2r44MvMVP5_bPJ23M7FS7Oq6bc6X9hbJ3jOrKwTa-IQMn',
                'https://lh3.googleusercontent.com/aida-public/AB6AXuAysy5niGP8sLFkFkelCeMLj695qdlmwEl3HExEC_JWwR7anw7lCS5GyP3O0YyGNm7nLqXYEpkagGTpEVyvq4W2I83og0l658VApt1IFXKljcESloDK04k8858ZNNmiO7S4iRg7_nGCfd3_Tob4BPm-QD4ryfF0g5rFj0DtO3zTnP1ZsmCrcgvOp8-CVvRBPfZJHi9IkdqsDrj1XP2w4dOHgFMg_wsaQbiphYwxwwmR7DxB0a6ns65V7E7nUa71Cc-r0DSVwf2lSH3w',
              ].map((src, i) => (
                <img key={i} className="w-12 h-12 rounded-full border-4 border-[#f9f6f5] object-cover" src={src} alt={`user-${i}`} />
              ))}
            </div>
            <p className="text-sm font-label font-semibold text-[#5c5b5b]">
              <span className="text-primary font-bold">+10k</span> personas ya reservaron hoy
            </p>
          </div>
        </div>

        {/* Right: Carousel */}
        <Carousel />
      </div>
    </section>
  )
}
