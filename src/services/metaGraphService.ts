/**
 * ==============================================================================
 * GUIA DE INTEGRAÇÃO OFICIAL COM META GRAPH API (FACEBOOK & INSTAGRAM)
 * ==============================================================================
 * 
 * Este módulo contém a implementação oficial das chamadas HTTP (fetch / async / await)
 * para publicar conteúdos no Facebook e Instagram via Meta Graph API v19.0+.
 * 
 * --- 1. ONDE CONFIGURAR SUAS CHAVES DE API ---
 * - Meta User / Page Access Token: Gerado no Graph API Explorer (https://developers.facebook.com/tools/explorer/)
 * - Permissões necessárias no Token:
 *   - pages_show_list
 *   - pages_read_engagement
 *   - pages_manage_posts
 *   - instagram_basic
 *   - instagram_content_publish
 * - Facebook Page ID: ID numérico da sua Página (ex: 108492049281729)
 * - Instagram Business Account ID: ID numérico da conta IG vinculada à Página (ex: 178414053092100)
 * 
 * --- 2. COMO FUNCIONA O ENVIO DE IMAGENS ---
 * - Para o INSTAGRAM:
 *   A Meta exige que o parâmetro `image_url` aponte para uma URL pública na internet
 *   (HTTP ou HTTPS acessível pelos robôs do Facebook/Meta). Imagens em `localhost`
 *   ou em `data:image/jpeg;base64` NÃO são aceitas diretamente pelo endpoint `/media` do Instagram.
 *   Em produção, faça upload prévio da imagem para um Storage bucket (ex: Firebase Storage,
 *   Supabase Storage, AWS S3, Cloudinary) e passe a URL pública resultante.
 * 
 * - Para o FACEBOOK:
 *   Aceita tanto uma URL pública via `url: "https://..."` quanto envio binário via
 *   `multipart/form-data` usando o parâmetro `source` contendo o arquivo Blob/File.
 * 
 * --- 3. COMO CONECTAR A UM BANCO DE DADOS E DISPARAR AGENDAMENTOS FUTUROS ---
 * - Com SUPABASE:
 *   1. Crie uma tabela `posts` com colunas `(id, caption, media_url, scheduled_for, status, platform)`.
 *   2. Use a extensão `pg_cron` ou uma Edge Function chamada a cada minuto para buscar posts
 *      com `status = 'scheduled'` e `scheduled_for <= now()`.
 *   3. A Edge Function executa as funções `publishToInstagram` e `publishToFacebook` abaixo
 *      e atualiza `status = 'published'` com os IDs retornados.
 * 
 * - Com FIREBASE:
 *   1. Salve o post no Firestore na coleção `/posts`.
 *   2. Crie uma Cloud Function com agendador (`functions.pubsub.schedule('every 5 minutes')`).
 *   3. O worker busca posts pendentes e efetua os disparos na Graph API.
 * ==============================================================================
 */

import { MetaCredentials, Post } from '../types';

/**
 * Publicação direta no Feed do Facebook via Meta Graph API v19.0
 * Endpoint: POST https://graph.facebook.com/v19.0/{page-id}/photos
 */
export async function publishToFacebookDirect(options: {
  pageId: string;
  accessToken: string;
  caption: string;
  imageUrl?: string;
  scheduledTimeUnix?: number; // Para agendamento nativo pelo próprio Facebook
}): Promise<{ success: boolean; photoId?: string; postId?: string; error?: any }> {
  const { pageId, accessToken, caption, imageUrl, scheduledTimeUnix } = options;

  const url = `https://graph.facebook.com/v19.0/${pageId}/photos`;

  const params: Record<string, string> = {
    access_token: accessToken,
    caption: caption || '',
  };

  if (imageUrl) {
    params.url = imageUrl;
  }

  // Agendamento nativo do Facebook: exige published=false e scheduled_publish_time (UNIX timestamp entre 10min e 75 dias)
  if (scheduledTimeUnix && scheduledTimeUnix > Math.floor(Date.now() / 1000) + 600) {
    params.published = 'false';
    params.scheduled_publish_time = scheduledTimeUnix.toString();
  } else {
    params.published = 'true';
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams(params).toString(),
  });

  const data = await response.json();

  if (data.error) {
    console.error('[Meta Graph API] Erro ao publicar no Facebook:', data.error);
    return { success: false, error: data.error };
  }

  return {
    success: true,
    photoId: data.id,
    postId: data.post_id || data.id,
  };
}

/**
 * Publicação no Instagram Feed via Meta Graph API v19.0 (Processo em 2 etapas)
 * Etapa 1: POST https://graph.facebook.com/v19.0/{ig-user-id}/media (Criação do Container)
 * Etapa 2: POST https://graph.facebook.com/v19.0/{ig-user-id}/media_publish (Disparo da Publicação)
 */
export async function publishToInstagramDirect(options: {
  igAccountId: string;
  accessToken: string;
  imageUrl: string;
  caption: string;
}): Promise<{ success: boolean; containerId?: string; mediaId?: string; error?: any }> {
  const { igAccountId, accessToken, imageUrl, caption } = options;

  // --- ETAPA 1: Criar o Container de Mídia (Media Container) ---
  const containerUrl = `https://graph.facebook.com/v19.0/${igAccountId}/media`;
  
  const containerParams = {
    access_token: accessToken,
    image_url: imageUrl,
    caption: caption || '',
  };

  const containerResponse = await fetch(containerUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams(containerParams).toString(),
  });

  const containerData = await containerResponse.json();

  if (containerData.error) {
    console.error('[Meta Graph API] Erro na Etapa 1 do Instagram (Container):', containerData.error);
    return { success: false, error: containerData.error };
  }

  const creationId = containerData.id;

  // --- ETAPA 2: Publicar o Container no Feed (Media Publish) ---
  const publishUrl = `https://graph.facebook.com/v19.0/${igAccountId}/media_publish`;

  const publishParams = {
    access_token: accessToken,
    creation_id: creationId,
  };

  const publishResponse = await fetch(publishUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams(publishParams).toString(),
  });

  const publishData = await publishResponse.json();

  if (publishData.error) {
    console.error('[Meta Graph API] Erro na Etapa 2 do Instagram (Publish):', publishData.error);
    return {
      success: false,
      containerId: creationId,
      error: publishData.error,
    };
  }

  return {
    success: true,
    containerId: creationId,
    mediaId: publishData.id,
  };
}

// ==============================================================================
// FUNÇÕES CLIENTE CONSUMIDAS PELA APLICAÇÃO SPA (VIA BACKEND PROXY / SERVIDOR)
// ==============================================================================

/**
 * Dispara a publicação ou agendamento passando pelo servidor intermediário
 * (garante segurança, contorna restrições de CORS e permite modo Sandbox).
 */
export async function dispatchMetaPost(
  post: Post,
  credentials: MetaCredentials
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const response = await fetch('/api/meta/publish', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        post,
        credentials,
      }),
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      return {
        success: false,
        error: result.error || 'Erro ao comunicar com a API da Meta',
        data: result.data,
      };
    }

    return {
      success: true,
      data: result.data,
    };
  } catch (error: any) {
    console.error('Falha de rede ao disparar publicação:', error);
    return {
      success: false,
      error: error.message || 'Falha de conexão com o servidor local',
    };
  }
}

/**
 * Valida as credenciais da Meta com o Graph API
 */
export async function testMetaConnection(credentials: MetaCredentials) {
  try {
    const response = await fetch('/api/meta/test-connection', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        accessToken: credentials.accessToken,
        pageId: credentials.fbPageId,
        igAccountId: credentials.igAccountId,
        isSandboxMode: credentials.isSandboxMode,
      }),
    });

    return await response.json();
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Falha ao testar conexão',
    };
  }
}

/**
 * Solicita ao servidor geração de opções de legendas com Gemini 3.8 Flash
 */
export async function generateAICaptions(params: {
  idea: string;
  tone: string;
  niche: string;
  platforms: string[];
  includeHashtags: boolean;
  includeCta: boolean;
}) {
  const response = await fetch('/api/ai/generate-caption', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });

  return await response.json();
}
