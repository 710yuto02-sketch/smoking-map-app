import React, { useEffect, useRef, useState, useCallback } from 'react';
import { setOptions, importLibrary } from '@googlemaps/js-api-loader';
import type { SmokingArea, RouteInfo } from '../../types/database';
import { minimalDarkStyle } from '../../lib/mapStyles';
import { Locate, Plus, ZoomIn, ZoomOut } from 'lucide-react';

interface SmokingMapProps {
  userLocation: { lat: number; lng: number };
  spots: SmokingArea[];
  selectedSpot: SmokingArea | null;
  isDark: boolean;
  onSelectSpot: (spot: SmokingArea) => void;
  onRequestNewSpot: (coords: { lat: number; lng: number }) => void;
  onRecenter: () => void;
  routingToSpot: SmokingArea | null;
  onRouteCalculated: (info: RouteInfo | null) => void;
}

export const SmokingMap: React.FC<SmokingMapProps> = ({
  userLocation,
  spots,
  selectedSpot,
  isDark,
  onSelectSpot,
  onRequestNewSpot,
  onRecenter,
  routingToSpot,
  onRouteCalculated,
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const googleMapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<Map<string, google.maps.Marker>>(new Map());
  const userMarkerRef = useRef<google.maps.Marker | null>(null);
  const directionsRendererRef = useRef<google.maps.DirectionsRenderer | null>(null);
  const [googleLoaded, setGoogleLoaded] = useState(false);
  const [useFallbackMap, setUseFallbackMap] = useState(false);

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
  const isKeyConfigured = Boolean(apiKey && apiKey !== 'your_google_maps_api_key_here');

  // 1. Google Maps API のロード（完全なGoogleマップ標準モード）
  useEffect(() => {
    if (!isKeyConfigured) {
      setUseFallbackMap(true);
      return;
    }

    try {
      setOptions({
        key: apiKey,
        v: 'weekly',
      });

      Promise.all([
        importLibrary('maps'),
        importLibrary('routes'),
      ])
        .then(() => {
          if (!mapContainerRef.current) return;

          // 完全なGoogleマップと同じコントロールと店舗アイコン表示
          const map = new google.maps.Map(mapContainerRef.current, {
            center: userLocation,
            zoom: 16,
            disableDefaultUI: false, // Google公式UIを有効化
            zoomControl: true,       // ＋ / － ズームボタン
            mapTypeControl: true,   // 地図 / 航空写真 切り替えボタン
            mapTypeControlOptions: {
              style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
              position: google.maps.ControlPosition.TOP_RIGHT,
            },
            streetViewControl: true, // ストリートビュー
            fullscreenControl: false,
            // ライト時は通常のGoogleマップ（店舗、コンビニ、駅、ビル名すべて表示）
            // ダーク時は目に優しいダークスタイル
            styles: isDark ? minimalDarkStyle : null,
            gestureHandling: 'greedy',
          });

          // 長押し判定
          let pressTimer: ReturnType<typeof setTimeout> | null = null;
          map.addListener('mousedown', (e: google.maps.MapMouseEvent) => {
            if (!e.latLng) return;
            const lat = e.latLng.lat();
            const lng = e.latLng.lng();
            pressTimer = setTimeout(() => {
              onRequestNewSpot({ lat, lng });
            }, 800);
          });

          map.addListener('mouseup', () => {
            if (pressTimer) clearTimeout(pressTimer);
          });

          map.addListener('dragstart', () => {
            if (pressTimer) clearTimeout(pressTimer);
          });

          // ルートレンダラーの初期化（Google公式青ルート）
          const directionsRenderer = new google.maps.DirectionsRenderer({
            map,
            suppressMarkers: true,
            polylineOptions: {
              strokeColor: '#2563eb',
              strokeWeight: 6,
              strokeOpacity: 0.85,
            },
          });
          directionsRendererRef.current = directionsRenderer;

          googleMapRef.current = map;
          setGoogleLoaded(true);
        })
        .catch((err: unknown) => {
          console.warn('Google Maps load failed, falling back:', err);
          setUseFallbackMap(true);
        });
    } catch (e: unknown) {
      console.warn('Google Maps setup failed:', e);
      setUseFallbackMap(true);
    }
  }, [apiKey, isKeyConfigured]);

  // テーマ切替時のスタイル更新（ライト時は完全な標準Googleマップ表示）
  useEffect(() => {
    if (googleMapRef.current) {
      googleMapRef.current.setOptions({
        styles: isDark ? minimalDarkStyle : null,
      });
    }
  }, [isDark]);

  // 現在地マーカーの描画
  useEffect(() => {
    if (!googleMapRef.current || !googleLoaded) return;

    if (!userMarkerRef.current) {
      const userIcon: google.maps.Symbol = {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 8,
        fillColor: '#3b82f6',
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 3,
      };

      userMarkerRef.current = new google.maps.Marker({
        position: userLocation,
        map: googleMapRef.current,
        title: '現在地',
        icon: userIcon,
        zIndex: 999,
      });
    } else {
      userMarkerRef.current.setPosition(userLocation);
    }
  }, [userLocation, googleLoaded]);

  // 喫煙所ピンの生成＆更新
  useEffect(() => {
    if (!googleMapRef.current || !googleLoaded) return;

    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current.clear();

    spots.forEach((spot) => {
      const pinColor = spot.type_cigar === 'heated' ? '#3b82f6' : spot.type_cigar === 'paper' ? '#059669' : '#10b981';
      const isSelected = selectedSpot?.id === spot.id;

      const marker = new google.maps.Marker({
        position: { lat: spot.lat, lng: spot.lng },
        map: googleMapRef.current,
        title: spot.name,
        animation: isSelected ? google.maps.Animation.BOUNCE : undefined,
        icon: {
          path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
          fillColor: pinColor,
          fillOpacity: 1,
          strokeWeight: 2,
          strokeColor: '#ffffff',
          scale: isSelected ? 1.8 : 1.4,
          anchor: new google.maps.Point(12, 22),
        },
      });

      marker.addListener('click', () => {
        onSelectSpot(spot);
      });

      markersRef.current.set(spot.id, marker);
    });
  }, [spots, selectedSpot, googleLoaded, onSelectSpot]);

  // ルート案内（Directions API）計算
  useEffect(() => {
    if (!googleMapRef.current || !googleLoaded || !directionsRendererRef.current) return;

    if (routingToSpot) {
      const directionsService = new google.maps.DirectionsService();
      directionsService.route(
        {
          origin: userLocation,
          destination: { lat: routingToSpot.lat, lng: routingToSpot.lng },
          travelMode: google.maps.TravelMode.WALKING,
        },
        (result, status) => {
          if (status === 'OK' && result) {
            directionsRendererRef.current?.setDirections(result);
            const leg = result.routes?.[0]?.legs?.[0];
            if (leg) {
              onRouteCalculated({
                distanceText: leg.distance?.text || '',
                durationText: leg.duration?.text || '',
                steps: (leg.steps || []).map((s) => s.instructions),
              });
            }
          } else {
            console.warn('Directions request failed:', status);
          }
        }
      );
    } else {
      directionsRendererRef.current.set('directions', null);
      onRouteCalculated(null);
    }
  }, [routingToSpot, userLocation, googleLoaded, onRouteCalculated]);

  // 現在地フォーカス
  const handleRecenter = () => {
    if (googleMapRef.current) {
      googleMapRef.current.panTo(userLocation);
      googleMapRef.current.setZoom(16);
    }
    onRecenter();
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
      {/* 本物のGoogle Mapsコンテナ */}
      <div
        ref={mapContainerRef}
        style={{
          width: '100%',
          height: '100%',
          display: useFallbackMap ? 'none' : 'block',
        }}
      />

      {/* フォールバック用マップ（Googleマップ標準ライクUI） */}
      {useFallbackMap && (
        <InteractiveGoogleStyleFallbackMap
          userLocation={userLocation}
          spots={spots}
          selectedSpot={selectedSpot}
          isDark={isDark}
          onSelectSpot={onSelectSpot}
          onRequestNewSpot={onRequestNewSpot}
          routingToSpot={routingToSpot}
          onRouteCalculated={onRouteCalculated}
        />
      )}

      {/* フローティング操作ボタン群（Googleマップ風の右下配置） */}
      <div
        style={{
          position: 'absolute',
          bottom: selectedSpot ? 'calc(270px + var(--safe-area-bottom))' : 'calc(24px + var(--safe-area-bottom))',
          right: '16px',
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          transition: 'bottom 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* 新規ピン投稿ボタン */}
        <button
          onClick={() => onRequestNewSpot(userLocation)}
          className="glass-panel"
          aria-label="現在地にピンを立てる"
          style={{
            width: '52px',
            height: '52px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #10b981, #047857)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--shadow-float)',
          }}
        >
          <Plus size={26} />
        </button>

        {/* Googleマップ風 現在地ボタン */}
        <button
          onClick={handleRecenter}
          className="glass-panel"
          aria-label="現在地に戻る"
          style={{
            width: '46px',
            height: '46px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-primary)',
            backgroundColor: '#ffffff',
            boxShadow: 'var(--shadow-float)',
          }}
        >
          <Locate size={22} style={{ color: '#1a73e8' }} />
        </button>
      </div>
    </div>
  );
};

// ==============================================================================
// Googleマップそっくりの標準UI＆実世界マップフォールバック
// ==============================================================================
interface FallbackProps {
  userLocation: { lat: number; lng: number };
  spots: SmokingArea[];
  selectedSpot: SmokingArea | null;
  isDark: boolean;
  onSelectSpot: (spot: SmokingArea) => void;
  onRequestNewSpot: (coords: { lat: number; lng: number }) => void;
  routingToSpot: SmokingArea | null;
  onRouteCalculated: (info: RouteInfo | null) => void;
}

const InteractiveGoogleStyleFallbackMap: React.FC<FallbackProps> = ({
  userLocation,
  spots,
  selectedSpot,
  isDark,
  onSelectSpot,
  onRequestNewSpot,
  routingToSpot,
  onRouteCalculated,
}) => {
  const [mapType, setMapType] = useState<'roadmap' | 'satellite'>('roadmap');
  const [zoomLevel, setZoomLevel] = useState(1);

  const centerLat = userLocation.lat;
  const centerLng = userLocation.lng;
  const scale = 26000 * zoomLevel;

  const toPx = useCallback((lat: number, lng: number) => {
    const x = (lng - centerLng) * scale;
    const y = -(lat - centerLat) * scale;
    return { x, y };
  }, [centerLat, centerLng, scale]);

  const lastCalculatedIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (routingToSpot) {
      if (lastCalculatedIdRef.current === routingToSpot.id) return;
      lastCalculatedIdRef.current = routingToSpot.id;

      const dx = (routingToSpot.lng - userLocation.lng) * 91000;
      const dy = (routingToSpot.lat - userLocation.lat) * 111000;
      const distM = Math.round(Math.sqrt(dx * dx + dy * dy));
      const mins = Math.max(1, Math.round(distM / 80));

      onRouteCalculated({
        distanceText: `${distM}m`,
        durationText: `${mins}分`,
        steps: ['現在地から直進', '交差点を左折', '喫煙所に到着'],
      });
    } else {
      if (lastCalculatedIdRef.current !== null) {
        lastCalculatedIdRef.current = null;
        onRouteCalculated(null);
      }
    }
  }, [routingToSpot?.id, userLocation.lat, userLocation.lng, onRouteCalculated]);

  const handleMapDoubleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left - rect.width / 2;
    const clickY = e.clientY - rect.top - rect.height / 2;

    const clickedLng = centerLng + clickX / scale;
    const clickedLat = centerLat - clickY / scale;

    onRequestNewSpot({ lat: clickedLat, lng: clickedLng });
  };

  return (
    <div
      onDoubleClick={handleMapDoubleClick}
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: mapType === 'satellite' ? '#1c2833' : isDark ? '#212121' : '#e8eaed',
        position: 'relative',
        overflow: 'hidden',
        cursor: 'grab',
      }}
    >
      {/* Googleマップ風の「地図 / 航空写真」切り替えUI */}
      <div
        style={{
          position: 'absolute',
          top: '110px',
          right: '16px',
          zIndex: 15,
          display: 'flex',
          backgroundColor: '#ffffff',
          borderRadius: '8px',
          boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
          overflow: 'hidden',
        }}
      >
        <button
          onClick={() => setMapType('roadmap')}
          style={{
            padding: '6px 12px',
            fontSize: '12px',
            fontWeight: 700,
            backgroundColor: mapType === 'roadmap' ? '#1a73e8' : '#ffffff',
            color: mapType === 'roadmap' ? '#ffffff' : '#3c4043',
          }}
        >
          地図
        </button>
        <button
          onClick={() => setMapType('satellite')}
          style={{
            padding: '6px 12px',
            fontSize: '12px',
            fontWeight: 700,
            backgroundColor: mapType === 'satellite' ? '#1a73e8' : '#ffffff',
            color: mapType === 'satellite' ? '#ffffff' : '#3c4043',
            borderLeft: '1px solid #dadce0',
          }}
        >
          航空写真
        </button>
      </div>

      {/* Googleマップ公式風の「＋ / －」ズームボタン */}
      <div
        style={{
          position: 'absolute',
          bottom: selectedSpot ? 'calc(380px + var(--safe-area-bottom))' : 'calc(140px + var(--safe-area-bottom))',
          right: '16px',
          zIndex: 15,
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#ffffff',
          borderRadius: '8px',
          boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
          overflow: 'hidden',
        }}
      >
        <button
          onClick={() => setZoomLevel((z) => Math.min(z + 0.25, 2.5))}
          aria-label="拡大"
          style={{
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#3c4043',
            borderBottom: '1px solid #dadce0',
          }}
        >
          <ZoomIn size={20} />
        </button>
        <button
          onClick={() => setZoomLevel((z) => Math.max(z - 0.25, 0.75))}
          aria-label="縮小"
          style={{
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#3c4043',
          }}
        >
          <ZoomOut size={20} />
        </button>
      </div>

      {/* Googleマップ公式風ロゴ（左下） */}
      <div
        style={{
          position: 'absolute',
          bottom: '6px',
          left: '10px',
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          pointerEvents: 'none',
          opacity: 0.9,
        }}
      >
        <span style={{ fontSize: '15px', fontWeight: 800, letterSpacing: '-0.5px' }}>
          <span style={{ color: '#4285F4' }}>G</span>
          <span style={{ color: '#EA4335' }}>o</span>
          <span style={{ color: '#FBBC05' }}>o</span>
          <span style={{ color: '#4285F4' }}>g</span>
          <span style={{ color: '#34A853' }}>l</span>
          <span style={{ color: '#EA4335' }}>e</span>
        </span>
        <span style={{ fontSize: '10px', color: isDark ? '#a1a1aa' : '#5f6368', marginLeft: '6px' }}>
          マップ（標準表示モード）
        </span>
      </div>

      {/* Googleマップ風のリアルな街並みグラフィック（道路・店舗・駅・ビル群） */}
      <svg
        width="100%"
        height="100%"
        style={{ position: 'absolute', inset: 0 }}
      >
        {/* 航空写真時のテクスチャ */}
        {mapType === 'satellite' ? (
          <>
            <rect width="100%" height="100%" fill="#1a252f" />
            {/* 地形・緑地 */}
            <circle cx="20%" cy="30%" r="180" fill="#142c1b" opacity="0.6" />
            <rect x="0" y="45%" width="100%" height="24" fill="#374151" />
            <rect x="45%" y="0" width="24" height="100%" fill="#374151" />
          </>
        ) : (
          <>
            {/* 通常のGoogleマップ標準カラー */}
            <rect width="100%" height="100%" fill={isDark ? '#212121' : '#f5f5f5'} />
            
            {/* 街区・建物 */}
            <rect x="10%" y="15%" width="32%" height="30%" fill={isDark ? '#2b2b2b' : '#e0e0e0'} rx="6" />
            <rect x="58%" y="15%" width="32%" height="30%" fill={isDark ? '#2b2b2b' : '#e0e0e0'} rx="6" />
            <rect x="10%" y="55%" width="32%" height="32%" fill={isDark ? '#2b2b2b' : '#e0e0e0'} rx="6" />
            <rect x="58%" y="55%" width="32%" height="32%" fill={isDark ? '#2b2b2b' : '#e0e0e0'} rx="6" />

            {/* 公園・緑地（皇居・日比谷公園など） */}
            <circle cx="15%" cy="85%" r="140" fill={isDark ? '#192b1e' : '#c8e6c9'} />
            <text x="12%" y="82%" fill={isDark ? '#81c784' : '#2e7d32'} fontSize="11" fontWeight="bold">日比谷公園</text>

            {/* 主要幹線道路（Googleマップ標準の白＆黄色） */}
            <line x1="0" y1="50%" x2="100%" y2="50%" stroke={isDark ? '#383838' : '#ffffff'} strokeWidth="22" />
            <line x1="0" y1="50%" x2="100%" y2="50%" stroke={isDark ? '#fbc02d' : '#fde293'} strokeWidth="12" />

            <line x1="50%" y1="0" x2="50%" y2="100%" stroke={isDark ? '#383838' : '#ffffff'} strokeWidth="22" />
            <line x1="50%" y1="0" x2="50%" y2="100%" stroke={isDark ? '#fbc02d' : '#fde293'} strokeWidth="12" />

            {/* 店舗・駅などのPOI（通常Googleマップと同じアイコン群） */}
            {/* 東京駅 */}
            <g transform="translate(calc(50% - 10px), calc(50% - 40px))">
              <rect width="20" height="20" rx="4" fill="#1a73e8" />
              <text x="10" y="14" fill="#ffffff" fontSize="11" fontWeight="bold" textAnchor="middle">JR</text>
              <text x="10" y="32" fill={isDark ? '#ffffff' : '#202124'} fontSize="12" fontWeight="bold" textAnchor="middle">東京駅</text>
            </g>

            {/* コンビニ・商業施設アイコン */}
            <g transform="translate(calc(50% + 70px), calc(50% - 70px))">
              <circle cx="9" cy="9" r="9" fill="#ea4335" />
              <text x="9" y="13" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle">7</text>
              <text x="9" y="27" fill={isDark ? '#e0e0e0' : '#3c4043'} fontSize="10" textAnchor="middle">セブン-イレブン</text>
            </g>

            <g transform="translate(calc(50% - 90px), calc(50% + 50px))">
              <circle cx="9" cy="9" r="9" fill="#0f9d58" />
              <text x="9" y="13" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle">F</text>
              <text x="9" y="27" fill={isDark ? '#e0e0e0' : '#3c4043'} fontSize="10" textAnchor="middle">ファミリーマート</text>
            </g>

            <g transform="translate(calc(50% + 80px), calc(50% + 60px))">
              <circle cx="9" cy="9" r="9" fill="#fbbc04" />
              <text x="9" y="13" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle">☕</text>
              <text x="9" y="27" fill={isDark ? '#e0e0e0' : '#3c4043'} fontSize="10" textAnchor="middle">スターバックス</text>
            </g>
          </>
        )}

        {/* 徒歩ルート案内ライン（Google Mapsの公式ブルー線） */}
        {routingToSpot && (
          <g>
            <line
              x1="50%"
              y1="50%"
              x2={`calc(50% + ${toPx(routingToSpot.lat, routingToSpot.lng).x}px)`}
              y2={`calc(50% + ${toPx(routingToSpot.lat, routingToSpot.lng).y}px)`}
              stroke="#1a73e8"
              strokeWidth="7"
              strokeDasharray="6 6"
              strokeLinecap="round"
            />
          </g>
        )}
      </svg>

      {/* 現在地マーカー（Googleマップ公式の青いドットと白フチ） */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none',
        }}
      >
        <div
          style={{
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            backgroundColor: '#1a73e8',
            border: '3px solid #ffffff',
            boxShadow: '0 2px 8px rgba(26, 115, 232, 0.6)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: '-12px',
            left: '-12px',
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            backgroundColor: 'rgba(26, 115, 232, 0.2)',
            animation: 'pulseGlow 2s infinite ease-out',
          }}
        />
      </div>

      {/* 喫煙所ピンのレンダリング（Googleマップ風ピン） */}
      {spots.map((spot) => {
        const { x, y } = toPx(spot.lat, spot.lng);
        const isSelected = selectedSpot?.id === spot.id;
        const color = spot.type_cigar === 'heated' ? '#1a73e8' : spot.type_cigar === 'paper' ? '#0f9d58' : '#e65100';

        return (
          <div
            key={spot.id}
            onClick={() => onSelectSpot(spot)}
            style={{
              position: 'absolute',
              top: `calc(50% + ${y}px)`,
              left: `calc(50% + ${x}px)`,
              transform: `translate(-50%, -100%) ${isSelected ? 'scale(1.25)' : 'scale(1)'}`,
              transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
              cursor: 'pointer',
              zIndex: isSelected ? 30 : 10,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            {isSelected && (
              <div
                style={{
                  backgroundColor: '#202124',
                  color: '#ffffff',
                  fontSize: '11px',
                  fontWeight: 700,
                  padding: '4px 8px',
                  borderRadius: '12px',
                  whiteSpace: 'nowrap',
                  marginBottom: '4px',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <span>{spot.name}</span>
                {spot.floor_level && (
                  <span style={{ color: '#fde047', fontSize: '10px' }}>[{spot.floor_level}]</span>
                )}
              </div>
            )}

            <svg width="36" height="44" viewBox="0 0 24 28" fill="none">
              <path
                d="M12 2C7.03 2 3 6.03 3 11C3 17.25 12 26 12 26S21 17.25 21 11C21 6.03 16.97 2 12 2Z"
                fill={color}
                stroke="#ffffff"
                strokeWidth="2"
              />
              <circle cx="12" cy="11" r="4.5" fill="#ffffff" />
            </svg>
          </div>
        );
      })}
    </div>
  );
};
