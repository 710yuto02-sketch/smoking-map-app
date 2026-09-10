import React, { useState } from 'react';
import type { SmokingArea, Review, UserProfile, RouteInfo } from '../../types/database';
import { 
  X, Navigation, Flame, Wind, Home, Trees, Coins, DollarSign, 
  Star, MessageSquare, Camera, User, CornerUpRight, ExternalLink 
} from 'lucide-react';

interface SpotDetailDrawerProps {
  spot: SmokingArea;
  reviews: Review[];
  currentUser: UserProfile | null;
  routeInfo: RouteInfo | null;
  isRouting: boolean;
  onClose: () => void;
  onNavigate: () => void;
  onAddReview: (review: Omit<Review, 'id' | 'created_at'>) => void;
}

export const SpotDetailDrawer: React.FC<SpotDetailDrawerProps> = ({
  spot,
  reviews,
  currentUser,
  routeInfo,
  isRouting,
  onClose,
  onNavigate,
  onAddReview,
}) => {
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewPhoto, setReviewPhoto] = useState<string | null>(null);

  // 平均評価の計算
  const avgRating = reviews.length > 0
    ? (reviews.reduce((acc, cur) => acc + cur.rating, 0) / reviews.length).toFixed(1)
    : null;

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setReviewPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    onAddReview({
      area_id: spot.id,
      user_id: currentUser.id,
      user_name: currentUser.display_name,
      rating,
      comment: comment.trim() || undefined,
      photo_url: reviewPhoto || undefined,
    });

    setComment('');
    setReviewPhoto(null);
    setShowReviewForm(false);
  };

  return (
    <div
      className="animate-slide-up glass-panel"
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 25,
        maxHeight: '75vh',
        overflowY: 'auto',
        borderTopLeftRadius: 'var(--radius-xl)',
        borderTopRightRadius: 'var(--radius-xl)',
        boxShadow: 'var(--shadow-float)',
        padding: '16px 20px calc(24px + var(--safe-area-bottom))',
        backgroundColor: 'var(--bg-surface)',
      }}
    >
      {/* ドラッグハンドルバー */}
      <div
        style={{
          width: '36px',
          height: '4px',
          borderRadius: '2px',
          backgroundColor: 'var(--border-medium)',
          margin: '0 auto 12px',
        }}
      />

      {/* トップ行：タイトルと閉じるボタン */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 800, lineHeight: 1.3 }}>
            {spot.name || '喫煙スポット'}
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
            {avgRating ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '3px', color: 'var(--accent-amber)' }}>
                <Star size={14} fill="currentColor" />
                <span style={{ fontSize: '13px', fontWeight: 700 }}>{avgRating}</span>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>({reviews.length}件)</span>
              </div>
            ) : (
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>まだレビューはありません</span>
            )}
            {spot.distance_m && (
              <span style={{ fontSize: '12px', color: 'var(--accent-emerald)', fontWeight: 600 }}>
                • 現在地から約{spot.distance_m}m
              </span>
            )}
          </div>
        </div>

        <button
          onClick={onClose}
          aria-label="閉じる"
          style={{
            padding: '6px',
            borderRadius: '50%',
            backgroundColor: 'var(--bg-app)',
            color: 'var(--text-secondary)',
          }}
        >
          <X size={18} />
        </button>
      </div>

      {/* バッジ属性一覧（紙/加熱、屋内/屋外、料金） */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', margin: '14px 0' }}>
        {/* タバコ種類 */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            padding: '5px 10px',
            borderRadius: 'var(--radius-pill)',
            fontSize: '12px',
            fontWeight: 700,
            backgroundColor: spot.type_cigar === 'heated' ? 'var(--accent-blue-light)' : 'var(--accent-emerald-light)',
            color: spot.type_cigar === 'heated' ? 'var(--accent-blue)' : 'var(--accent-emerald-dark)',
          }}
        >
          {spot.type_cigar === 'paper' && <Flame size={14} />}
          {spot.type_cigar === 'heated' && <Wind size={14} />}
          {spot.type_cigar === 'both' && (
            <>
              <Flame size={14} />
              <Wind size={14} />
            </>
          )}
          <span>
            {spot.type_cigar === 'paper' ? '紙タバコ専用' : spot.type_cigar === 'heated' ? '加熱式専用' : '紙・加熱式 両方可'}
          </span>
        </div>

        {/* 場所タイプ */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            padding: '5px 10px',
            borderRadius: 'var(--radius-pill)',
            fontSize: '12px',
            fontWeight: 700,
            backgroundColor: spot.type_place === 'indoor' ? 'var(--accent-amber-light)' : 'rgba(139, 92, 246, 0.1)',
            color: spot.type_place === 'indoor' ? 'var(--accent-amber)' : '#8b5cf6',
          }}
        >
          {spot.type_place === 'indoor' ? <Home size={14} /> : <Trees size={14} />}
          <span>{spot.type_place === 'indoor' ? '屋内（換気設備有）' : '屋外（開放スペース）'}</span>
        </div>

        {/* 利用料金 */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            padding: '5px 10px',
            borderRadius: 'var(--radius-pill)',
            fontSize: '12px',
            fontWeight: 700,
            backgroundColor: spot.type_fee === 'free' ? 'rgba(2, 132, 199, 0.1)' : 'rgba(249, 115, 22, 0.1)',
            color: spot.type_fee === 'free' ? '#0284c7' : '#f97316',
          }}
        >
          {spot.type_fee === 'free' ? <Coins size={14} /> : <DollarSign size={14} />}
          <span>{spot.type_fee === 'free' ? '無料' : '有料（カフェ・要注文）'}</span>
        </div>
      </div>

      {/* 写真がある場合の表示 */}
      {spot.photo_url && (
        <div
          style={{
            width: '100%',
            height: '160px',
            borderRadius: 'var(--radius-md)',
            overflow: 'hidden',
            marginBottom: '14px',
          }}
        >
          <img
            src={spot.photo_url}
            alt={spot.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
      )}

      {/* 補足説明 */}
      {spot.description && (
        <p
          style={{
            fontSize: '13px',
            color: 'var(--text-secondary)',
            backgroundColor: 'var(--bg-app)',
            padding: '10px 14px',
            borderRadius: 'var(--radius-md)',
            marginBottom: '16px',
            lineHeight: 1.5,
          }}
        >
          {spot.description}
        </p>
      )}

      {/* ルート案内カード & アクションボタン */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
        <button
          onClick={onNavigate}
          style={{
            width: '100%',
            padding: '14px',
            borderRadius: 'var(--radius-md)',
            background: isRouting ? '#1a73e8' : 'linear-gradient(135deg, #10b981, #059669)',
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
          <Navigation size={18} />
          <span>{isRouting ? '徒歩ルート案内中（アプリ内表示）' : 'ここへ行く（徒歩ルート案内）'}</span>
        </button>

        {/* 公式Googleマップアプリ起動ボタン */}
        <a
          href={`https://www.google.com/maps/dir/?api=1&destination=${spot.lat},${spot.lng}&travelmode=walking`}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            width: '100%',
            padding: '11px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--bg-app)',
            border: '1px solid var(--border-medium)',
            color: 'var(--text-primary)',
            fontSize: '13px',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            textDecoration: 'none',
          }}
        >
          <ExternalLink size={16} style={{ color: '#1a73e8' }} />
          <span>Googleマップ公式アプリで開く（音声ナビ）</span>
        </a>

        {/* ルート所要時間・距離情報 */}
        {routeInfo && (
          <div
            className="glass-panel"
            style={{
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '13px',
              border: '1px solid #1a73e8',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#1a73e8', fontWeight: 700 }}>
              <CornerUpRight size={16} />
              <span>徒歩 {routeInfo.durationText}</span>
              <span style={{ color: 'var(--text-muted)' }}>({routeInfo.distanceText})</span>
            </div>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Google Directions</span>
          </div>
        )}
      </div>

      {/* レビューセクション */}
      <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <MessageSquare size={16} style={{ color: 'var(--text-secondary)' }} />
            <h3 style={{ fontSize: '14px', fontWeight: 800 }}>口コミ・写真 ({reviews.length})</h3>
          </div>
          {!showReviewForm && (
            <button
              onClick={() => setShowReviewForm(true)}
              style={{
                fontSize: '12px',
                fontWeight: 700,
                color: 'var(--accent-emerald)',
                padding: '4px 10px',
                borderRadius: 'var(--radius-pill)',
                backgroundColor: 'var(--accent-emerald-light)',
              }}
            >
              ＋ レビューを書く
            </button>
          )}
        </div>

        {/* レビュー投稿フォーム */}
        {showReviewForm && (
          <form
            onSubmit={handleReviewSubmit}
            className="glass-panel"
            style={{
              padding: '14px',
              borderRadius: 'var(--radius-md)',
              marginBottom: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '12px', fontWeight: 700 }}>星評価を選ぶ</span>
              <div style={{ display: 'flex', gap: '4px' }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    style={{
                      color: star <= rating ? 'var(--accent-amber)' : 'var(--border-medium)',
                      padding: '2px',
                    }}
                  >
                    <Star size={20} fill={star <= rating ? 'currentColor' : 'none'} />
                  </button>
                ))}
              </div>
            </div>

            <textarea
              rows={2}
              placeholder="灰皿の綺麗さや混雑具合などを教えてください"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 10px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-medium)',
                backgroundColor: 'var(--bg-app)',
                color: 'var(--text-primary)',
                fontSize: '12px',
                resize: 'none',
                outline: 'none',
              }}
            />

            {/* 写真添付 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  padding: '6px 10px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--bg-app)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <Camera size={14} />
                <span>写真添付</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoSelect}
                  style={{ display: 'none' }}
                />
              </label>
              {reviewPhoto && (
                <span style={{ fontSize: '11px', color: 'var(--accent-emerald)' }}>
                  ✓ 写真選択済み
                </span>
              )}
            </div>

            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setShowReviewForm(false)}
                style={{
                  padding: '6px 12px',
                  fontSize: '12px',
                  color: 'var(--text-secondary)',
                }}
              >
                キャンセル
              </button>
              <button
                type="submit"
                style={{
                  padding: '6px 16px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--accent-emerald)',
                  color: '#fff',
                  fontSize: '12px',
                  fontWeight: 700,
                }}
              >
                投稿する
              </button>
            </div>
          </form>
        )}

        {/* 口コミリスト */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {reviews.length === 0 ? (
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center', padding: '16px 0' }}>
              最初のレビューを投稿してみましょう！
            </p>
          ) : (
            reviews.map((rev) => (
              <div
                key={rev.id}
                style={{
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-app)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div
                      style={{
                        width: '22px',
                        height: '22px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--border-medium)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '10px',
                      }}
                    >
                      <User size={12} />
                    </div>
                    <span style={{ fontSize: '12px', fontWeight: 700 }}>
                      {rev.user_name || 'スモーカー'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '2px', color: 'var(--accent-amber)' }}>
                    {Array.from({ length: rev.rating }).map((_, i) => (
                      <Star key={i} size={12} fill="currentColor" />
                    ))}
                  </div>
                </div>

                {rev.comment && (
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                    {rev.comment}
                  </p>
                )}

                {rev.photo_url && (
                  <img
                    src={rev.photo_url}
                    alt="レビュー写真"
                    style={{
                      width: '80px',
                      height: '80px',
                      borderRadius: 'var(--radius-sm)',
                      objectFit: 'cover',
                      marginTop: '4px',
                    }}
                  />
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
