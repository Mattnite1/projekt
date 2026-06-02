import { useState, useEffect, useCallback } from 'react';
import Modal from '../components/Modal';
import { placeBid } from '../api/auctionApi';
import { getUserId } from '../utils/userId';
import { images } from '../data/mockData';
import './AuctionDetail.css';

function useCountdown(endDate) {
  const calc = useCallback(() => {
    
    if (!endDate) return { hours: 0, minutes: 0, expired: true };
    const end = new Date(endDate);
    if (isNaN(end.getTime())) return { hours: 0, minutes: 0, expired: true };

    const diff = Math.max(0, end - new Date());
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return { hours, minutes, expired: diff === 0 };
  }, [endDate]);

  
  const [time, setTime] = useState(() => calc());

  useEffect(() => {
    setTime(calc());
    const id = setInterval(() => setTime(calc()), 30000);
    return () => clearInterval(id);
  }, [calc]);

  return time;
}

function AuctionDetail({ auction, isOpen, onClose }) {
  const [activeImg, setActiveImg] = useState(0);
  const [bidAmount, setBidAmount] = useState('');
  const [bidderName, setBidderName] = useState('');
  const [currentAuction, setCurrentAuction] = useState(auction);
  const [bidError, setBidError] = useState('');
  const [bidSuccess, setBidSuccess] = useState(false);

  const userId = getUserId();
  const isOwner = currentAuction?.createdBy && currentAuction.createdBy === userId;

  const timer = useCountdown(currentAuction?.endDate);

  useEffect(() => {
    setCurrentAuction(auction);
    setActiveImg(0);
    setBidAmount('');
    setBidderName('');
    setBidError('');
    setBidSuccess(false);
  }, [auction]);

  if (!currentAuction) return null;

  const allImages =
    currentAuction.images && currentAuction.images.length > 0
      ? currentAuction.images
      : [images.paintingDog];

  const canBid = currentAuction.isActive && !timer.expired && !isOwner;

  const handleBid = async () => {
    setBidError('');
    const amount = parseFloat(bidAmount);
    if (!bidderName.trim()) {
      setBidError('Podaj swoje imię.');
      return;
    }
    if (isNaN(amount) || amount <= currentAuction.currentPrice) {
      setBidError(
        `Oferta musi być wyższa niż ${currentAuction.currentPrice.toLocaleString('pl-PL')} PLN.`
      );
      return;
    }
    try {
      const updated = await placeBid(currentAuction.id, bidderName.trim(), amount);
      setCurrentAuction(updated);
      setBidAmount('');
      setBidSuccess(true);
      setTimeout(() => setBidSuccess(false), 3000);
    } catch (err) {
      setBidError(err.message);
    }
  };

  const pad = (n) => String(n).padStart(2, '0');

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="large" showCloseButton={false}>
      <div className="auction-detail">
        {}
        <div className="auction-detail-gallery">
          <div className="auction-detail-main-image">
            <img src={allImages[activeImg]} alt={currentAuction.title} />
          </div>
          <button className="auction-detail-back" onClick={onClose}>←</button>

          {allImages.length > 1 && (
            <div className="auction-detail-thumbnails">
              {allImages.map((img, i) => (
                <div
                  key={i}
                  className={`auction-detail-thumb ${i === activeImg ? 'active' : ''}`}
                  onClick={() => setActiveImg(i)}
                >
                  <img src={img} alt={`Zdjęcie ${i + 1}`} />
                </div>
              ))}
            </div>
          )}
        </div>

        {}
        <div className="auction-detail-info">
          <div className="auction-detail-live-badge">
            <span className="dot"></span>
            Live Auction
          </div>

          <h2 className="auction-detail-title">{currentAuction.title}</h2>

          <div className="auction-detail-seller">
            <div className="auction-detail-avatar">
              {currentAuction.seller?.initials || 'AN'}
            </div>
            <span className="auction-detail-seller-name">
              {currentAuction.seller?.name || 'Anonimowy'}
              {isOwner && (
                <span className="owner-badge"> · Twoja aukcja</span>
              )}
            </span>
          </div>

          <p className="auction-detail-desc">{currentAuction.description}</p>

          {(currentAuction.technique || currentAuction.deliveryTime) && (
            <div className="auction-detail-meta">
              {currentAuction.technique && (
                <div className="auction-detail-meta-item">
                  <label>Technika</label>
                  <span>{currentAuction.technique}</span>
                </div>
              )}
              {currentAuction.deliveryTime && (
                <div className="auction-detail-meta-item">
                  <label>Czas realizacji</label>
                  <span>{currentAuction.deliveryTime}</span>
                </div>
              )}
            </div>
          )}

          {currentAuction.bids && currentAuction.bids.length > 0 && (
            <>
              <div className="auction-detail-history-title">Historia licytacji</div>
              <div className="auction-detail-bids">
                {currentAuction.bids.slice(0, 3).map((bid, i) => (
                  <div key={i} className={`auction-detail-bid-row ${i === 0 ? 'top-bid' : ''}`}>
                    <div className={`bid-avatar ${i === 0 ? 'top' : ''}`}>
                      {bid.bidder.initials}
                    </div>
                    <span className="bid-name">{bid.bidder.name}</span>
                    <span className="bid-amount">
                      {bid.amount.toLocaleString('pl-PL')} PLN
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}

          {}
          <div className="auction-detail-footer">
            <div className="auction-detail-footer-top">
              <div className="auction-detail-current-price">
                <label>Aktualna oferta</label>
                <div className="price">
                  {currentAuction.currentPrice.toLocaleString('pl-PL')} PLN
                </div>
              </div>
              {currentAuction.isActive && !timer.expired && (
                <div className="auction-detail-timer">
                  <label>Koniec za</label>
                  <div className="time">
                    {pad(timer.hours)} : {pad(timer.minutes)}
                  </div>
                </div>
              )}
            </div>

            {}
            {isOwner && currentAuction.isActive && (
              <div className="owner-info-box">
                <span>🔒</span>
                Nie możesz licytować własnej aukcji.
              </div>
            )}

            {}
            {canBid && (
              <>
                <input
                  className="bid-name-input"
                  type="text"
                  placeholder="Twoje imię i nazwisko"
                  value={bidderName}
                  onChange={(e) => setBidderName(e.target.value)}
                />
                <div className="bid-input-row">
                  <div className="bid-input-wrap">
                    <span>zł</span>
                    <input
                      className="bid-input"
                      type="number"
                      min={currentAuction.currentPrice + 1}
                      step="10"
                      placeholder={`Min. ${currentAuction.currentPrice + 50}`}
                      value={bidAmount}
                      onChange={(e) => setBidAmount(e.target.value)}
                    />
                  </div>
                </div>

                {bidError && (
                  <p style={{ color: '#dc2626', fontSize: '0.8rem', marginBottom: 8 }}>
                    ⚠️ {bidError}
                  </p>
                )}
                {bidSuccess && (
                  <p style={{ color: '#16a34a', fontSize: '0.8rem', marginBottom: 8 }}>
                    ✅ Oferta złożona pomyślnie!
                  </p>
                )}

                <button className="auction-detail-bid-btn" onClick={handleBid}>
                  🔨 Złóż Ofertę!
                </button>
              </>
            )}

            {(!currentAuction.isActive || timer.expired) && (
              <button className="auction-detail-bid-btn" disabled style={{ opacity: 0.6 }}>
                Aukcja zakończona
              </button>
            )}

            <p className="auction-detail-disclaimer">
              Składając ofertę akceptujesz regulamin platformy KindRaise Collective.
              Środki przekazywane są na rzecz fundacji wspierającej psy.
            </p>
          </div>
        </div>
      </div>
    </Modal>
  );
}

export default AuctionDetail;
