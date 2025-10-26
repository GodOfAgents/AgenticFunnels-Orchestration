# AFO Platform - Production Deployment Guide

## 🚀 Deployment Checklist

### ✅ Pre-Deployment Fixes Applied

All deployment blockers identified by the deployment agent have been fixed:

1. ✅ **Frontend URL**: Now uses `REACT_APP_BACKEND_URL` environment variable
2. ✅ **WebSocket URL**: Now uses `REACT_APP_WS_URL` environment variable
3. ✅ **CORS Configuration**: Reads from `ALLOWED_ORIGINS` environment variable
4. ✅ **Secret Keys**: Configuration validates required keys in production
5. ✅ **Database URLs**: All use environment variables

---

## 📋 Required Environment Variables

### Frontend (Wasp)

Create `.env.client` in `/app/template/app/`:

```env
# Backend API URL (REQUIRED)
REACT_APP_BACKEND_URL=https://your-backend-api.com

# WebSocket URL (REQUIRED)
REACT_APP_WS_URL=wss://your-backend-api.com
```

### Backend (FastAPI)

Update `/app/agent-service/.env`:

```env
# Database (REQUIRED)
DATABASE_URL=postgresql://user:password@your-db-host:5432/afo_production

# Redis (Optional - for caching)
REDIS_URL=redis://your-redis-host:6379

# Milvus (Optional - for RAG)
MILVUS_HOST=your-milvus-host
MILVUS_PORT=19530

# OpenAI (REQUIRED - Emergent LLM Key already configured)
OPENAI_API_KEY=sk-emergent-aDf9b1aE7744d59190

# Service
PORT=8001
HOST=0.0.0.0
ENVIRONMENT=production

# Security (REQUIRED - Generate new keys!)
SECRET_KEY=<generate-secure-key>
ENCRYPTION_KEY=<generate-encryption-key>

# CORS (REQUIRED - Add your frontend domain)
ALLOWED_ORIGINS=https://your-frontend-domain.com,https://www.your-frontend-domain.com

# WebSocket
WS_MAX_CONNECTIONS=1000

# Monitoring
ENABLE_METRICS=true
METRICS_PORT=9090
```

---

## 🔐 Generate Secure Keys

### SECRET_KEY
```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

### ENCRYPTION_KEY
```bash
python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
```

---

## 🗄️ Database Setup

### Option 1: PostgreSQL (Recommended)
The application is designed for PostgreSQL. Use a managed service:

- **AWS RDS PostgreSQL**
- **Google Cloud SQL**
- **Azure Database for PostgreSQL**
- **DigitalOcean Managed Databases**
- **Heroku Postgres**
- **Supabase**

Connection string format:
```
postgresql://username:password@host:5432/database_name
```

### Option 2: Adapt for MongoDB (If using Emergent)
Note: The current Prisma schema uses PostgreSQL. To use MongoDB:

1. Update `schema.prisma` to use MongoDB provider:
```prisma
datasource db {
  provider = "mongodb"
  url      = env("DATABASE_URL")
}
```

2. Update all `@id` fields to use MongoDB format:
```prisma
model Agent {
  id String @id @default(auto()) @map("_id") @db.ObjectId
  // ... rest of model
}
```

3. Run new migrations:
```bash
wasp db migrate-dev
```

---

## 🔄 External Services Setup

### Milvus (Vector Database for RAG)

**Cloud Options:**
- **Zilliz Cloud** (Managed Milvus): https://zilliz.com/cloud
- **AWS EC2** with Milvus installation
- **Docker container** on your infrastructure

**Alternative:** Replace Milvus with:
- **Pinecone** (fully managed)
- **Weaviate Cloud**
- **Qdrant Cloud**

### Redis (Caching & WebSocket Scaling)

**Cloud Options:**
- **Redis Cloud** (managed): https://redis.com/cloud
- **AWS ElastiCache**
- **Google Cloud Memorystore**
- **Azure Cache for Redis**
- **DigitalOcean Managed Redis**

**Alternative:** Remove Redis dependency if not scaling WebSocket across multiple instances

---

## 🚢 Deployment Steps

### 1. Deploy Backend (FastAPI)

#### Option A: Docker Deployment
```bash
cd /app/agent-service

# Build Docker image
docker build -t afo-backend .

# Run container
docker run -d \
  -p 8001:8001 \
  --env-file .env \
  --name afo-backend \
  afo-backend
```

#### Option B: Platform as a Service
Deploy to:
- **Render** (recommended for Python)
- **Railway**
- **Fly.io**
- **Google Cloud Run**
- **AWS Elastic Beanstalk**
- **Azure App Service**

**Deploy Command:**
```bash
# Example for Render
render deploy --service-id your-service-id
```

### 2. Deploy Frontend (Wasp)

```bash
cd /app/template/app

# Set environment variables
export REACT_APP_BACKEND_URL=https://your-backend-api.com
export REACT_APP_WS_URL=wss://your-backend-api.com

# Deploy with Wasp
wasp deploy fly launch afo-frontend

# Or build and deploy manually
wasp build
# Deploy dist/ folder to your hosting
```

### 3. Run Database Migrations

```bash
cd /app/template/app
wasp db migrate-deploy
```

### 4. Verify Deployment

Test each service:

```bash
# Backend health check
curl https://your-backend-api.com/health

# Frontend
open https://your-frontend-domain.com

# WebSocket (use browser console)
const ws = new WebSocket('wss://your-backend-api.com/ws/admin');
ws.onopen = () => console.log('Connected!');
```

---

## 🔍 Post-Deployment Verification

### Backend Checks
- [ ] Health endpoint returns 200
- [ ] API docs accessible at `/docs`
- [ ] CORS allows frontend domain
- [ ] WebSocket connections work
- [ ] Database connection successful
- [ ] Anomaly detector running

### Frontend Checks
- [ ] Sign up/login works
- [ ] Agent creation works
- [ ] API calls to backend succeed
- [ ] WebSocket real-time updates work
- [ ] Admin dashboard accessible

### Integration Checks
- [ ] ElevenLabs integration works
- [ ] OpenAI (Emergent Key) works
- [ ] External services accessible (if using Milvus/Redis)

---

## 🐛 Common Deployment Issues

### Issue 1: CORS Errors
**Symptom:** Frontend can't connect to backend  
**Fix:** Ensure `ALLOWED_ORIGINS` includes your frontend domain
```env
ALLOWED_ORIGINS=https://your-frontend.com
```

### Issue 2: Database Connection Failed
**Symptom:** Backend crashes on startup  
**Fix:** Verify `DATABASE_URL` is correct and accessible
```bash
# Test connection
psql $DATABASE_URL -c "SELECT 1"
```

### Issue 3: WebSocket Connection Failed
**Symptom:** Real-time updates don't work  
**Fix:** Ensure WebSocket URL uses `wss://` (not `ws://`) in production

### Issue 4: SECRET_KEY Error
**Symptom:** Backend won't start in production  
**Fix:** Generate and set secure SECRET_KEY
```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

### Issue 5: Milvus/Redis Not Available
**Symptom:** RAG features fail  
**Fix:** Either:
- Deploy Milvus/Redis externally
- Or temporarily disable RAG features
- Or use alternative services

---

## 📊 Monitoring in Production

### Health Monitoring
Set up monitoring for:
- Backend `/health` endpoint (should return 200)
- Frontend uptime
- Database connection
- External service health (Milvus, Redis)

### Logging
Configure logging aggregation:
- **Sentry** for error tracking
- **LogDNA** or **Papertrail** for logs
- **DataDog** for metrics

### Alerts
Set up alerts for:
- Service downtime
- High error rates (>5%)
- Slow response times (>2s)
- Database connection issues
- Anomalies detected by the system

---

## 🔒 Security in Production

### SSL/TLS
- [ ] Enable HTTPS for frontend
- [ ] Enable HTTPS for backend
- [ ] Use WSS for WebSocket

### Secrets Management
- [ ] Rotate SECRET_KEY regularly
- [ ] Store credentials in secret manager (AWS Secrets Manager, etc.)
- [ ] Never commit secrets to git

### Database Security
- [ ] Use strong database passwords
- [ ] Restrict database access to backend IP
- [ ] Enable SSL for database connections
- [ ] Regular backups

### API Security
- [ ] Implement rate limiting
- [ ] Add API authentication
- [ ] Monitor for abuse
- [ ] Keep dependencies updated

---

## 📈 Scaling Considerations

### Horizontal Scaling
To scale beyond one instance:

1. **Use Managed Redis** for WebSocket state
2. **Load Balancer** in front of backend instances
3. **Database Connection Pooling** (already configured)
4. **CDN** for frontend static assets

### Vertical Scaling
Resource recommendations:

**Backend:**
- CPU: 2+ cores
- RAM: 4GB+ (8GB recommended)
- Disk: 20GB+

**Database:**
- RAM: 4GB+ (depends on data size)
- Storage: SSD, 50GB+ initial

---

## ✅ Production Readiness Checklist

### Before Going Live:
- [ ] All environment variables set
- [ ] Secure keys generated
- [ ] Database migrated
- [ ] External services configured (Milvus, Redis)
- [ ] CORS configured for production domain
- [ ] HTTPS enabled
- [ ] Monitoring set up
- [ ] Backup strategy in place
- [ ] Load testing completed
- [ ] Security audit performed

### After Deployment:
- [ ] Verify all features work
- [ ] Test end-to-end flows
- [ ] Monitor error rates
- [ ] Check performance metrics
- [ ] Set up alerts
- [ ] Document any issues

---

## 🆘 Support & Troubleshooting

### Logs Location
- **Backend:** Check your hosting platform's logs
- **Frontend:** Browser console + server logs
- **Database:** Database service logs

### Debug Mode
Enable debug logging:
```env
ENVIRONMENT=development  # Temporarily
```

### Health Endpoints
- Backend: `GET /health`
- Backend Metrics: `GET /api/admin/system-metrics`

---

## 📚 Additional Resources

- **Wasp Deployment Docs:** https://wasp-lang.dev/docs/deploying
- **FastAPI Deployment:** https://fastapi.tiangolo.com/deployment/
- **Docker Best Practices:** https://docs.docker.com/develop/dev-best-practices/
- **PostgreSQL on Cloud:** Choose your provider's documentation
- **Milvus Cloud:** https://zilliz.com/cloud/docs

---

## 🎉 Deployment Success!

Once deployed, your AFO Platform will be live with:
- ✅ AI-powered agent conversations
- ✅ Multi-tenant SaaS architecture
- ✅ Real-time monitoring & anomaly detection
- ✅ Voice integration (ElevenLabs)
- ✅ Comprehensive admin panel
- ✅ Secure credential management

**Congratulations on deploying the AFO Platform!** 🚀

---

*Last Updated: December 2025*  
*Version: 1.0.0*
