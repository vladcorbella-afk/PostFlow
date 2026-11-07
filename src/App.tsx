/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { PostComposer } from './components/PostComposer';
import { SocialPreview } from './components/SocialPreview';
import { QueueManager } from './components/QueueManager';
import { HistoryView } from './components/HistoryView';
import { MetaSettings } from './components/MetaSettings';
import { Post, MetaCredentials, TargetPlatform } from './types';
import { 
  INITIAL_SCHEDULED_POSTS, 
  INITIAL_PUBLISHED_POSTS, 
  SAMPLE_PRESETS 
} from './data/samplePresets';
import { dispatchMetaPost } from './services/metaGraphService';
import { Sparkles, CheckCircle2, ShieldCheck, Instagram, Facebook } from 'lucide-react';

const STORAGE_KEYS = {
  CREDENTIALS: 'postflow_meta_credentials_v1',
  SCHEDULED: 'postflow_scheduled_posts_v1',
  PUBLISHED: 'postflow_published_posts_v1',
};

const DEFAULT_CREDENTIALS: MetaCredentials = {
  accessToken: '',
  igAccountId: '178414053092100',
  fbPageId: '108492049281729',
  pageName: 'Minha Empresa Tech Brasil',
  igHandle: 'minhaempresa.oficial',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
  isSandboxMode: true, // Inicia em modo Sandbox para funcionar imediatamente sem travar o usuário
};

export default function App() {
  const [activeTab, setActiveTab] = useState<'composer' | 'queue' | 'history' | 'settings'>('composer');

  // Inicialização de credenciais
  const [credentials, setCredentials] = useState<MetaCredentials>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CREDENTIALS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Erro ao carregar credenciais do localStorage', e);
    }
    return DEFAULT_CREDENTIALS;
  });

  // Inicialização de posts agendados
  const [scheduledPosts, setScheduledPosts] = useState<Post[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SCHEDULED);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Erro ao carregar posts agendados do localStorage', e);
    }
    return INITIAL_SCHEDULED_POSTS;
  });

  // Inicialização de histórico de publicações
  const [publishedPosts, setPublishedPosts] = useState<Post[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PUBLISHED);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Erro ao carregar histórico do localStorage', e);
    }
    return INITIAL_PUBLISHED_POSTS;
  });

  const [editingPost, setEditingPost] = useState<Post | null>(null);

  // Estado sincronizado da prévia em tempo real
  const [previewState, setPreviewState] = useState<{
    mediaUrl: string;
    mediaType: 'image' | 'video';
    caption: string;
    platforms: TargetPlatform;
  }>({
    mediaUrl: SAMPLE_PRESETS[0].mediaUrl,
    mediaType: SAMPLE_PRESETS[0].mediaType,
    caption: SAMPLE_PRESETS[0].caption,
    platforms: 'both',
  });

  // Salva no localStorage sempre que houver alterações
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CREDENTIALS, JSON.stringify(credentials));
    } catch (e) {
      console.error(e);
    }
  }, [credentials]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SCHEDULED, JSON.stringify(scheduledPosts));
    } catch (e) {
      console.error(e);
    }
  }, [scheduledPosts]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PUBLISHED, JSON.stringify(publishedPosts));
    } catch (e) {
      console.error(e);
    }
  }, [publishedPosts]);

  // Ação de Publicação Imediata
  const handlePublishNow = async (postData: Omit<Post, 'id' | 'createdAt' | 'status'>) => {
    const newPost: Post = {
      ...postData,
      id: `post_${Date.now()}`,
      status: 'published',
      createdAt: new Date().toISOString(),
      publishedAt: new Date().toISOString(),
    };

    const response = await dispatchMetaPost(newPost, credentials);

    if (!response.success) {
      throw new Error(response.error || 'Falha ao publicar na Meta Graph API');
    }

    const completedPost: Post = {
      ...newPost,
      metaResponse: response.data,
    };

    setPublishedPosts((prev) => [completedPost, ...prev]);

    // Se estava editando um agendado, remove da fila
    if (editingPost) {
      setScheduledPosts((prev) => prev.filter((p) => p.id !== editingPost.id));
      setEditingPost(null);
    }

    // Leva o usuário para o histórico para ver o post e os logs da API
    setActiveTab('history');
  };

  // Ação de Agendamento de Post
  const handleSchedulePost = async (postData: Omit<Post, 'id' | 'createdAt' | 'status'>) => {
    if (editingPost) {
      // Atualiza post existente
      setScheduledPosts((prev) =>
        prev.map((p) =>
          p.id === editingPost.id
            ? {
                ...p,
                ...postData,
              }
            : p
        )
      );
      setEditingPost(null);
    } else {
      // Cria novo agendamento
      const newPost: Post = {
        ...postData,
        id: `sched_${Date.now()}`,
        status: 'scheduled',
        createdAt: new Date().toISOString(),
      };

      setScheduledPosts((prev) =>
        [...prev, newPost].sort(
          (a, b) =>
            new Date(a.scheduledFor || 0).getTime() - new Date(b.scheduledFor || 0).getTime()
        )
      );
    }

    setActiveTab('queue');
  };

  // Cancelar post agendado
  const handleCancelPost = (id: string) => {
    if (confirm('Deseja realmente cancelar este agendamento?')) {
      setScheduledPosts((prev) => prev.filter((p) => p.id !== id));
    }
  };

  // Iniciar edição de post agendado
  const handleEditPost = (post: Post) => {
    setEditingPost(post);
    setPreviewState({
      mediaUrl: post.mediaUrl,
      mediaType: post.mediaType,
      caption: post.caption,
      platforms: post.platforms,
    });
    setActiveTab('composer');
  };

  // Adiantar publicação a partir da fila
  const handlePublishNowFromQueue = async (post: Post) => {
    const response = await dispatchMetaPost(post, credentials);

    if (!response.success) {
      alert(`Erro: ${response.error || 'Não foi possível publicar'}`);
      return;
    }

    const completedPost: Post = {
      ...post,
      status: 'published',
      publishedAt: new Date().toISOString(),
      metaResponse: response.data,
    };

    setPublishedPosts((prev) => [completedPost, ...prev]);
    setScheduledPosts((prev) => prev.filter((p) => p.id !== post.id));
    setActiveTab('history');
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col selection:bg-purple-600 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        credentials={credentials}
        scheduledCount={scheduledPosts.length}
        historyCount={publishedPosts.length}
      />

      {/* Banner de Status do Modo Sandbox / Informação Rápida */}
      {credentials.isSandboxMode && (
        <div className="bg-gradient-to-r from-amber-950/60 via-purple-950/40 to-slate-900 border-b border-amber-800/40 px-4 py-2">
          <div className="max-w-7xl mx-auto flex items-center justify-between text-xs text-amber-200">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>
                <strong>Modo Sandbox Ativo:</strong> Simulação completa da Meta Graph API habilitada. Crie, gere legendas com IA Gemini e teste publicações sem travar!
              </span>
            </div>
            <button
              onClick={() => setActiveTab('settings')}
              className="text-[11px] font-bold underline hover:text-amber-100"
            >
              Configurar Chaves Reais
            </button>
          </div>
        </div>
      )}

      {/* Conteúdo Principal */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {activeTab === 'composer' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Coluna Esquerda: Painel de Criação (7 colunas) */}
            <div className="lg:col-span-7">
              <PostComposer
                key={editingPost ? editingPost.id : 'composer-new'}
                onPublishNow={handlePublishNow}
                onSchedulePost={handleSchedulePost}
                editingPost={editingPost}
                onCancelEdit={() => setEditingPost(null)}
                credentials={credentials}
                onPreviewChange={setPreviewState}
              />
            </div>

            {/* Coluna Direita: Pré-Visualização das Redes Sociais (5 colunas) */}
            <div className="lg:col-span-5 lg:sticky lg:top-24">
              <SocialPreview
                mediaUrl={previewState.mediaUrl}
                mediaType={previewState.mediaType}
                caption={previewState.caption}
                platforms={previewState.platforms}
                credentials={credentials}
              />
            </div>
          </div>
        )}

        {activeTab === 'queue' && (
          <QueueManager
            scheduledPosts={scheduledPosts}
            onCancelPost={handleCancelPost}
            onEditPost={handleEditPost}
            onPublishNowFromQueue={handlePublishNowFromQueue}
            onCreateNewClick={() => {
              setEditingPost(null);
              setActiveTab('composer');
            }}
          />
        )}

        {activeTab === 'history' && (
          <HistoryView
            publishedPosts={publishedPosts}
            onCreateNewClick={() => {
              setEditingPost(null);
              setActiveTab('composer');
            }}
          />
        )}

        {activeTab === 'settings' && (
          <MetaSettings
            credentials={credentials}
            onSaveCredentials={setCredentials}
          />
        )}
      </main>

      {/* Footer Elegante */}
      <footer className="border-t border-slate-900 bg-[#080c14] py-6 px-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-400">PostFlow</span>
            <span>·</span>
            <span>Meta Graph API v19.0 Integration</span>
            <span>·</span>
            <span className="text-purple-400">Gemini 3.8 Flash AI</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span className="flex items-center gap-1">
              <Instagram className="w-3.5 h-3.5 text-pink-400" />
              <span>Instagram Business Feed</span>
            </span>
            <span className="flex items-center gap-1">
              <Facebook className="w-3.5 h-3.5 text-blue-400" />
              <span>Facebook Page Feed</span>
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
