import React, { useState, useEffect, useMemo } from 'react';
import type { SmokingArea, Review, UserProfile, FilterCriteria, RouteInfo } from './types/database';
import { initialSmokingAreas, initialReviews } from './lib/mockData';
import { useGeolocation } from './hooks/useGeolocation';
import { Header } from './components/common/Header';
import { AuthModal } from './components/auth/AuthModal';
import { FilterBar } from './components/filter/FilterBar';
import { SmokingMap } from './components/map/SmokingMap';
import { NewSpotModal } from './components/post/NewSpotModal';
import { SpotDetailDrawer } from './components/drawer/SpotDetailDrawer';

export const App: React.FC = () => {
  // 1. ユーザー認証状態（未ログイン時は認証画面を強制表示）
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('smoke_user');
    return saved ? JSON.parse(saved) : null;
  });

  // 2. テーマ状態（ダーク/ライト）
  const [isDark, setIsDark] = useState<boolean>(() => {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  // 3. 現在地（GPS）
  const { location: userLocation, requestLocation } = useGeolocation();
  const userCoords = useMemo(
    () => ({ lat: userLocation.lat, lng: userLocation.lng }),
    [userLocation.lat, userLocation.lng]
  );

  // 4. 喫煙所データ & レビューデータ（localStorageで永続化＆同期）
  const [smokingAreas, setSmokingAreas] = useState<SmokingArea[]>(() => {
    const saved = localStorage.getItem('smoke_spots');
    return saved ? JSON.parse(saved) : initialSmokingAreas;
  });

  const [reviews, setReviews] = useState<Review[]>(() => {
    const saved = localStorage.getItem('smoke_reviews');
    return saved ? JSON.parse(saved) : initialReviews;
  });

  // 5. フィルター条件
  const [filter, setFilter] = useState<FilterCriteria>({
    cigar: 'all',
    place: 'all',
    fee: 'all',
  });

  // 6. 選択中のピン & モーダル状態
  const [selectedSpot, setSelectedSpot] = useState<SmokingArea | null>(null);
  const [newSpotCoords, setNewSpotCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [routingToSpot, setRoutingToSpot] = useState<SmokingArea | null>(null);
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);

  // 喫煙所のリアルタイム絞り込み
  const filteredSpots = useMemo(() => {
    return smokingAreas.filter((spot) => {
      // タバコ種類フィルター
      if (filter.cigar === 'paper' && spot.type_cigar === 'heated') return false;
      if (filter.cigar === 'heated' && spot.type_cigar === 'paper') return false;
      
      // 場所タイプフィルター
      if (filter.place !== 'all' && spot.type_place !== filter.place) return false;

      // 料金フィルター
      if (filter.fee !== 'all' && spot.type_fee !== filter.fee) return false;

      return true;
    });
  }, [smokingAreas, filter]);

  // 新規喫煙所の追加処理
  const handleAddNewSpot = (newAreaData: Omit<SmokingArea, 'id' | 'created_at'>) => {
    const newArea: SmokingArea = {
      ...newAreaData,
      id: 'spot-' + Date.now(),
      created_by: currentUser?.id,
      created_at: new Date().toISOString(),
    };

    const updated = [newArea, ...smokingAreas];
    setSmokingAreas(updated);
    localStorage.setItem('smoke_spots', JSON.stringify(updated));
    setNewSpotCoords(null);
    setSelectedSpot(newArea); // 投稿直後にそのピンを選択して開く
  };

  // レビュー追加処理
  const handleAddReview = (reviewData: Omit<Review, 'id' | 'created_at'>) => {
    const newReview: Review = {
      ...reviewData,
      id: 'rev-' + Date.now(),
      created_at: new Date().toISOString(),
    };

    const updated = [newReview, ...reviews];
    setReviews(updated);
    localStorage.setItem('smoke_reviews', JSON.stringify(updated));
  };

  // ログアウト
  const handleLogout = () => {
    localStorage.removeItem('smoke_user');
    setCurrentUser(null);
    setSelectedSpot(null);
    setRoutingToSpot(null);
  };

  // ルート案内開始/解除
  const handleToggleRoute = () => {
    if (routingToSpot?.id === selectedSpot?.id) {
      setRoutingToSpot(null);
      setRouteInfo(null);
    } else {
      setRoutingToSpot(selectedSpot);
    }
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* 未ログイン時は強制ログインモーダル */}
      {!currentUser && (
        <AuthModal onLoginSuccess={(user) => setCurrentUser(user)} />
      )}

      {/* ヘッダーバー */}
      <Header
        user={currentUser}
        onLogout={handleLogout}
        isDark={isDark}
        onToggleTheme={() => setIsDark(!isDark)}
      />

      {/* チップ型フィルター */}
      <FilterBar
        filter={filter}
        onFilterChange={setFilter}
        matchCount={filteredSpots.length}
      />

      {/* メインマップ */}
      <SmokingMap
        userLocation={userCoords}
        spots={filteredSpots}
        selectedSpot={selectedSpot}
        isDark={isDark}
        onSelectSpot={(spot) => {
          setSelectedSpot(spot);
          if (routingToSpot && routingToSpot.id !== spot.id) {
            setRoutingToSpot(null);
            setRouteInfo(null);
          }
        }}
        onRequestNewSpot={(coords) => setNewSpotCoords(coords)}
        onRecenter={requestLocation}
        routingToSpot={routingToSpot}
        onRouteCalculated={setRouteInfo}
      />

      {/* 新規喫煙所投稿モーダル */}
      {newSpotCoords && (
        <NewSpotModal
          lat={newSpotCoords.lat}
          lng={newSpotCoords.lng}
          onClose={() => setNewSpotCoords(null)}
          onSubmit={handleAddNewSpot}
        />
      )}

      {/* 選択中の喫煙所詳細ドロワー */}
      {selectedSpot && (
        <SpotDetailDrawer
          spot={selectedSpot}
          reviews={reviews.filter((r) => r.area_id === selectedSpot.id)}
          currentUser={currentUser}
          routeInfo={routeInfo}
          isRouting={routingToSpot?.id === selectedSpot.id}
          onClose={() => {
            setSelectedSpot(null);
            setRoutingToSpot(null);
            setRouteInfo(null);
          }}
          onNavigate={handleToggleRoute}
          onAddReview={handleAddReview}
        />
      )}
    </div>
  );
};

export default App;
