export interface SamplePreset {
  id: string;
  name: string;
  category: string;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  caption: string;
  platforms: 'both' | 'instagram' | 'facebook';
}

export const SAMPLE_PRESETS: SamplePreset[] = [
  {
    id: 'preset-tech',
    name: 'Lançamento de Produto Tech',
    category: 'Tecnologia & Inovação',
    mediaUrl: 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=1200&q=80',
    mediaType: 'image',
    caption: `Chegou a nova geração que vai revolucionar a sua produtividade diária! 🚀✨\n\nDesenvolvemos cada detalhe com foco em performance extrema, design ergonômico e integração perfeita ao seu fluxo de trabalho. Não é apenas uma ferramenta, é o seu próximo salto profissional.\n\n👇 Toque no link da bio e garanta acesso exclusivo com 20% OFF no lote de lançamento!\n\n#Inovacao #TechTrends #Produtividade #Lancamento #EmpreendedorismoDigital #Gadgets`,
    platforms: 'both'
  },
  {
    id: 'preset-cafe',
    name: 'Cafeteria Artesanal',
    category: 'Gastronomia',
    mediaUrl: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1200&q=80',
    mediaType: 'image',
    caption: `O aroma que transforma a sua manhã. ☕🤎\n\nGrãos selecionados a mais de 1.200 metros de altitude, torra média artesanal e aquele método pour-over que extrai notas sutis de caramelo e chocolate.\n\nQual é o seu ritual favorito para começar o dia? Conte pra gente nos comentários! 👇\n\n#SpecialtyCoffee #CafeEspecial #Cafeteria #BaristaLife #MomentoCafe #CoffeeLovers`,
    platforms: 'instagram'
  },
  {
    id: 'preset-fitness',
    name: 'Treino & Bem-Estar',
    category: 'Saúde & Fitness',
    mediaUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1200&q=80',
    mediaType: 'image',
    caption: `A consistência sempre vence o talento quando a motivação acaba. 🏋️‍♂️💪\n\nNão espere a segunda-feira perfeita para dar o primeiro passo. Cada repetição, cada quilômetro e cada refeição consciente te aproximam da sua melhor versão.\n\nMarque aquele amigo que precisa desse incentivo para treinar hoje com você! 🔥\n\n#FitnessMotivation #TreinoFocado #SaudeEBemEstar #VidaSaudavel #FocoNoObjetivo #Superacao`,
    platforms: 'both'
  },
  {
    id: 'preset-fashion',
    name: 'Coleção Outono & Estilo',
    category: 'Moda & Varejo',
    mediaUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=80',
    mediaType: 'image',
    caption: `A sofisticação do minimalismo moderno. 🍂✨\n\nNossa nova coleção traz tecidos naturais, caimento impecável e paletas terrosas para composições elegantes que transitam do dia à noite sem esforço.\n\nDisponível em nossas lojas físicas e no e-commerce oficial com frete grátis neste fim de semana!\n\n#ModaFeminina #EstiloElegante #LookDoDia #NovaColecao #Tendencias2025 #Minimalismo`,
    platforms: 'instagram'
  },
  {
    id: 'preset-travel',
    name: 'Destinos & Viagem',
    category: 'Turismo & Aventura',
    mediaUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
    mediaType: 'image',
    caption: `Se você pudesse se teletransportar agora para qualquer lugar do planeta, onde estaria? 🌊☀️\n\nÁguas cristalinas, brisa leve e a sensação de que o tempo desacelera. Viajar não é gastar, é colecionar memórias que ninguém pode tirar de você.\n\nSalve este post para o seu próximo roteiro de férias! 📌\n\n#ViagensIncríveis #DestinosDosSonhos #PraiasDoBrasil #TravelGram #Aventuras #Natureza`,
    platforms: 'facebook'
  }
];

export const INITIAL_SCHEDULED_POSTS = [
  {
    id: 'post-init-1',
    caption: 'Chegou a nova geração que vai revolucionar a sua produtividade diária! 🚀✨\n\nDesenvolvemos cada detalhe com foco em performance extrema. Não é apenas uma ferramenta, é o seu próximo salto profissional.\n\n#Inovacao #TechTrends #Produtividade',
    mediaUrl: 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=1200&q=80',
    mediaType: 'image' as const,
    platforms: 'both' as const,
    scheduledFor: new Date(Date.now() + 1000 * 60 * 60 * 4).toISOString(), // Daqui a 4 horas
    status: 'scheduled' as const,
    createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
  },
  {
    id: 'post-init-2',
    caption: 'A consistência sempre vence o talento quando a motivação acaba. 🏋️‍♂️💪\n\nNão espere a segunda-feira perfeita para dar o primeiro passo.\n\n#FitnessMotivation #TreinoFocado #SaudeEBemEstar',
    mediaUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1200&q=80',
    mediaType: 'image' as const,
    platforms: 'instagram' as const,
    scheduledFor: new Date(Date.now() + 1000 * 60 * 60 * 26).toISOString(), // Amanhã
    status: 'scheduled' as const,
    createdAt: new Date(Date.now() - 1000 * 60 * 300).toISOString(),
  }
];

export const INITIAL_PUBLISHED_POSTS = [
  {
    id: 'post-published-1',
    caption: 'O aroma que transforma a sua manhã. ☕🤎 Grãos selecionados a mais de 1.200 metros de altitude e aquele método pour-over inconfundível. Qual o seu ritual matinal?\n\n#SpecialtyCoffee #CafeEspecial #BaristaLife',
    mediaUrl: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1200&q=80',
    mediaType: 'image' as const,
    platforms: 'both' as const,
    scheduledFor: null,
    status: 'published' as const,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    metaResponse: {
      isSandbox: true,
      facebook: {
        success: true,
        photoId: 'fb_photo_1740001928_89123',
        postId: '108492049281729_fb_photo_1740001928_89123',
        permalink: 'https://facebook.com/108492049281729/posts/fb_photo_1740001928_89123'
      },
      instagram: {
        success: true,
        containerId: '17929402910492',
        mediaId: '18092401928471',
        permalink: 'https://instagram.com/p/C9f83K_z9q'
      },
      logs: [
        '[Meta Graph API v19.0] POST https://graph.facebook.com/v19.0/108492049281729/photos - 200 OK',
        '[Instagram Graph API v19.0 - Passo 1] Criando Media Container /178414053092100/media - 200 OK',
        '[Instagram Graph API v19.0 - Passo 2] Disparo de publicação /178414053092100/media_publish - 200 OK'
      ]
    }
  }
];
