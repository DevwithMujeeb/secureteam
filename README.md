# SecureTeam

A secure, role-based team and project management application — built to demonstrate production-grade access control, not just feature completeness.

**Status:** 🚧 In active development (Month 3 of a 90-day public build challenge)

## Why this project exists

Most team/project management demo apps treat authentication as a checkbox and authorization as an afterthought. SecureTeam flips that: role-based access control (RBAC) and auditability are the core design constraint, not a bolted-on feature.

This project extends security patterns proven out in an earlier Secure Authentication REST API build — JWT access/refresh rotation, brute-force protection, httpOnly cookie handling — into a real multi-tenant product with organizations, projects, and granular permissions.

## Planned feature set

- **Organizations & roles** — users belong to organizations with `owner`, `admin`, or `member` roles
- **Project-level access control** — permissions aren't just global; project membership determines visibility and edit rights independently of org-level role
- **Audit logging** — every privileged action (invite, role change, deletion) is recorded with actor, target, and timestamp
- **Hardened authentication** — JWT access/refresh token rotation, httpOnly cookies, rate-limited login attempts
- **Input validation & sanitization** on every write path
- **Security headers** via Helmet, strict CORS policy

## Tech stack

| Layer    | Technology                                        |
| -------- | ------------------------------------------------- |
| Backend  | Node.js, Express, MongoDB, Mongoose               |
| Frontend | React (Vite)                                      |
| Auth     | JWT (access + refresh rotation), httpOnly cookies |
| Security | Helmet, express-rate-limit, bcrypt                |

## Project structure

\`\`\`
secureteam/
├── server/ # Express API
│ └── src/
│ ├── config/ # env + DB connection
│ ├── models/ # Mongoose schemas
│ ├── controllers/ # route handlers
│ ├── routes/ # route definitions
│ ├── middleware/ # auth, RBAC, error handling
│ └── utils/
└── client/ # React frontend (Vite)
\`\`\`

## Local setup

\`\`\`bash

# Server

cd server
cp .env.example .env # fill in your own values
npm install
npm run dev

# Client

cd client
cp .env.example .env
npm install
npm run dev
\`\`\`

## Roadmap

- [x] Project scaffolding (Express + React, security middleware)
- [x] User & Organization models
- [x] Auth (register/login/refresh) wired into RBAC from the ground up
- [ ] Role + project-membership authorization middleware
- [ ] Audit logging layer
- [ ] Core project/task CRUD with permission enforcement
- [ ] React frontend
- [ ] Security hardening pass + writeup

---

Part of a public 90-day build-in-public challenge by [DevwithMujeeb](https://github.com/DevwithMujeeb).
