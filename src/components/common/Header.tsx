import React from 'react';
import { Cigarette, Moon, Sun, LogOut, User, Info } from 'lucide-react';
import type { UserProfile } from '../../types/database';

interface HeaderProps {
  user: UserProfile | null;
  onLogout: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
  onOpenTerms: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  onLogout,
  isDark,
  onToggleTheme,
  onOpenTerms,
}) => {
  return (
    <header
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 20,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 16px',
        pointerEvents: 'none', // マップ操作を邪魔しない
      }}
    >
      {/* ロゴとアプリタイトル（ガラスモーフィズム） */}
      <div
        className="glass-panel"
        style={{
          pointerEvents: 'auto',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 14px',
          borderRadius: 'var(--radius-pill)',
          boxShadow: 'var(--shadow-md)',
        }}
      >
        <div
          style={{
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--accent-emerald), #047857)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
          }}
        >
          <Cigarette size={16} />
        </div>
        <div>
          <span style={{ fontWeight: 800, fontSize: '15px', letterSpacing: '-0.3px' }}>
            SMOKE <span style={{ color: 'var(--accent-emerald)' }}>SPOT</span>
          </span>
        </div>
      </div>

      {/* 右側アクション（テーマ切替、ユーザーアイコン、ログアウト） */}
      <div
        style={{
          pointerEvents: 'auto',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        {/* 利用規約・プライバシー方針ボタン */}
        <button
          onClick={onOpenTerms}
          aria-label="利用規約・プライバシー方針"
          title="利用規約 & プライバシー方針"
          className="glass-panel"
          style={{
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-primary)',
            boxShadow: 'var(--shadow-md)',
          }}
        >
          <Info size={18} />
        </button>

        {/* ダーク/ライトモード切替ボタン */}
        <button
          onClick={onToggleTheme}
          aria-label="テーマ切替"
          title={isDark ? 'ライトモードに切替' : 'ダークモードに切替'}
          className="glass-panel"
          style={{
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-primary)',
            boxShadow: 'var(--shadow-md)',
          }}
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* ユーザー情報＆ログアウト */}
        {user && (
          <div
            className="glass-panel"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '4px 10px 4px 6px',
              borderRadius: 'var(--radius-pill)',
              boxShadow: 'var(--shadow-md)',
            }}
          >
            <div
              style={{
                width: '30px',
                height: '30px',
                borderRadius: '50%',
                background: 'var(--accent-emerald-light)',
                color: 'var(--accent-emerald)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <User size={16} />
            </div>
            <span
              style={{
                fontSize: '13px',
                fontWeight: 600,
                maxWidth: '90px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {user.display_name}
            </span>
            <button
              onClick={onLogout}
              title="ログアウト"
              style={{
                color: 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                padding: '4px',
              }}
            >
              <LogOut size={16} />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
