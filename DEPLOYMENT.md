# 🚀 StudySphere Deployment Guide

This guide provides step-by-step instructions for deploying StudySphere to various platforms.

## 📋 Pre-deployment Checklist

- [ ] All dependencies installed (`npm install`)
- [ ] Environment variables configured (`.env.local`)
- [ ] Application tested locally (`npm run dev`)
- [ ] Build process successful (`npm run build`)
- [ ] Agentic RAG API keys obtained and tested

## 🌐 Vercel Deployment (Recommended)

### Option 1: Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy from Project Directory**
   ```bash
   cd studysphere
   vercel
   ```

4. **Configure Environment Variables**
   - Go to Vercel Dashboard → Project → Settings → Environment Variables
   - Add all variables from `.env.local`:
     ```
     RAG_WRITER_URL
     RAG_WRITER_KEY
     RAG_READER_KEY
     RAG_GENERATOR_URL
     RAG_GENERATOR_KEY
     RAG_QA_GENERATOR_URL
     RAG_QA_GENERATOR_KEY
     RAG_ASK_URL
     ```

5. **Redeploy with Environment Variables**
   ```bash
   vercel --prod
   ```

### Option 2: GitHub Integration

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial StudySphere deployment"
   git push origin main
   ```

2. **Connect to Vercel**
   - Visit [vercel.com](https://vercel.com)
   - Click "Import Git Repository"
   - Select your StudySphere repository
   - Configure environment variables during setup

## 🐳 Docker Deployment

### Dockerfile
```dockerfile
# Use official Node.js runtime as base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
```

### Docker Compose
```yaml
version: '3.8'

services:
  studysphere:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - RAG_WRITER_URL=${RAG_WRITER_URL}
      - RAG_WRITER_KEY=${RAG_WRITER_KEY}
      - RAG_READER_KEY=${RAG_READER_KEY}
      - RAG_GENERATOR_URL=${RAG_GENERATOR_URL}
      - RAG_GENERATOR_KEY=${RAG_GENERATOR_KEY}
      - RAG_QA_GENERATOR_URL=${RAG_QA_GENERATOR_URL}
      - RAG_QA_GENERATOR_KEY=${RAG_QA_GENERATOR_KEY}
      - RAG_ASK_URL=${RAG_ASK_URL}
    restart: unless-stopped
```

### Deploy with Docker
```bash
# Build and run
docker-compose up -d

# View logs
docker-compose logs -f studysphere

# Stop
docker-compose down
```

## ☁️ AWS Deployment

### Using AWS Amplify

1. **Connect Repository**
   - Go to AWS Amplify Console
   - Click "New App" → "Host web app"
   - Connect your GitHub repository

2. **Configure Build Settings**
   ```yaml
   version: 1
   frontend:
     phases:
       preBuild:
         commands:
           - npm ci
       build:
         commands:
           - npm run build
     artifacts:
       baseDirectory: .next
       files:
         - '**/*'
     cache:
       paths:
         - node_modules/**/*
         - .next/cache/**/*
   ```

3. **Set Environment Variables**
   - Go to App Settings → Environment Variables
   - Add all required RAG API configuration

### Using AWS ECS (Container)

1. **Push to ECR**
   ```bash
   # Build and tag
   docker build -t studysphere .
   docker tag studysphere:latest <account-id>.dkr.ecr.<region>.amazonaws.com/studysphere:latest
   
   # Push to ECR
   aws ecr get-login-password --region <region> | docker login --username AWS --password-stdin <account-id>.dkr.ecr.<region>.amazonaws.com
   docker push <account-id>.dkr.ecr.<region>.amazonaws.com/studysphere:latest
   ```

2. **Create ECS Task Definition**
3. **Deploy to ECS Service**

## 🔧 Environment Configuration

### Production Environment Variables

```bash
# Required for production
NODE_ENV=production
NEXT_PUBLIC_APP_NAME=StudySphere
NEXT_PUBLIC_APP_VERSION=1.0.0

# Agentic RAG Configuration
RAG_WRITER_URL=https://api.agentic-rag.com/writer
RAG_WRITER_KEY=your_production_writer_key
RAG_READER_KEY=your_production_reader_key
RAG_GENERATOR_URL=https://api.agentic-rag.com/generator
RAG_GENERATOR_KEY=your_production_generator_key
RAG_QA_GENERATOR_URL=https://api.agentic-rag.com/qa-generator
RAG_QA_GENERATOR_KEY=your_production_qa_generator_key
RAG_ASK_URL=https://api.agentic-rag.com/ask

# Optional: Authentication (if implementing user management)
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your_production_secret

# Optional: Analytics and Monitoring
NEXT_PUBLIC_GA_ID=your_google_analytics_id
SENTRY_DSN=your_sentry_dsn
```

## 🔍 Health Checks and Monitoring

### Basic Health Check Endpoint
Create `pages/api/health.js`:
```javascript
export default function handler(req, res) {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0'
  });
}
```

### Monitoring Checklist
- [ ] Application startup successful
- [ ] Health endpoint responding (200 OK)
- [ ] PDF upload functionality working
- [ ] RAG API connections established
- [ ] All pages loading correctly
- [ ] No console errors in browser

## 🛡️ Security Considerations

### Production Security Checklist
- [ ] All API keys stored securely in environment variables
- [ ] HTTPS enabled (handled by platform)
- [ ] File upload size limits enforced
- [ ] Input validation on all forms
- [ ] Error messages don't expose sensitive information
- [ ] Rate limiting configured (if needed)
- [ ] CORS policies properly configured

## 📊 Performance Optimization

### Build Optimization
```bash
# Analyze bundle size
npm run analyze

# Check for unused dependencies
npx depcheck

# Optimize images (if any)
npx @next/bundle-analyzer
```

### Performance Checklist
- [ ] Images optimized and properly sized
- [ ] CSS and JavaScript minified
- [ ] Gzip compression enabled
- [ ] CDN configured for static assets
- [ ] Database queries optimized (if applicable)
- [ ] Caching strategies implemented

## 🔄 CI/CD Pipeline Example

### GitHub Actions
Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy StudySphere

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run tests
      run: npm run test
    
    - name: Build application
      run: npm run build
    
    - name: Deploy to Vercel
      uses: amondnet/vercel-action@v20
      with:
        vercel-token: ${{ secrets.VERCEL_TOKEN }}
        vercel-org-id: ${{ secrets.ORG_ID }}
        vercel-project-id: ${{ secrets.PROJECT_ID }}
        vercel-args: '--prod'
```

## 🚨 Troubleshooting

### Common Issues

1. **Build Failures**
   ```bash
   # Clear cache and reinstall
   rm -rf .next node_modules
   npm install
   npm run build
   ```

2. **Environment Variable Issues**
   - Verify all required variables are set
   - Check for typos in variable names
   - Ensure values don't contain special characters

3. **API Connection Issues**
   - Test RAG API endpoints manually
   - Check API key permissions
   - Verify network connectivity

4. **Memory Issues**
   ```bash
   # Increase Node.js memory limit
   export NODE_OPTIONS="--max-old-space-size=4096"
   npm run build
   ```

## 📞 Post-deployment

### Launch Checklist
- [ ] Domain configured and SSL certificate active
- [ ] All features tested in production environment
- [ ] Error tracking configured (Sentry, etc.)
- [ ] Analytics tracking implemented
- [ ] Backup strategy in place
- [ ] Documentation updated with production URLs

### Monitoring
- Set up uptime monitoring
- Configure log aggregation
- Monitor API usage and rate limits
- Track user engagement metrics

---

🎉 **Congratulations!** Your StudySphere application is now deployed and ready to transform PDF learning experiences!

For support or questions, please check the main README.md or open an issue in the repository.