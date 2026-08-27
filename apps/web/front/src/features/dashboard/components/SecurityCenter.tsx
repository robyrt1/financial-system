import { useState, useEffect, useRef } from "react";
import {
  Shield,
  ShieldAlert,
  Cpu,
  Radio,
  Terminal,
  CircleDot,
} from "lucide-react";
import { Card } from "../../../components/ui/Card";
import { api } from "../../../app/api";

interface SecurityLog {
  id: string;
  timestamp: string;
  level: "INFO" | "SUCCESS" | "WARNING" | "CRITICAL";
  message: string;
}

interface SecurityStatus {
  shieldStatus: "PROTEGIDO" | "ALERTA" | "DESATIVADO";
  riskLevel: number;
  threatsCount: number;
  firewallActive: boolean;
  gatewayIp: string;
  sslEncryption: string;
}

export function SecurityCenter() {
  const [status, setStatus] = useState<SecurityStatus>({
    shieldStatus: "PROTEGIDO",
    riskLevel: 0.02,
    threatsCount: 0,
    firewallActive: true,
    gatewayIp: "10.24.45.101",
    sslEncryption: "ECC-384",
  });
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  const fetchStatus = async () => {
    try {
      const response = await api.get<{
        status: SecurityStatus;
        recentLogs: SecurityLog[];
      }>("/security/status");
      setStatus(response.data.status);

      const reversedLogs = [...response.data.recentLogs].reverse();
      setLogs(reversedLogs);
    } catch (err) {
      console.error("Erro ao carregar status de segurança:", err);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  useEffect(() => {
    const sseBaseUrl =
      import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1";
    const sseUrl = `${sseBaseUrl}/security/events/stream`;

    let eventSource: EventSource | null = null;
    let reconnectTimeout: NodeJS.Timeout;

    const connectSSE = () => {
      eventSource = new EventSource(sseUrl);

      eventSource.onopen = () => {
        setIsConnected(true);
      };

      eventSource.onmessage = (event) => {
        try {
          const log: SecurityLog = JSON.parse(event.data);
          setLogs((prev) => {
            if (prev.some((l) => l.id === log.id)) return prev;
            const updated = [...prev, log];
            return updated.slice(-50);
          });
          fetchStatus();
        } catch (err) {
          console.error("Erro ao processar mensagem SSE:", err);
        }
      };

      eventSource.onerror = () => {
        setIsConnected(false);
        eventSource?.close();
        reconnectTimeout = setTimeout(connectSSE, 3000);
      };
    };

    connectSSE();

    return () => {
      eventSource?.close();
      clearTimeout(reconnectTimeout);
    };
  }, []);

  const handleToggleFirewall = async () => {
    try {
      const response = await api.post<SecurityStatus>(
        "/security/firewall/toggle",
      );
      setStatus(response.data);
      fetchStatus();
    } catch (err) {
      console.error("Erro ao alternar firewall:", err);
    }
  };

  return (
    <Card className="flex flex-col h-full justify-between">
      <div>
        <Card.Header className="mb-4">
          <Card.Title className="flex items-center gap-2">
            <Shield className="w-4.5 h-4.5 text-cyan-400" />
            <span>CENTRO DE SEGURANÇA CIBERNÉTICA</span>
          </Card.Title>
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 relative">
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  isConnected ? "bg-emerald-400" : "bg-amber-400"
                }`}
              ></span>
              <span
                className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                  isConnected ? "bg-emerald-500" : "bg-amber-500"
                }`}
              ></span>
            </span>
            <span
              className={`text-[12px] font-bold uppercase tracking-widest font-mono ${
                isConnected ? "text-emerald-500" : "text-amber-500"
              }`}
            >
              {isConnected ? "MONITORAMENTO AO VIVO" : "RECONECTANDO..."}
            </span>
          </div>
        </Card.Header>

        <Card.Content className="space-y-4">
          {/* Main Security Stats */}
          <div className="grid grid-cols-2 gap-3.5">
            <div className="bg-surface-base border border-stroke rounded-xl p-3 flex flex-col justify-between">
              <div className="flex items-center justify-between text-content-muted">
                <span className="text-[12px] font-bold uppercase tracking-wide">
                  Status do Escudo
                </span>
                <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              </div>
              <div className="mt-2.5 flex items-baseline gap-1">
                <span
                  className={`text-lg font-bold font-mono ${
                    status.shieldStatus === "PROTEGIDO"
                      ? "text-emerald-400"
                      : status.shieldStatus === "ALERTA"
                        ? "text-amber-400"
                        : "text-rose-500"
                  }`}
                >
                  {status.shieldStatus}
                </span>
              </div>
              <button
                onClick={handleToggleFirewall}
                className="mt-2.5 w-full text-center text-[12px] font-bold py-1.5 rounded-lg border border-cyan-400/30 hover:border-cyan-400 bg-cyan-400/5 hover:bg-cyan-400 text-cyan-400 hover:text-navy-950 transition-all cursor-pointer focus:outline-none"
              >
                {status.firewallActive
                  ? "Desativar Firewall"
                  : "Ativar Firewall"}
              </button>
            </div>

            <div className="bg-surface-base border border-stroke rounded-xl p-3 flex flex-col justify-between">
              <div className="flex items-center justify-between text-content-muted">
                <span className="text-[12px] font-bold uppercase tracking-wide">
                  Nível de Risco
                </span>
                <ShieldAlert
                  className={`w-3.5 h-3.5 ${
                    status.shieldStatus === "PROTEGIDO"
                      ? "text-emerald-400"
                      : status.shieldStatus === "ALERTA"
                        ? "text-amber-400"
                        : "text-rose-500"
                  }`}
                />
              </div>
              <div className="mt-2.5">
                <span
                  className={`text-lg font-bold font-mono ${
                    status.shieldStatus === "PROTEGIDO"
                      ? "text-emerald-400"
                      : status.shieldStatus === "ALERTA"
                        ? "text-amber-400"
                        : "text-rose-500"
                  }`}
                >
                  {status.riskLevel.toFixed(2)}%
                </span>
              </div>
              <div className="mt-2.5 flex items-center gap-1.5 text-[9px] text-content-muted">
                <Radio
                  className={`w-3 h-3 animate-pulse ${
                    status.threatsCount > 0
                      ? "text-rose-500"
                      : "text-emerald-500"
                  }`}
                />
                <span>
                  {status.threatsCount === 0
                    ? "Zero threats found"
                    : `${status.threatsCount} ameaças encontradas`}
                </span>
              </div>
            </div>
          </div>

          {/* Real-time Security Event Stream */}
          <div>
            <h4 className="text-[12px] font-bold uppercase tracking-wider text-content-muted mb-2.5 flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-cyan-400" />
              <span>EVENTOS DE SEGURANÇA DO GATEWAY</span>
            </h4>
            <div className="space-y-2 bg-surface-base border border-stroke rounded-xl p-3 h-[180px] overflow-y-auto font-mono text-[12px] leading-relaxed">
              {logs.map((log) => {
                const badgeColor =
                  {
                    INFO: "text-cyan-400",
                    SUCCESS: "text-emerald-500",
                    WARNING: "text-amber-500",
                    CRITICAL: "text-rose-500",
                  }[log.level] || "text-content-title";

                return (
                  <div
                    key={log.id}
                    className="flex gap-2 border-b border-stroke/50 pb-1.5 last:border-0 last:pb-0"
                  >
                    <span className="text-content-muted shrink-0">
                      [ {log.timestamp} ]
                    </span>
                    <span className={`font-bold shrink-0 ${badgeColor}`}>
                      [ {log.level} ]
                    </span>
                    <span className="text-content-body break-all">
                      {log.message}
                    </span>
                  </div>
                );
              })}
              <div ref={terminalEndRef} />
            </div>
          </div>
        </Card.Content>
      </div>

      <div className="mt-4 pt-3.5 border-t border-stroke/70 flex items-center justify-between text-[12px] text-content-muted">
        <span className="flex items-center gap-1">
          <CircleDot className="w-2.5 h-2.5 text-emerald-500" />
          Gateway IP: <strong className="font-mono">{status.gatewayIp}</strong>
        </span>
        <span>
          SSL Encryption: <strong>{status.sslEncryption}</strong>
        </span>
      </div>
    </Card>
  );
}
