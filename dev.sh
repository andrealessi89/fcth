#!/bin/bash
# =============================================
#  FCTH - Script de Desenvolvimento
# =============================================
#  Inicia: Backend (3001) + Frontend (5173) + Admin (5174)
#  Para parar tudo: Ctrl+C
# =============================================

ROOT="$(cd "$(dirname "$0")" && pwd)"

# Mata processos antigos nas portas
kill $(lsof -t -i:3001) 2>/dev/null
kill $(lsof -t -i:5173) 2>/dev/null
kill $(lsof -t -i:5174) 2>/dev/null
sleep 1

# Guarda PIDs para matar no Ctrl+C
PIDS=()
cleanup() {
  echo ""
  echo "[DEV] Parando todos os servicos..."
  for pid in "${PIDS[@]}"; do
    kill "$pid" 2>/dev/null
  done
  exit 0
}
trap cleanup SIGINT SIGTERM

echo "============================================="
echo "  FCTH - Ambiente de Desenvolvimento"
echo "============================================="
echo ""

# 1) Backend
echo "[1/3] Iniciando Backend (porta 3001)..."
(cd "$ROOT" && node server.js) &
PIDS+=($!)
sleep 2

# 2) Frontend
echo "[2/3] Iniciando Frontend (porta 5173)..."
(cd "$ROOT/frontend" && npx vite --port 5173) &
PIDS+=($!)
sleep 1

# 3) Admin
echo "[3/3] Iniciando Admin (porta 5174)..."
(cd "$ROOT/admin" && npx vite --port 5174) &
PIDS+=($!)
sleep 2

echo ""
echo "============================================="
echo "  Tudo rodando!"
echo "============================================="
echo ""
echo "  Site:   http://localhost:5173"
echo "  Admin:  http://localhost:5174/admin/"
echo "  API:    http://localhost:3001/api"
echo ""
echo "  Login admin: admin / fcth2026"
echo ""
echo "  Ctrl+C para parar tudo"
echo "============================================="
echo ""

# Espera todos os processos
wait
