# Support Ticket System

A full-stack web application for managing support tickets with AI-powered categorization and prioritization using LLM integration.

## Overview

The Support Ticket System allows users to:
- **Submit tickets** with automatic category and priority suggestions powered by OpenAI's GPT-3.5-turbo
- **Browse and filter tickets** by category, priority, status, and search keywords
- **View aggregated metrics** including total tickets, open count, and breakdowns by priority/category
- **Manage ticket status** by updating tickets from open → in progress → resolved → closed

## Tech Stack

**Backend:**
- Django 4.2.7 + Django REST Framework 3.14.0
- PostgreSQL 15 for persistent data storage
- OpenAI API for LLM-powered ticket classification

**Frontend:**
- React 19.2.4 with Hooks for state management
- Axios for HTTP API calls

**Infrastructure:**
- Docker + Docker Compose for containerization
- Full end-to-end deployment with single command

## Setup Instructions

### Prerequisites
- Docker and Docker Compose installed
- OpenAI API key (get one at https://platform.openai.com/api-keys)

### Quick Start

1. **Set your OpenAI API key:**
   ```bash
   export OPENAI_API_KEY=sk-your-actual-api-key-here
   ```

2. **Start all services:**
   ```bash
   docker-compose up --build
   ```

3. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000/api/
   - Django Admin: http://localhost:8000/admin/

## LLM Integration

### Why OpenAI GPT-3.5-turbo?

1. **Cost-effective** - Low token usage for classification tasks
2. **Reliable** - Consistently produces valid JSON output
3. **Fast** - Sub-second response times for better UX

### How It Works

When a user enters a ticket description, the system:
1. Calls `POST /api/tickets/classify/` with the description
2. Backend sends description to OpenAI with a strict prompt
3. LLM returns suggested category and priority
4. Frontend pre-fills dropdowns with suggestions
5. User can accept or override before submitting

If the LLM fails (invalid key, network error), empty suggestions are returned and ticket submission continues unblocked (graceful degradation).

## API Endpoints

All endpoints return JSON and start with `/api/`

**POST /api/tickets/**
- Create a new ticket
- Required fields: title, description, category, priority

**GET /api/tickets/**
- List all tickets (newest first)
- Filters: `?category=...&priority=...&status=...&search=...`

**PATCH /api/tickets/{id}/**
- Update a ticket

**POST /api/tickets/classify/**
- Get LLM suggestions for category and priority
- Input: `{ "description": "..." }`
- Output: `{ "suggested_category": "...", "suggested_priority": "..." }`

**GET /api/tickets/stats/**
- Get aggregated statistics
- Returns: total_tickets, open_tickets, avg_tickets_per_day, priority_breakdown, category_breakdown

## Database Schema

**Ticket Model:**
- `title` - CharField, max_length=200, required
- `description` - TextField, required
- `category` - CharField, choices: billing|technical|account|general
- `priority` - CharField, choices: low|medium|high|critical
- `status` - CharField, choices: open|in_progress|resolved|closed, default=open
- `created_at` - DateTimeField, auto-set on creation

All constraints are enforced at the database level via Django ORM.

## Design Decisions

**Backend:**
- Used Django ORM `Count` and `Min` aggregation for stats endpoint (database-level, not Python loops)
- Filters use `Q` objects with `icontains` for case-insensitive search
- LLM failures return empty suggestions (graceful error handling)
- CORS enabled for development

**Frontend:**
- React Hooks for state management
- LLM classification triggered on description blur (not on every keystroke)
- Form clears and list auto-refreshes on submit
- Shows "Loading LLM suggestions..." during API call

**Docker:**
- PostgreSQL for persistent storage
- Backend migrations run automatically on startup
- Services start in correct order (DB → backend → frontend)
- Environment variables for API key (not hardcoded)

## Project Structure

```
backend/                    # Django project
├── backend/              # Project config (settings, URLs)
├── tickets/              # Main app (models, views, serializers)
├── manage.py
├── requirements.txt
└── Dockerfile

frontend/                   # React project
├── src/
│   ├── App.js           # Root component
│   ├── components/      # Form, List, Stats components
│   └── index.js
├── package.json
└── Dockerfile

docker-compose.yml        # Multi-service orchestration
.env.example             # Environment variable template
README.md               # This file
```

## Troubleshooting

**LLM suggestions not appearing:**
- Verify OPENAI_API_KEY is set: `echo $OPENAI_API_KEY`
- Check browser console for errors
- Ensure API key is valid (not expired)

**API returns 404:**
- Verify endpoints are `/api/tickets/...` not `/tickets/...`
- Check backend is running: http://localhost:8000/api/

**Docker issues:**
- Ensure Docker daemon is running
- Try: `docker-compose down && docker-compose up --build`

## Future Enhancements

- User authentication and ticket assignment
- Real-time updates with WebSockets
- Advanced search with Elasticsearch
- Ticket templates
- Email notifications
- Support for multiple LLM providers
