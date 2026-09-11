// ==============================================================================
// データベース & アプリ共通 型定義
// ==============================================================================

// 1. ユーザー型
export interface UserProfile {
  id: string;
  email: string;
  display_name: string;
  avatar_url?: string;
  created_at: string;
}

// 2. 喫煙所型
export type CigarType = 'paper' | 'heated' | 'both'; // paper: 紙タバコ可, heated: 加熱式専用, both: 両方可
export type PlaceType = 'indoor' | 'outdoor';        // indoor: 屋内, outdoor: 屋外
export type FeeType = 'free' | 'paid';              // free: 無料, paid: 有料（カフェ・施設等）

export interface SmokingArea {
  id: string;
  lat: number;
  lng: number;
  name?: string;
  type_cigar: CigarType;
  type_place: PlaceType;
  type_fee: FeeType;
  floor_level?: string; // 設置フロア (例: '1F (路面)', 'B1F', 'B2F', '2F', '屋上' など)
  description?: string;
  photo_url?: string;
  created_by?: string;
  created_at: string;
  distance_m?: number; // 現在地からの推定距離（メートル）
  last_verified_at?: string; // 最終利用確認日時 (生存確認)
  verified_count?: number;    // 今日・直近で吸えたと報告された回数
  closed_report_count?: number; // 撤去・閉鎖が通報された回数
  inappropriate_report_count?: number; // 不適切・規約違反が通報された回数
}

// 3. レビュー型
export interface Review {
  id: string;
  area_id: string;
  user_id: string;
  rating: number; // 1〜5
  comment?: string;
  photo_url?: string;
  created_at: string;
  user_name?: string; // 画面表示用
}

// 4. フィルター検索条件
export interface FilterCriteria {
  cigar: CigarType | 'all';
  place: PlaceType | 'all';
  fee: FeeType | 'all';
}

// 5. 経路案内（Directions）用
export interface RouteInfo {
  distanceText: string;
  durationText: string;
  steps: string[];
}
