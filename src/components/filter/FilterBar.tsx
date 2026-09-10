import type { FilterCriteria, CigarType, PlaceType, FeeType } from '../../types/database';
import { Flame, Wind, Home, Trees, Coins, Check } from 'lucide-react';

interface FilterBarProps {
  filter: FilterCriteria;
  onFilterChange: (newFilter: FilterCriteria) => void;
  matchCount: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filter,
  onFilterChange,
  matchCount,
}) => {
  const toggleCigar = (type: CigarType) => {
    onFilterChange({
      ...filter,
      cigar: filter.cigar === type ? 'all' : type,
    });
  };

  const togglePlace = (type: PlaceType) => {
    onFilterChange({
      ...filter,
      place: filter.place === type ? 'all' : type,
    });
  };

  const toggleFee = (type: FeeType) => {
    onFilterChange({
      ...filter,
      fee: filter.fee === type ? 'all' : type,
    });
  };

  const isFiltered = filter.cigar !== 'all' || filter.place !== 'all' || filter.fee !== 'all';

  const resetFilter = () => {
    onFilterChange({
      cigar: 'all',
      place: 'all',
      fee: 'all',
    });
  };

  return (
    <div
      style={{
        position: 'absolute',
        top: '64px',
        left: 0,
        right: 0,
        zIndex: 15,
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        padding: '0 12px',
        pointerEvents: 'none',
      }}
    >
      {/* 水平スクロール対応のピルフィルターバー */}
      <div
        className="no-scrollbar"
        style={{
          pointerEvents: 'auto',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          overflowX: 'auto',
          padding: '4px 2px',
        }}
      >
        {/* 全件リセット/カウントピル */}
        <button
          onClick={resetFilter}
          className="glass-panel"
          style={{
            whiteSpace: 'nowrap',
            padding: '7px 12px',
            borderRadius: 'var(--radius-pill)',
            fontSize: '12px',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: !isFiltered ? 'var(--text-primary)' : 'var(--bg-surface)',
            color: !isFiltered ? 'var(--bg-surface)' : 'var(--text-primary)',
            boxShadow: 'var(--shadow-md)',
            flexShrink: 0,
          }}
        >
          <span>すべて</span>
          <span
            style={{
              padding: '1px 6px',
              borderRadius: '10px',
              backgroundColor: !isFiltered ? 'rgba(255,255,255,0.2)' : 'var(--border-subtle)',
              fontSize: '11px',
            }}
          >
            {matchCount}
          </span>
        </button>

        {/* 1. タバコ種類: 紙タバコ可 */}
        <button
          onClick={() => toggleCigar('paper')}
          className="glass-panel"
          style={{
            whiteSpace: 'nowrap',
            padding: '7px 13px',
            borderRadius: 'var(--radius-pill)',
            fontSize: '12px',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: filter.cigar === 'paper' ? 'var(--accent-emerald)' : 'var(--bg-surface)',
            color: filter.cigar === 'paper' ? '#ffffff' : 'var(--text-secondary)',
            border: filter.cigar === 'paper' ? '1px solid var(--accent-emerald)' : '1px solid var(--border-medium)',
            boxShadow: 'var(--shadow-md)',
            flexShrink: 0,
          }}
        >
          <Flame size={14} />
          <span>紙タバコ可</span>
          {filter.cigar === 'paper' && <Check size={12} />}
        </button>

        {/* 2. タバコ種類: 加熱式専用 */}
        <button
          onClick={() => toggleCigar('heated')}
          className="glass-panel"
          style={{
            whiteSpace: 'nowrap',
            padding: '7px 13px',
            borderRadius: 'var(--radius-pill)',
            fontSize: '12px',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: filter.cigar === 'heated' ? 'var(--accent-blue)' : 'var(--bg-surface)',
            color: filter.cigar === 'heated' ? '#ffffff' : 'var(--text-secondary)',
            border: filter.cigar === 'heated' ? '1px solid var(--accent-blue)' : '1px solid var(--border-medium)',
            boxShadow: 'var(--shadow-md)',
            flexShrink: 0,
          }}
        >
          <Wind size={14} />
          <span>加熱式専用</span>
          {filter.cigar === 'heated' && <Check size={12} />}
        </button>

        {/* 3. 場所タイプ: 屋内 */}
        <button
          onClick={() => togglePlace('indoor')}
          className="glass-panel"
          style={{
            whiteSpace: 'nowrap',
            padding: '7px 13px',
            borderRadius: 'var(--radius-pill)',
            fontSize: '12px',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: filter.place === 'indoor' ? 'var(--accent-amber)' : 'var(--bg-surface)',
            color: filter.place === 'indoor' ? '#ffffff' : 'var(--text-secondary)',
            border: filter.place === 'indoor' ? '1px solid var(--accent-amber)' : '1px solid var(--border-medium)',
            boxShadow: 'var(--shadow-md)',
            flexShrink: 0,
          }}
        >
          <Home size={14} />
          <span>屋内</span>
          {filter.place === 'indoor' && <Check size={12} />}
        </button>

        {/* 4. 場所タイプ: 屋外 */}
        <button
          onClick={() => togglePlace('outdoor')}
          className="glass-panel"
          style={{
            whiteSpace: 'nowrap',
            padding: '7px 13px',
            borderRadius: 'var(--radius-pill)',
            fontSize: '12px',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: filter.place === 'outdoor' ? '#8b5cf6' : 'var(--bg-surface)',
            color: filter.place === 'outdoor' ? '#ffffff' : 'var(--text-secondary)',
            border: filter.place === 'outdoor' ? '1px solid #8b5cf6' : '1px solid var(--border-medium)',
            boxShadow: 'var(--shadow-md)',
            flexShrink: 0,
          }}
        >
          <Trees size={14} />
          <span>屋外</span>
          {filter.place === 'outdoor' && <Check size={12} />}
        </button>

        {/* 5. 料金: 無料 */}
        <button
          onClick={() => toggleFee('free')}
          className="glass-panel"
          style={{
            whiteSpace: 'nowrap',
            padding: '7px 13px',
            borderRadius: 'var(--radius-pill)',
            fontSize: '12px',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: filter.fee === 'free' ? '#0284c7' : 'var(--bg-surface)',
            color: filter.fee === 'free' ? '#ffffff' : 'var(--text-secondary)',
            border: filter.fee === 'free' ? '1px solid #0284c7' : '1px solid var(--border-medium)',
            boxShadow: 'var(--shadow-md)',
            flexShrink: 0,
          }}
        >
          <Coins size={14} />
          <span>無料のみ</span>
          {filter.fee === 'free' && <Check size={12} />}
        </button>
      </div>
    </div>
  );
};
