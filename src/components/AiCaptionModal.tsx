import React, { useState } from 'react';
import { 
  Sparkles, 
  X, 
  Copy, 
  Check, 
  ArrowRight, 
  Loader2, 
  Wand2, 
  Hash, 
  MessageSquareQuote,
  Clock
} from 'lucide-react';
import { AICaptionOption } from '../types';
import { generateAICaptions } from '../services/metaGraphService';

interface AiCaptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCaption: (captionText: string) => void;
  initialIdea?: string;
  targetPlatforms: string[];
}

export const AiCaptionModal: React.FC<AiCaptionModalProps> = ({
  isOpen,
  onClose,
  onSelectCaption,
  initialIdea = '',
  targetPlatforms,
}) => {
  const [idea, setIdea] = useState(initialIdea);
  const [tone, setTone] = useState('persuasivo');
  const [niche, setNiche] = useState('tecnologia');
  const [includeCta, setIncludeCta] = useState(true);
  const [includeHashtags, setIncludeHashtags] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [variations, setVariations] = useState<AICaptionOption[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (!idea.trim()) {
      setErrorMessage('Por favor, descreva a ideia ou objetivo do seu post.');
      return;
    }

    setErrorMessage(null);
    setIsLoading(true);

    try {
      const response = await generateAICaptions({
        idea,
        tone,
        niche,
        platforms: targetPlatforms,
        includeHashtags,
        includeCta,
      });

      if (response.success && response.data) {
        setVariations(response.data);
      } else {
        setErrorMessage(response.error || 'Não foi possível gerar a legenda no momento.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Erro de conexão com o serviço de IA.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const getFullCaptionString = (v: AICaptionOption) => {
    const parts = [v.caption];
    if (v.callToAction) parts.push(`\n\n${v.callToAction}`);
    if (v.hashtags && v.hashtags.length > 0) parts.push(`\n\n${v.hashtags.join(' ')}`);
    return parts.join('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#111827] border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header do Modal */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-pink-600 flex items-center justify-center shadow-md">
              <Sparkles className="w-5 h-5 text-amber-200" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Assistente de Legendas com IA Gemini
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  gemini-3.8-flash
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Gere cópias de alto engajamento, chamadas para ação (CTA) e hashtags sob medida.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corpo do Modal */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Formulário de Ideia */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Qual é a ideia, tema ou objetivo do post? *
              </label>
              <textarea
                value={idea}
                onChange={(e) => setIdea(e.target.value)}
                placeholder="Ex: Anúncio do novo recurso de automação do nosso software para agências e freelancers economizarem 10 horas por semana."
                rows={3}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-500"
              />
            </div>

            {/* Configurações de Tom e Nicho */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Tom de Voz
                </label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                >
                  <option value="persuasivo">🎯 Persuasivo &amp; Focado em Vendas</option>
                  <option value="descontraído">⚡ Descontraído &amp; Engajador</option>
                  <option value="profissional">👔 Profissional &amp; Corporativo</option>
                  <option value="storytelling">📖 Storytelling &amp; Emocional</option>
                  <option value="educativo">💡 Educativo &amp; Dicas Práticas</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Nicho de Conteúdo
                </label>
                <select
                  value={niche}
                  onChange={(e) => setNiche(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                >
                  <option value="tecnologia">💻 Tecnologia &amp; Inovação</option>
                  <option value="gastronomia">☕ Gastronomia &amp; Alimentos</option>
                  <option value="fitness">🏋️ Saúde, Fitness &amp; Bem-Estar</option>
                  <option value="moda">👗 Moda &amp; Estilo de Vida</option>
                  <option value="negocios">📈 Negócios, Finanças &amp; B2B</option>
                  <option value="turismo">✈️ Viagens &amp; Hospitalidade</option>
                  <option value="geral">🌟 Geral / Variado</option>
                </select>
              </div>
            </div>

            {/* Checkboxes de Opções Rápidas */}
            <div className="flex flex-wrap items-center gap-6 pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-300">
                <input
                  type="checkbox"
                  checked={includeCta}
                  onChange={(e) => setIncludeCta(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-purple-600 focus:ring-purple-500"
                />
                <span>Incluir Chamada para Ação (CTA)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-300">
                <input
                  type="checkbox"
                  checked={includeHashtags}
                  onChange={(e) => setIncludeHashtags(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-purple-600 focus:ring-purple-500"
                />
                <span>Incluir Hashtags Otimizadas</span>
              </label>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-800 text-rose-300 text-xs">
                {errorMessage}
              </div>
            )}

            {/* Botão de Disparo da IA */}
            <button
              onClick={handleGenerate}
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold text-sm shadow-lg shadow-purple-900/30 flex items-center justify-center gap-2 disabled:opacity-50 transition-all cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Criando variações de alta conversão...</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4" />
                  <span>Gerar 3 Variações com Gemini AI</span>
                </>
              )}
            </button>
          </div>

          {/* Lista de Resultados Gerados */}
          {variations.length > 0 && (
            <div className="space-y-4 pt-4 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Escolha a variação perfeita para o seu post:
                </h3>
              </div>

              <div className="space-y-4">
                {variations.map((v, idx) => {
                  const fullText = getFullCaptionString(v);

                  return (
                    <div
                      key={idx}
                      className="bg-slate-950/80 border border-slate-800 hover:border-purple-500/50 rounded-xl p-4 transition-all space-y-3 relative group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-extrabold text-purple-400 uppercase tracking-wide">
                          {v.title || `Variação #${idx + 1}`}
                        </span>

                        {v.recommendedBestTime && (
                          <div className="flex items-center gap-1 text-[11px] text-amber-400/90 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                            <Clock className="w-3 h-3" />
                            <span>{v.recommendedBestTime}</span>
                          </div>
                        )}
                      </div>

                      {/* Legenda principal */}
                      <p className="text-xs text-slate-200 leading-relaxed whitespace-pre-line">
                        {v.caption}
                      </p>

                      {/* CTA */}
                      {v.callToAction && (
                        <div className="flex items-start gap-2 text-xs text-slate-300 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                          <MessageSquareQuote className="w-3.5 h-3.5 text-pink-400 shrink-0 mt-0.5" />
                          <div>
                            <strong className="text-pink-300 font-semibold block text-[10px] uppercase">
                              Chamada para Ação (CTA):
                            </strong>
                            <span>{v.callToAction}</span>
                          </div>
                        </div>
                      )}

                      {/* Hashtags */}
                      {v.hashtags && v.hashtags.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {v.hashtags.map((tag, tagIdx) => (
                            <span
                              key={tagIdx}
                              className="text-[11px] text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20"
                            >
                              {tag.startsWith('#') ? tag : `#${tag}`}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Ações da Variação */}
                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800/80">
                        <button
                          onClick={() => handleCopy(fullText, idx)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white bg-slate-800/70 hover:bg-slate-800 transition-colors cursor-pointer"
                        >
                          {copiedIndex === idx ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              <span className="text-emerald-400">Copiado!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copiar</span>
                            </>
                          )}
                        </button>

                        <button
                          onClick={() => {
                            onSelectCaption(fullText);
                            onClose();
                          }}
                          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white shadow transition-colors cursor-pointer"
                        >
                          <span>Usar no Post</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
