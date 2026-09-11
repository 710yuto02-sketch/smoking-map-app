import React, { useState } from 'react';
import type { SmokingArea, Review, UserProfile, RouteInfo } from '../../types/database';
import { 
  X, Navigation, Flame, Wind, Home, Trees, Coins, DollarSign, 
  Star, MessageSquare, Camera, User, CornerUpRight, ExternalLink,
  ThumbsUp, Building2, AlertTriangle, CheckCircle2, Clock,
  Trash2, ShieldAlert
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
  onVerifySpot?: (spotId: string) => void;
  onReportClosed?: (spotId: string) => void;
  onDeleteSpot?: (spotId: string) => void;
  onDeleteReview?: (reviewId: string) => void;
  onReportInappropriate?: (spotId: string) => void;
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
  onVerifySpot,
  onReportClosed,
  onDeleteSpot,
  onDeleteReview,
  onReportInappropriate,
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

        {/* 設置フロア階数バッジ（迷子防止） */}
        {spot.floor_level && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              padding: '5px 10px',
              borderRadius: 'var(--radius-pill)',
              fontSize: '12px',
              fontWeight: 800,
              backgroundColor: '#fef3c7',
              color: '#b45309',
              border: '1px solid #fcd34d',
            }}
          >
            <Building2 size={14} />
            <span>{spot.floor_level}</span>
          </div>
        )}

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

      {/* ① 生存確認・鮮度カード（愛煙家の無駄足ゼロへ） */}
      <div
        className="glass-panel"
        style={{
          padding: '12px 14px',
          borderRadius: 'var(--radius-md)',
          marginBottom: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          border: spot.closed_report_count && spot.closed_report_count > 0 
            ? '1px solid var(--accent-danger)' 
            : '1px solid #10b981',
          backgroundColor: spot.closed_report_count && spot.closed_report_count > 0 
            ? 'rgba(239, 68, 68, 0.05)' 
            : 'rgba(16, 185, 129, 0.05)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {spot.closed_report_count && spot.closed_report_count > 0 ? (
              <AlertTriangle size={16} style={{ color: 'var(--accent-danger)' }} />
            ) : (
              <CheckCircle2 size={16} style={{ color: '#10b981' }} />
            )}
            <span style={{ fontSize: '12px', fontWeight: 800 }}>
              {spot.closed_report_count && spot.closed_report_count > 0 ? (
                <span style={{ color: 'var(--accent-danger)' }}>撤去・閉鎖の報告があります</span>
              ) : (
                <span style={{ color: '#047857' }}>
                  実在確認済み（生存確認 {spot.verified_count || 1}回）
                </span>
              )}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--text-muted)' }}>
            <Clock size={12} />
            <span>最終確認: {spot.last_verified_at || '最近'}</span>
          </div>
        </div>

        {/* 不適切通報が多数ある場合の安全警告バッジ */}
        {Boolean(spot.inappropriate_report_count && spot.inappropriate_report_count >= 3) && (
          <div
            style={{
              padding: '8px 10px',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid var(--accent-danger)',
              borderRadius: 'var(--radius-sm)',
              marginBottom: '10px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '11px',
              color: 'var(--accent-danger)',
              fontWeight: 700,
            }}
          >
            <ShieldAlert size={15} />
            <span>⚠️ 複数のユーザーから規約違反・誤情報の通報が寄せられています</span>
          </div>
        )}

        {/* 生存確認 ＆ 通報ボタン群 */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => onVerifySpot && onVerifySpot(spot.id)}
            style={{
              flex: '1 1 auto',
              minWidth: '130px',
              padding: '8px 10px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: '#10b981',
              color: '#ffffff',
              fontSize: '12px',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <ThumbsUp size={14} />
            <span>👍 今日ここで吸えた！</span>
          </button>

          <button
            type="button"
            onClick={() => onReportClosed && onReportClosed(spot.id)}
            title="喫煙所が撤去・閉鎖されている場合"
            style={{
              padding: '8px 10px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--bg-app)',
              border: '1px solid var(--border-medium)',
              color: 'var(--text-secondary)',
              fontSize: '11px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
            }}
          >
            <AlertTriangle size={13} style={{ color: 'var(--text-muted)' }} />
            <span>撤去を通報</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (window.confirm('この喫煙所の情報に不適切な内容（虚偽、私有地、誹謗中傷など）が含まれていますか？\n通報を送信します。')) {
                onReportInappropriate && onReportInappropriate(spot.id);
              }
            }}
            title="利用規約に反する不適切な投稿を通報"
            style={{
              padding: '8px 10px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--bg-app)',
              border: '1px solid var(--border-medium)',
              color: 'var(--text-secondary)',
              fontSize: '11px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
            }}
          >
            <ShieldAlert size={13} style={{ color: 'var(--accent-amber)' }} />
            <span>不適切を通報</span>
          </button>
        </div>

        {/* 投稿者本人の場合のみ表示される削除ボタン */}
        {currentUser && spot.created_by && spot.created_by === currentUser.id && (
          <div style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px dashed var(--border-subtle)' }}>
            <button
              type="button"
              onClick={() => {
                if (window.confirm('【確認】あなたが投稿したこの喫煙所ピンを削除しますか？\n（この操作は取り消せません）')) {
                  onDeleteSpot && onDeleteSpot(spot.id);
                }
              }}
              style={{
                width: '100%',
                padding: '7px 10px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'rgba(239, 68, 68, 0.08)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: 'var(--accent-danger)',
                fontSize: '11px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                cursor: 'pointer',
              }}
            >
              <Trash2 size={13} />
              <span>自分が投稿したこのピンを削除する</span>
            </button>
          </div>
        )}
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
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ display: 'flex', gap: '2px', color: 'var(--accent-amber)' }}>
                      {Array.from({ length: rev.rating }).map((_, i) => (
                        <Star key={i} size={12} fill="currentColor" />
                      ))}
                    </div>
                    {currentUser && rev.user_id === currentUser.id && (
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm('この口コミレビューを削除しますか？')) {
                            onDeleteReview && onDeleteReview(rev.id);
                          }
                        }}
                        title="自分の口コミを削除"
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--text-muted)',
                          padding: '2px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                        }}
                      >
                        <Trash2 size={12} style={{ color: 'var(--accent-danger)' }} />
                      </button>
                    )}
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
