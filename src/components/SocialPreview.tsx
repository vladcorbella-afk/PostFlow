import React, { useState } from 'react';
import { 
  Instagram, 
  Facebook, 
  Heart, 
  MessageCircle, 
  Send, 
  Bookmark, 
  MoreHorizontal, 
  Globe, 
  ThumbsUp, 
  Share2, 
  CheckCircle,
  Eye,
  Maximize2
} from 'lucide-react';
import { TargetPlatform, MetaCredentials } from '../types';

interface SocialPreviewProps {
  mediaUrl: string;
  mediaType: 'image' | 'video';
  caption: string;
  platforms: TargetPlatform;
  credentials: MetaCredentials;
}

export const SocialPreview: React.FC<SocialPreviewProps> = ({
  mediaUrl,
  mediaType,
  caption,
  platforms,
  credentials,
}) => {
  const [activeNetwork, setActiveNetwork] = useState<'instagram' | 'facebook'>('instagram');
  const [isLiked, setIsLiked] = useState(false);
  const [isFbLiked, setIsFbLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showFullCaption, setShowFullCaption] = useState(false);

  // Fallbacks de apresentação
  const displayAvatar = credentials.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80';
  const displayIgHandle = credentials.igHandle || 'suaempresa.oficial';
  const displayPageName = credentials.pageName || 'Sua Empresa Oficial';
  const displayMedia = mediaUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80';

  // Formatador para destacar hashtags em azul nos feeds
  const renderFormattedCaption = (text: string) => {
    if (!text) return <span className="text-slate-400 italic">Sua legenda aparecerá aqui...</span>;

    const parts = text.split(/(#[a-zA-Z0-9_À-ÿ]+)/g);
    return parts.map((part, index) => {
      if (part.startsWith('#')) {
        return (
          <span key={index} className="text-blue-500 font-medium hover:underline cursor-pointer">
            {part}
          </span>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <div className="bg-[#111827] rounded-2xl border border-slate-800 p-4 lg:p-6 shadow-xl flex flex-col h-full">
      {/* Header com Seletor de Rede */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-purple-400" />
          <h3 className="font-bold text-sm text-slate-100 tracking-wide uppercase">
            Pré-Visualização Realista
          </h3>
        </div>

        {/* Abas Instagram vs Facebook */}
        <div className="flex items-center bg-slate-900/90 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveNetwork('instagram')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeNetwork === 'instagram'
                ? 'bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Instagram className="w-3.5 h-3.5" />
            <span>Instagram Feed</span>
          </button>

          <button
            onClick={() => setActiveNetwork('facebook')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeNetwork === 'facebook'
                ? 'bg-[#1877F2] text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Facebook className="w-3.5 h-3.5" />
            <span>Facebook Feed</span>
          </button>
        </div>
      </div>

      {/* Conteúdo da Pré-Visualização */}
      <div className="flex-1 flex items-center justify-center p-2 sm:p-4 bg-slate-950/60 rounded-xl border border-slate-800/60 overflow-hidden">
        {/* ======================================= */}
        {/* MOCKUP DO INSTAGRAM */}
        {/* ======================================= */}
        {activeNetwork === 'instagram' && (
          <div className="w-full max-w-[420px] bg-black text-white rounded-2xl border border-neutral-800 overflow-hidden shadow-2xl transition-all">
            {/* Top Bar / Profile Header */}
            <div className="flex items-center justify-between px-3.5 py-3 border-b border-neutral-900">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full p-[2px] bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600">
                  <img
                    src={displayAvatar}
                    alt={displayIgHandle}
                    className="w-full h-full object-cover rounded-full border border-black"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-bold hover:underline cursor-pointer">
                      {displayIgHandle}
                    </span>
                    <CheckCircle className="w-3 h-3 text-blue-500 fill-blue-500 inline" />
                  </div>
                  <span className="text-[10px] text-neutral-400 block leading-tight">
                    São Paulo, Brasil
                  </span>
                </div>
              </div>
              <button className="text-neutral-300 hover:text-white p-1">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>

            {/* Media Area */}
            <div className="relative bg-neutral-950 aspect-square flex items-center justify-center overflow-hidden">
              {mediaType === 'video' ? (
                <video
                  src={displayMedia}
                  controls
                  className="w-full h-full object-cover"
                />
              ) : (
                <img
                  src={displayMedia}
                  alt="Pré-visualização do post"
                  className="w-full h-full object-cover select-none"
                />
              )}
            </div>

            {/* Actions Toolbar */}
            <div className="px-3.5 pt-3 pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setIsLiked(!isLiked)}
                    className="transition-transform active:scale-125"
                    title="Curtir"
                  >
                    <Heart
                      className={`w-6 h-6 transition-colors ${
                        isLiked ? 'text-red-500 fill-red-500' : 'text-neutral-200 hover:text-neutral-400'
                      }`}
                    />
                  </button>
                  <button title="Comentar" className="hover:opacity-75">
                    <MessageCircle className="w-6 h-6 -rotate-90 text-neutral-200" />
                  </button>
                  <button title="Enviar" className="hover:opacity-75">
                    <Send className="w-5 h-5 text-neutral-200 -rotate-12" />
                  </button>
                </div>
                <button
                  onClick={() => setIsSaved(!isSaved)}
                  title="Salvar"
                  className="hover:opacity-75"
                >
                  <Bookmark
                    className={`w-6 h-6 ${
                      isSaved ? 'text-white fill-white' : 'text-neutral-200'
                    }`}
                  />
                </button>
              </div>

              {/* Curtidas */}
              <div className="text-xs font-bold mt-2.5 text-neutral-100">
                {isLiked ? '1.429 curtidas' : '1.428 curtidas'}
              </div>

              {/* Legenda com quebras de linha e ler mais */}
              <div className="text-xs text-neutral-200 mt-1.5 leading-relaxed break-words whitespace-pre-line">
                <span className="font-bold mr-1.5 text-white">{displayIgHandle}</span>
                {showFullCaption || caption.length <= 130 ? (
                  renderFormattedCaption(caption)
                ) : (
                  <>
                    {renderFormattedCaption(caption.slice(0, 130))}
                    <button
                      onClick={() => setShowFullCaption(true)}
                      className="text-neutral-400 hover:text-neutral-200 ml-1 text-xs"
                    >
                      ...mais
                    </button>
                  </>
                )}
              </div>

              {/* Comentários simulados */}
              <div className="text-[11px] text-neutral-400 mt-1.5 cursor-pointer hover:underline">
                Ver todos os 28 comentários
              </div>

              {/* Data / Tempo */}
              <div className="text-[9px] uppercase tracking-wider text-neutral-400 mt-1.5">
                Há 15 minutos · Ver tradução
              </div>
            </div>
          </div>
        )}

        {/* ======================================= */}
        {/* MOCKUP DO FACEBOOK */}
        {/* ======================================= */}
        {activeNetwork === 'facebook' && (
          <div className="w-full max-w-[440px] bg-[#242526] text-[#E4E6EB] rounded-2xl border border-neutral-700/60 overflow-hidden shadow-2xl transition-all">
            {/* Header da Página */}
            <div className="flex items-center justify-between p-3.5">
              <div className="flex items-center gap-3">
                <img
                  src={displayAvatar}
                  alt={displayPageName}
                  className="w-10 h-10 rounded-full object-cover border border-neutral-600"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-semibold hover:underline cursor-pointer text-[#E4E6EB]">
                      {displayPageName}
                    </span>
                    <span className="w-3.5 h-3.5 rounded-full bg-[#1877F2] text-white flex items-center justify-center text-[9px] font-bold">
                      ✓
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-[#B0B3B8]">
                    <span>Publicado por Meta Graph API</span>
                    <span>·</span>
                    <span>Agora mesmo</span>
                    <span>·</span>
                    <Globe className="w-3 h-3 text-[#B0B3B8]" />
                  </div>
                </div>
              </div>
              <button className="text-[#B0B3B8] hover:text-white p-1 rounded-full hover:bg-neutral-700/50">
                <MoreHorizontal className="w-5 h-5" />
              </button>
            </div>

            {/* Texto da Publicação do Facebook */}
            <div className="px-3.5 pb-2.5 text-sm text-[#E4E6EB] leading-relaxed break-words whitespace-pre-line">
              {renderFormattedCaption(caption)}
            </div>

            {/* Imagem / Mídia do Post */}
            <div className="w-full bg-neutral-900 aspect-square sm:aspect-[4/3] overflow-hidden flex items-center justify-center">
              {mediaType === 'video' ? (
                <video
                  src={displayMedia}
                  controls
                  className="w-full h-full object-cover"
                />
              ) : (
                <img
                  src={displayMedia}
                  alt="Post Facebook"
                  className="w-full h-full object-cover"
                />
              )}
            </div>

            {/* Barra de Reações e Contadores */}
            <div className="px-3.5 py-2 flex items-center justify-between border-b border-neutral-700/50 text-xs text-[#B0B3B8]">
              <div className="flex items-center gap-1.5">
                <div className="flex -space-x-1">
                  <span className="w-4 h-4 rounded-full bg-[#1877F2] text-white flex items-center justify-center text-[10px]">
                    👍
                  </span>
                  <span className="w-4 h-4 rounded-full bg-[#FA3E3E] text-white flex items-center justify-center text-[10px]">
                    ❤️
                  </span>
                  <span className="w-4 h-4 rounded-full bg-[#F7B125] text-white flex items-center justify-center text-[10px]">
                    😮
                  </span>
                </div>
                <span>{isFbLiked ? '353' : '352'}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="hover:underline cursor-pointer">48 comentários</span>
                <span>·</span>
                <span className="hover:underline cursor-pointer">12 compartilhamentos</span>
              </div>
            </div>

            {/* Botões de Ação do Facebook */}
            <div className="grid grid-cols-3 py-1 px-2 text-xs font-semibold text-[#B0B3B8]">
              <button
                onClick={() => setIsFbLiked(!isFbLiked)}
                className={`flex items-center justify-center gap-2 py-2 rounded-lg hover:bg-neutral-700/40 transition-colors ${
                  isFbLiked ? 'text-[#1877F2]' : 'hover:text-white'
                }`}
              >
                <ThumbsUp className={`w-4 h-4 ${isFbLiked ? 'fill-[#1877F2]' : ''}`} />
                <span>{isFbLiked ? 'Curtiu' : 'Curtir'}</span>
              </button>

              <button className="flex items-center justify-center gap-2 py-2 rounded-lg hover:bg-neutral-700/40 hover:text-white transition-colors">
                <MessageCircle className="w-4 h-4" />
                <span>Comentar</span>
              </button>

              <button className="flex items-center justify-center gap-2 py-2 rounded-lg hover:bg-neutral-700/40 hover:text-white transition-colors">
                <Share2 className="w-4 h-4" />
                <span>Compartilhar</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Nota de rodapé da prévia */}
      <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500">
        <span>Renderização nativa de feed Meta v19.0</span>
        <span className="text-slate-400 font-medium">
          Destino selecionado:{' '}
          <strong className="text-purple-400 capitalize">
            {platforms === 'both' ? 'Instagram & Facebook' : platforms}
          </strong>
        </span>
      </div>
    </div>
  );
};
