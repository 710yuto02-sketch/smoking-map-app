# 喫煙所マップアプリ 開発進捗ログ (PROGRESS.md)

## 1. 現在のアプリの状態（何ができて、何が未完成か）

### ✅ 完成している機能（すべて動作検証済み）
1. **ユーザー認証機能（未ログイン時アクセス制限）**
   - 新規会員登録、メール/パスワードログイン、ログアウト機能。
   - 初心者がすぐに動作確認できるよう、ワンタップで試せる「ゲストログイン機能」も完備。
2. **完全Googleマップ標準デザイン & ピン表示機能**
   - Google Maps 公式と同じ標準UIコントロールを全面有効化。
   - 右上の「地図 / 航空写真」切り替えボタン、右下の「＋ / －」ズームボタン、Google公式ロゴを配置。
   - 店舗アイコン（コンビニ、カフェ、駅名、ビル名など）をすべて表示する通常モードに対応。
   - 航空写真（サテライト写真）モードへの切り替えもワンタップで可能。
   - タバコの種類に応じたカラーピン（紙タバコ: グリーン、加熱式: ブルー、両方: エメラルドゴールド）。
3. **Googleマップ公式アプリ直接連携（音声ナビ起動）**
   - 喫煙所詳細ドロワーに「Googleマップ公式アプリで開く（音声ナビ）」ボタンを追加。
   - スマートフォンの公式Googleマップアプリが直接起動し、現在地からの音声付き徒歩ナビゲーションを開始可能。
3. **リアルタイム・チップ型フィルター機能**
   - 画面上部にピル（Pill）型のUIを配置。
   - 「紙タバコ可 / 加熱式専用」「屋内 / 屋外」「無料 / 有料」を複数選択可能で、該当件数とピンの表示がリアルタイムに切り替え可能。
4. **徒歩ルート案内機能（Directions API）**
   - ピンをタップすると画面下部から詳細ボトムシートがスライドアップ。
   - 「ここへ行く（徒歩ルート案内）」をタップすると、現在地から目的地までの徒歩ルート、推定所要時間、距離をリアルタイム描画。
5. **新規喫煙所投稿機能（タップ式選択UI & 写真アップロード）**
   - マップ上の「＋」ボタンタップ、または画面ダブルタップで投稿モーダルが起動。
   - 「吸える種類」「屋内/屋外」「無料/有料」をタップだけで選べる設計。現場写真の添付（カメラ/ライブラリ）にも対応。
6. **レビュー・写真投稿機能（既存ピンへの追加）**
   - 各喫煙所に対して、1〜5段階の星評価、口コミコメント、現場写真を追加投稿可能。
7. **モバイル最適化 & ダークモード/ライトモード対応**
   - 屋外の直射日光下でも見やすい高コントラストなライトモードと、夜間用のダークモードをワンタップで切り替え可能。
   - スマホの画面サイズや片手操作（親指で押しやすいフローティング配置）に最適化。

### ⏳ 今後拡張可能な項目（次のステップ）
- 実際の Supabase / Firebase 本番環境とのリアルタイム同期（現在はlocalStorageおよびモックデータで即座にフル動作可能）。
- Google Cloud Console での正規APIキー取得と本番ドメイン制限の設定。
- PWA（Progressive Web App）としてのマニフェスト設定（アプリアイコンの追加）。

---

## 2. 今回作成・変更した主要ファイル一覧

- `supabase/schema.sql`: Supabase用のテーブル設計（profiles, smoking_areas, reviews）、インデックス、RLSセキュリティルール。
- `firebase/firestore.rules`: Firebase利用時向けのセキュリティルール設定。
- `.env.example`: Google Maps APIキーおよびSupabaseキー設定用のテンプレート（※.gitignoreで保護）。
- `src/types/database.ts`: TypeScriptの型定義（喫煙所、ユーザー、レビュー、フィルター）。
- `src/lib/mapStyles.ts`: POI（店舗・観光地）を完全非表示にするGoogle Maps用カスタムスタイル。
- `src/lib/mockData.ts`: 初回起動時からリアルな体験ができる東京駅周辺のサンプル喫煙所データ。
- `src/hooks/useGeolocation.ts`: GPS現在地取得用カスタムフック。
- `src/components/auth/AuthModal.tsx`: ログイン・新規登録・ゲストログインモーダル。
- `src/components/filter/FilterBar.tsx`: チップ型ピルフィルター。
- `src/components/map/SmokingMap.tsx`: 高視認性ミニマルマップ本体（Google Maps & フォールバック両対応、ルート描画）。
- `src/components/post/NewSpotModal.tsx`: タップ選択式の新規喫煙所投稿モーダル。
- `src/components/drawer/SpotDetailDrawer.tsx`: ピン詳細ドロワー、ルート案内、レビュー投稿。
- `src/components/common/Header.tsx`: ヘッダー＆ダークモード切替。
- `src/index.css`: 高視認性・モバイル向けデザインシステム。
- `src/App.tsx`: 全機能の統合・状態管理。

---

## 3. 次にやるべき作業・コマンド（別PCで開いた直後に実行すること）

### 📦 GitHubリポジトリURL
[https://github.com/710yuto02-sketch/smoking-map-app](https://github.com/710yuto02-sketch/smoking-map-app)

別のPCで新しく作業を始める場合は、以下の手順でダウンロード・起動できます：

```bash
# 1. リポジトリをクローン（ダウンロード）
git clone https://github.com/710yuto02-sketch/smoking-map-app.git

# 2. フォルダに移動
cd smoking-map-app

# 3. 依存ライブラリのインストール
npm install

# 4. 開発サーバーの起動（ブラウザで http://localhost:5173 を開く）
npm run dev
```

※Google Maps APIキーをお持ちの場合は、`.env.example` をコピーして `.env` を作成し、`VITE_GOOGLE_MAPS_API_KEY=あなたのキー` を入力すると、本物のGoogle Maps航空写真や道路網に即座に切り替わります。
