export interface Business {
  id: number
  name: string
  email: string      // credencial de login del negocio
  password: string   // contraseña predefinida (se hashea al sembrar en zylo_users)
  image: string
  imageAlt: string
  category: string
  distance: string
  rating: number
  availability: string
  available: boolean
  address: string
  description: string
  hours: {
    weekdays: string
    saturday: string
    sunday: string
  }
  services: {
    id: number
    title: string
    price: string
    description: string
    icon: string
    featured?: boolean
  }[]
  team: {
    id: number
    name: string
    role: string
    image: string
  }[]
  gallery: string[]
}

export const businesses: Business[] = [
  {
    id: 1,
    name: 'The Serene Sanctuary',
    email: 'serene@zylo.com',
    password: 'zylo1234',
    image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=800',
    imageAlt: 'Interior de spa moderno',
    category: 'Bienestar',
    distance: '0.8km de distancia',
    rating: 4.9,
    availability: 'Hoy a las 2:30 PM',
    available: true,
    address: '45 Wellness Ave, San Francisco, CA',
    description: 'The Serene Sanctuary es un refugio de paz y relajación. Ofrecemos tratamientos de spa de lujo diseñados para renovar cuerpo y mente, con terapeutas certificados y productos naturales de primera calidad.',
    hours: { weekdays: '09:00 AM - 08:00 PM', saturday: '10:00 AM - 06:00 PM', sunday: '11:00 AM - 05:00 PM' },
    services: [
      { id: 1, title: 'Masaje Relajante', price: '$60/hr', description: 'Masaje de cuerpo completo con aceites esenciales para aliviar tensiones y estrés.', icon: 'self_improvement' },
      { id: 2, title: 'Tratamiento Facial', price: '$80/hr', description: 'Limpieza profunda e hidratación con productos orgánicos premium.', icon: 'face', featured: true },
    ],
    team: [
      { id: 1, name: 'Ana Morales', role: 'Terapeuta Principal', image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=400' },
      { id: 2, name: 'Luis Peña', role: 'Especialista Facial', image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=400' },
    ],
    gallery: [
      'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=800',
      'https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=800',
      'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?q=80&w=800',
      'https://images.unsplash.com/photo-1515377905703-c4788e51af15?q=80&w=800',
    ],
  },
  {
    id: 2,
    name: 'Iron & Soul Gym',
    email: 'ironsoul@zylo.com',
    password: 'zylo1234',
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=800',
    imageAlt: 'Gimnasio moderno',
    category: 'Fitness',
    distance: '1.2km de distancia',
    rating: 4.7,
    availability: 'Próximo: Mañana 9:00 AM',
    available: false,
    address: '88 Fitness Blvd, San Francisco, CA',
    description: 'Iron & Soul Gym es más que un gimnasio; es una comunidad de personas apasionadas por el fitness. Contamos con equipos de última generación y entrenadores certificados listos para ayudarte a alcanzar tus metas.',
    hours: { weekdays: '06:00 AM - 10:00 PM', saturday: '07:00 AM - 08:00 PM', sunday: '08:00 AM - 06:00 PM' },
    services: [
      { id: 1, title: 'Entrenamiento Personal', price: '$50/hr', description: 'Sesiones one-on-one con nuestros entrenadores certificados adaptadas a tus objetivos.', icon: 'fitness_center', featured: true },
      { id: 2, title: 'Clases Grupales', price: '$20/clase', description: 'Yoga, spinning, crossfit y más. Elige la clase que más te motive.', icon: 'groups' },
    ],
    team: [
      { id: 1, name: 'Carlos Ruiz', role: 'Head Coach', image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=400' },
      { id: 2, name: 'María Torres', role: 'Instructora Yoga', image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=400' },
    ],
    gallery: [
      'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=800',
      'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=800',
      'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=800',
      'https://images.unsplash.com/photo-1549060279-7e168fcee0c2?q=80&w=800',
    ],
  },
  {
    id: 3,
    name: 'Glow Beauty Studio',
    email: 'glow@zylo.com',
    password: 'zylo1234',
    image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=800',
    imageAlt: 'Salón de belleza',
    category: 'Belleza',
    distance: '1.0km de distancia',
    rating: 4.8,
    availability: 'Hoy a las 4:00 PM',
    available: true,
    address: '22 Beauty Lane, San Francisco, CA',
    description: 'Glow Beauty Studio es tu destino para lucir radiante. Nuestro equipo de estilistas y esteticistas expertos utilizan las últimas técnicas y productos premium para realzar tu belleza natural.',
    hours: { weekdays: '09:00 AM - 07:00 PM', saturday: '09:00 AM - 06:00 PM', sunday: 'Cerrado' },
    services: [
      { id: 1, title: 'Maquillaje Profesional', price: '$55/sesión', description: 'Maquillaje para cualquier ocasión: día, noche, eventos especiales o bodas.', icon: 'face_retouching_natural', featured: true },
      { id: 2, title: 'Tratamiento de Cejas', price: '$30/sesión', description: 'Diseño, depilación y pigmentación de cejas para un look perfecto.', icon: 'auto_awesome' },
    ],
    team: [
      { id: 1, name: 'Sofía Gómez', role: 'Directora Creativa', image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?q=80&w=400' },
      { id: 2, name: 'Valeria Cruz', role: 'Esteticista', image: 'https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?q=80&w=400' },
    ],
    gallery: [
      'https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=800',
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=800',
      'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?q=80&w=400',
      'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?q=80&w=800',
    ],
  },
  {
    id: 4,
    name: 'Luxe Hair & Nails',
    email: 'luxe@zylo.com',
    password: 'zylo1234',
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=800',
    imageAlt: 'Salón de cabello',
    category: 'Belleza',
    distance: '1.6km de distancia',
    rating: 4.6,
    availability: 'Mañana a las 11:00 AM',
    available: false,
    address: '78 Glamour St, San Francisco, CA',
    description: 'Luxe Hair & Nails combina estilo y lujo en cada servicio. Desde cortes de vanguardia hasta manicuras de gel, nuestros especialistas te brindan una experiencia premium que te dejará impecable.',
    hours: { weekdays: '10:00 AM - 07:00 PM', saturday: '10:00 AM - 05:00 PM', sunday: 'Cerrado' },
    services: [
      { id: 1, title: 'Corte & Peinado', price: '$40/sesión', description: 'Corte personalizado según tu tipo de cabello y estilo de vida, incluye lavado y peinado.', icon: 'content_cut', featured: true },
      { id: 2, title: 'Manicura Gel', price: '$35/sesión', description: 'Uñas perfectas de larga duración con esmalte gel y diseños a tu elección.', icon: 'colorize' },
    ],
    team: [
      { id: 1, name: 'Daniela Ríos', role: 'Estilista Senior', image: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?q=80&w=400' },
      { id: 2, name: 'Paola Vega', role: 'Nail Artist', image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=400' },
    ],
    gallery: [
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=800',
      'https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=800',
      'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?q=80&w=800',
      'https://images.unsplash.com/photo-1604654894610-df63bc536371?q=80&w=800',
    ],
  },
  {
    id: 5,
    name: 'VitalCare Clinic',
    email: 'vitalcare@zylo.com',
    password: 'zylo1234',
    image: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?q=80&w=800',
    imageAlt: 'Clínica de salud',
    category: 'Salud',
    distance: '0.9km de distancia',
    rating: 4.8,
    availability: 'Hoy a las 3:15 PM',
    available: true,
    address: '10 Health Plaza, San Francisco, CA',
    description: 'VitalCare Clinic es tu aliado en salud y bienestar. Contamos con médicos especialistas, tecnología de punta y un enfoque integral para cuidar de ti y tu familia con la más alta calidad.',
    hours: { weekdays: '08:00 AM - 06:00 PM', saturday: '09:00 AM - 01:00 PM', sunday: 'Cerrado' },
    services: [
      { id: 1, title: 'Consulta General', price: '$40/consulta', description: 'Atención médica integral con diagnóstico y seguimiento personalizado.', icon: 'medical_services', featured: true },
      { id: 2, title: 'Nutrición', price: '$55/sesión', description: 'Plan nutricional personalizado con seguimiento mensual por especialista certificado.', icon: 'restaurant' },
    ],
    team: [
      { id: 1, name: 'Dr. Marco Silva', role: 'Médico General', image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=400' },
      { id: 2, name: 'Dra. Isabel León', role: 'Nutricionista', image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=400' },
    ],
    gallery: [
      'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?q=80&w=800',
      'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=800',
      'https://images.unsplash.com/photo-1504813184591-01572f98c85f?q=80&w=800',
      'https://images.unsplash.com/photo-1581056771107-24ca5f033842?q=80&w=800',
    ],
  },
  {
    id: 6,
    name: 'Dental Smile Center',
    email: 'dental@zylo.com',
    password: 'zylo1234',
    image: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?q=80&w=800',
    imageAlt: 'Clínica dental',
    category: 'Salud',
    distance: '1.8km de distancia',
    rating: 4.5,
    availability: 'Mañana a las 10:00 AM',
    available: false,
    address: '33 Smile Rd, San Francisco, CA',
    description: 'Dental Smile Center se dedica a darte la sonrisa que siempre soñaste. Con tecnología dental de última generación y un equipo de odontólogos altamente calificados, tu salud bucal está en las mejores manos.',
    hours: { weekdays: '08:00 AM - 05:00 PM', saturday: '09:00 AM - 12:00 PM', sunday: 'Cerrado' },
    services: [
      { id: 1, title: 'Limpieza Dental', price: '$50/sesión', description: 'Limpieza profesional completa para mantener tu salud bucal en óptimas condiciones.', icon: 'medical_services' },
      { id: 2, title: 'Blanqueamiento', price: '$120/sesión', description: 'Blanqueamiento dental profesional con resultados visibles desde la primera sesión.', icon: 'auto_awesome', featured: true },
    ],
    team: [
      { id: 1, name: 'Dr. Rafael Mora', role: 'Odontólogo', image: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?q=80&w=400' },
      { id: 2, name: 'Dra. Carmen Ávila', role: 'Ortodoncista', image: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?q=80&w=400' },
    ],
    gallery: [
      'https://images.unsplash.com/photo-1629909613654-28e377c37b09?q=80&w=800',
      'https://images.unsplash.com/photo-1588776814546-1ffbb172d936?q=80&w=800',
      'https://images.unsplash.com/photo-1606811971618-4486d14f3f99?q=80&w=800',
      'https://images.unsplash.com/photo-1609840114035-3c981b782dfe?q=80&w=800',
    ],
  },
  {
    id: 7,
    name: 'Paws & Polish Salon',
    email: 'paws@zylo.com',
    password: 'zylo1234',
    image: 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?q=80&w=800',
    imageAlt: 'Salón para mascotas',
    category: 'Mascotas',
    distance: '2.5km de distancia',
    rating: 4.9,
    availability: 'Hoy a las 5:00 PM',
    available: true,
    address: '55 Pet Haven Dr, San Francisco, CA',
    description: 'Paws & Polish Salon es el lugar donde tu mascota recibe el cuidado y amor que merece. Nuestros groómers certificados trabajan con cariño y paciencia para que tu peludo amigo luzca y se sienta increíble.',
    hours: { weekdays: '09:00 AM - 06:00 PM', saturday: '09:00 AM - 05:00 PM', sunday: '10:00 AM - 03:00 PM' },
    services: [
      { id: 1, title: 'Baño & Grooming', price: '$45/sesión', description: 'Baño completo, secado, corte de uñas y arreglo del pelaje según la raza.', icon: 'pets', featured: true },
      { id: 2, title: 'Corte de Pelo', price: '$35/sesión', description: 'Corte estético personalizado para que tu mascota luzca siempre impecable.', icon: 'content_cut' },
    ],
    team: [
      { id: 1, name: 'Lucía Paredes', role: 'Groómer Principal', image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400' },
      { id: 2, name: 'Andrés Fuentes', role: 'Asistente', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400' },
    ],
    gallery: [
      'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?q=80&w=800',
      'https://images.unsplash.com/photo-1587300003388-59208cc962cb?q=80&w=800',
      'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?q=80&w=800',
      'https://images.unsplash.com/photo-1450778869180-41d0601e046e?q=80&w=800',
    ],
  },
  {
    id: 8,
    name: 'Happy Tails Vet',
    email: 'happytails@zylo.com',
    password: 'zylo1234',
    image: 'https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?q=80&w=800',
    imageAlt: 'Clínica veterinaria',
    category: 'Mascotas',
    distance: '2.0km de distancia',
    rating: 4.7,
    availability: 'Hoy a las 6:00 PM',
    available: true,
    address: '99 Vet Circle, San Francisco, CA',
    description: 'Happy Tails Vet es una clínica veterinaria de confianza comprometida con la salud y bienestar de tus mascotas. Nuestros veterinarios con años de experiencia brindan atención médica con el más alto estándar.',
    hours: { weekdays: '08:00 AM - 07:00 PM', saturday: '09:00 AM - 04:00 PM', sunday: '10:00 AM - 02:00 PM' },
    services: [
      { id: 1, title: 'Consulta Veterinaria', price: '$45/consulta', description: 'Examen clínico completo, diagnóstico y plan de tratamiento personalizado para tu mascota.', icon: 'medical_services', featured: true },
      { id: 2, title: 'Vacunación', price: '$25/dosis', description: 'Plan de vacunación completo para mantener a tu mascota protegida y saludable.', icon: 'vaccines' },
    ],
    team: [
      { id: 1, name: 'Dra. Natalia Soto', role: 'Veterinaria', image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=400' },
      { id: 2, name: 'Dr. Javier Medina', role: 'Cirujano Veterinario', image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=400' },
    ],
    gallery: [
      'https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?q=80&w=800',
      'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?q=80&w=800',
      'https://images.unsplash.com/photo-1587300003388-59208cc962cb?q=80&w=800',
      'https://images.unsplash.com/photo-1450778869180-41d0601e046e?q=80&w=800',
    ],
  },
]