import React from 'react';

interface SearchBarProps {
  focusArea: string;
  searchTerm: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ focusArea, searchTerm }) => {
  return (
    <div
      className={`p-2 transition-colors ${
        focusArea === 'search' ? 'bg-black/20 ring-1 ring-black inset shadow-inner' : ''
      }`}
    >
      <div className="bg-white/40 p-1 flex items-center gap-2 border border-black/10">
        <i className="fas fa-search text-[8px]"></i>
        <span className="gb-font text-[9px] truncate uppercase">
          {searchTerm || 'BUSCAR...'}
        </span>
      </div>
    </div>
  );
};

export default SearchBar;
