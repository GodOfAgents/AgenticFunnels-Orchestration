# LiveKit Setup Guide for AFO Platform

This guide explains how to set up LiveKit for voice communication in the AFO Platform.

## 🎯 What is LiveKit?

LiveKit is an open-source WebRTC infrastructure that provides:
- Real-time voice and video communication
- Scalable room-based architecture
- Low-latency audio streaming
- Self-hosted or cloud deployment options

## 🚀 Quick Start (Docker)

### Option 1: Docker Compose (Recommended)

The easiest way to run LiveKit locally:

```bash
# Start LiveKit and its Redis dependency
cd /app
docker-compose up -d livekit redis-livekit

# Check logs
docker-compose logs -f livekit

# Stop services
docker-compose down
```

### Option 2: Docker Run

Run LiveKit directly with Docker:

```bash
# Pull the image
docker pull livekit/livekit-server:latest

# Run LiveKit
docker run -d \
  --name livekit \
  -p 7880:7880 \
  -p 7881:7881 \
  -p 7882:7882 \
  -p 50000-50200:50000-50200/udp \
  -v $(pwd)/livekit-config.yaml:/etc/livekit.yaml \
  livekit/livekit-server:latest \
  --config /etc/livekit.yaml
```

## 📦 Option 3: Native Installation

### macOS (Homebrew)

```bash
brew install livekit
livekit-server --config livekit-config.yaml
```

### Linux

```bash
# Download the latest release
curl -sSL https://get.livekit.io | bash

# Run with config
livekit-server --config livekit-config.yaml
```

### Windows

Download the Windows binary from: https://github.com/livekit/livekit/releases

```powershell
.\livekit-server.exe --config livekit-config.yaml
```

## ⚙️ Configuration

The `livekit-config.yaml` file includes:

### Development Configuration (Current)

```yaml
port: 7880
keys:
  devkey: devsecret
room:
  auto_create: true
  empty_timeout: 300
development: true
```

### Production Configuration

For production, update these settings:

```yaml
port: 7880
bind_addresses:
  - "0.0.0.0"

# Generate new API keys
keys:
  your-production-key: your-production-secret

# Configure public IP for external access
rtc:
  use_external_ip: true
  node_ip: "your.public.ip.address"
  
  # UDP port range
  port_range_start: 50000
  port_range_end: 50200

# Production Redis
redis:
  address: your-redis-host:6379
  password: your-redis-password

# Room settings
room:
  max_duration: 7200  # 2 hours
  empty_timeout: 300  # 5 minutes
  auto_create: true

# Disable development mode
development: false

# Enable webhooks for room events
webhook:
  urls:
    - https://your-backend.com/api/webhooks/livekit
  api_key: your-webhook-secret
```

## 🔐 Generating API Keys

For production, generate secure API keys:

```bash
# Using LiveKit CLI
livekit-cli create-token \
  --api-key your-api-key \
  --api-secret your-api-secret \
  --identity user-123 \
  --room my-room

# Or use the online generator
# https://livekit.io/tools/keygen
```

## 🌐 Environment Variables

Update your backend `.env` file:

```env
# Development
LIVEKIT_URL=ws://localhost:7880
LIVEKIT_API_KEY=devkey
LIVEKIT_API_SECRET=devsecret

# Production (example)
LIVEKIT_URL=wss://livekit.yourdomain.com
LIVEKIT_API_KEY=APIxxxxxxxxxxxxx
LIVEKIT_API_SECRET=secretxxxxxxxxxxxxxx
```

## 🧪 Testing LiveKit

### 1. Check if LiveKit is Running

```bash
curl http://localhost:7880/
# Should return LiveKit server info
```

### 2. Test Voice Session Creation

```bash
curl -X POST http://localhost:8001/api/phase2/voice/session \
  -H "Content-Type: application/json" \
  -d '{
    "agent_id": "test-agent",
    "agent_config": {"name": "Test Agent"},
    "user_credentials": {
      "deepgram_api_key": "your-deepgram-key",
      "elevenlabs_api_key": "your-elevenlabs-key",
      "openai_api_key": "your-openai-key"
    }
  }'
```

Expected response:
```json
{
  "session_id": "uuid-here",
  "room_name": "afo-session-xxxxx",
  "livekit_url": "ws://localhost:7880",
  "access_token": "jwt-token-here",
  "status": "active",
  "agent_id": "test-agent"
}
```

### 3. Connect to Room (Frontend)

The frontend can now connect using the LiveKit JS SDK:

```typescript
import { Room } from 'livekit-client';

const room = new Room();
await room.connect(livekit_url, access_token, {
  audio: true,
  video: false
});
```

## 🔧 Troubleshooting

### Issue: Can't connect to LiveKit

**Solution:**
- Check if LiveKit is running: `docker ps` or `lsof -i :7880`
- Verify firewall rules allow ports 7880, 7881, 7882
- Check UDP ports 50000-50200 are open
- Review logs: `docker logs livekit`

### Issue: No audio in voice sessions

**Solution:**
- Verify Deepgram and ElevenLabs API keys are valid
- Check browser microphone permissions
- Ensure NAT/firewall allows UDP traffic
- Test with a simple LiveKit example first

### Issue: WebRTC connection fails

**Solution:**
- In production, configure TURN server in `livekit-config.yaml`
- Ensure public IP is correctly configured
- Check WebRTC debug logs in browser console

## 📊 Monitoring

### LiveKit Metrics

LiveKit exposes Prometheus metrics on port 6789:

```bash
curl http://localhost:6789/metrics
```

### WebSocket Connections

Monitor active rooms and participants:

```bash
# Using LiveKit CLI
livekit-cli list-rooms --url ws://localhost:7880

# List participants in a room
livekit-cli list-participants --url ws://localhost:7880 --room room-name
```

## 🚀 Production Deployment

### Recommended Infrastructure

```
┌─────────────┐
│  Load       │
│  Balancer   │
└──────┬──────┘
       │
   ┌───┴────┐
   │        │
┌──▼──┐  ┌──▼──┐
│LK-1 │  │LK-2 │  LiveKit Servers
└──┬──┘  └──┬──┘
   │        │
   └───┬────┘
       │
  ┌────▼────┐
  │  Redis  │  Shared state
  └─────────┘
```

### Cloud Deployment Options

1. **Self-hosted**: Deploy on AWS/GCP/Azure with Docker/Kubernetes
2. **LiveKit Cloud**: Managed hosting at https://cloud.livekit.io
3. **Hybrid**: Self-host control plane, use cloud for media servers

### Kubernetes Deployment

Example Helm chart values:

```yaml
replicaCount: 2

service:
  type: LoadBalancer
  port: 7880

redis:
  enabled: true

config:
  keys:
    production-key: production-secret
  rtc:
    use_external_ip: true
```

## 📚 Additional Resources

- **Official Docs**: https://docs.livekit.io
- **GitHub**: https://github.com/livekit/livekit
- **Community**: https://livekit.io/community
- **Examples**: https://github.com/livekit/livekit-examples

## 🔄 Migrating from Daily.co

If you previously used Daily.co, the migration is simple:

| Daily.co | LiveKit |
|----------|---------|
| room_url | room_name + livekit_url |
| Daily token | LiveKit access token |
| DailyTransport | LiveKitTransport |
| Daily.co dashboard | Self-hosted control |

**Benefits of switching to LiveKit:**
- ✅ Open-source and self-hosted
- ✅ No per-minute charges
- ✅ Full control over infrastructure
- ✅ Better for multi-tenant SaaS
- ✅ More flexible configuration

---

**Need help?** Check the [troubleshooting](#troubleshooting) section or open an issue on GitHub.
