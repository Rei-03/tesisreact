#!/bin/bash

# Script para gestionar Docker Compose en producción
# Uso: ./deploy.sh [comando] [opciones]

set -e

COMPOSE_FILE="docker-compose.prod.yml"
COMPOSE_CMD="docker-compose -f $COMPOSE_FILE"

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Funciones
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warn() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

show_help() {
    cat << EOF
${BLUE}Gestor de Docker Compose - Producción${NC}

${GREEN}Uso:${NC}
  ./deploy.sh [comando] [opciones]

${GREEN}Comandos:${NC}
  build         Construir imágenes Docker
  up            Iniciar servicios en background
  down          Detener servicios
  logs          Ver logs de los servicios
  ps            Ver estado de los servicios
  restart       Reiniciar servicios
  clean         Detener y eliminar volúmenes
  validate      Validar docker-compose.prod.yml
  health        Verificar healthcheck de servicios

${GREEN}Opciones:${NC}
  -s, --service [nombre]  Aplicar a servicio específico
  -f, --follow           Seguir logs en tiempo real
  -t, --tail [n]         Últimas n líneas de logs
  --no-cache             Construir sin usar caché
  -h, --help             Mostrar esta ayuda

${GREEN}Ejemplos:${NC}
  ./deploy.sh build
  ./deploy.sh up
  ./deploy.sh logs -f
  ./deploy.sh logs -s auth-ms -t 50
  ./deploy.sh restart -s api-gateway
  ./deploy.sh health

EOF
}

# Parse arguments
COMMAND=$1
SERVICE=""
FOLLOW=""
TAIL="all"
NO_CACHE=""

shift || true

while [[ $# -gt 0 ]]; do
    case $1 in
        -s|--service)
            SERVICE="$2"
            shift 2
            ;;
        -f|--follow)
            FOLLOW="-f"
            shift
            ;;
        -t|--tail)
            TAIL="$2"
            shift 2
            ;;
        --no-cache)
            NO_CACHE="--no-cache"
            shift
            ;;
        -h|--help)
            show_help
            exit 0
            ;;
        *)
            log_error "Opción desconocida: $1"
            show_help
            exit 1
            ;;
    esac
done

# Ejecutar comandos
case $COMMAND in
    build)
        log_info "Construyendo imágenes Docker..."
        $COMPOSE_CMD build $NO_CACHE
        log_success "Imágenes construidas exitosamente"
        ;;
    
    up)
        log_info "Iniciando servicios..."
        $COMPOSE_CMD up -d
        log_success "Servicios iniciados"
        sleep 2
        $COMPOSE_CMD ps
        ;;
    
    down)
        log_info "Deteniendo servicios..."
        $COMPOSE_CMD down
        log_success "Servicios detenidos"
        ;;
    
    logs)
        log_info "Mostrando logs..."
        if [ -n "$SERVICE" ]; then
            log_info "Servicio: $SERVICE"
            if [ "$TAIL" = "all" ]; then
                $COMPOSE_CMD logs $FOLLOW $SERVICE
            else
                $COMPOSE_CMD logs $FOLLOW --tail=$TAIL $SERVICE
            fi
        else
            if [ "$TAIL" = "all" ]; then
                $COMPOSE_CMD logs $FOLLOW
            else
                $COMPOSE_CMD logs $FOLLOW --tail=$TAIL
            fi
        fi
        ;;
    
    ps)
        log_info "Estado de servicios:"
        $COMPOSE_CMD ps
        ;;
    
    restart)
        if [ -n "$SERVICE" ]; then
            log_info "Reiniciando servicio: $SERVICE..."
            $COMPOSE_CMD restart $SERVICE
            log_success "Servicio reiniciado"
        else
            log_info "Reiniciando todos los servicios..."
            $COMPOSE_CMD restart
            log_success "Servicios reiniciados"
        fi
        $COMPOSE_CMD ps
        ;;
    
    clean)
        log_warn "Esto eliminará todos los contenedores, redes y volúmenes"
        read -p "¿Deseas continuar? (s/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Ss]$ ]]; then
            log_info "Limpiando..."
            $COMPOSE_CMD down -v
            log_success "Limpieza completada"
        else
            log_info "Cancelado"
        fi
        ;;
    
    validate)
        log_info "Validando $COMPOSE_FILE..."
        $COMPOSE_CMD config --quiet
        log_success "Configuración válida"
        ;;
    
    health)
        log_info "Verificando healthcheck de servicios..."
        $COMPOSE_CMD ps
        echo
        log_info "Detalles de healthcheck:"
        
        # Servicios con healthcheck
        SERVICES=("nats-server" "postgres-auth" "redis-cache" "auth-ms" "circuitos-ms" "rotaciones-ms" "api-gateway")
        
        for service in "${SERVICES[@]}"; do
            STATUS=$(docker inspect -f '{{.State.Health.Status}}' $service 2>/dev/null || echo "no healthcheck")
            if [ "$STATUS" = "healthy" ]; then
                echo -e "${GREEN}✓${NC} $service: $STATUS"
            elif [ "$STATUS" = "unhealthy" ]; then
                echo -e "${RED}✗${NC} $service: $STATUS"
            else
                echo -e "${YELLOW}→${NC} $service: $STATUS"
            fi
        done
        ;;
    
    *)
        log_error "Comando desconocido: $COMMAND"
        show_help
        exit 1
        ;;
esac
