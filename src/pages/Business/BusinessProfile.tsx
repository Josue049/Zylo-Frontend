import React from 'react';
import HeaderBusiness from '../../components/user/HeaderUser';

// --- Interfaces para Tipado ---
interface Service {
  id: number;
  title: string;
  price: string;
  description: string;
  icon: string;
  featured?: boolean;
}

interface TeamMember {
  id: number;
  name: string;
  role: string;
  image: string;
}

const App: React.FC = () => {
  // Datos simulados
  const services: Service[] = [
    {
      id: 1,
      title: "Premium Solo Pod",
      price: "$45/hr",
      description: "Sound-isolated acoustic pods with ergonomic seating and high-speed fiber connection.",
      icon: "workspace_premium"
    },
    {
      id: 2,
      title: "Strategy Boardroom",
      price: "$120/hr",
      description: "Fully equipped 4K conferencing systems, digital whiteboards, and catering options available.",
      icon: "groups",
      featured: true
    }
  ];

  const team: TeamMember[] = [
    { id: 1, name: "Elena Rossi", role: "Director", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDHlpypTJLBDZGOsrcf59gDBZbAncEkdHrCED_WevgVyJ1rLsxPkhgtvKtdzbyAuXVU_lLuapDrUGGymov6y54nWkh7sF-aP1l3_DQz9pUYo_1HFEt54XQWOVszPFcmBc2wyX6jWXdvOZ0w5gdqS81SyjIozfMQpTfDZQBpVDCnbiwJy_k5YPEhZHAjTw7CNlVWEXk_p6l39dFf5ZKb4HkPpiMVxheYlvqr8m_xmCnOJwGLfHYhn-Osrnx1raY_OLTzxDN0Kqje6uA8" },
    { id: 2, name: "Marcus Chen", role: "Operations", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDKnfmWzWtE7tSPdkptauU-WOcL1hfrf3xiGR5pBkndxhBNE8EXIwPDxLDN2-HmOW1fhJ1rkuoMZBnhCBZbjpJpbPy9Gl1R-TAAyc-v4zeUcQB83XLQ18LFK_iSzMKDg_oHtQ0PN6Eefk4kh5uZnG1faeB_DnZNrnVuHGyh83gvi7xG78SVzZL_HCpkw6to_zcDlffgBMLPV6HbN4kB63a4v4RENOqbcxquZdC1dFN25TJMw5P-JhlCB-k2AhJLeXTdek2DBpPu6kCL" },
    { id: 3, name: "Sarah Jenkins", role: "Hearth Lead", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAkHWJrECSvJUzSaS9DTtXt1tBtlcvY1brSts6vMDdPDD6EM_T2em8zLlY_v5ysIoQlSEKvVyUY1UcgZoC3NgJ-Zr8c8VltwUqqKb1DBwbeonGLH5W2IKfwUuueCLjdew-RlFmK8ZhcjztHW224Ar59KxNhtG_wAShTm0-mfAHr86p1grAAY6DkwY946pV7hlsFzB_27W_76T3Y-Wvs1r8-L22eLIdHiSVmqE7Ws7zVjZLEbdR9ZMPSLEVWEGl2sZWj1cXCfUZDPf5z" },
    { id: 4, name: "David Kim", role: "Tech Support", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAMcamLjth8dV6MAh5A4d-roZc1s0sztrJ7ZYsM5sts0tbHULixKtufSC14cqY9FgLQUfS11B5YdnykR-Khu_xNwKNvPhY0ncxphQRDNr3hfnGDylsmZ4iiHM1k0mO34amwGfYne_MetznLcx75qZzQba2Q54j65AUxHfAL4jaUh9uqxfkwuhlrjbkLnFcrqvMZKVL_eM9fHHL8HJ5E2Th96XqtcXMWDpC6xx2o33uvcT4T2rs6XqIJYIviDxJm9ZSYqHF-k04gkDzf" },
  ];

  return (
    <div className="bg-[#f9f6f5] text-[#2f2f2e] font-['Inter'] min-h-screen pb-32">
      
      {/* --- Top Navigation --- */}
      <HeaderBusiness /> 

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
        
        {/* --- Hero / Bento Gallery --- */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-4 h-[400px] md:h-[500px]">
          <div className="md:col-span-2 md:row-span-2 rounded-xl overflow-hidden relative group">
            <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuCsYGkdP2DgPmXzAAutYHzmBM3zW36p_YFj4Ltx6hXqdqb1Zr2T2lM_lsz5GBQrjfqgh9fSP7nDb2FySNlRpELlwGpDNiig28B7Uz8ArI690Ms5NB30whzdwFAi3cNCgq0q_5hQT_EsI2a45CmNAAPTa9AKHPP_mynQTyx3lYU5IZJtHxhVPzpBbB_3BJBa-mpWXF1ZZeUTroFhR8rO_vdo7aS3MA_T9lZo3X1okj5uax2Jwh2jffmoKmv5_MfntAfTgVsIpBAmnoV8" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Main" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
          </div>
          <div className="hidden md:block md:col-span-2 rounded-xl overflow-hidden group">
            <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuBmopvI7VnDPTZkNXrlhEFKoNtO0x5uEX8kQNwXnEBiWo6ClqbIjVZLcJ6rrcRJvoj0BqEqOGX50uVSlTVOnTJmFXWSbKSa95a0O1jG9QqJsvcsD3ELlFdSIdpT4j9D35SV_zgHPJtS7Y79ML0Wx1j8u3mSRX4RmyJGS2KMMvommMhsz5ub2DeUrOiNOZ11gc6bJ8XRENyB3LN73SoTD9Y-FNaUn5VG1IsfM6zdcM4fRErJinwgtTXdgwYPA8ajW6CVxpCopWR5tExl" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Interior" />
          </div>
          <div className="hidden md:block rounded-xl overflow-hidden group">
            <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuANzv7EXI3VOVaFtolJ_9suZ_IpZFFX1G5oCVN7wRNyJfeP-wkcwSfXW_qQE7S96ckUrTMmN1E9tCZOnodtZ5L2N-P8Igp4MzoNmUw58DRXdgeHpP58KDAMrp4YlXJzuS1j49qRHkyrCZMhV0MenPD8Tc5oR8urGHJnEbcF0pSngoQhAqZsDjA6Gf3VLAHQdNuLmJDDYWBXhXazdPFK6wnfffhgFI21gxiCmO4H498sIfPV6Sqe5mgMsojL0gKj4qskRX3pZ3FDwC46" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Detail" />
          </div>
          <div className="hidden md:block rounded-xl overflow-hidden group">
            <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuAgs_xIh9GIjy7ZyB2AiBvm_0Tskzq1lL0DI-4HQTCVcMRf3Qxlx-H9dMsIZXwqq6auscsBd9KGKNOxX9-6NMowXIFX59wqnnOijg-YpEw_jNbHGPcMiyll4NNI9hY_pfsYZKaxHylpKI3KsIOe_3tq_qyxfKGDG81XtAN5np92841t7NOtvjs9IZEJiVmNYe-yIKrH2aTs-t5oZ1BjQUU7PASP3MeUL1h2IkqrcL31ww0zfMAI0bAFWUMYJEMDRu4tfNY9SuE7hv26" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Social" />
          </div>
        </section>

        {/* --- Header Info --- */}
        <section className="mt-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-[#ff7851]/20 text-[#ab2d00] font-bold text-xs uppercase tracking-wider">Top Rated</span>
              <div className="flex items-center text-[#ab2d00]">
                <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                <span className="text-sm font-bold ml-1">4.9 (128 Reviews)</span>
              </div>
            </div>
            <h1 className="font-['Plus_Jakarta_Sans'] text-4xl md:text-5xl font-extrabold tracking-tight">Lumina Creative Hub</h1>
            <div className="flex items-center gap-2 text-[#5c5b5b]">
              <span className="material-symbols-outlined text-lg">location_on</span>
              <span className="font-medium">124 Design District, San Francisco, CA</span>
            </div>
          </div>
          <div className="flex gap-4">
            <button className="bg-[#dfdcdc] text-[#2f2f2e] px-8 py-4 rounded-full font-bold active:scale-95 transition-all">Message</button>
            <button className="bg-gradient-to-br from-[#ab2d00] to-[#ff7851] text-white px-8 py-4 rounded-full font-bold shadow-lg shadow-[#ab2d00]/20 active:scale-95 transition-all">
              Book Now
            </button>
          </div>
        </section>

        {/* --- Main Content Grid --- */}
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-12">
            <section>
              <h2 className="font-['Plus_Jakarta_Sans'] text-2xl font-bold mb-4">About</h2>
              <p className="text-[#5c5b5b] leading-relaxed text-lg">
                Lumina Creative Hub is more than just a workspace; it's a sanctuary for innovation. We specialize in providing premium environments for designers, architects, and digital creators to bring their visions to life.
              </p>
            </section>

            <section>
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-['Plus_Jakarta_Sans'] text-2xl font-bold">Our Services</h2>
                <button className="text-[#ab2d00] font-bold text-sm hover:underline">View All</button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {services.map((service) => (
                  <div key={service.id} className={`bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer group ${service.featured ? 'border-l-4 border-[#ab2d00]' : ''}`}>
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-12 h-12 bg-[#ff7851]/10 rounded-full flex items-center justify-center text-[#ab2d00]">
                        <span className="material-symbols-outlined">{service.icon}</span>
                      </div>
                      <span className="font-['Plus_Jakarta_Sans'] font-extrabold text-xl text-[#ab2d00]">{service.price}</span>
                    </div>
                    <h3 className="font-bold text-lg mb-1 group-hover:text-[#ab2d00] transition-colors">{service.title}</h3>
                    <p className="text-[#5c5b5b] text-sm line-clamp-2">{service.description}</p>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 className="font-['Plus_Jakarta_Sans'] text-2xl font-bold mb-6">Meet the Team</h2>
              <div className="flex gap-6 overflow-x-auto pb-4 no-scrollbar">
                {team.map((member) => (
                  <div key={member.id} className="flex-shrink-0 w-32 group">
                    <div className="w-32 h-32 rounded-xl overflow-hidden mb-3 grayscale group-hover:grayscale-0 transition-all duration-300">
                      <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
                    </div>
                    <h4 className="font-bold text-sm text-center">{member.name}</h4>
                    <p className="text-[#ab2d00] text-[10px] text-center font-bold uppercase tracking-widest">{member.role}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Right Column (Sidebar) */}
          <aside className="space-y-8">
            <div className="bg-[#f3f0ef] p-8 rounded-xl space-y-6">
              <div>
                <h3 className="font-bold mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#ab2d00]">schedule</span> Business Hours
                </h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex justify-between"><span>Mon — Fri</span><span className="font-semibold">08:00 AM - 08:00 PM</span></li>
                  <li className="flex justify-between"><span>Sat</span><span className="font-semibold">10:00 AM - 04:00 PM</span></li>
                  <li className="flex justify-between text-red-600 font-medium"><span>Sun</span><span>Closed</span></li>
                </ul>
              </div>
              <div className="pt-6 border-t border-[#dfdcdc]">
                <h3 className="font-bold mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#ab2d00]">map</span> Location
                </h3>
                <div className="w-full h-48 rounded-xl overflow-hidden bg-[#dfdcdc] relative mb-4">
                  <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuA5s-nUMlvpgsghslwE9bo1E97U12LTqLR7zWH0c2KXEXZgUtmzLdFTZj0eHiMLkvFHNEY94EymkqOGKRM7pqQJAzR8Yx-jLxU6gcjVod7lHh_YwjDF7RY3IojHeXtINVUD1ezIwt7iH7htQuVCtI7CcVEjLYQagSXz3g86qZJUK8xKIgYLmUdsGln-hl39E7ngDYRFFMW__zPuBhvUDfpciutQoXOTstJ3oeiXEnZMC__OXuyipJ2Q57IZwaR-tkRQyViO5rmpzMFk" className="w-full h-full object-cover opacity-80" alt="Map" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[#ab2d00] text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>location_on</span>
                  </div>
                </div>
                <p className="text-sm text-[#5c5b5b] italic">Entrance located on the south corner, adjacent to Blue Bottle Coffee.</p>
              </div>
            </div>
          </aside>
        </div>
      </main>

      {/* --- Bottom Navigation --- */}
      {/* <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 py-3 bg-white/80 backdrop-blur-xl shadow-lg rounded-t-[3rem]">
        {[
          { icon: 'search', label: 'Explore' },
          { icon: 'calendar_today', label: 'Bookings' },
          { icon: 'favorite', label: 'Saved' },
          { icon: 'chat_bubble', label: 'Messages' }
        ].map((item) => (
          <button key={item.label} className="flex flex-col items-center justify-center text-[#2f2f2e] p-2 hover:text-[#ab2d00] transition-all">
            <span className="material-symbols-outlined">{item.icon}</span>
            <span className="text-[10px] font-semibold mt-1">{item.label}</span>
          </button>
        ))}
        <button className="bg-gradient-to-br from-[#ab2d00] to-[#ff7851] text-white rounded-full p-3 mb-1 active:scale-95 transition-all">
          <span className="material-symbols-outlined">person_outline</span>
        </button>
      </nav> */}
    </div>
  );
};

export default App;