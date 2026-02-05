import React from 'react';

interface FilterControlsProps {
  focusArea: string;
  filterOptionIdx: number;
  activeType: string;
  sortMode: string;
}

const FilterControls: React.FC<FilterControlsProps> = ({
  focusArea,
  filterOptionIdx,
  activeType,
  sortMode,
}) => {
  return (
    <div
      className={`p-1 flex gap-1 bg-black/5 border-b border-black/10 text-[6px] gb-font ${
        focusArea === 'filter' ? 'bg-black/20 ring-1 ring-black inset' : ''
      }`}
    >
      <div
        className={`flex-1 p-1 rounded ${
          focusArea === 'filter' && filterOptionIdx === 0 ? 'bg-black text-white' : ''
        }`}
      >
        TIPO: {activeType}
      </div>
      <div
        className={`flex-1 p-1 rounded ${
          focusArea === 'filter' && filterOptionIdx === 1 ? 'bg-black text-white' : ''
        }`}
      >
        ORD: {sortMode}
      </div>
    </div>
  );
};

export default FilterControls;
