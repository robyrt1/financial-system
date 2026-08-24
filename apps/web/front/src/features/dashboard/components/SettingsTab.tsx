import { useState, useEffect } from "react";
import { ShieldCheck, Copy, Check, Eye, EyeOff } from "lucide-react";
import { api } from "../../../app/api";

export function SettingsTab() {
  const [loading, setLoading] = useState(false);
  const [isMfaEnabled, setIsMfaEnabled] = useState(false);
  const [mfaData, setMfaData] = useState<{
    secret: string;
    qrCode: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchMfaStatus = async () => {
      try {
        const response = await api.get("/auth/mfa/status");
        setIsMfaEnabled(response.data.mfaEnabled);
      } catch (err) {
        console.error("Erro ao buscar status do MFA:", err);
      }
    };
    fetchMfaStatus();
  }, []);

  const handleSetupMfa = async () => {
    setLoading(true);
    try {
      const response = await api.post("/auth/mfa/setup");
      setMfaData(response.data);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      const message = err instanceof Error ? err.message : String(err);
      alert(message || "Erro ao configurar MFA");
    }
  };

  const handleCopySecret = () => {
    if (!mfaData) return;
    navigator.clipboard.writeText(mfaData.secret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const qrCodeUrl = mfaData
    ? `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(mfaData.qrCode)}`
    : "";

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fadeIn">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-content-title">
          Configurações do Sistema
        </h2>
        <p className="text-sm text-content-muted mt-1">
          Gerencie a segurança e as preferências do seu terminal RMTECH.
        </p>
      </div>

      <div className="bg-surface-card border border-stroke rounded-2xl p-6 space-y-6">
        <div className="flex items-start space-x-4 border-b border-stroke pb-6">
          <div className="p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-xl text-cyan-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-content-title">
              Autenticação de Dois Fatores (MFA / 2FA)
            </h3>
            <p className="text-sm text-content-muted mt-1">
              Adicione uma camada adicional de cibersegurança. Toda vez que
              acessar o terminal, além de sua senha corporativa, você deverá
              inserir o token dinâmico de 6 dígitos gerado por um aplicativo de
              autenticação.
            </p>
          </div>
        </div>

        {/* Display Status Panel */}
        {isMfaEnabled && !mfaData ? (
          <div className="space-y-6">
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-sm flex items-start space-x-2.5">
              <ShieldCheck className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">STATUS: ATIVO & PROTEGIDO</p>
                <p className="text-xs text-content-muted mt-0.5">
                  A autenticação MFA está devidamente configurada em seu
                  terminal. Suas sessões exigem validação criptográfica TOTP.
                </p>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={handleSetupMfa}
                disabled={loading}
                className="px-4 py-2 bg-surface-base border border-stroke hover:border-cyan-400 text-content-title hover:text-cyan-400 text-xs font-semibold rounded-xl transition-all cursor-pointer focus:outline-none"
              >
                {loading
                  ? "Processando..."
                  : "Reconfigurar MFA / Novo Dispositivo"}
              </button>
            </div>
          </div>
        ) : !mfaData ? (
          <div className="py-4">
            <button
              onClick={handleSetupMfa}
              disabled={loading}
              className="px-5 py-3 bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 text-navy-950 font-bold rounded-xl transition-all shadow-lg shadow-cyan-500/20 cursor-pointer flex items-center space-x-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>
                {loading
                  ? "Processando..."
                  : "Ativar Autenticação de Dois Fatores"}
              </span>
            </button>
          </div>
        ) : (
          <div className="space-y-6 pt-2">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              {/* QR Code */}
              <div className="flex flex-col items-center justify-center p-4 bg-surface-base border border-stroke rounded-2xl max-w-[240px] mx-auto md:mx-0">
                <img
                  src={qrCodeUrl}
                  alt="QR Code MFA"
                  className="w-44 h-44 rounded-lg select-none border border-stroke p-1.5 bg-white"
                />
                <span className="text-[10px] text-content-muted mt-3 font-mono">
                  Scan via Google Authenticator
                </span>
              </div>

              {/* Steps and Secret key */}
              <div className="md:col-span-2 space-y-4">
                <div className="space-y-2">
                  <h4 className="text-sm font-bold text-content-title">
                    Instruções de Ativação
                  </h4>
                  <ol className="list-decimal pl-4 text-xs text-content-body space-y-1.5">
                    <li>
                      Abra o aplicativo de autenticação em seu smartphone
                      (Google Authenticator, Authy ou similar).
                    </li>
                    <li>
                      Escolha a opção de adicionar conta e escaneie o código QR
                      ao lado.
                    </li>
                    <li>
                      Se não puder ler o código, insira manualmente a chave
                      secreta gerada abaixo.
                    </li>
                  </ol>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-content-muted block">
                    Chave Secreta (Base32)
                  </label>
                  <div className="flex items-center space-x-2 max-w-md">
                    <div className="flex-1 bg-surface-base border border-stroke rounded-xl px-4 py-3 font-mono text-sm tracking-widest text-content-title relative flex items-center justify-between">
                      <span>
                        {showSecret
                          ? mfaData?.secret
                          : "•••• •••• •••• •••• ••••"}
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowSecret(!showSecret)}
                        className="text-content-muted hover:text-cyan-400 transition-colors focus:outline-none cursor-pointer"
                      >
                        {showSecret ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>

                    <button
                      onClick={handleCopySecret}
                      className="p-3 bg-surface-base border border-stroke hover:border-cyan-400 rounded-xl text-content-title hover:text-cyan-400 transition-all cursor-pointer focus:outline-none shrink-0"
                      title="Copiar Chave Secreta"
                    >
                      {copied ? (
                        <Check className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-stroke flex justify-end">
              <button
                onClick={() => {
                  setMfaData(null);
                  setIsMfaEnabled(true);
                  setSuccess(true);
                  setTimeout(() => setSuccess(false), 5000);
                }}
                className="px-5 py-2.5 bg-surface-base border border-stroke hover:border-cyan-400 text-content-body hover:text-cyan-400 font-bold rounded-xl text-sm transition-all cursor-pointer"
              >
                Concluir Configuração
              </button>
            </div>
          </div>
        )}

        {success && (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-sm flex items-start space-x-2.5">
            <ShieldCheck className="w-5 h-5 shrink-0" />
            <div>
              <p className="font-bold">Autenticação MFA Habilitada!</p>
              <p className="text-xs text-content-muted mt-0.5">
                Nas próximas conexões com o terminal, o sistema exigirá o código
                TOTP de 6 dígitos para conceder acesso.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
