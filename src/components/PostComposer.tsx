import React, { useState, useRef } from 'react';
import { 
  UploadCloud, 
  Sparkles, 
  Calendar, 
  Send, 
  Image as ImageIcon, 
  Video, 
  Trash2, 
  Link, 
  Layers, 
  Instagram, 
  Facebook, 
  Clock, 
  AlertCircle,
  Loader2,
  CheckCircle2
} from 'lucide-react';
import { Post, TargetPlatform, MetaCredentials } from '../types';
import { SAMPLE_PRESETS, SamplePreset } from '../data/samplePresets';
import { AiCaptionModal } from './AiCaptionModal';

interface PostComposerProps {
  onPublishNow: (post: Omit<Post, 'id' | 'createdAt' | 'status'>) => Promise<void>;
  onSchedulePost: (post: Omit<Post, 'id' | 'createdAt' | 'status'>) => Promise<void>;
  editingPost: Post | null;
  onCancelEdit: () => void;
  credentials: MetaCredentials;
  onPreviewChange: (data: {
    mediaUrl: string;
    mediaType: 'image' | 'video';
    caption: string;
    platforms: TargetPlatform;
  }) => void;
}

export const PostComposer: React.FC<PostComposerProps> = ({
  onPublishNow,
  onSchedulePost,
  editingPost,
  onCancelEdit,
  credentials,
  onPreviewChange,
}) => {
  const [mediaUrl, setMediaUrl] = useState<string>(
    editingPost?.mediaUrl || SAMPLE_PRESETS[0].mediaUrl
  );
  const [mediaType, setMediaType] = useState<'image' | 'video'>(
    editingPost?.mediaType || 'image'
  );
  const [caption, setCaption] = useState<string>(
    editingPost?.caption || SAMPLE_PRESETS[0].caption
  );
  const [platforms, setPlatforms] = useState<TargetPlatform>(
    editingPost?.platforms || 'both'
  );
  const [scheduledFor, setScheduledFor] = useState<string>(
    editingPost?.scheduledFor ? editingPost.scheduledFor.slice(0, 16) : ''
  );
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionType, setActionType] = useState<'publish' | 'schedule' | null>(null);
  const [urlInputMode, setUrlInputMode] = useState(false);
  const [customUrl, setCustomUrl] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Notifica o SocialPreview em tempo real sempre que o usuário altera os campos
  const notifyPreview = (newMedia = mediaUrl, newType = mediaType, newCap = caption, newPlat = platforms) => {
    onPreviewChange({
      mediaUrl: newMedia,
      mediaType: newType,
      caption: newCap,
      platforms: newPlat,
    });
  };

  const handleCaptionChange = (val: string) => {
    setCaption(val);
    notifyPreview(mediaUrl, mediaType, val, platforms);
  };

  const handlePlatformToggle = (target: TargetPlatform) => {
    setPlatforms(target);
    notifyPreview(mediaUrl, mediaType, caption, target);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isVid = file.type.startsWith('video/');
    setMediaType(isVid ? 'video' : 'image');

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setMediaUrl(result);
      notifyPreview(result, isVid ? 'video' : 'image', caption, platforms);
    };
    reader.readAsDataURL(file);
  };

  const handleApplyPreset = (preset: SamplePreset) => {
    setMediaUrl(preset.mediaUrl);
    setMediaType(preset.mediaType);
    setCaption(preset.caption);
    setPlatforms(preset.platforms);
    notifyPreview(preset.mediaUrl, preset.mediaType, preset.caption, preset.platforms);
  };

  const handleApplyCustomUrl = () => {
    if (!customUrl.trim()) return;
    setMediaUrl(customUrl);
    notifyPreview(customUrl, mediaType, caption, platforms);
    setUrlInputMode(false);
  };

  const insertEmoji = (emoji: string) => {
    const updated = caption + ' ' + emoji;
    setCaption(updated);
    notifyPreview(mediaUrl, mediaType, updated, platforms);
  };

  const setShortcutTime = (hoursToAdd: number) => {
    const d = new Date();
    d.setHours(d.getHours() + hoursToAdd);
    // Formato YYYY-MM-DDTHH:mm
    const isoLocal = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
    setScheduledFor(isoLocal);
  };

  const setTomorrowTime = (hour: number) => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(hour, 0, 0, 0);
    const isoLocal = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
    setScheduledFor(isoLocal);
  };

  // Submissão imediata (Publicar Agora)
  const handleImmediatePublish = async () => {
    if (!caption.trim()) {
      setFeedback({ type: 'error', message: 'Por favor, escreva uma legenda para o post.' });
      return;
    }
    if (!mediaUrl) {
      setFeedback({ type: 'error', message: 'Selecione uma imagem ou vídeo para publicar.' });
      return;
    }

    setIsSubmitting(true);
    setActionType('publish');
    setFeedback(null);

    try {
      await onPublishNow({
        caption,
        mediaUrl,
        mediaType,
        platforms,
        scheduledFor: null,
      });
      setFeedback({ type: 'success', message: 'Post publicado com sucesso na Meta Graph API!' });
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Erro ao publicar post.' });
    } finally {
      setIsSubmitting(false);
      setActionType(null);
    }
  };

  // Submissão agendada (Agendar Post)
  const handleSchedule = async () => {
    if (!caption.trim()) {
      setFeedback({ type: 'error', message: 'Por favor, escreva uma legenda para o post.' });
      return;
    }
    if (!mediaUrl) {
      setFeedback({ type: 'error', message: 'Selecione uma imagem ou vídeo para agendar.' });
      return;
    }
    if (!scheduledFor) {
      setFeedback({ type: 'error', message: 'Defina a data e horário para o agendamento.' });
      return;
    }

    const scheduledDate = new Date(scheduledFor);
    if (scheduledDate.getTime() <= Date.now()) {
      setFeedback({
        type: 'error',
        message: 'O horário do agendamento deve ser no futuro.',
      });
      return;
    }

    setIsSubmitting(true);
    setActionType('schedule');
    setFeedback(null);

    try {
      await onSchedulePost({
        caption,
        mediaUrl,
        mediaType,
        platforms,
        scheduledFor: scheduledDate.toISOString(),
      });
      setFeedback({ type: 'success', message: 'Post agendado com sucesso na fila!' });
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Erro ao agendar post.' });
    } finally {
      setIsSubmitting(false);
      setActionType(null);
    }
  };

  return (
    <div className="bg-[#111827] rounded-2xl border border-slate-800 p-5 lg:p-6 shadow-xl space-y-6">
      {/* Header do Composer */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            {editingPost ? 'Editar Publicação Agendada' : 'Criar Nova Publicação'}
          </h2>
          <p className="text-xs text-slate-400">
            Adicione sua mídia, crie com Gemini AI e escolha os canais de publicação.
          </p>
        </div>

        {editingPost && (
          <button
            onClick={onCancelEdit}
            className="text-xs text-rose-400 hover:text-rose-300 font-semibold px-2.5 py-1 rounded bg-rose-500/10 border border-rose-500/20"
          >
            Cancelar Edição
          </button>
        )}
      </div>

      {/* 1. SELEÇÃO DE DESTINO (CHECKBOXES) */}
      <div className="space-y-2">
        <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
          1. Destino da Publicação *
        </label>
        <div className="grid grid-cols-3 gap-2.5">
          {/* Ambos */}
          <button
            type="button"
            onClick={() => handlePlatformToggle('both')}
            className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
              platforms === 'both'
                ? 'bg-purple-950/60 border-purple-500 text-purple-200 shadow-md shadow-purple-900/20'
                : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-850'
            }`}
          >
            <Layers className="w-4 h-4 text-purple-400" />
            <span>[✓] Ambos (IG + FB)</span>
          </button>

          {/* Instagram */}
          <button
            type="button"
            onClick={() => handlePlatformToggle('instagram')}
            className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
              platforms === 'instagram'
                ? 'bg-gradient-to-r from-amber-950/40 via-rose-950/40 to-purple-950/40 border-pink-500 text-pink-200 shadow-md shadow-pink-900/20'
                : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-850'
            }`}
          >
            <Instagram className="w-4 h-4 text-pink-400" />
            <span>Instagram</span>
          </button>

          {/* Facebook */}
          <button
            type="button"
            onClick={() => handlePlatformToggle('facebook')}
            className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
              platforms === 'facebook'
                ? 'bg-blue-950/60 border-blue-500 text-blue-200 shadow-md shadow-blue-900/20'
                : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-850'
            }`}
          >
            <Facebook className="w-4 h-4 text-blue-400" />
            <span>Facebook</span>
          </button>
        </div>
      </div>

      {/* 2. UPLOAD E GESTÃO DE MÍDIA */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
            2. Mídia (Imagem ou Vídeo) *
          </label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setUrlInputMode(!urlInputMode)}
              className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1"
            >
              <Link className="w-3 h-3" />
              <span>{urlInputMode ? 'Usar Arquivo' : 'Colar URL Externa'}</span>
            </button>
          </div>
        </div>

        {urlInputMode ? (
          <div className="flex gap-2">
            <input
              type="url"
              placeholder="https://exemplo.com/minha-imagem.jpg"
              value={customUrl}
              onChange={(e) => setCustomUrl(e.target.value)}
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button
              onClick={handleApplyCustomUrl}
              className="px-3.5 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              Aplicar
            </button>
          </div>
        ) : (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-700/80 hover:border-purple-500/80 bg-slate-950/60 hover:bg-slate-900/50 rounded-2xl p-4 transition-all text-center cursor-pointer group"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/mp4"
              onChange={handleFileUpload}
              className="hidden"
            />
            <div className="flex flex-col items-center justify-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-purple-600/10 group-hover:bg-purple-600/20 text-purple-400 flex items-center justify-center transition-colors">
                <UploadCloud className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-200">
                  Clique para carregar ou arraste seu arquivo
                </p>
                <p className="text-[11px] text-slate-400">
                  Suporta PNG, JPG e MP4 (Até 30MB)
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Galeria de Presets Prontos para Teste Instantâneo */}
        <div className="space-y-1.5 pt-1">
          <span className="text-[11px] font-semibold text-slate-400 block">
            💡 Ou escolha um exemplo pronto para testar com 1 clique:
          </span>
          <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-thin">
            {SAMPLE_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleApplyPreset(preset)}
                className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-xs whitespace-nowrap transition-all cursor-pointer ${
                  mediaUrl === preset.mediaUrl
                    ? 'bg-purple-900/40 border-purple-500 text-purple-200 font-semibold'
                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <img
                  src={preset.mediaUrl}
                  alt={preset.name}
                  className="w-4 h-4 rounded object-cover"
                />
                <span>{preset.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. CAMPO DE TEXTO PARA A LEGENDA */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
            3. Legenda da Publicação *
          </label>

          {/* Botão Gerar com IA Gemini */}
          <button
            type="button"
            onClick={() => setIsAiModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-md shadow-purple-900/30 transition-all cursor-pointer group"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-200 group-hover:scale-110 transition-transform" />
            <span>Gerar com IA</span>
          </button>
        </div>

        <div className="relative">
          <textarea
            value={caption}
            onChange={(e) => handleCaptionChange(e.target.value)}
            placeholder="Escreva a legenda que será publicada no Instagram e no Facebook..."
            rows={5}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 leading-relaxed"
          />

          {/* Barra de Emojis Rápidos e Contador */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 px-1 text-xs">
            <div className="flex items-center gap-1.5 overflow-x-auto text-slate-400">
              <span className="text-[10px] uppercase font-bold text-slate-500">Emojis:</span>
              {['🚀', '✨', '🔥', '💡', '👇', '☕', '🎯', '❤️', '📸', '⚡'].map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => insertEmoji(emoji)}
                  className="hover:scale-125 transition-transform text-sm cursor-pointer"
                  title={`Inserir ${emoji}`}
                >
                  {emoji}
                </button>
              ))}
            </div>

            <div className="text-[11px] text-slate-400 font-mono">
              <span className={caption.length > 2200 ? 'text-rose-400 font-bold' : ''}>
                {caption.length}
              </span>
              <span className="text-slate-600"> / 2.200 carac. (Instagram)</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. AGENDAMENTO (DATA E HORA) */}
      <div className="space-y-3 pt-2 border-t border-slate-800/80">
        <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
          4. Horário de Disparo (Opcional para Agendamento)
        </label>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <input
              type="datetime-local"
              value={scheduledFor}
              onChange={(e) => setScheduledFor(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Atalhos Rápidos de Horário */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShortcutTime(1)}
              className="px-2.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 font-medium whitespace-nowrap cursor-pointer"
            >
              +1 Hora
            </button>
            <button
              type="button"
              onClick={() => setTomorrowTime(9)}
              className="px-2.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 font-medium whitespace-nowrap cursor-pointer"
            >
              Amanhã 09:00
            </button>
            <button
              type="button"
              onClick={() => setTomorrowTime(18)}
              className="px-2.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 font-medium whitespace-nowrap cursor-pointer"
            >
              Amanhã 18:00
            </button>
          </div>
        </div>
      </div>

      {/* MENSAGENS DE FEEDBACK */}
      {feedback && (
        <div
          className={`p-3.5 rounded-xl border text-xs flex items-center gap-2 ${
            feedback.type === 'success'
              ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300'
              : 'bg-rose-950/60 border-rose-800 text-rose-300'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* 5. BOTÕES PRINCIPAIS DE AÇÃO */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3">
        {/* Publicar Agora */}
        <button
          type="button"
          onClick={handleImmediatePublish}
          disabled={isSubmitting}
          className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-blue-900/30 flex items-center justify-center gap-2 disabled:opacity-50 transition-all cursor-pointer"
        >
          {isSubmitting && actionType === 'publish' ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Publicando na Meta API...</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>Publicar Agora</span>
            </>
          )}
        </button>

        {/* Agendar Postagem */}
        <button
          type="button"
          onClick={handleSchedule}
          disabled={isSubmitting}
          className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-purple-900/30 flex items-center justify-center gap-2 disabled:opacity-50 transition-all cursor-pointer"
        >
          {isSubmitting && actionType === 'schedule' ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Agendando na Fila...</span>
            </>
          ) : (
            <>
              <Calendar className="w-4 h-4" />
              <span>{editingPost ? 'Salvar Agendamento' : 'Agendar Postagem'}</span>
            </>
          )}
        </button>
      </div>

      {/* Modal de Legenda IA */}
      <AiCaptionModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        onSelectCaption={(newText) => {
          setCaption(newText);
          notifyPreview(mediaUrl, mediaType, newText, platforms);
        }}
        initialIdea={caption.slice(0, 100)}
        targetPlatforms={platforms === 'both' ? ['Instagram', 'Facebook'] : [platforms]}
      />
    </div>
  );
};
