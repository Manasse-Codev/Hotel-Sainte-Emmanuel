import { useState } from 'react';
import Header from '../components/public/Header';
import ChapterNav from '../components/public/ChapterNav';
import Footer from '../components/public/Footer';
import HeroSection from '../components/public/sections/HeroSection';
import ChambresSection from '../components/public/sections/ChambresSection';
import ExperienceSection from '../components/public/sections/ExperienceSection';
import GalerieSection from '../components/public/sections/GalerieSection';
import OffresSection from '../components/public/sections/OffresSection';
import InfosSection from '../components/public/sections/InfosSection';
import ContactSection from '../components/public/sections/ContactSection';
import AuthModal from '../components/public/modals/AuthModal';
import RoomDetailModal from '../components/public/modals/RoomDetailModal';
import LightboxModal from '../components/public/modals/LightboxModal';
import ClientSpaceModal from '../components/public/client/ClientSpaceModal';

export default function PublicSite() {
  const [authModal, setAuthModal] = useState({ open: false, mode: 'login' });
  const [roomModal, setRoomModal] = useState({ open: false, room: null });
  const [lightbox, setLightbox] = useState({ open: false, image: null });
  const [clientSpace, setClientSpace] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState('');

  const openAuth = (mode = 'login') => setAuthModal({ open: true, mode });
  const closeAuth = () => setAuthModal({ open: false, mode: 'login' });

  const openRoom = (room) => setRoomModal({ open: true, room });
  const closeRoom = () => setRoomModal({ open: false, room: null });

  const openLightbox = (image) => setLightbox({ open: true, image });
  const closeLightbox = () => setLightbox({ open: false, image: null });

  const openClientSpace = () => setClientSpace(true);
  const closeClientSpace = () => setClientSpace(false);

  const handleQuickBook = (roomId) => {
    setSelectedRoom(roomId);
    const el = document.getElementById('reservation');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <Header onOpenAuth={openAuth} onOpenClientSpace={openClientSpace} />
      <ChapterNav />

      <main>
        <HeroSection />
        <ChambresSection onOpenRoom={openRoom} onQuickBook={handleQuickBook} />
        <ExperienceSection />
        <GalerieSection onOpenLightbox={openLightbox} />
        <OffresSection />
        <InfosSection />
        <ContactSection onOpenAuth={openAuth} onOpenClientSpace={openClientSpace} selectedRoom={selectedRoom} />
      </main>

      <Footer />

      {/* Modales */}
      <AuthModal
        isOpen={authModal.open}
        mode={authModal.mode}
        onClose={closeAuth}
        onSuccess={openClientSpace}
      />
      <RoomDetailModal
        isOpen={roomModal.open}
        onClose={closeRoom}
        onReserve={handleQuickBook}
        room={roomModal.room}
      />
      <LightboxModal
        image={lightbox.image}
        isOpen={lightbox.open}
        onClose={closeLightbox}
      />
      <ClientSpaceModal
        isOpen={clientSpace}
        onClose={closeClientSpace}
      />
    </>
  );
}
