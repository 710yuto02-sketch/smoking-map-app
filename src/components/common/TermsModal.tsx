import React from 'react';
import { X, ShieldCheck, MapPin, AlertTriangle, Scale, HeartHandshake } from 'lucide-react';

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TermsModal: React.FC<TermsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
      onClick={onClose}
    >
      <div
        className="animate-slide-up"
        style={{
          width: '100%',
          maxWidth: '540px',
          maxHeight: '85vh',
          backgroundColor: 'var(--bg-surface)',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--border-medium)',
          boxShadow: 'var(--shadow-float)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ヘッダー */}
        <div
          style={{
            padding: '18px 20px',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: 'var(--bg-surface)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                backgroundColor: 'var(--accent-emerald-light)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-emerald)',
              }}
            >
              <ShieldCheck size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '17px', fontWeight: 800, margin: 0 }}>利用規約 & プライバシー方針</h2>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0 }}>
                安心してご利用いただくためのガイドライン
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              padding: '6px',
              borderRadius: '50%',
              backgroundColor: 'var(--bg-app)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* 本文（スクロール可能） */}
        <div
          style={{
            padding: '20px',
            overflowY: 'auto',
            fontSize: '13px',
            lineHeight: 1.6,
            color: 'var(--text-secondary)',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
          }}
        >
          {/* セクション1: 位置情報の取り扱い */}
          <section
            style={{
              padding: '14px',
              backgroundColor: 'var(--bg-app)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', color: 'var(--accent-emerald)' }}>
              <MapPin size={16} />
              <h3 style={{ fontSize: '14px', fontWeight: 700, margin: 0 }}>1. 位置情報（GPS）の取り扱い方針</h3>
            </div>
            <p style={{ margin: 0 }}>
              本アプリは、現在地周辺の喫煙所を探す目的および徒歩ルート案内機能の提供のためにのみ位置情報を取得します。
              取得した位置情報をサーバーに保存したり、個人の行動履歴を追跡・第三者に提供することは一切ありません。
            </p>
          </section>

          {/* セクション2: ユーザー投稿ルール（UGC） */}
          <section
            style={{
              padding: '14px',
              backgroundColor: 'var(--bg-app)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', color: 'var(--accent-amber)' }}>
              <HeartHandshake size={16} />
              <h3 style={{ fontSize: '14px', fontWeight: 700, margin: 0 }}>2. 投稿・コミュニティガイドライン</h3>
            </div>
            <p style={{ margin: 0, marginBottom: '8px' }}>
              本アプリは愛煙家の皆様の善意の共有によって運営されています。以下の投稿は固く禁止いたします：
            </p>
            <ul style={{ margin: 0, paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <li>喫煙が禁止されている区域や私有地への無断立ち入りを促す投稿</li>
              <li>存在しない架空の場所や悪質ないたずら投稿</li>
              <li>他者への誹謗中傷、差別的表現、広告・宣伝目的の投稿</li>
              <li>個人を特定できる写真（人物の顔や車のナンバーなど）の無断添付</li>
            </ul>
          </section>

          {/* セクション3: 法令遵守と未成年喫煙防止 */}
          <section
            style={{
              padding: '14px',
              backgroundColor: 'var(--bg-app)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', color: 'var(--accent-danger)' }}>
              <AlertTriangle size={16} />
              <h3 style={{ fontSize: '14px', fontWeight: 700, margin: 0 }}>3. 法令遵守（20歳未満の喫煙禁止）</h3>
            </div>
            <p style={{ margin: 0 }}>
              日本の法律により、20歳未満の喫煙および加熱式タバコ・電子タバコの使用は固く禁止されています。
              本アプリは成人の喫煙マナー向上と受動喫煙防止の啓発を目的としています。
            </p>
          </section>

          {/* セクション4: 免責事項 */}
          <section
            style={{
              padding: '14px',
              backgroundColor: 'var(--bg-app)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', color: 'var(--text-primary)' }}>
              <Scale size={16} />
              <h3 style={{ fontSize: '14px', fontWeight: 700, margin: 0 }}>4. 免責事項</h3>
            </div>
            <p style={{ margin: 0 }}>
              掲載されている喫煙所の位置や営業時間、利用可否は自治体の条例改正や店舗都合により予告なく変更される場合があります。
              本アプリの利用により生じたトラブルや損害について、開発運営者は一切の責任を負いかねます。現地の喫煙看板やルールを必ず遵守してください。
            </p>
          </section>
        </div>

        {/* フッター */}
        <div
          style={{
            padding: '14px 20px',
            borderTop: '1px solid var(--border-subtle)',
            backgroundColor: 'var(--bg-surface)',
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: '10px 24px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--accent-emerald)',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '13px',
              border: 'none',
              cursor: 'pointer',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            同意して閉じる
          </button>
        </div>
      </div>
    </div>
  );
};
