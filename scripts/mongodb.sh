#!/bin/bash

# MongoDB management script for QuanLyMuonSach

case "$1" in
  start)
    echo "🚀 Starting MongoDB..."
    docker-compose up -d mongodb
    echo "✅ MongoDB started successfully!"
    echo "📊 MongoDB Admin: http://localhost:8081"
    ;;
  stop)
    echo "🛑 Stopping MongoDB..."
    docker-compose down
    echo "✅ MongoDB stopped successfully!"
    ;;
  restart)
    echo "🔄 Restarting MongoDB..."
    docker-compose restart mongodb
    echo "✅ MongoDB restarted successfully!"
    ;;
  logs)
    echo "📋 MongoDB logs:"
    docker-compose logs -f mongodb
    ;;
  status)
    echo "📊 MongoDB status:"
    docker-compose ps mongodb
    ;;
  admin)
    echo "🌐 Starting MongoDB Admin interface..."
    docker-compose up -d mongo-express
    echo "✅ MongoDB Admin available at: http://localhost:8081"
    ;;
  *)
    echo "Usage: $0 {start|stop|restart|logs|status|admin}"
    echo ""
    echo "Commands:"
    echo "  start   - Start MongoDB container"
    echo "  stop    - Stop all containers"
    echo "  restart - Restart MongoDB container"
    echo "  logs    - Show MongoDB logs"
    echo "  status  - Show container status"
    echo "  admin   - Start MongoDB Admin interface"
    exit 1
    ;;
esac