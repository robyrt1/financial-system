/* global __VU, __ITER */
import http from "k6/http";
import { check, sleep } from "k6";

// Configurações do teste de carga
export const options = {
  stages: [
    { duration: "15s", target: 20 }, // Ramp-up: sobe para 20 usuários simultâneos
    { duration: "30s", target: 20 }, // Estabilidade: mantém 20 usuários simulando requisições
    { duration: "10s", target: 0 }, // Ramp-down: reduz para 0 usuários
  ],
  thresholds: {
    http_req_duration: ["p(95)<500"], // 95% das requisições devem responder em menos de 500ms
    http_req_failed: ["rate<0.01"], // Taxa de falha de requisições menor que 1%
  },
};

export default function () {
  const baseUrl = "http://localhost:4000/api/v1/auth";

  // Gera credenciais únicas para cada iteração para evitar conflitos no banco
  const uniqueId = `${__VU}-${__ITER}-${Math.floor(Math.random() * 1000000)}`;
  const email = `loadtest-${uniqueId}@example.com`;
  const password = "Password123!";
  const name = `VU-${__VU} User`;

  const headers = { "Content-Type": "application/json" };

  // 1. Cadastra Usuário (Escrita pesada com hash Bcrypt no banco)
  const registerPayload = JSON.stringify({ name, email, password });
  const registerRes = http.post(`${baseUrl}/register`, registerPayload, {
    headers,
  });

  check(registerRes, {
    "cadastro retornou 201": (r) => r.status === 201,
  });

  // Aguarda 1 segundo simulando tempo de leitura
  sleep(1);

  // 2. Realiza Login (Operação CPU-bound de verificação de hash)
  const loginPayload = JSON.stringify({ email, password });
  const loginRes = http.post(`${baseUrl}/login`, loginPayload, { headers });

  check(loginRes, {
    "login retornou 200": (r) => r.status === 200,
    "contém accessToken": (r) => {
      try {
        return JSON.parse(r.body).accessToken !== undefined;
      } catch {
        return false;
      }
    },
  });

  sleep(1);
}
