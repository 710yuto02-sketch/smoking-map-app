import type { SmokingArea, Review } from '../types/database';

// 初心者向け解説:
// APIキーやデータベース未接続時でも、すぐにリアルな動作確認ができる初期サンプルデータです。
// 東京駅〜銀座周辺の喫煙所を模しています。

export const initialSmokingAreas: SmokingArea[] = [
  {
    id: 'spot-1',
    lat: 35.681382,
    lng: 139.766084,
    name: '丸の内北口前 公共指定喫煙所',
    type_cigar: 'both',
    type_place: 'outdoor',
    type_fee: 'free',
    description: '屋外の公共喫煙所。灰皿4台設置。換気良好で混雑時も回転が早いです。',
    photo_url: 'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?auto=format&fit=crop&w=600&q=80',
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'spot-2',
    lat: 35.683050,
    lng: 139.769200,
    name: '大手町ビル B2F 喫煙ルーム',
    type_cigar: 'paper',
    type_place: 'indoor',
    type_fee: 'free',
    description: '地下街にある強力換気エアコン付きの屋内喫煙ブース。雨の日でも快適です。',
    photo_url: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=600&q=80',
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: 'spot-3',
    lat: 35.679500,
    lng: 139.764800,
    name: 'カフェ・ド・タバコ 丸の内店',
    type_cigar: 'both',
    type_place: 'indoor',
    type_fee: 'paid',
    description: '全席喫煙可能カフェ。要1ドリンク注文（コーヒー450円〜）。コンセント・Wi-Fi完備。',
    photo_url: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=600&q=80',
    created_at: new Date(Date.now() - 86400000 * 10).toISOString(),
  },
  {
    id: 'spot-4',
    lat: 35.678200,
    lng: 139.768500,
    name: '有楽町高架下 IQOS / 加熱式専用ラウンジ',
    type_cigar: 'heated',
    type_place: 'indoor',
    type_fee: 'free',
    description: '加熱式タバコ（Ploom/IQOS/glo）専用スペース。煙や匂いが苦手な加熱式ユーザーに最適。',
    photo_url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80',
    created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
  {
    id: 'spot-5',
    lat: 35.684500,
    lng: 139.763000,
    name: '皇居外苑前 ベンダー横灰皿',
    type_cigar: 'both',
    type_place: 'outdoor',
    type_fee: 'free',
    description: '自動販売機コーナーの横に設置された灰皿。24時間利用可能。',
    created_at: new Date(Date.now() - 86400000 * 12).toISOString(),
  }
];

export const initialReviews: Review[] = [
  {
    id: 'rev-1',
    area_id: 'spot-1',
    user_id: 'u-1',
    user_name: 'スモーカー太郎',
    rating: 5,
    comment: 'お昼休みに利用しました。灰皿が清掃されていて清潔感があります！',
    created_at: new Date(Date.now() - 3600000 * 3).toISOString()
  },
  {
    id: 'rev-2',
    area_id: 'spot-1',
    user_id: 'u-2',
    user_name: 'ケムリ好き',
    rating: 4,
    comment: '風通しが良いので服に匂いがつきにくいのが助かる。',
    created_at: new Date(Date.now() - 3600000 * 8).toISOString()
  },
  {
    id: 'rev-3',
    area_id: 'spot-4',
    user_id: 'u-3',
    user_name: 'アイコス派',
    rating: 5,
    comment: '加熱式専用なのでヤニ臭さが一切なく、充電器も借りられて最高でした！',
    photo_url: 'https://images.unsplash.com/photo-1527061011665-3652c757a4d4?auto=format&fit=crop&w=600&q=80',
    created_at: new Date(Date.now() - 86400000 * 2).toISOString()
  }
];
