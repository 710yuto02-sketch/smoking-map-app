import React, { useState } from 'react';
import { Cigarette, Mail, Lock, User, ArrowRight, ShieldCheck } from 'lucide-react';
import { auth, isFirebaseConfigured } from '../../lib/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile,
  signInAnonymously
} from 'firebase/auth';
import type { UserProfile } from '../../types/database';

interface AuthModalProps {
  onLoginSuccess: (user: UserProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onLoginSuccess }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const formatAuthError = (err: any): string => {
    const msg = err?.message || String(err);
    if (msg.includes('auth/configuration-not-found') || msg.includes('CONFIGURATION_NOT_FOUND')) {
      return 'Firebase Console で「Authentication（認証）」がまだ開始されていません。コンソール画面で「始める」をクリックし、「メール/パスワード」または「匿名」を有効にしてください。';
    }
    if (msg.includes('auth/email-already-in-use')) {
      return 'このメールアドレスは既に登録されています。「ログイン」をお試しください。';
    }
    if (msg.includes('auth/weak-password')) {
      return 'パスワードが短すぎます。6文字以上の英数字を入力してください。';
    }
    if (msg.includes('auth/invalid-email')) {
      return 'メールアドレスの形式が正しくありません。';
    }
    if (msg.includes('auth/invalid-credential') || msg.includes('auth/wrong-password') || msg.includes('auth/user-not-found')) {
      return 'メールアドレスまたはパスワードが正しくありません。';
    }
    return msg || '認証に失敗しました。入力内容をお確かめください。';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      if (isFirebaseConfigured && auth) {
        if (isSignUp) {
          // Firebase 新規登録
          const userCredential = await createUserWithEmailAndPassword(auth, email, password);
          if (displayName && userCredential.user) {
            await updateProfile(userCredential.user, { displayName });
          }
          const user = userCredential.user;
          const userObj: UserProfile = {
            id: user.uid,
            email: user.email || email,
            display_name: displayName || user.email?.split('@')[0] || 'スモーカー',
            created_at: new Date().toISOString(),
          };
          localStorage.setItem('smoke_user', JSON.stringify(userObj));
          onLoginSuccess(userObj);
        } else {
          // Firebase ログイン
          const userCredential = await signInWithEmailAndPassword(auth, email, password);
          const user = userCredential.user;
          const userObj: UserProfile = {
            id: user.uid,
            email: user.email || email,
            display_name: user.displayName || user.email?.split('@')[0] || 'スモーカー',
            created_at: new Date().toISOString(),
          };
          localStorage.setItem('smoke_user', JSON.stringify(userObj));
          onLoginSuccess(userObj);
        }
      } else {
        // デモモード（APIキー未設定でもすぐにお試し可能）
        const mockUser: UserProfile = {
          id: 'demo-user-' + Math.random().toString(36).substring(2, 9),
          email: email || 'guest@smokespot.com',
          display_name: displayName || (email ? email.split('@')[0] : 'ゲストスモーカー'),
          created_at: new Date().toISOString(),
        };
        localStorage.setItem('smoke_user', JSON.stringify(mockUser));
        onLoginSuccess(mockUser);
      }
    } catch (err: any) {
      console.warn('Auth error:', err);
      setErrorMsg(formatAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  // ワンクリック・ゲストログイン機能（Firebase匿名認証と安全に連動）
  const handleQuickDemoLogin = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      if (isFirebaseConfigured && auth) {
        // Firebase の匿名ログインを試行
        const userCredential = await signInAnonymously(auth);
        const user = userCredential.user;
        const demoUser: UserProfile = {
          id: user.uid,
          email: 'guest@smokespot.jp',
          display_name: 'ゲストスモーカー',
          created_at: new Date().toISOString(),
        };
        localStorage.setItem('smoke_user', JSON.stringify(demoUser));
        onLoginSuccess(demoUser);
        return;
      }
    } catch (err: any) {
      console.warn('Firebase anonymous login fallback:', err);
      // Firebaseで匿名認証が未有効の場合でも、ローカルフォールバックで体験を継続可能にする
    } finally {
      setLoading(false);
    }

    // フォールバックデモユーザー
    const demoUser: UserProfile = {
      id: 'demo-user-guest',
      email: 'demo@smokespot.jp',
      display_name: '公式テスター',
      created_at: new Date().toISOString(),
    };
    localStorage.setItem('smoke_user', JSON.stringify(demoUser));
    onLoginSuccess(demoUser);
  };


  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(9, 9, 11, 0.75)',
        backdropFilter: 'blur(12px)',
        padding: '20px',
      }}
    >
      <div
        className="animate-slide-up"
        style={{
          width: '100%',
          maxWidth: '400px',
          backgroundColor: 'var(--bg-surface)',
          borderRadius: 'var(--radius-xl)',
          padding: '32px 24px',
          boxShadow: 'var(--shadow-float)',
          border: '1px solid var(--border-medium)',
        }}
      >
        {/* アイコン & タイトル */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              margin: '0 auto 16px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #10b981, #047857)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              boxShadow: '0 8px 16px rgba(16, 185, 129, 0.25)',
            }}
          >
            <Cigarette size={28} />
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '6px' }}>
            {isSignUp ? 'アカウントを新規作成' : '喫煙所マップへログイン'}
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            {isSignUp
              ? '登録して全国の喫煙所を探す・ピンを追加する'
              : '本アプリはユーザー専用です。ログインして開始してください'}
          </p>
        </div>

        {errorMsg && (
          <div
            style={{
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid var(--accent-danger)',
              color: 'var(--accent-danger)',
              borderRadius: 'var(--radius-md)',
              padding: '10px 14px',
              fontSize: '13px',
              marginBottom: '16px',
            }}
          >
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {isSignUp && (
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                ニックネーム
              </label>
              <div style={{ position: 'relative' }}>
                <User size={18} style={{ position: 'absolute', left: '12px', top: '13px', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="例: たばこマスター"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 14px 12px 38px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-medium)',
                    backgroundColor: 'var(--bg-app)',
                    color: 'var(--text-primary)',
                    fontSize: '14px',
                    outline: 'none',
                  }}
                />
              </div>
            </div>
          )}

          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
              メールアドレス
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '12px', top: '13px', color: 'var(--text-muted)' }} />
              <input
                type="email"
                required
                placeholder="smoke@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 14px 12px 38px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-medium)',
                  backgroundColor: 'var(--bg-app)',
                  color: 'var(--text-primary)',
                  fontSize: '14px',
                  outline: 'none',
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
              パスワード
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '12px', top: '13px', color: 'var(--text-muted)' }} />
              <input
                type="password"
                required
                placeholder="6文字以上の半角英数"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 14px 12px 38px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-medium)',
                  backgroundColor: 'var(--bg-app)',
                  color: 'var(--text-primary)',
                  fontSize: '14px',
                  outline: 'none',
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: '8px',
              padding: '13px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--accent-emerald)',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '15px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: 'var(--shadow-md)',
            }}
          >
            {loading ? '処理中...' : isSignUp ? '会員登録して開始' : 'ログイン'}
            <ArrowRight size={18} />
          </button>
        </form>

        {/* 登録・ログイン切り替え */}
        <div style={{ textAlign: 'center', marginTop: '16px' }}>
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            style={{
              fontSize: '13px',
              color: 'var(--accent-emerald)',
              fontWeight: 600,
              textDecoration: 'underline',
            }}
          >
            {isSignUp ? 'すでにアカウントをお持ちの方はこちら（ログイン）' : 'アカウントをお持ちでない方はこちら（新規登録）'}
          </button>
        </div>

        {/* 初心者向けクイックデモ体験ボタン */}
        <div
          style={{
            marginTop: '20px',
            paddingTop: '16px',
            borderTop: '1px dashed var(--border-subtle)',
            textAlign: 'center',
          }}
        >
          <button
            type="button"
            onClick={handleQuickDemoLogin}
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--accent-emerald-light)',
              color: 'var(--accent-emerald-dark)',
              fontSize: '13px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            <ShieldCheck size={16} />
            ワンタップで今すぐ体験（ゲストログイン）
          </button>
        </div>
      </div>
    </div>
  );
};
