# Financial System - Backend (Development)

Ambiente de desenvolvimento local do banco de dados e serviços auxiliares do backend via Docker Compose.

---

## 📋 Pré-requisitos

* [Docker](https://docs.docker.com/get-docker/) instalado
* [Docker Compose v2](https://docs.docker.com/compose/) instalado

---

## 🚀 Como Executar

### 1. Configurar as Variáveis de Ambiente

Crie o link simbólico apontando o arquivo de desenvolvimento `.env.development` para o `.env` padrão:

```bash
ln -sf .env.development .env

### 2. Executar Direto
docker compose --profile dev --env-file=.env.development -f docker-databases.yml up
