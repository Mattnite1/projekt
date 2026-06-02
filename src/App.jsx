import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import Home from './pages/Home';
import LiveAuctions from './pages/LiveAuctions';
import Profile from './pages/Profile';
import AuctionDetail from './modals/AuctionDetail';
import PostAuction from './modals/PostAuction';
import { initializeDB } from './api/auctionApi';
import './App.css';

function App() {
  const [selectedAuction, setSelectedAuction] = useState(null);
  const [showAuctionDetail, setShowAuctionDetail] = useState(false);
  const [showPostAuction, setShowPostAuction] = useState(false);
  const [auctionKey, setAuctionKey] = useState(0);

  useEffect(() => {
    initializeDB();
  }, []);

  const handleOpenAuctionDetail = (auction) => {
    setSelectedAuction(auction);
    setShowAuctionDetail(true);
  };

  const handleCloseAuctionDetail = () => {
    setShowAuctionDetail(false);
    setTimeout(() => setSelectedAuction(null), 300);
  };

  const handleOpenPostAuction = () => {
    setShowPostAuction(true);
  };

  const handleClosePostAuction = () => {
    setShowPostAuction(false);
  };

  const handleAuctionCreated = () => {
    
    setAuctionKey((k) => k + 1);
  };

  return (
    <BrowserRouter>
      <div className="app-layout">
        <Sidebar onStartCause={handleOpenPostAuction} />

        <div className="main-content">
          <TopBar onStartCause={handleOpenPostAuction} />

          <div className="page-content">
            <Routes>
              <Route
                path="/"
                element={
                  <Home
                    key={auctionKey}
                    onAuctionDetail={handleOpenAuctionDetail}
                  />
                }
              />
              <Route
                path="/auctions"
                element={
                  <LiveAuctions
                    key={auctionKey}
                    onAuctionDetail={handleOpenAuctionDetail}
                    onPostAuction={handleOpenPostAuction}
                  />
                }
              />
              <Route
                path="/profile"
                element={
                  <Profile
                    key={auctionKey}
                    onPostAuction={handleOpenPostAuction}
                    onAuctionDetail={handleOpenAuctionDetail}
                  />
                }
              />
            </Routes>
          </div>
        </div>
      </div>

      {}
      <AuctionDetail
        auction={selectedAuction}
        isOpen={showAuctionDetail}
        onClose={handleCloseAuctionDetail}
      />

      <PostAuction
        isOpen={showPostAuction}
        onClose={handleClosePostAuction}
        onAuctionCreated={handleAuctionCreated}
      />
    </BrowserRouter>
  );
}

export default App;
