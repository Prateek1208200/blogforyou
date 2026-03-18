# Blog App

Full-stack blog application built with:
- **Frontend**: Vanilla JavaScript + Vite
- **Backend**: Java 21 + Spring Boot 3.x
- **Database**: PostgreSQL 16
- **Auth**: JWT (JSON Web Tokens)

## Features
- Create / Edit / Delete blog posts
- User registration & login (JWT auth)
- Comments on posts
- Admin dashboard (manage users & posts)

## Quick Start

### Run with Docker (Recommended)
```bash
# Build backend jar first
cd backend && ./mvnw package -DskipTests && cd ..

# Start all services
docker compose up --build
```
App will be live at: http://localhost

### Run Locally (Development)
```bash
# Terminal 1 - Backend
cd backend
./mvnw spring-boot:run

# Terminal 2 - Frontend
cd frontend
npm install
npm run dev
```
- Frontend: http://localhost:5173
- Backend API: http://localhost:8080

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/auth/register | Public | Register new user |
| POST | /api/auth/login | Public | Login, returns JWT |
| GET | /api/posts | Public | Get all posts |
| GET | /api/posts/{id} | Public | Get single post |
| POST | /api/posts | JWT | Create post |
| PUT | /api/posts/{id} | JWT | Update post |
| DELETE | /api/posts/{id} | JWT | Delete post |
| GET | /api/comments/{postId} | Public | Get comments |
| POST | /api/comments/{postId} | JWT | Add comment |
| DELETE | /api/comments/{id} | JWT | Delete comment |
| GET | /api/admin/users | ADMIN | List all users |
| DELETE | /api/admin/users/{id} | ADMIN | Delete user |

## Environment Variables (Production)
```
SPRING_DATASOURCE_URL=jdbc:postgresql://db:5432/blogdb
SPRING_DATASOURCE_USERNAME=bloguser
SPRING_DATASOURCE_PASSWORD=your-secure-password
JWT_SECRET=your-256-bit-secret-key
```
