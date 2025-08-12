# AuthFlow Enterprise Platform

A full-stack user management system with AI-powered chat capabilities. Complete user lifecycle from registration to intelligent conversations.

## What It Does

**User Journey:**
1. **Register/Login** → JWT authentication + Google OAuth
2. **Profile Setup** → Upload profile picture, update details  
3. **Dashboard** → Personalized user experience
4. **AI Chat** → Real-time streaming conversations with OpenAI
5. **File Management** → Automatic cleanup of unused photos via RabbitMQ

## Tech Stack

**Backend:** Spring Boot, JWT, OAuth2, WebFlux, RabbitMQ, PostgreSQL  
**Frontend:** React, SSE streaming  
**APIs:** REST + GraphQL  
**AI:** OpenAI GPT-3.5 streaming chat  
**Infrastructure:** Docker, Message queues, file processing, rate limiting

## Quick Start

```bash
# Backend
cd backend
mvn spring-boot:run


# Frontend  
cd frontend
npm install && npm start
```
Appliation Run: docker-compose up --build

## Key Features

- 🔐 **Secure Auth** - JWT + Google OAuth + session management
- 👤 **Profile Management** - Real-time updates, photo upload
- 🤖 **AI Streaming Chat** - OpenAI integration with conversation history
- 🗂️ **Smart File Cleanup** - RabbitMQ background processing
- 🏗️ **Modern Architecture** -  REST/GraphQL, reactive streaming


---
**Enterprise-grade user platform with intelligent AI integration**