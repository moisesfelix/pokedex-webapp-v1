export const speakText = (text: string, onEnd?: () => void): void => {
    if (!('speechSynthesis' in window)) {
        console.error("Seu navegador não suporta síntese de fala.");
        if (onEnd) onEnd();
        return;
    }

    // Cancela qualquer fala anterior
    stopSpeech();

    const utterance = new SpeechSynthesisUtterance(text);

    // Configuração estilo "Pokédex"
    utterance.rate = 1.1;
    utterance.pitch = 1.0;

    // Tenta encontrar uma voz em Português
    const voices = window.speechSynthesis.getVoices();
    const ptVoice = voices.find(v => v.lang.includes('pt-BR') || v.lang.includes('pt-PT'));
    if (ptVoice) utterance.voice = ptVoice;

    utterance.onend = () => { if (onEnd) onEnd(); };
    utterance.onerror = () => { if (onEnd) onEnd(); };

    window.speechSynthesis.speak(utterance);
};

export const stopSpeech = (): void => {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
    }
};

// Garante carregamento das vozes no Chrome
if ('speechSynthesis' in window) {
    window.speechSynthesis.onvoiceschanged = () => { window.speechSynthesis.getVoices(); };
}

