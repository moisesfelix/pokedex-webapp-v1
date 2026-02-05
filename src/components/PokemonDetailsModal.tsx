import React, { useState, useEffect, useRef, useMemo } from 'react';
import { PokemonDetails, TYPE_COLORS, TYPE_NAMES_PT } from '../types';
import { getProfessorInsight } from '../services/geminiService';
import { speakText, stopSpeech } from '../services/ttsService';
import MarkdownRenderer from './MarkdownRenderer';

interface ModalActions {
  onDpad: (dir: 'up' | 'down' | 'left' | 'right') => void;
  onA: () => void;
  onB: () => void;
}

interface PokemonDetailsModalProps {
  pokemon: PokemonDetails;
  allPokemon: PokemonDetails[];
  onClose: () => void;
  onSelectOther: (p: PokemonDetails) => void;
  initialInsight?: string;
  isGameBoyMode?: boolean;
  actionRef?: React.MutableRefObject<ModalActions | null>;
}

const PokemonDetailsModal: React.FC<PokemonDetailsModalProps> = ({ 
  pokemon, 
  allPokemon, 
  onClose, 
  onSelectOther, 
  initialInsight, 
  isGameBoyMode, 
  actionRef 
}) => {
  const [insight, setInsight] = useState<string>(initialInsight || '');
  const [loadingInsight, setLoadingInsight] = useState(!initialInsight);
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  // Áreas de Foco: 0: Header/Sair, 1: Ouvir Voz, 2: Texto IA, 3: Grupo
  const [focusArea, setFocusArea] = useState(1); 
  const [groupIndex, setGroupIndex] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);

  // --- HELPER FUNCTIONS (Para compatibilidade Híbrida) ---
  // Garante que funcione com backend novo (image: string) ou antigo (sprites.other...)
  const getImage = (p: any): string => {
    return p.image || p.sprites?.other?.['official-artwork']?.front_default || p.sprites?.front_default || '';
  };

  // Garante que funcione com backend novo (types: string[]) ou antigo (types: {type:{name}}[])
  const getTypeName = (t: any): string => {
    return typeof t === 'string' ? t : t.type.name;
  };

  const getTypeArray = (p: any): string[] => {
    if (!p.types) return [];
    return p.types.map((t: any) => getTypeName(t));
  };
  // -----------------------------------------------------

  // Lógica de grupo (Pokémon relacionados)
  const sameGroup = useMemo(() => {
    const pTypes = getTypeArray(pokemon);
    if (pTypes.length === 0) return [];
    const mainType = pTypes[0];

    return allPokemon.filter(p => {
      const otherTypes = getTypeArray(p);
      return otherTypes.includes(mainType) && p.id !== pokemon.id;
    }).slice(0, 10);
  }, [pokemon, allPokemon]);

  // Carregar Insight da IA
  useEffect(() => {
    const fetchInsight = async () => {
      if (initialInsight) {
        setInsight(initialInsight);
        setLoadingInsight(false);
        return;
      }
      setLoadingInsight(true);
      try {
        const text = await getProfessorInsight(pokemon);
        setInsight(text);
      } catch (error) {
        setInsight("Não foi possível acessar os dados do Professor Carvalho.");
      } finally {
        setLoadingInsight(false);
      }
    };
    fetchInsight();

    // Cleanup: Para a voz ao desmontar/fechar
    return () => {
      stopSpeech();
      setIsSpeaking(false);
    };
  }, [pokemon, initialInsight]);

  // Controle de Voz (Nativo)
  const handleSpeak = () => {
    if (isSpeaking) {
      stopSpeech();
      setIsSpeaking(false);
      return;
    }
    
    if (!insight) return;

    setIsSpeaking(true);
    // Remove markdown para leitura limpa
    const cleanText = insight.replace(/[#*`_]/g, '');
    
    speakText(cleanText, () => {
      setIsSpeaking(false);
    });
  };

  // Auto-scroll do grupo horizontal
  useEffect(() => {
    if (focusArea === 3) {
      const activeEl = document.querySelector('.group-item.selected');
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [groupIndex, focusArea]);

  // Controle D-PAD (Teclado/Gameboy)
  if (actionRef) {
    actionRef.current = {
      onDpad: (dir) => {
        if (focusArea === 2 && contentRef.current) {
          // Scroll texto
          const scrollAmount = dir === 'up' ? -40 : 40;
          contentRef.current.scrollBy({ top: scrollAmount, behavior: 'smooth' });
          if (dir === 'up' && contentRef.current.scrollTop < 10) setFocusArea(1);
          if (dir === 'down' && (contentRef.current.scrollHeight - contentRef.current.scrollTop - contentRef.current.clientHeight < 20)) setFocusArea(3);
        } else if (focusArea === 3) {
          // Navegação carrossel
          if (dir === 'left') setGroupIndex(prev => Math.max(0, prev - 1));
          if (dir === 'right') setGroupIndex(prev => Math.min(sameGroup.length - 1, prev + 1));
          if (dir === 'up') setFocusArea(2);
        } else {
          // Navegação vertical principal
          if (dir === 'up') setFocusArea(prev => Math.max(0, prev - 1));
          if (dir === 'down') setFocusArea(prev => Math.min(3, prev + 1));
        }
      },
      onA: () => {
        if (focusArea === 0) onClose();
        if (focusArea === 1) handleSpeak();
        if (focusArea === 3 && sameGroup[groupIndex]) onSelectOther(sameGroup[groupIndex]);
      },
      onB: () => {
        onClose();
      }
    };
  }

  if (!isGameBoyMode) return null;

  const currentTypes = getTypeArray(pokemon);

  return (
    <div className="flex flex-col h-full bg-white select-none relative overflow-hidden">
      {/* 0. Header */}
      <div className={`flex justify-between items-center px-2 py-1 border-b-2 border-black/10 z-10 ${focusArea === 0 ? 'bg-black/5 ring-1 ring-inset ring-black' : ''}`}>
         <h2 className="text-[10px] font-black capitalize tracking-tighter truncate w-32">{pokemon.name}</h2>
         <button 
           onClick={onClose} 
           className={`text-[6px] px-1 py-0.5 rounded gb-font ${focusArea === 0 ? 'bg-red-600 text-white' : 'bg-slate-200 text-slate-600'}`}
         >
           SAIR
         </button>
      </div>

      {/* Conteúdo Scrollável */}
      <div ref={contentRef} className="flex-grow overflow-y-auto p-2 space-y-3 scrollbar-hide">
         
         {/* Info Principal */}
         <div className="flex gap-2">
            <img 
               src={getImage(pokemon)} 
               className="w-20 h-20 bg-slate-50 rounded-lg border-2 border-black/5 object-contain pixelated"
               alt={pokemon.name}
            />
            <div className="text-[8px] flex flex-col gap-0.5 font-bold leading-tight">
               <p className="text-slate-400">#{String(pokemon.id).padStart(3, '0')}</p>
               <p>ALT: {(pokemon.height/10)}m</p>
               <p>PES: {(pokemon.weight/10)}kg</p>
               <div className="flex flex-wrap gap-1 mt-1">
                 {currentTypes.map(t => (
                   <span key={t} className={`${TYPE_COLORS[t] || 'bg-gray-500'} text-white px-1 rounded uppercase text-[6px]`}>
                     {TYPE_NAMES_PT[t] || t}
                   </span>
                 ))}
               </div>
            </div>
         </div>

         {/* 1. Botão Ouvir */}
         <button 
           onClick={handleSpeak}
           className={`w-full py-1.5 rounded text-[8px] gb-font border-2 transition-all ${
             focusArea === 1 
              ? 'border-black bg-indigo-600 text-white shadow-[2px_2px_0px_#000]' 
              : 'border-transparent bg-slate-100 text-slate-800'
           } ${isSpeaking ? 'animate-pulse' : ''}`}
         >
           {isSpeaking ? 'PARAR VOZ' : 'OUVIR POKEDEX'}
         </button>

         {/* 2. Texto IA */}
         <div className={`bg-slate-50 p-2 rounded border-2 transition-colors ${focusArea === 2 ? 'border-black bg-white shadow-inner' : 'border-black/5'} text-[9px]`}>
            <h3 className="font-bold border-b border-black/10 mb-2 pb-1 uppercase text-[7px] flex items-center gap-1">
              <i className="fas fa-microscope text-[8px]"></i> Notas do Professor
            </h3>
            {loadingInsight ? (
               <div className="flex items-center gap-2 animate-pulse py-4 justify-center">
                 <div className="w-1.5 h-1.5 bg-black/40 rounded-full animate-bounce"></div>
                 <span className="gb-font text-[6px]">SINTETIZANDO...</span>
               </div>
            ) : (
               <MarkdownRenderer content={insight} />
            )}
         </div>

         {/* 3. Grupo Relacionado */}
         <div className={`space-y-1 p-1 rounded border-2 transition-all ${focusArea === 3 ? 'border-black bg-slate-50 shadow-inner' : 'border-transparent'}`}>
            <h3 className="text-[7px] gb-font opacity-60 uppercase flex justify-between">
              <span>Mesmo Grupo</span>
              {focusArea === 3 && <span className="animate-pulse">A: VER</span>}
            </h3>
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
               {sameGroup.length > 0 ? sameGroup.map((p, i) => (
                 <div 
                  key={p.id}
                  className={`group-item flex-shrink-0 w-12 h-12 bg-white border-2 rounded flex items-center justify-center transition-all ${focusArea === 3 && groupIndex === i ? 'border-black scale-110 shadow-md selected' : 'border-black/5'}`}
                  onClick={() => onSelectOther(p)}
                 >
                   <img 
                      src={getImage(p)}
                      className="w-full h-full object-contain pixelated"
                      alt={p.name}
                   />
                 </div>
               )) : <div className="text-[6px] gb-font italic p-2 opacity-30 text-center w-full">Nenhum similar</div>}
            </div>
         </div>
         
         <div className="h-4"></div>
      </div>

      {/* Footer Hint */}
      <div className="text-[6px] font-bold text-center bg-black text-white/40 py-1">
        DPAD: NAVEGAR | A: SELECIONAR | B: VOLTAR
      </div>
    </div>
  );
};

export default PokemonDetailsModal;

