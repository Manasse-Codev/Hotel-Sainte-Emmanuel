// Données des chambres — extraites de la maquette Stitch
export const rooms = [
  {
    id: 'standard',
    name: 'Chambre Standard',
    price: '45 000 FCFA',
    pricePerNight: 45000,
    capacity: '2 personnes',
    badge: 'Disponibilité Immédiate',
    badgeType: 'available',
    shortDesc: 'Une chambre chaleureuse aux finitions boisées, dotée d\'une literie King Size soignée et d\'une salle de bain privative.',
    fullDesc: 'Conçue pour offrir quiétude et bien-être après vos déplacements dans le département de Soubré. Un refuge élégant alliant confort contemporain et chaleur ivoirienne.',
    amenities: [
      'Climatisation réglable',
      'Wi-Fi haut débit',
      'Télévision par satellite',
      'Salle de bain privative',
      'Literie prestige',
      'Espace bureau',
    ],
    image: '/images/room-standard.jpg',
  },
  {
    id: 'superieure',
    name: 'Chambre Supérieure',
    price: '55 000 FCFA',
    pricePerNight: 55000,
    capacity: '2 personnes',
    badge: 'Sur Demande',
    badgeType: 'request',
    shortDesc: 'Une harmonie parfaite entre volume et clarté avec belle ouverture extérieure et balcon privatif.',
    fullDesc: 'Idéale pour un séjour reposant avec vue dégagée. L\'espace généreux, la douche italienne et le balcon privatif font de cette chambre une parenthèse de sérénité.',
    amenities: [
      'Climatisation',
      'Wi-Fi',
      'Balcon privatif',
      'Douche italienne',
      'Literie premium',
      'Télévision',
    ],
    image: '/images/room-superieure.jpg',
  },
  {
    id: 'deluxe',
    name: 'Suite Deluxe',
    price: '75 000 FCFA',
    pricePerNight: 75000,
    capacity: '2 personnes',
    badge: 'Disponibilité Immédiate',
    badgeType: 'available',
    shortDesc: 'Notre suite premium par excellence avec un salon intime, miroirs pleine hauteur et salle de bain marbrée.',
    fullDesc: 'La Suite Deluxe incarne le raffinement absolu de l\'Hôtel Sainte Emmanuelle. Salon privé, miroirs pleine hauteur, salle de bain marbrée — une expérience inoubliable à Soubré.',
    amenities: [
      'Climatisation réglable',
      'Wi-Fi haut débit',
      'Salon privé',
      'Salle de bain marbre',
      'Minibar',
      'Télévision 55"',
    ],
    image: '/images/room-deluxe.jpg',
  },
];

export function getRoomImage(room) {
  if (!room) return '/images/hero.jpg';
  if (room.image && !room.image.includes('lh3.googleusercontent.com')) {
    return room.image;
  }
  const id = (room.id || '').toLowerCase();
  if (id.includes('superieure')) return '/images/room-superieure.jpg';
  if (id.includes('deluxe')) return '/images/room-deluxe.jpg';
  return '/images/room-standard.jpg';
}

