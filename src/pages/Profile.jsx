import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProfileStatsCard } from '../components/StatsCard';
import { getUserAuctions, getBiddedAuctions, closeAuction, deleteAuction } from '../api/auctionApi';
import { getUserId } from '../utils/userId';
import { images } from '../data/mockData';
import './Profile.css';

function getDaysLeft(endDate) {
  if (!endDate) return 0;
  const diff = Math.ceil((new Date(endDate) - new Date()) / (1000 * 60 * 60 * 24));
  return diff;
}


function useConfirm() {
  const [pending, setPending] = useState(null); 
  const ask = (message, onConfirm) => setPending({ message, onConfirm });
  const confirm = () => { pending?.onConfirm(); setPending(null); };
  const cancel = () => setPending(null);
  return { pending, ask, confirm, cancel };
}


function ProfileAuctionCard({ auction, index, onClose, onDelete, onDetail }) {
  const daysLeft = getDaysLeft(auction.endDate);
  const imgSrc = auction.mainImage || (auction.images?.[0]) || images.paintingDog;
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="profile-auction-card" style={{ animationDelay: `${index * 0.08}s` }}>
      <div className="profile-auction-image">
        <img src={imgSrc} alt={auction.title} />
      </div>

      {!auction.isActive && <div className="profile-ribbon">Aukcja</div>}

      <div className="profile-auction-content">
        {}
        <div className="profile-auction-status">
          <span className={`profile-badge ${auction.isActive ? 'active' : 'ended'}`}>
            {auction.isActive ? 'Aktywna' : 'Zakończona'}
          </span>
          {auction.isActive && daysLeft > 0 && (
            <span className="profile-days-left">⏱ {daysLeft} dni do końca</span>
          )}
          {auction.isActive && daysLeft <= 0 && (
            <span className="profile-days-left" style={{ color: '#dc2626' }}>Kończy się dziś</span>
          )}
        </div>

        <h4 className="profile-auction-title">{auction.title}</h4>
        <p className="profile-auction-desc">{auction.description}</p>

        {}
        <div className="profile-auction-stats-row">
          <div className="profile-stat-chip">
            <span className="chip-label">Aktualna cena</span>
            <span className="chip-value orange">{auction.currentPrice.toLocaleString('pl-PL')} zł</span>
          </div>
          <div className="profile-stat-chip">
            <span className="chip-label">Cena startowa</span>
            <span className="chip-value">{(auction.startingPrice || 0).toLocaleString('pl-PL')} zł</span>
          </div>
          <div className="profile-stat-chip">
            <span className="chip-label">Licytujących</span>
            <span className="chip-value">{auction.biddersCount}</span>
          </div>
          <div className="profile-stat-chip">
            <span className="chip-label">Ofert</span>
            <span className="chip-value">{auction.bidsCount}</span>
          </div>
        </div>

        {}
        {auction.bids && auction.bids.length > 0 && (
          <div className="profile-latest-bid">
            <span className="bid-leader-label">🏆 Prowadzi:</span>
            <span className="bid-leader-name">{auction.bids[0].bidder.name}</span>
            <span className="bid-leader-amount">{auction.bids[0].amount.toLocaleString('pl-PL')} zł</span>
          </div>
        )}

        {}
        <div className="profile-auction-actions">
          <button
            className="profile-action-btn detail"
            onClick={() => onDetail(auction)}
            title="Podgląd aukcji"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            Podgląd
          </button>

          {onClose && onDelete && (
            auction.isActive ? (
              <button
                className="profile-action-btn close"
                onClick={() => onClose(auction)}
                title="Zakończ aukcję wcześniej"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                  <line x1="15" y1="9" x2="9" y2="15" />
                </svg>
                Zakończ
              </button>
            ) : (
              <button
                className="profile-action-btn delete"
                onClick={() => onDelete(auction)}
                title="Usuń aukcję"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6l-1 14H6L5 6" />
                  <path d="M10 11v6M14 11v6" />
                  <path d="M9 6V4h6v2" />
                </svg>
                Usuń
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
}


function ConfirmDialog({ pending, onConfirm, onCancel }) {
  if (!pending) return null;
  return (
    <div className="confirm-overlay" onClick={onCancel}>
      <div className="confirm-box" onClick={e => e.stopPropagation()}>
        <div className="confirm-icon">⚠️</div>
        <p className="confirm-msg">{pending.message}</p>
        <div className="confirm-actions">
          <button className="confirm-btn cancel" onClick={onCancel}>Anuluj</button>
          <button className="confirm-btn danger" onClick={onConfirm}>Tak, kontynuuj</button>
        </div>
      </div>
    </div>
  );
}


function Profile({ onPostAuction, onAuctionDetail }) {
  const [myAuctions, setMyAuctions] = useState([]);
  const [biddedAuctions, setBiddedAuctions] = useState([]);
  const [activeTab, setActiveTab] = useState('created'); // 'created' | 'bidding'
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(4);
  const [actionError, setActionError] = useState('');
  
  const userId = getUserId();
  const navigate = useNavigate();
  const { pending, ask, confirm, cancel } = useConfirm();

  const load = async () => {
    setLoading(true);
    try {
      const [created, bidding] = await Promise.all([
        getUserAuctions(userId),
        getBiddedAuctions()
      ]);
      setMyAuctions(created);
      setBiddedAuctions(bidding);
    } catch (e) {
      console.error('Failed to load auctions:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    setVisibleCount(4);
  }, [activeTab]);

  const handleClose = (auction) => {
    ask(
      `Czy na pewno chcesz zakończyć aukcję "${auction.title}"? Tego nie można cofnąć.`,
      async () => {
        try {
          await closeAuction(auction.id);
          await load();
        } catch (e) {
          setActionError(e.message);
        }
      }
    );
  };

  const handleDelete = (auction) => {
    ask(
      `Czy na pewno chcesz USUNĄĆ aukcję "${auction.title}"? Wszystkie oferty zostaną utracone.`,
      async () => {
        try {
          await deleteAuction(auction.id);
          await load();
        } catch (e) {
          setActionError(e.message);
        }
      }
    );
  };

  const currentAuctions = activeTab === 'created' ? myAuctions : biddedAuctions;
  const visible = currentAuctions.slice(0, visibleCount);
  
  const activeCount = myAuctions.filter(a => a.isActive).length;
  const totalFunds = myAuctions.reduce((s, a) => s + a.currentPrice, 0);
  const totalBidders = myAuctions.reduce((s, a) => s + (a.biddersCount || 0), 0);

  return (
    <div className="profile">
      <ConfirmDialog pending={pending} onConfirm={confirm} onCancel={cancel} />

      <div className="profile-breadcrumb animate-fade-in">
        Dashboard › <span>Moje Konto</span>
      </div>

      <div className="profile-header animate-fade-in-up">
        <h2>Profil i Licytacje</h2>
        <p>
          Zarządzaj swoimi aukcjami oraz śledź te, w których bierzesz udział dla{' '}
          <a href="#">KindRaise Collective</a>.
        </p>
      </div>

      <div className="profile-stats">
        <ProfileStatsCard label="Twoje Aktywne Aukcje" value={activeCount} delay={0.1} />
        <ProfileStatsCard
          label="Zebrane Fundusze"
          value={`${totalFunds.toLocaleString('pl-PL')} zł`}
          orangeBorder
          delay={0.2}
        />
        <ProfileStatsCard label="Liczba Licytujących" value={totalBidders} delay={0.3} />
      </div>

      {actionError && (
        <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 8, padding: '10px 16px', marginBottom: 16, color: '#dc2626', fontSize: '0.85rem' }}>
          ⚠️ {actionError}
          <button onClick={() => setActionError('')} style={{ marginLeft: 12, fontWeight: 600, background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer' }}>✕</button>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="profile-tabs-nav">
        <button
          className={`profile-tab-btn ${activeTab === 'created' ? 'active' : ''}`}
          onClick={() => setActiveTab('created')}
        >
          Wystawione przez mnie ({myAuctions.length})
        </button>
        <button
          className={`profile-tab-btn ${activeTab === 'bidding' ? 'active' : ''}`}
          onClick={() => setActiveTab('bidding')}
        >
          Licytowane przeze mnie ({biddedAuctions.length})
        </button>
      </div>

      {loading ? (
        <div className="profile-loading">
          <div className="profile-loading-spinner" />
          <p>Ładowanie aukcji...</p>
        </div>
      ) : currentAuctions.length === 0 ? (
        activeTab === 'created' ? (
          <div className="profile-empty animate-fade-in">
            <h4>Nie masz jeszcze żadnych wystawionych aukcji</h4>
            <p>Kliknij „Start a Cause", aby dodać swoją pierwszą aukcję!</p>
            <button
              onClick={onPostAuction}
              style={{
                marginTop: 16, padding: '12px 28px',
                background: 'var(--color-orange-gradient)', color: 'white',
                borderRadius: 'var(--radius-pill)', fontWeight: 600,
                cursor: 'pointer', border: 'none', fontSize: '0.9rem',
              }}
            >
              + Start a Cause
            </button>
          </div>
        ) : (
          <div className="profile-empty animate-fade-in">
            <h4>Nie licytujesz jeszcze żadnych aukcji</h4>
            <p>Przejdź do listy aktywnych licytacji, aby wesprzeć pieski w potrzebie!</p>
            <button
              onClick={() => navigate('/auctions')}
              style={{
                marginTop: 16, padding: '12px 28px',
                background: 'var(--color-orange-gradient)', color: 'white',
                borderRadius: 'var(--radius-pill)', fontWeight: 600,
                cursor: 'pointer', border: 'none', fontSize: '0.9rem',
              }}
            >
              Zobacz aktywne licytacje
            </button>
          </div>
        )
      ) : (
        <>
          <div className="profile-auctions-grid">
            {visible.map((auction, i) => (
              <ProfileAuctionCard
                key={auction.id}
                auction={auction}
                index={i}
                onClose={activeTab === 'created' ? handleClose : undefined}
                onDelete={activeTab === 'created' ? handleDelete : undefined}
                onDetail={onAuctionDetail || (() => {})}
              />
            ))}
          </div>

          <div className="profile-footer animate-fade-in">
            <p>Wyświetlasz {visible.length} z {currentAuctions.length} przedmiotów</p>
            {visibleCount < currentAuctions.length && (
              <button
                className="profile-show-more"
                onClick={() => setVisibleCount(p => p + 4)}
              >
                Pokaż więcej aukcji
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default Profile;
