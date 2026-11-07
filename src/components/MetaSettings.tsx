import React, { useState } from 'react';
import { 
  KeyRound, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  ShieldCheck, 
  BookOpen, 
  Eye, 
  EyeOff, 
  Save, 
  Instagram, 
  Facebook, 
  ExternalLink,
  Database,
  Server,
  Code2
} from 'lucide-react';
import { MetaCredentials } from '../types';
import { testMetaConnection } from '../services/metaGraphService';

interface MetaSettingsProps {
  credentials: MetaCredentials;
  onSaveCredentials: (newCreds: MetaCredentials) => void;
}

export const MetaSettings: React.FC<MetaSettingsProps> = ({
  credentials,
  onSaveCredentials,
}) => {
  const [formData, setFormData] = useState<MetaCredentials>({ ...credentials });
  const [showToken, setShowToken] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    details?: any;
    logs?: string[];
  } | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);

    try {
      const res = await testMetaConnection(formData);
      if (res.success) {
        setTestResult({
          success: true,
          message: res.message || 'Conexão validada com sucesso!',
          details: {
            page: res.page,
            instagram: res.instagram,
          },
          logs: res.logs,
        });

        // Se a Meta retornou os nomes reais da página ou instagram, atualiza automaticamente
        if (res.page?.name) {
          setFormData((prev) => ({ ...prev, pageName: res.page.name }));
        }
        if (res.instagram?.username) {
          setFormData((prev) => ({ ...prev, igHandle: res.instagram.username }));
        }
      } else {
        setTestResult({
          success: false,
          message: res.error || 'Falha ao validar credenciais.',
          logs: res.logs,
        });
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || 'Erro de comunicação ao testar.',
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveCredentials({
      ...formData,
      lastVerifiedAt: new Date().toISOString(),
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Card Principal de Configuração */}
      <div className="bg-[#111827] rounded-2xl border border-slate-800 p-6 sm:p-8 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-purple-400" />
              <span>Painel de Credenciais da Meta Graph API</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Configure seus tokens e identificadores para publicação direta no Facebook e Instagram.
            </p>
          </div>

          {/* Toggle de Modo Sandbox */}
          <div className="flex items-center gap-3 bg-slate-900/90 p-2 rounded-xl border border-slate-800">
            <div className="text-right">
              <span className="block text-xs font-bold text-slate-200">
                Modo Sandbox (Simulação)
              </span>
              <span className="block text-[10px] text-slate-400">
                Teste sem App da Meta
              </span>
            </div>
            <button
              type="button"
              onClick={() =>
                setFormData((prev) => ({ ...prev, isSandboxMode: !prev.isSandboxMode }))
              }
              className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                formData.isSandboxMode ? 'bg-amber-600' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                  formData.isSandboxMode ? 'left-7' : 'left-1'
                }`}
              />
            </button>
          </div>
        </div>

        {formData.isSandboxMode && (
          <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-800/60 text-amber-300 text-xs flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <strong className="font-bold block">
                O Modo Sandbox está ATIVADO!
              </strong>
              <p className="text-amber-300/90 leading-relaxed">
                Você pode testar todas as funcionalidades do aplicativo (geração de legendas com Gemini AI, pré-visualização de feed, agendamento e simulação completa de respostas da Graph API v19.0) sem precisar de credenciais reais da Meta neste momento. Para postar na sua conta real, desative o Sandbox e insira seu Access Token abaixo.
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-5">
          {/* 1. Meta User Access Token */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                1. Meta Access Token (User ou Page Token) *
              </label>
              <a
                href="https://developers.facebook.com/tools/explorer/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
              >
                <span>Obter no Graph API Explorer</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <div className="relative">
              <input
                type={showToken ? 'text' : 'password'}
                value={formData.accessToken}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, accessToken: e.target.value }))
                }
                placeholder="Ex: EAAQ... (Token de longa duração com permissões de publicação)"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono pr-10"
              />
              <button
                type="button"
                onClick={() => setShowToken(!showToken)}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-200"
              >
                {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* 2. IDs de Página e Instagram */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Facebook className="w-3.5 h-3.5 text-blue-400" />
                <span>2. Facebook Page ID *</span>
              </label>
              <input
                type="text"
                value={formData.fbPageId}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, fbPageId: e.target.value }))
                }
                placeholder="Ex: 108492049281729"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Instagram className="w-3.5 h-3.5 text-pink-400" />
                <span>3. Instagram Business Account ID *</span>
              </label>
              <input
                type="text"
                value={formData.igAccountId}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, igAccountId: e.target.value }))
                }
                placeholder="Ex: 178414053092100"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono"
              />
            </div>
          </div>

          {/* 3. Personalização visual do Feed Mockup */}
          <div className="pt-2 border-t border-slate-800/80">
            <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              Personalização da Prévia Visual do Feed
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-xs text-slate-400">
                  Nome da Página (Facebook Feed)
                </label>
                <input
                  type="text"
                  value={formData.pageName}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, pageName: e.target.value }))
                  }
                  placeholder="Minha Empresa Oficial"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs text-slate-400">
                  Handle do Instagram (@nomedaconta)
                </label>
                <input
                  type="text"
                  value={formData.igHandle}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, igHandle: e.target.value }))
                  }
                  placeholder="minhaempresa.oficial"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200"
                />
              </div>
            </div>
          </div>

          {/* Feedback de Teste de Conexão */}
          {testResult && (
            <div
              className={`p-4 rounded-xl border text-xs space-y-2 ${
                testResult.success
                  ? 'bg-emerald-950/50 border-emerald-800 text-emerald-300'
                  : 'bg-rose-950/50 border-rose-800 text-rose-300'
              }`}
            >
              <div className="flex items-center gap-2 font-bold">
                {testResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                )}
                <span>{testResult.message}</span>
              </div>

              {testResult.logs && (
                <div className="bg-slate-950/80 rounded-lg p-2.5 font-mono text-[11px] text-slate-300 space-y-1 max-h-36 overflow-y-auto">
                  {testResult.logs.map((log, i) => (
                    <div key={i}>{log}</div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Botões de Ação */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={isTesting}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
              <span>{isTesting ? 'Verificando com Meta...' : 'Testar Conexão com a Meta'}</span>
            </button>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              {saveSuccess && (
                <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Salvo com sucesso!
                </span>
              )}
              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-purple-900/30 transition-all cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Salvar Credenciais</span>
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* GUIA PASSO A PASSO E ARQUITETURA DE BANCO DE DADOS */}
      <div className="bg-[#111827] rounded-2xl border border-slate-800 p-6 sm:p-8 shadow-xl space-y-6">
        <div className="flex items-center gap-2.5 pb-4 border-b border-slate-800">
          <BookOpen className="w-5 h-5 text-blue-400" />
          <h3 className="text-base font-bold text-white">
            Manual de Integração Técnica &amp; Arquitetura Backend
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-300">
          {/* Coluna 1: Como obter as chaves no Meta Developers */}
          <div className="space-y-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
            <h4 className="font-bold text-purple-400 uppercase tracking-wide flex items-center gap-1.5">
              <span>1. Como Obter os Dados na Meta</span>
            </h4>
            <ol className="space-y-2.5 list-decimal list-inside text-slate-300 leading-relaxed">
              <li>
                Acesse o <strong className="text-white">Meta for Developers</strong> (developers.facebook.com) e crie um App do tipo <strong className="text-white">Business</strong>.
              </li>
              <li>
                No menu lateral, adicione os produtos <strong className="text-white">Facebook Login</strong> e <strong className="text-white">Instagram Graph API</strong>.
              </li>
              <li>
                Abra a ferramenta <strong className="text-white">Graph API Explorer</strong> e selecione seu App.
              </li>
              <li>
                Em <em>User or Page</em>, selecione a sua Página do Facebook para gerar um <strong className="text-white">Page Access Token</strong>.
              </li>
              <li>
                Marque as permissões obrigatórias:
                <div className="mt-1 flex flex-wrap gap-1 font-mono text-[10px]">
                  <span className="bg-slate-800 px-1.5 py-0.5 rounded text-blue-300">pages_manage_posts</span>
                  <span className="bg-slate-800 px-1.5 py-0.5 rounded text-blue-300">pages_read_engagement</span>
                  <span className="bg-slate-800 px-1.5 py-0.5 rounded text-pink-300">instagram_basic</span>
                  <span className="bg-slate-800 px-1.5 py-0.5 rounded text-pink-300">instagram_content_publish</span>
                </div>
              </li>
              <li>
                Gere o token e converta-o para <strong className="text-white">Long-Lived Token</strong> (válido por 60 dias) pelo Access Token Tool.
              </li>
            </ol>
          </div>

          {/* Coluna 2: Arquitetura para Banco e Cron em Produção */}
          <div className="space-y-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
            <h4 className="font-bold text-emerald-400 uppercase tracking-wide flex items-center gap-1.5">
              <Database className="w-4 h-4 text-emerald-400" />
              <span>2. Agendamento com Supabase ou Firebase</span>
            </h4>
            <div className="space-y-2.5 leading-relaxed text-slate-300">
              <p>
                Para que os posts sejam publicados automaticamente no horário mesmo com o navegador fechado:
              </p>
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                <strong className="text-white block font-semibold">Com Supabase (PostgreSQL):</strong>
                <p className="text-[11px] text-slate-400">
                  Salve a postagem com <code>status = 'scheduled'</code> e data <code>scheduled_for</code>. Configure um cron job com a extensão <code>pg_cron</code> disparando a cada minuto uma Supabase Edge Function que executa a chamada na Meta Graph API.
                </p>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                <strong className="text-white block font-semibold">Com Firebase (Firestore):</strong>
                <p className="text-[11px] text-slate-400">
                  Salve o documento na coleção <code>/posts</code>. Crie uma Cloud Function agendada (<code>pubsub.schedule('every 5 minutes')</code>) que consulta posts onde <code>scheduledFor &lt;= now()</code> e faz os disparos.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
