import React, { useState, useRef } from 'react';
import { X, Camera, MapPin, Flame, Wind, Home, Trees, Coins, DollarSign, Check, Plus } from 'lucide-react';
import type { CigarType, PlaceType, FeeType, SmokingArea } from '../../types/database';

interface NewSpotModalProps {
  lat: number;
  lng: number;
  onClose: () => void;
  onSubmit: (newArea: Omit<SmokingArea, 'id' | 'created_at'>) => void;
}

export const NewSpotModal: React.FC<NewSpotModalProps> = ({
  lat,
  lng,
  onClose,
  onSubmit,
}) => {
  const [name, setName] = useState('');
  const [cigarType, setCigarType] = useState<CigarType>('both');
  const [placeType, setPlaceType] = useState<PlaceType>('outdoor');
  const [feeType, setFeeType] = useState<FeeType>('free');
  const [description, setDescription] = useState('');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // 写真選択 / カメラ起動
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      lat,
      lng,
      name: name.trim() || '新規喫煙スポット',
      type_cigar: cigarType,
      type_place: placeType,
      type_fee: feeType,
      description: description.trim(),
      photo_url: photoPreview || undefined,
    });
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9000,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
      }}
    >
      <div
        className="animate-slide-up"
        style={{
          width: '100%',
          maxWidth: '520px',
          backgroundColor: 'var(--bg-surface)',
          borderTopLeftRadius: 'var(--radius-xl)',
          borderTopRightRadius: 'var(--radius-xl)',
          padding: '20px 20px calc(24px + var(--safe-area-bottom))',
          boxShadow: 'var(--shadow-float)',
          maxHeight: '88vh',
          overflowY: 'auto',
        }}
      >
        {/* ヘッダー */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'var(--accent-emerald)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
              }}
            >
              <Plus size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '17px', fontWeight: 800 }}>新規喫煙所を投稿</h3>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                タップだけでかんたん登録（文字入力は任意）
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="閉じる"
            style={{
              padding: '8px',
              borderRadius: '50%',
              backgroundColor: 'var(--bg-app)',
              color: 'var(--text-secondary)',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* 座標情報カード */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'var(--bg-app)',
            padding: '8px 12px',
            borderRadius: 'var(--radius-md)',
            marginBottom: '16px',
            fontSize: '12px',
            color: 'var(--text-secondary)',
          }}
        >
          <MapPin size={16} style={{ color: 'var(--accent-emerald)', flexShrink: 0 }} />
          <span>位置: 緯度 {lat.toFixed(5)}, 経度 {lng.toFixed(5)}</span>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          
          {/* 1. タバコの種類（ワンタップ選択） */}
          <div>
            <label style={{ fontSize: '13px', fontWeight: 700, marginBottom: '8px', display: 'block' }}>
              吸えるタバコの種類 <span style={{ color: 'var(--accent-emerald)' }}>*</span>
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setCigarType('both')}
                style={{
                  padding: '12px 6px',
                  borderRadius: 'var(--radius-md)',
                  border: cigarType === 'both' ? '2px solid var(--accent-emerald)' : '1px solid var(--border-medium)',
                  backgroundColor: cigarType === 'both' ? 'var(--accent-emerald-light)' : 'var(--bg-app)',
                  color: cigarType === 'both' ? 'var(--accent-emerald-dark)' : 'var(--text-primary)',
                  fontWeight: 700,
                  fontSize: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <div style={{ display: 'flex', gap: '2px' }}>
                  <Flame size={16} />
                  <Wind size={16} />
                </div>
                <span>両方OK</span>
              </button>

              <button
                type="button"
                onClick={() => setCigarType('paper')}
                style={{
                  padding: '12px 6px',
                  borderRadius: 'var(--radius-md)',
                  border: cigarType === 'paper' ? '2px solid var(--accent-emerald)' : '1px solid var(--border-medium)',
                  backgroundColor: cigarType === 'paper' ? 'var(--accent-emerald-light)' : 'var(--bg-app)',
                  color: cigarType === 'paper' ? 'var(--accent-emerald-dark)' : 'var(--text-primary)',
                  fontWeight: 700,
                  fontSize: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <Flame size={16} />
                <span>紙タバコ</span>
              </button>

              <button
                type="button"
                onClick={() => setCigarType('heated')}
                style={{
                  padding: '12px 6px',
                  borderRadius: 'var(--radius-md)',
                  border: cigarType === 'heated' ? '2px solid var(--accent-blue)' : '1px solid var(--border-medium)',
                  backgroundColor: cigarType === 'heated' ? 'var(--accent-blue-light)' : 'var(--bg-app)',
                  color: cigarType === 'heated' ? 'var(--accent-blue)' : 'var(--text-primary)',
                  fontWeight: 700,
                  fontSize: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <Wind size={16} />
                <span>加熱式専用</span>
              </button>
            </div>
          </div>

          {/* 2. 場所のタイプ（屋内 / 屋外） */}
          <div>
            <label style={{ fontSize: '13px', fontWeight: 700, marginBottom: '8px', display: 'block' }}>
              設置場所のタイプ <span style={{ color: 'var(--accent-emerald)' }}>*</span>
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setPlaceType('outdoor')}
                style={{
                  padding: '12px 10px',
                  borderRadius: 'var(--radius-md)',
                  border: placeType === 'outdoor' ? '2px solid #8b5cf6' : '1px solid var(--border-medium)',
                  backgroundColor: placeType === 'outdoor' ? 'rgba(139, 92, 246, 0.1)' : 'var(--bg-app)',
                  color: placeType === 'outdoor' ? '#8b5cf6' : 'var(--text-primary)',
                  fontWeight: 700,
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}
              >
                <Trees size={18} />
                <span>屋外（公園・路上等）</span>
              </button>

              <button
                type="button"
                onClick={() => setPlaceType('indoor')}
                style={{
                  padding: '12px 10px',
                  borderRadius: 'var(--radius-md)',
                  border: placeType === 'indoor' ? '2px solid var(--accent-amber)' : '1px solid var(--border-medium)',
                  backgroundColor: placeType === 'indoor' ? 'var(--accent-amber-light)' : 'var(--bg-app)',
                  color: placeType === 'indoor' ? 'var(--accent-amber)' : 'var(--text-primary)',
                  fontWeight: 700,
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}
              >
                <Home size={18} />
                <span>屋内（ビル内・地下等）</span>
              </button>
            </div>
          </div>

          {/* 3. 利用料金（無料 / 有料） */}
          <div>
            <label style={{ fontSize: '13px', fontWeight: 700, marginBottom: '8px', display: 'block' }}>
              利用料金 <span style={{ color: 'var(--accent-emerald)' }}>*</span>
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setFeeType('free')}
                style={{
                  padding: '12px 10px',
                  borderRadius: 'var(--radius-md)',
                  border: feeType === 'free' ? '2px solid #0284c7' : '1px solid var(--border-medium)',
                  backgroundColor: feeType === 'free' ? 'rgba(2, 132, 199, 0.1)' : 'var(--bg-app)',
                  color: feeType === 'free' ? '#0284c7' : 'var(--text-primary)',
                  fontWeight: 700,
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}
              >
                <Coins size={18} />
                <span>無料（公共・誰でも可）</span>
              </button>

              <button
                type="button"
                onClick={() => setFeeType('paid')}
                style={{
                  padding: '12px 10px',
                  borderRadius: 'var(--radius-md)',
                  border: feeType === 'paid' ? '2px solid #f97316' : '1px solid var(--border-medium)',
                  backgroundColor: feeType === 'paid' ? 'rgba(249, 115, 22, 0.1)' : 'var(--bg-app)',
                  color: feeType === 'paid' ? '#f97316' : 'var(--text-primary)',
                  fontWeight: 700,
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}
              >
                <DollarSign size={18} />
                <span>有料（カフェ・要注文等）</span>
              </button>
            </div>
          </div>

          {/* 4. 写真の追加（任意・カメラ/ギャラリー） */}
          <div>
            <label style={{ fontSize: '13px', fontWeight: 700, marginBottom: '8px', display: 'block' }}>
              現場の写真（任意）
            </label>
            <input
              type="file"
              accept="image/*"
              capture="environment"
              ref={fileInputRef}
              onChange={handlePhotoSelect}
              style={{ display: 'none' }}
            />

            {photoPreview ? (
              <div style={{ position: 'relative', width: '100%', height: '140px', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                <img
                  src={photoPreview}
                  alt="プレビュー"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <button
                  type="button"
                  onClick={() => setPhotoPreview(null)}
                  style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    backgroundColor: 'rgba(0, 0, 0, 0.6)',
                    color: '#fff',
                    padding: '6px',
                    borderRadius: '50%',
                  }}
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                style={{
                  width: '100%',
                  padding: '16px',
                  borderRadius: 'var(--radius-md)',
                  border: '2px dashed var(--border-medium)',
                  backgroundColor: 'var(--bg-app)',
                  color: 'var(--text-secondary)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '12px',
                  fontWeight: 600,
                }}
              >
                <Camera size={24} style={{ color: 'var(--accent-emerald)' }} />
                <span>写真を撮影 / ライブラリから選択</span>
              </button>
            )}
          </div>

          {/* 5. スポット名＆メモ（任意入力） */}
          <div>
            <label style={{ fontSize: '13px', fontWeight: 700, marginBottom: '6px', display: 'block' }}>
              スポット名・場所の目安（任意）
            </label>
            <input
              type="text"
              placeholder="例: ○○駅 東口前 灰皿"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-medium)',
                backgroundColor: 'var(--bg-app)',
                color: 'var(--text-primary)',
                fontSize: '13px',
                outline: 'none',
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: '13px', fontWeight: 700, marginBottom: '6px', display: 'block' }}>
              補足メモ（任意）
            </label>
            <textarea
              rows={2}
              placeholder="例: 灰皿は3台。屋根があるので小雨でも大丈夫。"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-medium)',
                backgroundColor: 'var(--bg-app)',
                color: 'var(--text-primary)',
                fontSize: '13px',
                outline: 'none',
                resize: 'none',
              }}
            />
          </div>

          {/* 送信ボタン */}
          <button
            type="submit"
            style={{
              padding: '14px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--accent-emerald)',
              color: '#ffffff',
              fontSize: '15px',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: 'var(--shadow-md)',
            }}
          >
            <Check size={18} />
            この内容でピンを追加する
          </button>
        </form>
      </div>
    </div>
  );
};
