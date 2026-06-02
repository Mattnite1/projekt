import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuctionCard from '../components/AuctionCard';
import StatsCard from '../components/StatsCard';
import { getAllAuctions } from '../api/auctionApi';
import { images } from '../data/mockData';
import './Home.css';

function Home({ onAuctionDetail }) {
  const [auctions, setAuctions] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    getAllAuctions().then((data) => {
      setAuctions(data.filter((a) => a.isActive).slice(0, 3));
    });
  }, []);

  const scrollToHowItWorks = () => {
    document.getElementById('jak-to-dziala')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="home">
      {}
      <section className="home-hero animate-fade-in">
        <div className="home-hero-text">
          <h2>
            Razem Tworzymy<br />
            <span className="highlight">Lepsze Jutro</span><br />
            dla Psów.
          </h2>
          <p>
            Każda licytacja to krok w stronę pełnej miski i bezpiecznego schronienia.
            Dołącz do naszej społeczności i pomóż nam pomagać.
          </p>
          <div className="home-hero-buttons">
            <button className="btn-primary" onClick={() => navigate('/auctions')}>
              Zobacz Aukcje
            </button>
            <button className="btn-outline" onClick={scrollToHowItWorks}>Jak to działa?</button>
          </div>
        </div>
        <div className="home-hero-image animate-fade-in-up delay-2">
          <img src={images.heroDogs} alt="Szczęśliwe psy" />
        </div>
      </section>

      {}
      <section className="home-stats">
        <StatsCard
          icon="🤝"
          value={12400}
          label="Zebraliśmy w tym miesiącu"
          colorClass="teal"
          delay={0.1}
        />
        <StatsCard
          icon="🐾"
          value={86}
          label="Otrzymało wsparcie"
          colorClass="teal"
          delay={0.2}
        />
        <StatsCard
          icon="❤️"
          value={342}
          label="Aktywnie licytuje"
          colorClass="orange"
          delay={0.3}
        />
      </section>

      {}
      <section>
        <div className="home-auctions-header">
          <div>
            <h3>Aktywne Licytacje</h3>
            <p>Znajdź coś wyjątkowego i wesprzyj naszych podopiecznych.</p>
          </div>
          <button
            className="home-auctions-see-all"
            onClick={() => navigate('/auctions')}
          >
            Zobacz wszystkie
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>

        {auctions.length > 0 ? (
          <div className="home-auctions-grid">
            {auctions.map((auction, i) => (
              <AuctionCard
                key={auction.id}
                auction={auction}
                index={i}
                onBidClick={onAuctionDetail}
                onDetailClick={onAuctionDetail}
              />
            ))}
          </div>
        ) : (
          <div className="home-auctions-empty">
            <div className="home-auctions-empty-icon">🐾</div>
            <p>Brak aktywnych aukcji.</p>
            <span>Bądź pierwszy — dodaj swoją aukcję i pomóż psom!</span>
          </div>
        )}
      </section>

      {}
      <section id="jak-to-dziala" className="home-how-it-works">
        <div className="how-header">
          <h3>Jak to działa?</h3>
          <p>Cztery proste kroki, żeby wesprzeć psy potrzebujące pomocy.</p>
        </div>
        <div className="how-steps">
          <div className="how-step animate-fade-in-up delay-1">
            <div className="how-step-number">1</div>
            <div className="how-step-icon">🔍</div>
            <h4>Przeglądaj aukcje</h4>
            <p>Odkryj wyjątkowe przedmioty i doświadczenia wystawione przez społeczność. Od dzieła sztuki po sesje zdjęciowe z psem.</p>
          </div>
          <div className="how-step animate-fade-in-up delay-2">
            <div className="how-step-number">2</div>
            <div className="how-step-icon">🔨</div>
            <h4>Złóż ofertę</h4>
            <p>Licytuj przedmiot, który Cię zainteresuje. 100% środków trafia do schronisk i fundacji wspierających psy.</p>
          </div>
          <div className="how-step animate-fade-in-up delay-3">
            <div className="how-step-number">3</div>
            <div className="how-step-icon">❤️</div>
            <h4>Pomagasz psom</h4>
            <p>Wygrywasz wyjątkową nagrodę, a zebrane środki zapewniają psom jedzenie, opiekę weterynaryjną i bezpieczne schronienie.</p>
          </div>
          <div className="how-step animate-fade-in-up delay-4">
            <div className="how-step-number">4</div>
            <div className="how-step-icon">🎁</div>
            <h4>Wystaw swój przedmiot</h4>
            <p>Masz coś wartościowego? Dodaj własną aukcję i pomóż zebrać fundusze. Kliknij „Start a Cause" — to proste i bezpłatne.</p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
