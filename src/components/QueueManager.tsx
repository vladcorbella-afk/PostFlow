import React, { useState } from 'react';
import { 
  CalendarClock, 
  Send, 
  Edit3, 
  Trash2, 
  Clock, 
  Instagram, 
  Facebook, 
  Layers, 
  AlertCircle,
  PlusCircle,
  CheckCircle,
  Filter
} from 'lucide-react';
import { Post, TargetPlatform } from '../types';

interface QueueManagerProps {
  scheduledPosts: Post[];
  onCancelPost: (id: string) => void;
  onEditPost: (post: Post) => void;
  onPublishNowFromQueue: (post: Post) => Promise<void>;
  onCreateNewClick: () => void;
}

export const QueueManager: React.FC<QueueManagerProps> = ({
  scheduledPosts,
  onCancelPost,
  onEditPost,
  onPublishNowFromQueue,
  onCreateNewClick,
}) => {
  const [platformFilter, setPlatformFilter] = useState<'all' | TargetPlatform>('all');
  const [publishingId, setPublishingId] = useState<string | null>(null);

  const filteredPosts = scheduledPosts.filter((p) => {
    if (platformFilter === 'all') return true;
    if (p.platforms === 'both') return true;
    return p.platforms === platformFilter;
  });

  const formatDateTime = (isoDate: string | null) => {
    if (!isoDate) return 'Sem data definida';
    const date = new Date(isoDate);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const getRelativeTimeLabel = (isoDate: string | null) => {
    if (!isoDate) return '';
    const diffMs = new Date(isoDate).getTime() - Date.now();
    if (diffMs <= 0) return 'Horário atingido (Pronto para envio)';
    
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (diffHours >= 24) {
      const days = Math.floor(diffHours / 24);
      return `Em ${days} dia${days > 1 ? 's' : ''}`;
    }
    if (diffHours > 0) {
      return `Em ~${diffHours}h ${diffMins}m`;
    }
    return `Em ~${diffMins} minutos`;
  };

  const handlePublishNow = async (post: Post) => {
    setPublishingId(post.id);
    try {
      await onPublishNowFromQueue(post);
    } finally {
      setPublishingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header do Gerenciador de Fila */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#111827] p-5 rounded-2xl border border-slate-800 shadow-xl">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <CalendarClock className="w-5 h-5 text-purple-400" />
            <span>Fila de Agendamentos Meta</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30">
              {scheduledPosts.length} agendados
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Gerencie publicações na fila. Você pode adiantar a publicação, editar o conteúdo ou cancelar a qualquer momento.
          </p>
        </div>

        {/* Filtros e Ação */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1 text-xs">
            <button
              onClick={() => setPlatformFilter('all')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                platformFilter === 'all'
                  ? 'bg-purple-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setPlatformFilter('instagram')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                platformFilter === 'instagram'
                  ? 'bg-pink-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Instagram
            </button>
            <button
              onClick={() => setPlatformFilter('facebook')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                platformFilter === 'facebook'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Facebook
            </button>
          </div>

          <button
            onClick={onCreateNewClick}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer whitespace-nowrap"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Novo Post</span>
          </button>
        </div>
      </div>

      {/* Lista de Posts Agendados */}
      {filteredPosts.length === 0 ? (
        <div className="bg-[#111827] rounded-2xl border border-dashed border-slate-800 p-12 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-slate-900 text-slate-500 flex items-center justify-center mx-auto">
            <CalendarClock className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-200">
              Nenhuma publicação na fila de agendamento
            </h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
              {platformFilter !== 'all'
                ? `Nenhum post agendado para o filtro "${platformFilter}".`
                : 'Crie seu primeiro post no painel de criação e defina uma data e horário de disparo.'}
            </p>
          </div>
          <button
            onClick={onCreateNewClick}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-900/30 transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Criar Publicação Agora</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredPosts.map((post) => (
            <div
              key={post.id}
              className="bg-[#111827] border border-slate-800 hover:border-slate-700 rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col justify-between space-y-4 group transition-all"
            >
              {/* Top: Status & Destino */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20">
                    <Clock className="w-3 h-3 animate-pulse" />
                    <span>{getRelativeTimeLabel(post.scheduledFor)}</span>
                  </span>
                </div>

                {/* Badges de Plataforma */}
                <div className="flex items-center gap-1.5">
                  {(post.platforms === 'instagram' || post.platforms === 'both') && (
                    <span
                      title="Destinado ao Instagram"
                      className="w-6 h-6 rounded-lg bg-pink-500/15 border border-pink-500/30 text-pink-400 flex items-center justify-center"
                    >
                      <Instagram className="w-3.5 h-3.5" />
                    </span>
                  )}
                  {(post.platforms === 'facebook' || post.platforms === 'both') && (
                    <span
                      title="Destinado ao Facebook"
                      className="w-6 h-6 rounded-lg bg-blue-500/15 border border-blue-500/30 text-blue-400 flex items-center justify-center"
                    >
                      <Facebook className="w-3.5 h-3.5" />
                    </span>
                  )}
                </div>
              </div>

              {/* Informações Centrais: Mídia e Legenda */}
              <div className="flex items-start gap-3.5">
                <div className="w-20 h-20 rounded-xl bg-slate-900 border border-slate-800 overflow-hidden shrink-0">
                  {post.mediaType === 'video' ? (
                    <video
                      src={post.mediaUrl}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <img
                      src={post.mediaUrl}
                      alt="Thumbnail"
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="text-xs text-slate-400 flex items-center gap-1 mb-1 font-mono">
                    <CalendarClock className="w-3 h-3 text-slate-500" />
                    <span>{formatDateTime(post.scheduledFor)}</span>
                  </div>
                  <p className="text-xs text-slate-200 line-clamp-3 leading-relaxed">
                    {post.caption}
                  </p>
                </div>
              </div>

              {/* Barra de Ações: Adiantar, Editar, Cancelar */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-800/80">
                <button
                  onClick={() => onCancelPost(post.id)}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors cursor-pointer"
                  title="Cancelar Agendamento"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Cancelar</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onEditPost(post)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-colors cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Editar</span>
                  </button>

                  <button
                    onClick={() => handlePublishNow(post)}
                    disabled={publishingId === post.id}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{publishingId === post.id ? 'Publicando...' : 'Publicar Agora'}</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
