import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { PokemonBase, PokemonDetails, TYPE_NAMES_PT } from './types';
import { fetchPokemonList, fetchPokemonDetailsBatch, prefetchPokemonDetails } from './services/pokeService';
import { getProfessorInsight } from './services/geminiService';
import PokemonDetailsModal from './components/PokemonDetailsModal';

type FocusArea = 'list' | 'keyboard' | 'search' | 'filter';

const KEYBOARD_LAYOUT = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Ç'],
  ['Z', 'X', 'C', 'V', 'B', 'N', 'M', '.', '-', ' '],
  ['DEL', 'LIMPAR', 'FECHAR']
];

const FILTER_TYPES = ['TODOS', ...Object.keys(TYPE_NAMES_PT).map(k => k.toUpperCase())];
const SORT_MODES = ['Nº', 'HP', 'PODER', 'NOME'];

// Configurações de paginação
const PAGE_SIZE = 30; // Carrega 30 por vez
const INITIAL_LOAD = 30; // Carrega apenas 30 inicialmente

const App: React.FC = () => {
  const [pokemonList, setPokemonList] = useState<PokemonBase[]>([]);
  const [detailedList, setDetailedList] = useState<PokemonDetails[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [selectedPokemon, setSelectedPokemon] = useState<PokemonDetails | null>(null);
  const [descriptionsCache, setDescriptionsCache] = useState<Record<string, string>>({});
  
  // Paginação
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  
  // Filtros
  const [activeType, setActiveType] = useState('TODOS');
  const [sortMode, setSortMode] = useState('Nº');

  // Navegação
  const [focusArea, setFocusArea] = useState<FocusArea>('list');
  const [listIndex, setListIndex] = useState(0);
  const [kbRow, setKbRow] = useState(0);
  const [kbCol, setKbCol] = useState(0);
  const [filterOptionIdx, setFilterOptionIdx] = useState(0); 
  
  const modalActionRef = useRef<{ onDpad: (dir: 'up' | 'down' | 'left' | 'right') => void; onA: () => void; onB: () => void } | null>(null);
  const listContainerRef = useRef<HTMLDivElement>(null);

  // Carregamento inicial otimizado
  useEffect(() => {
    const loadInitialPokemon = async () => {
      try {
        setLoading(true);
        
        // Carrega apenas os primeiros 30 Pokémon
        const baseData = await fetchPokemonList(INITIAL_LOAD, 0);
        setPokemonList(baseData);
        
        // Carrega detalhes apenas dos primeiros 30
        const detailed = await fetchPokemonDetailsBatch(baseData, 10);
        setDetailedList(detailed);
        
        // Verifica se há mais para carregar
        setHasMore(baseData.length === INITIAL_LOAD);
        
        // Pré-carrega próxima página em segundo plano
        if (baseData.length === INITIAL_LOAD) {
          setTimeout(() => {
            fetchPokemonList(PAGE_SIZE, INITIAL_LOAD).then(nextPage => {
              prefetchPokemonDetails(nextPage.map(p => p.name), 5);
            });
          }, 1000);
        }
      } catch (err) {
        console.error("Erro ao carregar lista:", err);
      } finally {
        setLoading(false);
      }
    };
    loadInitialPokemon();
  }, []);

  // Carrega mais Pokémon quando necessário
  const loadMorePokemon = useCallback(async () => {
    if (loadingMore || !hasMore) return;

    try {
      setLoadingMore(true);
      const nextPage = currentPage + 1;
      const offset = INITIAL_LOAD + (nextPage - 1) * PAGE_SIZE;
      
      // Carrega próxima página
      const baseData = await fetchPokemonList(PAGE_SIZE, offset);
      
      if (baseData.length === 0) {
        setHasMore(false);
        return;
      }
      
      setPokemonList(prev => [...prev, ...baseData]);
      
      // Carrega detalhes em lote
      const detailed = await fetchPokemonDetailsBatch(baseData, 10);
      setDetailedList(prev => [...prev, ...detailed]);
      
      setCurrentPage(nextPage);
      setHasMore(baseData.length === PAGE_SIZE);
      
      // Pré-carrega próxima página
      if (baseData.length === PAGE_SIZE) {
        setTimeout(() => {
          fetchPokemonList(PAGE_SIZE, offset + PAGE_SIZE).then(nextPage => {
            prefetchPokemonDetails(nextPage.map(p => p.name), 3);
          });
        }, 500);
      }
    } catch (err) {
      console.error("Erro ao carregar mais Pokémon:", err);
    } finally {
      setLoadingMore(false);
    }
  }, [currentPage, loadingMore, hasMore]);

  // Detecta scroll próximo ao final para carregar mais
  useEffect(() => {
    const handleScroll = () => {
      if (!listContainerRef.current || focusArea !== 'list') return;
      
      const { scrollTop, scrollHeight, clientHeight } = listContainerRef.current;
      const scrollPercentage = (scrollTop + clientHeight) / scrollHeight;
      
      // Carrega mais quando está a 80% do final
      if (scrollPercentage > 0.8 && hasMore && !loadingMore) {
        loadMorePokemon();
      }
    };

    const container = listContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [focusArea, hasMore, loadingMore, loadMorePokemon]);

  const filteredPokemon = useMemo(() => {
    let result = [...detailedList];

    if (searchTerm) {
      result = result.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }

    if (activeType !== 'TODOS') {
      result = result.filter(p => p.types.some(t => t.type.name.toUpperCase() === activeType));
    }

    result.sort((a, b) => {
      if (sortMode === 'HP') return (b.stats.find(s => s.stat.name === 'hp')?.base_stat || 0) - (a.stats.find(s => s.stat.name === 'hp')?.base_stat || 0);
      if (sortMode === 'PODER') return b.base_experience - a.base_experience;
      if (sortMode === 'NOME') return a.name.localeCompare(b.name);
      return a.id - b.id;
    });

    return result;
  }, [detailedList, searchTerm, activeType, sortMode]);

  // Função para pré-carregar descrições de Pokémon do mesmo grupo
  const prefetchRelatedInsights = useCallback((pokemon: PokemonDetails) => {
    const mainType = pokemon.types[0].type.name;
    const related = detailedList
      .filter(p => p.types.some(t => t.type.name === mainType) && p.id !== pokemon.id)
      .slice(0, 6);

    related.forEach((p) => {
      if (!descriptionsCache[p.name]) {
        getProfessorInsight(p).then(insight => {
          setDescriptionsCache(prev => ({ ...prev, [p.name]: insight }));
        });
      }
    });
  }, [detailedList, descriptionsCache]);

  const handleSelectPokemon = useCallback((pokemon: PokemonDetails) => {
    setSelectedPokemon(pokemon);
    // Dispara prefetch dos relacionados em background
    prefetchRelatedInsights(pokemon);
  }, [prefetchRelatedInsights]);

  useEffect(() => {
    if (listIndex >= filteredPokemon.length && filteredPokemon.length > 0) {
      setListIndex(0);
    }
  }, [filteredPokemon, listIndex]);

  // Auto-carrega mais quando o índice está próximo do final
  useEffect(() => {
    if (focusArea === 'list' && filteredPokemon.length > 0) {
      const threshold = Math.max(filteredPokemon.length - 10, 0);
      if (listIndex >= threshold && hasMore && !loadingMore) {
        loadMorePokemon();
      }
    }
  }, [listIndex, filteredPokemon.length, focusArea, hasMore, loadingMore, loadMorePokemon]);

  const handleDpad = (direction: 'up' | 'down' | 'left' | 'right') => {
    if (selectedPokemon && modalActionRef.current) {
      modalActionRef.current.onDpad(direction);
      return;
    }

    if (focusArea === 'list') {
      if (direction === 'up') {
        if (listIndex === 0) setFocusArea('search');
        else setListIndex(prev => prev - 1);
      }
      if (direction === 'down') {
        if (listIndex < filteredPokemon.length - 1) setListIndex(prev => prev + 1);
      }
    } else if (focusArea === 'search') {
      if (direction === 'down') setFocusArea('list');
      if (direction === 'up') setFocusArea('filter');
    } else if (focusArea === 'filter') {
      if (direction === 'down') setFocusArea('search');
      if (direction === 'left') setFilterOptionIdx(0);
      if (direction === 'right') setFilterOptionIdx(1);
    } else if (focusArea === 'keyboard') {
      if (direction === 'up') setKbRow(prev => Math.max(0, prev - 1));
      if (direction === 'down') setKbRow(prev => Math.min(KEYBOARD_LAYOUT.length - 1, prev + 1));
      if (direction === 'left') setKbCol(prev => Math.max(0, prev - 1));
      if (direction === 'right') {
        const maxCol = KEYBOARD_LAYOUT[kbRow].length - 1;
        setKbCol(prev => Math.min(maxCol, prev + 1));
      }
    }
  };

  const handleActionA = async () => {
    if (selectedPokemon && modalActionRef.current) {
      modalActionRef.current.onA();
      return;
    }

    if (focusArea === 'filter') {
      if (filterOptionIdx === 0) {
        const nextIdx = (FILTER_TYPES.indexOf(activeType) + 1) % FILTER_TYPES.length;
        setActiveType(FILTER_TYPES[nextIdx]);
      } else {
        const nextIdx = (SORT_MODES.indexOf(sortMode) + 1) % SORT_MODES.length;
        setSortMode(SORT_MODES[nextIdx]);
      }
      return;
    }

    if (focusArea === 'search') {
      setFocusArea('keyboard');
      return;
    }

    if (focusArea === 'keyboard') {
      const key = KEYBOARD_LAYOUT[kbRow][kbCol];
      if (key === 'FECHAR') setFocusArea('list');
      else if (key === 'DEL') setSearchTerm(prev => prev.slice(0, -1));
      else if (key === 'LIMPAR') setSearchTerm('');
      else setSearchTerm(prev => prev + key);
      return;
    }

    if (focusArea === 'list' && filteredPokemon[listIndex]) {
      handleSelectPokemon(filteredPokemon[listIndex]);
    }
  };

  const handleActionB = () => {
    if (selectedPokemon && modalActionRef.current) {
      modalActionRef.current.onB();
      return;
    }
    if (focusArea === 'keyboard') setFocusArea('search');
    else if (focusArea === 'search' || focusArea === 'list' || focusArea === 'filter') {
      if (searchTerm || activeType !== 'TODOS' || sortMode !== 'Nº') {
        setSearchTerm('');
        setActiveType('TODOS');
        setSortMode('Nº');
        setListIndex(0);
        setFocusArea('list');
      }
    }
  };

  useEffect(() => {
    if (!selectedPokemon && focusArea === 'list') {
      const activeEl = document.querySelector('.mini-card.selected');
      if (activeEl) activeEl.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }
  }, [listIndex, selectedPokemon, focusArea]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch(e.key) {
        case 'ArrowUp': handleDpad('up'); break;
        case 'ArrowDown': handleDpad('down'); break;
        case 'ArrowLeft': handleDpad('left'); break;
        case 'ArrowRight': handleDpad('right'); break;
        case 'z': case 'Enter': handleActionA(); break;
        case 'x': case 'Escape': handleActionB(); break;
        case 's': setFocusArea('search'); break;
        case 'f': setFocusArea('filter'); break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [filteredPokemon, listIndex, selectedPokemon, focusArea, kbRow, kbCol, filterOptionIdx, activeType, sortMode, handleActionA, handleActionB, handleDpad]);

  return (
    <div className="gb-body">
      <div className="gb-screen-frame">
        <div className="power-light"></div>
        <div className="gb-lcd">
          <div className="pokedex-screen-content">
            {/* Header */}
            <div className="bg-black/10 p-2 border-b border-black/20 flex justify-between items-center">
              <span className="gb-font text-[7px] tracking-tight">POKÉDEX IA PRO</span>
              <span className="text-[8px] font-bold">{filteredPokemon.length} PKMN</span>
            </div>

            {/* Menu de Filtros (Select/Start) */}
            <div className={`p-1 flex gap-1 bg-black/5 border-b border-black/10 text-[6px] gb-font ${focusArea === 'filter' ? 'bg-black/20 ring-1 ring-black inset' : ''}`}>
               <div className={`flex-1 p-1 rounded ${focusArea === 'filter' && filterOptionIdx === 0 ? 'bg-black text-white' : ''}`}>
                  TIPO: {activeType}
               </div>
               <div className={`flex-1 p-1 rounded ${focusArea === 'filter' && filterOptionIdx === 1 ? 'bg-black text-white' : ''}`}>
                  ORD: {sortMode}
               </div>
            </div>

            {/* Display de Busca */}
            <div 
              className={`p-2 transition-colors ${focusArea === 'search' ? 'bg-black/20 ring-1 ring-black inset shadow-inner' : ''}`}
            >
              <div className="bg-white/40 p-1 flex items-center gap-2 border border-black/10">
                <i className="fas fa-search text-[8px]"></i>
                <span className="gb-font text-[9px] truncate uppercase">
                  {searchTerm || 'BUSCAR...'}
                </span>
              </div>
            </div>

            {/* Teclado Virtual Retro */}
            {focusArea === 'keyboard' && (
              <div className="absolute inset-0 top-[85px] bg-slate-200 z-30 p-2 border-t-2 border-black flex flex-col animate-in slide-in-from-bottom duration-200">
                <div className="bg-white p-2 mb-2 border border-black/20 shadow-inner flex justify-between items-center">
                   <span className="gb-font text-[10px]">{searchTerm || '_'}</span>
                   <span className="text-[7px] text-slate-400">NOMES</span>
                </div>
                <div className="grid gap-1 flex-grow">
                  {KEYBOARD_LAYOUT.map((row, rIdx) => (
                    <div key={rIdx} className="flex gap-1 justify-center">
                      {row.map((key, cIdx) => (
                        <button key={key} className={`flex-1 p-1 text-[8px] gb-font border transition-all ${kbRow === rIdx && kbCol === cIdx ? 'bg-black text-white scale-110 z-10 shadow-lg' : 'bg-white text-black border-black/10'}`}>
                          {key}
                        </button>
                      ))}
                    </div>
                  ))}
                </div>
                <div className="mt-2 text-[6px] text-center font-bold text-slate-500 uppercase">
                   A: INSERIR | B: VOLTAR
                </div>
              </div>
            )}

            {/* Lista Principal com Avatar */}
            <div 
              ref={listContainerRef}
              className={`pokemon-list-mini ${focusArea === 'keyboard' ? 'opacity-5 grayscale' : ''}`}
            >
              {loading ? (
                <div className="flex flex-col items-center justify-center h-full gap-2">
                  <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin"></div>
                  <span className="gb-font text-[6px] opacity-40">PROCESSANDO...</span>
                </div>
              ) : filteredPokemon.length === 0 ? (
                <div className="text-center p-8 gb-font text-[6px] opacity-40">SEM REGISTROS</div>
              ) : (
                <>
                  {filteredPokemon.map((p, idx) => (
                    <div 
                      key={p.name} 
                      className={`mini-card ${idx === listIndex && focusArea === 'list' ? 'selected' : ''}`}
                      onClick={() => { setFocusArea('list'); setListIndex(idx); }}
                    >
                      <div className="w-8 h-8 flex-shrink-0 mr-2 bg-white/60 rounded border border-black/5 flex items-center justify-center shadow-sm">
                        <img 
                          src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.id}.png`}
                          className="w-full h-full object-contain pixelated"
                          alt=""
                          loading="lazy"
                        />
                      </div>
                      <div className="flex flex-col flex-1 min-w-0">
                        <span className="text-[11px] font-black uppercase tracking-tighter truncate">{p.name}</span>
                        <div className="flex gap-1 overflow-hidden">
                          {p.types.map(t => <span key={t.type.name} className="text-[5px] gb-font opacity-40">{t.type.name}</span>)}
                        </div>
                      </div>
                      <div className="ml-2 flex flex-col items-end opacity-50 flex-shrink-0">
                         <span className="text-[5px] gb-font">HP:{p.stats.find(s=>s.stat.name==='hp')?.base_stat}</span>
                         <span className="text-[5px] gb-font">XP:{p.base_experience}</span>
                      </div>
                    </div>
                  ))}
                  
                  {/* Indicador de carregamento de mais itens */}
                  {loadingMore && (
                    <div className="flex items-center justify-center p-4 gap-2">
                      <div className="w-3 h-3 border border-black/20 border-t-black rounded-full animate-spin"></div>
                      <span className="gb-font text-[6px] opacity-40">CARREGANDO...</span>
                    </div>
                  )}
                  
                  {/* Indicador de fim da lista */}
                  {!hasMore && filteredPokemon.length > 0 && (
                    <div className="text-center p-4 gb-font text-[6px] opacity-40">
                      FIM DA LISTA
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="bg-black/10 p-1 text-center border-t border-black/20 text-[6px] gb-font">
               A:VER | B:RESET | SELECT:FILTRO
            </div>
          </div>

          {selectedPokemon && (
            <div className="absolute inset-0 bg-white z-50 overflow-hidden p-2 animate-in fade-in slide-in-from-bottom-4 duration-200">
               <PokemonDetailsModal 
                  pokemon={selectedPokemon} 
                  allPokemon={detailedList}
                  onClose={() => setSelectedPokemon(null)}
                  initialInsight={descriptionsCache[selectedPokemon.name]}
                  isGameBoyMode={true}
                  actionRef={modalActionRef}
                  onSelectOther={(other) => handleSelectPokemon(other)}
               />
            </div>
          )}
        </div>
        <div className="gb-logo">
          GAME BOY <span className="gb-color-text"><span>C</span><span>O</span><span>L</span><span>O</span><span>R</span></span>
        </div>
      </div>

      <div className="dpad">
        <div className="dpad-btn dpad-up" onClick={() => handleDpad('up')}></div>
        <div className="dpad-btn dpad-down" onClick={() => handleDpad('down')}></div>
        <div className="dpad-btn dpad-left" onClick={() => handleDpad('left')}></div>
        <div className="dpad-btn dpad-right" onClick={() => handleDpad('right')}></div>
      </div>

      <div className="action-btns">
        <div className="btn-circle" onClick={handleActionB}>B</div>
        <div className="btn-circle" onClick={handleActionA}>A</div>
      </div>

      <div className="system-btns">
        <div className="btn-pill" title="SELECT" onClick={() => setFocusArea('filter')}></div>
        <div className="btn-pill" title="START" onClick={() => setFocusArea('search')}></div>
      </div>

      <div className="speaker">
        {[...Array(12)].map((_, i) => <div key={i} className="speaker-hole"></div>)}
      </div>

      <style>{`
        .pixelated { image-rendering: pixelated; }
        .mini-card.selected { border-color: black; background: rgba(255,255,255,0.4); }
        @keyframes bounce-x {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(-3px); }
        }
      `}</style>
    </div>
  );
};

export default App;