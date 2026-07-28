# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-07-26

### Added
- Monorepo structure using workspaces containing Next.js web application and NestJS API.
- Comprehensive configuration layer utilizing Zod schema validation.
- Database access layer using Prisma ORM with migrations.
- Identity and authentication layer supporting local email/password login and Google OAuth login.
- Document storage integration using Cloudflare R2 object storage.
- Document rasterization worker utilizing BullMQ and Redis.
- Secure, rate-limited reader endpoints serving dynamic, custom watermarked pages.
- Entitlement tracking and Midtrans payment gateway integration.
- Membership subscription engine with automated lifecycle management.
- Admin dashboard reporting and global audit log tracking.
- Automated CI pipeline workflow.
- High-fidelity interactive UI dashboards with responsive layout and modern design.
