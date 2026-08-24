import { useState, useEffect } from "react";
import {
  Shield,
  ShieldAlert,
  Cpu,
  Radio,
  Terminal,
  CircleDot,
} from "lucide-react";
import { Card } from "./Card";

interface SecurityLog {
  id: string;
  time: string;
  type: "info" | "success" | "warning" | "danger";
  message: string;
}

export function SecurityCenter() {
  const [shieldActive, setShieldActive] = useState(true);
  const [logs, setLogs] = useState<SecurityLog[]>([
    {
      id: "1",
      time: "18:14:22",
      type: "success",
      message: "Assinatura digital de transação verificada com sucesso.",
    },
    {
      id: "2",
      time: "17:45:01",
      type: "info",
      message: "Conexão segura restabelecida para Terminal ID 28A4.",
    },
    {
      id: "3",
      time: "16:30:12",
      type: "info",
      message: "Sessão administrativa renovada via MFA por robert@rmtech.io.",
    },
    {
      id: "4",
      time: "14:22:45",
      type: "warning",
      message:
        "IP 192.168.10.155 bloqueado após 3 tentativas inválidas de autenticação.",
    },
  ]);

  // Simulate real-time security logs
  useEffect(() => {
    const interval = setInterval(() => {
      const types: ("info" | "success" | "warning")[] = [
        "info",
        "success",
        "warning",
      ];
      const selectedType = types[Math.floor(Math.random() * types.length)];

      const messages = {
        info: [
          "Terminal verificado com chave criptográfica ECC-384.",
          "Varredura automatizada de vulnerabilidades executada.",
          "Logs de auditoria sincronizados com backup frio.",
        ],
        success: [
          "Token JWT renovado com chaves rotativas.",
          "Integridade da base de dados financeira validada: 100% OK.",
          "Autorização MFA concedida para exportação de dados.",
        ],
        warning: [
          "Acesso detectado fora do padrão geográfico habitual.",
          "Requisição de API incomum vinda de subnet pública.",
          "Tentativa de alteração de limites de transação pendente de aprovação manual.",
        ],
      };

      const randMessageList = messages[selectedType];
      const randomMessage =
        randMessageList[Math.floor(Math.random() * randMessageList.length)];
      const now = new Date();
      const timeString = now.toTimeString().split(" ")[0];

      setLogs((prev) => [
        {
          id: String(Date.now()),
          time: timeString,
          type: selectedType,
          message: randomMessage,
        },
        ...prev.slice(0, 3),
      ]);
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="flex flex-col h-full justify-between">
      <div>
        <Card.Header className="mb-4">
          <Card.Title className="flex items-center gap-2">
            <Shield className="w-4.5 h-4.5 text-cyan-400" />
            <span>Cybersecurity Hub</span>
          </Card.Title>
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest font-mono">
              Live Monitoring
            </span>
          </div>
        </Card.Header>

        <Card.Content className="space-y-4">
          {/* Main Security Stats */}
          <div className="grid grid-cols-2 gap-3.5">
            <div className="bg-surface-base border border-stroke rounded-xl p-3 flex flex-col justify-between">
              <div className="flex items-center justify-between text-content-muted">
                <span className="text-[10px] font-bold uppercase tracking-wide">
                  Shield Status
                </span>
                <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              </div>
              <div className="mt-2.5 flex items-baseline gap-1">
                <span className="text-lg font-bold font-mono text-content-title">
                  {shieldActive ? "PROTECTED" : "WARNING"}
                </span>
              </div>
              <button
                onClick={() => setShieldActive(!shieldActive)}
                className="mt-2.5 w-full text-center text-[10px] font-bold py-1.5 rounded-lg border border-cyan-400/30 hover:border-cyan-400 bg-cyan-400/5 hover:bg-cyan-400 text-cyan-400 hover:text-navy-950 transition-all cursor-pointer"
              >
                {shieldActive ? "Desativar Firewall" : "Ativar Firewall"}
              </button>
            </div>

            <div className="bg-surface-base border border-stroke rounded-xl p-3 flex flex-col justify-between">
              <div className="flex items-center justify-between text-content-muted">
                <span className="text-[10px] font-bold uppercase tracking-wide">
                  Risk Level
                </span>
                <ShieldAlert className="w-3.5 h-3.5 text-emerald-500" />
              </div>
              <div className="mt-2.5">
                <span className="text-lg font-bold font-mono text-emerald-500">
                  0.02%
                </span>
              </div>
              <div className="mt-2.5 flex items-center gap-1.5 text-[9px] text-content-muted">
                <Radio className="w-3 h-3 text-emerald-500 animate-pulse" />
                <span>Zero threats found</span>
              </div>
            </div>
          </div>

          {/* Real-time Security Event Stream */}
          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-content-muted mb-2.5 flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-cyan-400" />
              <span>Eventos de Segurança do Gateway</span>
            </h4>
            <div className="space-y-2 bg-surface-base border border-stroke rounded-xl p-3 h-[180px] overflow-y-auto font-mono text-[10px] leading-relaxed">
              {logs.map((log) => {
                const badgeColor = {
                  info: "text-cyan-400",
                  success: "text-emerald-500",
                  warning: "text-amber-500",
                  danger: "text-rose-500",
                }[log.type];

                return (
                  <div
                    key={log.id}
                    className="flex gap-2 border-b border-stroke/50 pb-1.5 last:border-0 last:pb-0"
                  >
                    <span className="text-content-muted shrink-0">
                      [{log.time}]
                    </span>
                    <span className={`font-bold shrink-0 ${badgeColor}`}>
                      [{log.type.toUpperCase()}]
                    </span>
                    <span className="text-content-body break-all">
                      {log.message}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </Card.Content>
      </div>

      <div className="mt-4 pt-3.5 border-t border-stroke/70 flex items-center justify-between text-[10px] text-content-muted">
        <span className="flex items-center gap-1">
          <CircleDot className="w-2.5 h-2.5 text-emerald-500" />
          Gateway IP: <strong className="font-mono">10.24.45.101</strong>
        </span>
        <span>
          SSL Encryption: <strong>ECC-384</strong>
        </span>
      </div>
    </Card>
  );
}
