// ==============================================================================
// Google Maps 高視認性・ミニマルマップスタイル設定
// ==============================================================================
// 初心者向け解説:
// この設定により、コンビニや居酒屋、観光地などのアイコン（POI: Point of Interest）
// がすべて消去され、道路と現在地、そして喫煙所のピンだけがパッと目に飛び込む
// 視認性抜群のミニマルデザインが実現します。
// ==============================================================================

// 1. ライトモード（昼間・直射日光下でも見やすいハイコントラスト）
export const minimalLightStyle: google.maps.MapTypeStyle[] = [
  // 不要なPOI（店舗、商業施設、観光スポット）を全面非表示
  {
    featureType: 'poi',
    elementType: 'all',
    stylers: [{ visibility: 'off' }]
  },
  // 道路以外のランドマークや建物の装飾をフラット化
  {
    featureType: 'landscape.man_made',
    elementType: 'geometry',
    stylers: [{ color: '#f5f5f7' }]
  },
  {
    featureType: 'landscape.natural',
    elementType: 'geometry',
    stylers: [{ color: '#ebeef2' }]
  },
  // 水域（川・海）は淡いブルーグレーで落ち着かせる
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#dbeafe' }]
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#93c5fd' }]
  },
  // 道路（主要道路は太くクッキリ）
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#ffffff' }]
  },
  {
    featureType: 'road.arterial',
    elementType: 'geometry',
    stylers: [{ color: '#ffffff' }]
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#fde047' }] // 高速道路・幹線はアクセント
  },
  {
    featureType: 'road',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#475569' }]
  },
  // 交通機関（駅名のみシンプルに表示）
  {
    featureType: 'transit.station',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#1e293b' }]
  },
  {
    featureType: 'transit.line',
    elementType: 'geometry',
    stylers: [{ color: '#cbd5e1' }]
  },
  // 行政区界線
  {
    featureType: 'administrative',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#e2e8f0' }]
  }
];

// 2. ダークモード（夜間でも眩しくなく、ネオンピンが映えるデザイン）
export const minimalDarkStyle: google.maps.MapTypeStyle[] = [
  // 背景全体をダークスレートに
  {
    elementType: 'geometry',
    stylers: [{ color: '#18181b' }]
  },
  {
    elementType: 'labels.text.stroke',
    stylers: [{ color: '#18181b' }]
  },
  {
    elementType: 'labels.text.fill',
    stylers: [{ color: '#a1a1aa' }]
  },
  // 不要なPOIを完全消去
  {
    featureType: 'poi',
    elementType: 'all',
    stylers: [{ visibility: 'off' }]
  },
  // 道路をくっきり見せる
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#27272a' }]
  },
  {
    featureType: 'road.arterial',
    elementType: 'geometry',
    stylers: [{ color: '#3f3f46' }]
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#52525b' }]
  },
  {
    featureType: 'transit',
    elementType: 'geometry',
    stylers: [{ color: '#27272a' }]
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#09090b' }]
  }
];
