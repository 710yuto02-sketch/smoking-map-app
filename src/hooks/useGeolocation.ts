import { useState, useEffect } from 'react';

export interface LocationState {
  lat: number;
  lng: number;
  accuracy?: number;
  loading: boolean;
  error: string | null;
}

// デフォルト座標（東京駅丸の内口）
const DEFAULT_CENTER = {
  lat: 35.681236,
  lng: 139.767125,
};

export const useGeolocation = () => {
  const [location, setLocation] = useState<LocationState>({
    lat: DEFAULT_CENTER.lat,
    lng: DEFAULT_CENTER.lng,
    loading: true,
    error: null,
  });

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setLocation((prev) => ({
        ...prev,
        loading: false,
        error: 'お使いのブラウザは位置情報に対応していません。',
      }));
      return;
    }

    setLocation((prev) => ({ ...prev, loading: true, error: null }));

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          loading: false,
          error: null,
        });
      },
      (err) => {
        console.warn('Geolocation error:', err.message);
        setLocation((prev) => ({
          ...prev,
          loading: false,
          error: '現在地を取得できませんでした。デフォルト位置を表示します。',
        }));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  useEffect(() => {
    requestLocation();
  }, []);

  return { location, requestLocation };
};
