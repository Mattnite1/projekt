import { useState, useEffect, useMemo } from 'react';
import AuctionCard from '../components/AuctionCard';
import { getAllAuctions } from '../api/auctionApi';
import './LiveAuctions.css';

const FAVORITES_KEY = 'kindraise_favorites';

function loadFavorites() {
  try {
    return new Set(JSON.parse(localStorage.getItem(FAVORITES_KEY) || '[]'));
  } catch {
    return new Set();
  }
}

function saveFavorites(set) {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify([...set]));
}

const SORT_OPTIONS = [
  { value: 'ending_soon', label: 'Kończące się wkrótce' },
  { value: 'price_high', label: 'Cena: od najwyższej' },
  { value: 'price_low', label: 'Cena: od najniższej' },
  { value: 'most_bids', label: 'Najwięcej ofert' },
  { value: 'newest', label: 'Najnowsze' },
];

const categories = ['All Items', 'Fine Art', 'Experiences', 'Pet Accessories'];
const categoryIcons = {
  'All Items': '📦',
  'Fine Art': '🎨',
  'Experiences': '📸',
  'Pet Accessories': '🐾',
};

function sortAuctions(list, sortBy) {
  const sorted = [...list];
  switch (sortBy) {
    case 'ending_soon':
      return sorted.sort((a, b) => new Date(a.endDate) - new Date(b.endDate));
    case 'price_high':
      return sorted.sort((a, b) => b.currentPrice - a.currentPrice);
    case 'price_low':
      return sorted.sort((a, b) => a.currentPrice - b.currentPrice);
    case 'most_bids':
      return sorted.sort((a, b) => b.bidsCount - a.bidsCount);
    case 'newest':
      return sorted.sort((a, b) => b.id - a.id);
    default:
      return sorted;
  }
}

function LiveAuctions({ onAuctionDetail, onPostAuction }) {
  const [auctions, setAuctions] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All Items');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('ending_soon');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [favorites, setFavorites] = useState(loadFavorites);
  const [visibleCount, setVisibleCount] = useState(6);

  useEffect(() => {
    getAllAuctions().then(setAuctions);
  }, []);

  const handleToggleLike = (auctionId) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(auctionId)) {
        next.delete(auctionId);
      } else {
        next.add(auctionId);
      }
      saveFavorites(next);
      return next;
    });
  };

  const filteredAuctions = useMemo(() => {
    let result = auctions;

    
    if (selectedCategory !== 'All Items') {
      result = result.filter((a) => a.category === selectedCategory);
    }

    
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.description.toLowerCase().includes(q)
      );
    }

    
    if (showFavoritesOnly) {
      result = result.filter((a) => favorites.has(a.id));
    }

    
    return sortAuctions(result, sortBy);
  }, [auctions, selectedCategory, searchQuery, sortBy, showFavoritesOnly, favorites]);

  
  useEffect(() => {
    setVisibleCount(6);
  }, [selectedCategory, searchQuery, sortBy, showFavoritesOnly]);

  const visibleAuctions = filteredAuctions.slice(0, visibleCount);
  const hasMore = visibleCount < filteredAuctions.length;
  const favCount = favorites.size;

  return (
    <div className="live-auctions">
      <div className="live-auctions-header animate-fade-in">
        <h2>Aktywne Licytacje</h2>
        <p>Przeglądaj licytacje</p>
      </div>

      {}
      <div className="live-auctions-search animate-fade-in-up delay-1">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          placeholder="Szukaj aukcji..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {}
      <div className="live-auctions-toolbar animate-fade-in-up delay-2">
        <div className="live-auctions-categories">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`category-pill ${selectedCategory === cat && !showFavoritesOnly ? 'active' : ''}`}
              onClick={() => {
                setSelectedCategory(cat);
                setShowFavoritesOnly(false);
              }}
            >
              <span>{categoryIcons[cat]}</span>
              {cat}
            </button>
          ))}

          {}
          <button
            className={`category-pill favorites-pill ${showFavoritesOnly ? 'active' : ''}`}
            onClick={() => setShowFavoritesOnly((prev) => !prev)}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill={showFavoritesOnly ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            Ulubione
            {favCount > 0 && (
              <span className="fav-count">{favCount}</span>
            )}
          </button>
        </div>

        <div className="live-auctions-sort">
          <select
            className="sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {}
      <div className="live-auctions-grid">
        {visibleAuctions.length > 0 ? (
          visibleAuctions.map((auction, i) => (
            <AuctionCard
              key={auction.id}
              auction={auction}
              index={i}
              liked={favorites.has(auction.id)}
              onToggleLike={handleToggleLike}
              onBidClick={onAuctionDetail}
              onDetailClick={onAuctionDetail}
            />
          ))
        ) : (
          <div className="no-results">
            {showFavoritesOnly ? (
              <>
                <h4>Brak ulubionych</h4>
                <p>Kliknij serce na karcie aukcji, żeby dodać do ulubionych.</p>
              </>
            ) : (
              <>
                <h4>Brak wyników</h4>
                <p>Spróbuj zmienić kryteria wyszukiwania.</p>
              </>
            )}
          </div>
        )}
      </div>

      {}
      {hasMore && (
        <div className="live-auctions-more">
          <button
            className="explore-more-btn"
            onClick={() => setVisibleCount((prev) => prev + 6)}
          >
            Wczytaj więcej
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="7 13 12 18 17 13" />
              <polyline points="7 6 12 11 17 6" />
            </svg>
          </button>
        </div>
      )}

      {}
      <button className="fab" onClick={onPostAuction}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </button>
    </div>
  );
}

export default LiveAuctions;
