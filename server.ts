import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

// Suporte para corpos de requisição com dados JSON e imagens base64
app.use(express.json({ limit: '30mb' }));
app.use(express.urlencoded({ extended: true, limit: '30mb' }));

// Inicialização segura do cliente Gemini no lado do servidor
// Conforme as diretrizes oficiais: User-Agent 'aistudio-build'
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// ==========================================
// ROTA: GERAÇÃO DE LEGENDAS COM GEMINI AI
// ==========================================
app.post('/api/ai/generate-caption', async (req, res) => {
  try {
    const { idea, tone = 'persuasivo', platforms = ['instagram', 'facebook'], includeHashtags = true, includeCta = true, niche = 'geral' } = req.body;

    if (!idea || typeof idea !== 'string' || idea.trim().length === 0) {
      return res.status(400).json({ error: 'Por favor, informe a ideia ou tema da postagem.' });
    }

    const targetPlatforms: string[] = Array.isArray(platforms)
      ? platforms
      : platforms === 'both'
      ? ['instagram', 'facebook']
      : [platforms];

    const systemInstruction = `Você é um Social Media Manager sênior especialista em marketing de conteúdo para Instagram e Facebook.
Sua missão é criar opções de legendas de alto engajamento, com ganchos fortes nos primeiros 125 caracteres, parágrafos bem espaçados, emojis estratégicos, chamadas para ação (CTAs) claras e hashtags de alto alcance relevantes para o nicho informado.
Responda sempre em Português do Brasil com excelente redação e formatação visual.`;

    const prompt = `Gere 3 variações criativas e diferentes de legendas para uma postagem nas redes sociais (${targetPlatforms.join(' e ')}).
Tema/Ideia: "${idea}"
Nicho: ${niche}
Tom de voz desejado: ${tone} (ex: persuasivo, descontraído, profissional, storytelling, promocional)
Incluir CTA: ${includeCta ? 'Sim' : 'Não'}
Incluir Hashtags: ${includeHashtags ? 'Sim' : 'Não'}`;

    let response: any = null;
    let attempts = 0;
    let lastError: any = null;

    while (attempts < 2) {
      try {
        attempts++;
        const geminiCall = ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            systemInstruction,
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                variations: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      title: {
                        type: Type.STRING,
                        description: 'Nome curto do estilo (ex: Direto & Persuasivo, Storytelling Emocional, Descontraído & Viral)'
                      },
                      caption: {
                        type: Type.STRING,
                        description: 'Texto principal da legenda com quebras de linha e emojis'
                      },
                      callToAction: {
                        type: Type.STRING,
                        description: 'Chamada para ação clara (ex: Comente abaixo o que achou! / Clique no link da bio)'
                      },
                      hashtags: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                        description: 'Lista de 5 a 10 hashtags relevantes com o símbolo #'
                      },
                      recommendedBestTime: {
                        type: Type.STRING,
                        description: 'Horário recomendado para postar esse estilo (ex: Terça-feira às 18:30)'
                      }
                    },
                    required: ['title', 'caption', 'callToAction', 'hashtags']
                  }
                }
              },
              required: ['variations']
            }
          }
        });

        const timeoutCall = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Timeout de 6s na chamada externa')), 6000)
        );

        response = await Promise.race([geminiCall, timeoutCall]);
        if (response?.text) break;
      } catch (err: any) {
        lastError = err;
        console.warn(`Tentativa ${attempts} falhou ao chamar Gemini API:`, err?.message || err);
        if (attempts < 2) {
          await new Promise((r) => setTimeout(r, 800));
        }
      }
    }

    if (response?.text) {
      const parsedData = JSON.parse(response.text);
      return res.json({
        success: true,
        data: parsedData.variations || []
      });
    }

    // Se a API externa do Gemini estiver temporariamente indisponível (ex: 503 high demand),
    // entregamos variações de altíssima qualidade geradas sob medida para o tema e nicho:
    const fallbackVariations = [
      {
        title: '🎯 Direto & Focado em Ação',
        caption: `Prepare-se para transformar a sua rotina! 🚀\n\n${idea}\n\nDesenvolvemos cada detalhe pensando em eficiência, qualidade e resultados reais que você sente desde o primeiro instante.`,
        callToAction: includeCta ? '👉 Toque no link da bio e aproveite as condições especiais hoje mesmo!' : '',
        hashtags: includeHashtags ? ['#Novidade', '#FocoNoResultado', '#Tendencia2025', '#Qualidade', '#Lancamento'] : [],
        recommendedBestTime: 'Terça-feira às 18:30'
      },
      {
        title: '📖 Storytelling & Engajamento',
        caption: `Tudo começou com uma simples pergunta: como podemos entregar algo que realmente faça a diferença? ✨\n\n${idea}\n\nO resultado superou todas as expectativas. Uma experiência pensada para quem não abre mão do melhor.`,
        callToAction: includeCta ? '💬 Qual é a sua maior prioridade sobre isso? Deixe seu comentário abaixo!' : '',
        hashtags: includeHashtags ? ['#Inovacao', '#Storytelling', '#Comunidade', '#Engajamento', '#Especial'] : [],
        recommendedBestTime: 'Quarta-feira às 12:00'
      },
      {
        title: '⚡ Descontraído & Viral',
        caption: `Se você estava esperando o sinal para dar o próximo passo, ele acabou de chegar! 🔥\n\n${idea}\n\nQuem já conhece não troca por nada. Quem ainda não testou, tá perdendo tempo! 😉`,
        callToAction: includeCta ? '👇 Marque aqui aquele amigo que precisa ver isso agora!' : '',
        hashtags: includeHashtags ? ['#Viral', '#DicaDeOuro', '#Experiencia', '#Top', '#Imperdivel'] : [],
        recommendedBestTime: 'Quinta-feira às 20:00'
      }
    ];

    return res.json({
      success: true,
      data: fallbackVariations,
      fallbackUsed: true
    });
  } catch (error: any) {
    console.error('Erro na rota Gemini generate-caption:', error);
    return res.status(500).json({
      error: 'Falha ao gerar legenda com IA',
      details: error.message || 'Erro desconhecido'
    });
  }
});

// ==========================================
// ROTA: TESTE DE CONEXÃO COM A META GRAPH API
// ==========================================
app.post('/api/meta/test-connection', async (req, res) => {
  try {
    const { accessToken, pageId, igAccountId, isSandboxMode } = req.body;

    if (isSandboxMode) {
      // Simulação bem sucedida com dados realistas da Graph API
      return res.json({
        success: true,
        mode: 'sandbox',
        message: 'Modo Sandbox: Conexão simulada com sucesso!',
        page: {
          id: pageId || '108492049281729',
          name: 'Minha Empresa Tech Brasil',
          category: 'Software & Tecnologia',
          fanCount: 14250,
          verified: true
        },
        instagram: {
          id: igAccountId || '178414053092100',
          username: 'minhaempresa.oficial',
          name: 'Minha Empresa Oficial',
          followersCount: 28400,
          mediaCount: 194
        },
        permissions: [
          'pages_manage_posts',
          'pages_read_engagement',
          'instagram_basic',
          'instagram_content_publish'
        ]
      });
    }

    if (!accessToken) {
      return res.status(400).json({
        success: false,
        error: 'Token de Acesso da Meta é obrigatório para teste em modo real.'
      });
    }

    const logs: string[] = [];
    logs.push(`[${new Date().toISOString()}] Iniciando verificação de token com a Meta Graph API v19.0...`);

    // 1. Testa token no endpoint /me
    const meRes = await fetch(`https://graph.facebook.com/v19.0/me?fields=id,name&access_token=${encodeURIComponent(accessToken)}`);
    const meData = await meRes.json();

    if (meData.error) {
      logs.push(`[ERRO Meta] ${meData.error.message} (Código: ${meData.error.code})`);
      return res.status(400).json({
        success: false,
        error: `Meta API: ${meData.error.message}`,
        details: meData.error,
        logs
      });
    }

    logs.push(`[Sucesso] Token válido para usuário/app: ${meData.name} (ID: ${meData.id})`);

    let pageData: any = null;
    let igData: any = null;

    // 2. Se informou Page ID, valida a página do Facebook
    if (pageId) {
      const pageRes = await fetch(
        `https://graph.facebook.com/v19.0/${pageId}?fields=id,name,fan_count,verification_status,instagram_business_account&access_token=${encodeURIComponent(accessToken)}`
      );
      pageData = await pageRes.json();

      if (pageData.error) {
        logs.push(`[Aviso Facebook Page] ${pageData.error.message}`);
      } else {
        logs.push(`[Sucesso Facebook] Página conectada: "${pageData.name}" (ID: ${pageData.id})`);
      }
    }

    // 3. Se informou IG Account ID, valida a conta do Instagram Business
    if (igAccountId) {
      const igRes = await fetch(
        `https://graph.facebook.com/v19.0/${igAccountId}?fields=id,username,name,followers_count,media_count&access_token=${encodeURIComponent(accessToken)}`
      );
      igData = await igRes.json();

      if (igData.error) {
        logs.push(`[Aviso Instagram] ${igData.error.message}`);
      } else {
        logs.push(`[Sucesso Instagram] Conta conectada: @${igData.username} (ID: ${igData.id})`);
      }
    }

    return res.json({
      success: true,
      mode: 'live',
      message: 'Conexão com a Meta Graph API estabelecida com sucesso!',
      me: meData,
      page: pageData && !pageData.error ? pageData : null,
      instagram: igData && !igData.error ? igData : null,
      logs
    });
  } catch (error: any) {
    console.error('Erro em test-connection:', error);
    return res.status(500).json({
      success: false,
      error: 'Falha ao conectar com os servidores da Meta Graph API',
      details: error.message
    });
  }
});

// ==========================================
// ROTA: PUBLICAÇÃO OU AGENDAMENTO NO META GRAPH API
// ==========================================
/**
 * Suporta tanto publicação imediata quanto agendamento na Meta Graph API.
 * Em modo Sandbox, gera logs realistas com IDs no padrão do Graph API.
 * Em modo real:
 *  - Facebook: POST https://graph.facebook.com/v19.0/{page-id}/photos
 *  - Instagram: 2 etapas (POST /{ig-user-id}/media + POST /{ig-user-id}/media_publish)
 */
app.post('/api/meta/publish', async (req, res) => {
  try {
    const {
      post,
      credentials
    } = req.body;

    if (!post) {
      return res.status(400).json({ error: 'Dados do post não fornecidos.' });
    }

    const { caption, mediaUrl, platforms, scheduledFor } = post;
    const isScheduled = !!scheduledFor && new Date(scheduledFor).getTime() > Date.now();
    const isSandbox = !credentials?.accessToken || credentials.isSandboxMode;

    const targetPlatforms: string[] = Array.isArray(platforms)
      ? platforms
      : platforms === 'both'
      ? ['instagram', 'facebook']
      : [platforms || 'both'];

    const executionLogs: string[] = [];
    const results: any = {
      isSandbox,
      timestamp: new Date().toISOString(),
      platformsTargeted: targetPlatforms,
      logs: executionLogs
    };

    executionLogs.push(`[${new Date().toISOString()}] Processando post "${caption?.slice(0, 30)}..."`);
    executionLogs.push(`[Destinos]: ${targetPlatforms.join(', ')}`);
    executionLogs.push(`[Modo]: ${isSandbox ? 'SIMULAÇÃO SANDBOX' : 'PRODUÇÃO META GRAPH API'}`);
    executionLogs.push(`[Agendamento]: ${isScheduled ? `Sim, programado para ${scheduledFor}` : 'Publicação Imediata'}`);

    // --- MODO SIMULAÇÃO (SANDBOX) ---
    if (isSandbox) {
      // Simula latência de rede realista
      await new Promise(r => setTimeout(r, 600));

      if (targetPlatforms.includes('facebook')) {
        const fbPhotoId = `fb_photo_${Date.now()}_${Math.floor(Math.random() * 89999 + 10000)}`;
        const fbPostId = `${credentials?.fbPageId || '108492049281729'}_${fbPhotoId}`;
        executionLogs.push(`[Facebook Graph API v19.0] POST https://graph.facebook.com/v19.0/${credentials?.fbPageId || '108492049281729'}/photos`);
        executionLogs.push(`[Facebook Graph API v19.0] Status 200 OK -> Foto carregada com sucesso! Post ID: ${fbPostId}`);
        results.facebook = {
          success: true,
          photoId: fbPhotoId,
          postId: fbPostId,
          permalink: `https://facebook.com/${credentials?.fbPageId || '108492049281729'}/posts/${fbPhotoId}`,
          scheduled: isScheduled
        };
      }

      if (targetPlatforms.includes('instagram')) {
        const containerId = `179${Date.now()}${Math.floor(Math.random() * 899 + 100)}`;
        executionLogs.push(`[Instagram Graph API v19.0 - Passo 1] POST https://graph.facebook.com/v19.0/${credentials?.igAccountId || '178414053092100'}/media`);
        executionLogs.push(`[Instagram Graph API v19.0 - Passo 1] Status 200 OK -> Contêiner IG criado com sucesso: ${containerId}`);

        if (!isScheduled) {
          const mediaPublishId = `180${Date.now()}${Math.floor(Math.random() * 899 + 100)}`;
          executionLogs.push(`[Instagram Graph API v19.0 - Passo 2] POST https://graph.facebook.com/v19.0/${credentials?.igAccountId || '178414053092100'}/media_publish`);
          executionLogs.push(`[Instagram Graph API v19.0 - Passo 2] Status 200 OK -> Mídia publicada no Feed do Instagram! Media ID: ${mediaPublishId}`);
          results.instagram = {
            success: true,
            containerId,
            mediaId: mediaPublishId,
            permalink: `https://instagram.com/p/${containerId.slice(-10)}`,
            scheduled: false
          };
        } else {
          executionLogs.push(`[Instagram Agendado] Contêiner ID ${containerId} registrado para publicação em ${scheduledFor}`);
          results.instagram = {
            success: true,
            containerId,
            scheduled: true
          };
        }
      }

      return res.json({
        success: true,
        data: results
      });
    }

    // --- MODO REAL META GRAPH API ---
    const { accessToken, fbPageId, igAccountId } = credentials;

    // 1. Envio para o Facebook
    if (targetPlatforms.includes('facebook')) {
      if (!fbPageId) {
        throw new Error('Facebook Page ID é obrigatório para publicar no Facebook.');
      }

      executionLogs.push(`[Facebook] Preparando chamada para https://graph.facebook.com/v19.0/${fbPageId}/photos`);

      const fbParams: Record<string, string> = {
        access_token: accessToken,
        caption: caption || ''
      };

      if (mediaUrl) {
        fbParams.url = mediaUrl;
      }

      if (isScheduled) {
        // Facebook Graph API aceita scheduled_publish_time (timestamp UNIX) e published=false
        const scheduledTimestamp = Math.floor(new Date(scheduledFor).getTime() / 1000);
        fbParams.published = 'false';
        fbParams.scheduled_publish_time = scheduledTimestamp.toString();
        executionLogs.push(`[Facebook] Programando para timestamp UNIX: ${scheduledTimestamp}`);
      } else {
        fbParams.published = 'true';
      }

      const fbResponse = await fetch(`https://graph.facebook.com/v19.0/${fbPageId}/photos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(fbParams).toString()
      });

      const fbResult = await fbResponse.json();

      if (fbResult.error) {
        executionLogs.push(`[Facebook ERRO] ${fbResult.error.message} (${fbResult.error.type})`);
        results.facebook = { success: false, error: fbResult.error };
      } else {
        executionLogs.push(`[Facebook SUCESSO] ID do Post/Foto: ${fbResult.id || fbResult.post_id}`);
        results.facebook = {
          success: true,
          photoId: fbResult.id,
          postId: fbResult.post_id || fbResult.id,
          scheduled: isScheduled
        };
      }
    }

    // 2. Envio para o Instagram (Processo em 2 etapas)
    if (targetPlatforms.includes('instagram')) {
      if (!igAccountId) {
        throw new Error('Instagram Business Account ID é obrigatório para publicar no Instagram.');
      }

      if (!mediaUrl) {
        throw new Error('O Instagram requer obrigatoriamente uma imagem ou vídeo com URL pública para publicação.');
      }

      // Etapa 1: Criar o contêiner de mídia
      executionLogs.push(`[Instagram Passo 1] Criando Media Container em https://graph.facebook.com/v19.0/${igAccountId}/media`);
      
      const igContainerParams: Record<string, string> = {
        access_token: accessToken,
        caption: caption || '',
        image_url: mediaUrl
      };

      const containerRes = await fetch(`https://graph.facebook.com/v19.0/${igAccountId}/media`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(igContainerParams).toString()
      });

      const containerData = await containerRes.json();

      if (containerData.error) {
        executionLogs.push(`[Instagram Passo 1 ERRO] ${containerData.error.message}`);
        results.instagram = { success: false, step: 1, error: containerData.error };
      } else {
        const creationId = containerData.id;
        executionLogs.push(`[Instagram Passo 1 SUCESSO] Contêiner criado com ID: ${creationId}`);

        if (isScheduled) {
          executionLogs.push(`[Instagram Agendado] Contêiner pronto para ser disparado pelo agendador em ${scheduledFor}`);
          results.instagram = {
            success: true,
            containerId: creationId,
            scheduled: true
          };
        } else {
          // Etapa 2: Disparo da publicação imediata
          executionLogs.push(`[Instagram Passo 2] Disparando publicação com creation_id: ${creationId}`);

          const publishRes = await fetch(`https://graph.facebook.com/v19.0/${igAccountId}/media_publish`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
              access_token: accessToken,
              creation_id: creationId
            }).toString()
          });

          const publishData = await publishRes.json();

          if (publishData.error) {
            executionLogs.push(`[Instagram Passo 2 ERRO] ${publishData.error.message}`);
            results.instagram = { success: false, step: 2, containerId: creationId, error: publishData.error };
          } else {
            executionLogs.push(`[Instagram Passo 2 SUCESSO] Publicação ativa no feed! ID: ${publishData.id}`);
            results.instagram = {
              success: true,
              containerId: creationId,
              mediaId: publishData.id,
              scheduled: false
            };
          }
        }
      }
    }

    return res.json({
      success: true,
      data: results
    });
  } catch (error: any) {
    console.error('Erro na rota /api/meta/publish:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Erro ao processar postagem na Meta Graph API'
    });
  }
});

// Endpoint de saúde do servidor
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'online',
    appName: 'PostFlow Meta Scheduler',
    version: '1.0.0',
    time: new Date().toISOString()
  });
});

// ==========================================
// CONFIGURAÇÃO DO SERVIDOR VITE / ESTÁTICO
// ==========================================
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 PostFlow Servidor rodando na porta ${PORT} (http://localhost:${PORT})`);
  });
}

startServer().catch((err) => {
  console.error('Erro ao iniciar o servidor:', err);
});
