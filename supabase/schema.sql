-- ==============================================================================
-- 喫煙所マップアプリ データベース設計 (Supabase / PostgreSQL)
-- ==============================================================================
-- 初心者向け解説:
-- このSQLファイルをSupabaseの「SQL Editor」に貼り付けて「RUN」を押すだけで、
-- 必要なテーブルとセキュリティ設定がすべて一括で作成されます。
-- ==============================================================================

-- 1. ユーザープロフィールテーブル (Users / profiles)
-- Supabaseの標準認証(auth.users)と連動し、ユーザー名やアイコンを保持します
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 喫煙所情報テーブル (SmokingAreas / smoking_areas)
CREATE TABLE IF NOT EXISTS public.smoking_areas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lat DOUBLE PRECISION NOT NULL,                           -- 緯度
  lng DOUBLE PRECISION NOT NULL,                           -- 経度
  name TEXT DEFAULT '喫煙スポット',                         -- スポット名（任意）
  type_cigar TEXT CHECK (type_cigar IN ('paper', 'heated', 'both')) NOT NULL, -- paper: 紙タバコ, heated: 加熱式専用, both: 両方可
  type_place TEXT CHECK (type_place IN ('indoor', 'outdoor')) NOT NULL,       -- indoor: 屋内, outdoor: 屋外
  type_fee TEXT CHECK (type_fee IN ('free', 'paid')) NOT NULL,                -- free: 無料, paid: 有料（カフェ等）
  floor_level TEXT DEFAULT '1F (路面)',                    -- 設置フロア (1F, B1F, B2F, 2F, 屋上など)
  description TEXT,                                        -- 補足メモ（灰皿の数など）
  photo_url TEXT,                                          -- 代表写真URL
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL, -- 投稿者
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_verified_at TIMESTAMPTZ DEFAULT NOW(),              -- 直近の利用確認日時（生存確認）
  verified_count INTEGER DEFAULT 1,                        -- 利用確認（吸えた報告）カウント
  closed_report_count INTEGER DEFAULT 0                    -- 撤去・閉鎖通報カウント
);

-- 3. レビュー・写真情報テーブル (Reviews / reviews)
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  area_id UUID REFERENCES public.smoking_areas(id) ON DELETE CASCADE NOT NULL, -- どの喫煙所か
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,       -- 投稿したユーザー
  rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,                 -- 1〜5段階の星評価
  comment TEXT,                                                                -- 口コミコメント
  photo_url TEXT,                                                              -- 現場の写真URL
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 高速検索のためのインデックス（位置情報での高速絞り込み）
CREATE INDEX IF NOT EXISTS idx_smoking_areas_coords ON public.smoking_areas(lat, lng);
CREATE INDEX IF NOT EXISTS idx_smoking_areas_cigar ON public.smoking_areas(type_cigar);
CREATE INDEX IF NOT EXISTS idx_smoking_areas_place ON public.smoking_areas(type_place);
CREATE INDEX IF NOT EXISTS idx_smoking_areas_fee ON public.smoking_areas(type_fee);
CREATE INDEX IF NOT EXISTS idx_reviews_area ON public.reviews(area_id);

-- ==============================================================================
-- セキュリティルール (RLS: 行レベルセキュリティ)
-- 初心者向け解説:
-- 「ログインしている人だけが投稿・編集できる」「未登録の第三者にデータを壊されない」
-- ようにするための厳格なセキュリティルールです。
-- ==============================================================================

-- 各テーブルでRLSを有効化
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.smoking_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- 1. profiles のセキュリティ
-- ログインユーザーのみ全プロフィールを閲覧可能
CREATE POLICY "ログインユーザーは全プロフィールを閲覧可能"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

-- 自分のプロフィールのみ更新可能
CREATE POLICY "ユーザーは自分のプロフィールのみ更新可能"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- 新規ユーザー登録時にprofilesに自動登録するトリガー関数
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (new.id, new.email, COALESCE(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. smoking_areas のセキュリティ
-- ログインユーザーのみ閲覧可能（要件：アプリの利用は登録ユーザーのみ）
CREATE POLICY "ログインユーザーは喫煙所を閲覧可能"
  ON public.smoking_areas FOR SELECT
  TO authenticated
  USING (true);

-- ログインユーザーのみ新規投稿可能
CREATE POLICY "ログインユーザーは喫煙所を新規投稿可能"
  ON public.smoking_areas FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

-- 自分が投稿した喫煙所のみ更新可能
CREATE POLICY "投稿者本人のみ喫煙所を更新可能"
  ON public.smoking_areas FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by);

-- 3. reviews のセキュリティ
-- ログインユーザーのみレビューを閲覧可能
CREATE POLICY "ログインユーザーはレビューを閲覧可能"
  ON public.reviews FOR SELECT
  TO authenticated
  USING (true);

-- ログインユーザーのみレビューを投稿可能
CREATE POLICY "ログインユーザーはレビューを投稿可能"
  ON public.reviews FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- 自分が投稿したレビューのみ削除可能
CREATE POLICY "投稿者本人のみレビューを削除可能"
  ON public.reviews FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ==============================================================================
-- 画像ストレージ用設定 (Supabase Storage バケット: smoking-photos)
-- ==============================================================================
-- 画像用バケットの作成
INSERT INTO storage.buckets (id, name, public)
VALUES ('smoking-photos', 'smoking-photos', true)
ON CONFLICT (id) DO NOTHING;

-- 画像アップロードポリシー: ログインユーザーならアップロード可能
CREATE POLICY "ログインユーザーは画像をアップロード可能"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'smoking-photos');

-- 画像閲覧ポリシー: 誰でも閲覧可能（公開URL）
CREATE POLICY "画像は公開閲覧可能"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'smoking-photos');
