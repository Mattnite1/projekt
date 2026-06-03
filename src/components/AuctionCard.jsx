import { images } from '../data/mockData';
import './AuctionCard.css';

function AuctionCard({ auction, onBidClick, onDetailClick, index = 0, liked = false, onToggleLike }) {
  const delay = index * 0.1;

  const formatPrice = (price) => price.toLocaleString('pl-PL');

  const getImageSrc = (auction) => {
    if (auction.mainImage) return auction.mainImage;
    if (auction.images && auction.images.length > 0) return auction.images[0];
    return images.paintingDog;
  };

  const handleBidClick = (e) => {
    e.stopPropagation();
    if (onBidClick) onBidClick(auction);
  };

  const handleHeartClick = (e) => {
    e.stopPropagation();
    if (onToggleLike) onToggleLike(auction.id);
  };

  return (
    <div
      className={`auction-card ${!auction.isActive ? 'ended' : ''}`}
      style={{ animationDelay: `${delay}s` }}
      onClick={() => onDetailClick && onDetailClick(auction)}
    >
      <div className="auction-card-image">
        <img src={getImageSrc(auction)} alt={auction.title} />
        <span className="auction-card-badge">
          <span className="auction-card-badge-dot"></span>
          {auction.isActive ? 'NA ŻYWO' : 'ZAKOŃCZONA'}
        </span>
        <button
          className={`auction-card-heart ${liked ? 'liked' : ''}`}
          onClick={handleHeartClick}
          title={liked ? 'Usuń z ulubionych' : 'Dodaj do ulubionych'}
        >
          <svg viewBox="0 0 24 24" fill={liked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>
      </div>

      <div className="auction-card-content">
        <h3 className="auction-card-title">{auction.title}</h3>
        <p className="auction-card-desc">{auction.description}</p>

        <div className="auction-card-price-row">
          <div>
            <div className="auction-card-price-label">
              {auction.isActive ? 'Aktualna cena' : 'Cena końcowa'}
            </div>
            <div className="auction-card-price-value">
              {formatPrice(auction.currentPrice)} PLN
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div className="auction-card-price-label">Oferty</div>
            <div className="auction-card-bids-value">{auction.bidsCount}</div>
          </div>
        </div>

        <button className="auction-card-btn" onClick={handleBidClick}>
          {auction.isActive ? 'Licytuj Teraz' : 'Zakończona'}
        </button>
      </div>
    </div>
  );
}

export default AuctionCard;
