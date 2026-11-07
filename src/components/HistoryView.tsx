import React, { useState } from 'react';
import { 
  History, 
  CheckCircle2, 
  ExternalLink, 
  Code2, 
  Instagram, 
  Facebook, 
  Calendar, 
  X, 
  Copy, 
  Check, 
  FileJson,
  Layers
} from 'lucide-react';
import { Post, TargetPlatform } from '../types';

interface HistoryViewProps {
  publishedPosts: Post[];
  onCreateNewClick: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  publishedPosts,
  onCreateNewClick,
}) => {
  const [selectedPostLogs, setSelectedPostLogs] = useState<Post | null>(null);
  const [platformFilter, setPlatformFilter] = useState<'all' | TargetPlatform>('all');
  const [copied, setCopied] = useState(false);

  const filteredPosts = publishedPosts.filter((p) => {
    if (platformFilter === 'all') return true;
    if (p.platforms === 'both') return true;
    return p.platforms === platformFilter;
  });

  const formatDateTime = (isoDate?: string) => {
    if (!isoDate) return 'Recentemente';
    const date = new Date(isoDate);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const handleCopyJson = (obj: any) => {
    navigator.clipboard.writeText(JSON.stringify(obj, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header do Histórico */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#111827] p-5 rounded-2xl border border-slate-800 shadow-xl">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <History className="w-5 h-5 text-emerald-400" />
            <span>Histórico de Publicações Concluídas</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
              {publishedPosts.length} publicadas
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Registro detalhado de todas as publicações enviadas com sucesso para a Meta Graph API.
          </p>
        </div>

        {/* Filtros */}
        <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1 text-xs">
          <button
            onClick={() => setPlatformFilter('all')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              platformFilter === 'all'
                ? 'bg-emerald-600 text-white shadow'
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
      </div>

      {/* Lista de Histórico */}
      {filteredPosts.length === 0 ? (
        <div className="bg-[#111827] rounded-2xl border border-dashed border-slate-800 p-12 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-slate-900 text-slate-500 flex items-center justify-center mx-auto">
            <History className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-200">
              Nenhuma publicação no histórico ainda
            </h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
              Assim que você clicar em "Publicar Agora" ou um post agendado for disparado, ele aparecerá aqui com seus respectivos IDs da Meta Graph API.
            </p>
          </div>
          <button
            onClick={onCreateNewClick}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-900/30 transition-all cursor-pointer"
          >
            <span>Publicar Meu Primeiro Post</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPosts.map((post) => {
            const hasIg = post.platforms === 'instagram' || post.platforms === 'both';
            const hasFb = post.platforms === 'facebook' || post.platforms === 'both';

            return (
              <div
                key={post.id}
                className="bg-[#111827] border border-slate-800 hover:border-slate-700 rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all"
              >
                {/* Lado Esquerdo: Mídia e Conteúdo */}
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-slate-900 border border-slate-800 overflow-hidden shrink-0">
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

                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Publicado</span>
                      </span>

                      <div className="flex items-center gap-1 text-[11px] text-slate-400 font-mono">
                        <Calendar className="w-3 h-3 text-slate-500" />
                        <span>{formatDateTime(post.publishedAt || post.createdAt)}</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-200 line-clamp-2 leading-relaxed">
                      {post.caption}
                    </p>

                    {/* IDs e Destinos */}
                    <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-slate-400">
                      {hasIg && (
                        <span className="flex items-center gap-1 text-pink-400 font-mono">
                          <Instagram className="w-3 h-3" />
                          <span>
                            IG:{' '}
                            {post.metaResponse?.instagram?.mediaId
                              ? `#${post.metaResponse.instagram.mediaId}`
                              : 'Ativo'}
                          </span>
                        </span>
                      )}

                      {hasFb && (
                        <span className="flex items-center gap-1 text-blue-400 font-mono">
                          <Facebook className="w-3 h-3" />
                          <span>
                            FB:{' '}
                            {post.metaResponse?.facebook?.photoId
                              ? `#${post.metaResponse.facebook.photoId}`
                              : 'Ativo'}
                          </span>
                        </span>
                      )}

                      {post.metaResponse?.isSandbox && (
                        <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-bold">
                          Sandbox Meta
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Lado Direito: Ações e Inspetor de API */}
                <div className="flex items-center gap-2 w-full md:w-auto justify-end border-t md:border-t-0 pt-3 md:pt-0 border-slate-800/80">
                  <button
                    onClick={() => setSelectedPostLogs(post)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-colors cursor-pointer"
                  >
                    <Code2 className="w-3.5 h-3.5 text-purple-400" />
                    <span>Detalhes da API</span>
                  </button>

                  {/* Link externo para o post */}
                  {(post.metaResponse?.instagram?.permalink || post.metaResponse?.facebook?.permalink) && (
                    <a
                      href={
                        post.metaResponse?.instagram?.permalink ||
                        post.metaResponse?.facebook?.permalink ||
                        '#'
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow transition-colors"
                    >
                      <span>Ver na Rede</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL INSPETOR DE DETALHES DA API META */}
      {selectedPostLogs && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#111827] border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/70">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-purple-600/20 text-purple-400 flex items-center justify-center">
                  <FileJson className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    Logs &amp; Resposta do Meta Graph API
                  </h3>
                  <p className="text-[11px] text-slate-400 font-mono">
                    ID Post Interno: {selectedPostLogs.id}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedPostLogs(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-4">
              {/* Logs passo-a-passo */}
              <div>
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Trace de Execução da API:
                </h4>
                <div className="bg-slate-950 rounded-xl p-3 border border-slate-800 font-mono text-xs text-slate-300 space-y-1.5">
                  {selectedPostLogs.metaResponse?.logs && selectedPostLogs.metaResponse.logs.length > 0 ? (
                    selectedPostLogs.metaResponse.logs.map((log, i) => (
                      <div key={i} className="text-slate-300 leading-relaxed">
                        {log}
                      </div>
                    ))
                  ) : (
                    <div className="text-slate-500 italic">
                      [Meta Graph API v19.0] Requisição processada com status 200 OK.
                    </div>
                  )}
                </div>
              </div>

              {/* JSON Payload Completo */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Payload de Resposta da Meta (JSON):
                  </h4>
                  <button
                    onClick={() => handleCopyJson(selectedPostLogs.metaResponse)}
                    className="flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300"
                  >
                    {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copied ? 'Copiado!' : 'Copiar JSON'}</span>
                  </button>
                </div>

                <pre className="bg-slate-950 rounded-xl p-4 border border-slate-800 font-mono text-xs text-emerald-400 overflow-x-auto max-h-60">
                  {JSON.stringify(selectedPostLogs.metaResponse, null, 2)}
                </pre>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-900/60 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedPostLogs(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
