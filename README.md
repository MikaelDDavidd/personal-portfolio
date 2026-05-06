<div align="center">

# Personal Portfolio — Mikael David

**Live professional showcase, bio page, and admin panel — fully dynamic with Supabase.**

A three-app monorepo powering my online presence: a public portfolio site, a Linktree-style bio page, and a custom admin panel for managing all content without touching code.

[![Vite](https://img.shields.io/badge/Vite-5.0-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES2022-F7DF1E?logo=javascript&logoColor=black)](https://developer.mozilla.org/docs/Web/JavaScript)
[![HTML5](https://img.shields.io/badge/HTML5-Semantic-E34F26?logo=html5&logoColor=white)](https://developer.mozilla.org/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-Responsive-1572B6?logo=css3&logoColor=white)](https://developer.mozilla.org/docs/Web/CSS)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](portfolio/LICENSE)

</div>

---

## Overview

This is the actual personal portfolio I use as my professional showcase. It started as a static `vCard` site and evolved into a full content platform: every project, post, certificate, skill, and bio link is stored in Supabase and rendered dynamically on the frontend. A separate admin panel lets me update any of it from the browser — no redeploys, no code edits.

Three independent apps live in this repo:

| App | Purpose | Stack |
|-----|---------|-------|
| **`portfolio/`** | Public portfolio site (about, resume, projects, blog, contact) | Vite + Vanilla JS + Supabase |
| **`bio/`** | Linktree-style bio page — [bio.mikaeldavid.online](https://bio.mikaeldavid.online) | HTML/CSS/JS + Supabase + PWA (service worker) |
| **`panel/`** | Admin panel to manage profile, projects, blog, certificates, analytics | Vite + Vanilla JS + Supabase Auth |

## Demo

![Desktop Demo](./website-demo-image/desktop.png)

![Mobile Demo](./website-demo-image/mobile.png)

## Key Features

- **Fully dynamic content** — Profile, projects, skills, timeline, certificates, blog posts and bio links all loaded from Supabase at runtime
- **Custom admin panel** — Full CRUD on every entity behind Supabase Auth, no headless CMS dependency
- **Built-in blog** — Markdown-based blog with publish/draft state and image uploads
- **LinkedIn integration** — Pulls and displays recent LinkedIn posts via dedicated service layer
- **Visitor analytics** — Page views, sessions, device/locale data tracked into a dedicated `analytics` table
- **Bio page (PWA)** — Installable Linktree-style page with offline support via service worker
- **Responsive across all breakpoints** — Mobile-first layout, works from phones to ultrawide displays
- **AdSense-ready** — `app-ads.txt` published at the root for monetization

## Tech Stack

- **Frontend**: Vanilla JavaScript (ES Modules), HTML5, CSS3
- **Build**: [Vite 5](https://vitejs.dev) for `portfolio/` and `panel/`
- **Backend**: [Supabase](https://supabase.com) — Postgres, Auth, Storage, Row Level Security
- **PWA**: Service Worker for the bio app
- **Hosting**: Static hosting (Vercel/Netlify-compatible builds)

### Supabase Schema

The backend is a single Postgres database with the following tables:

```
profiles            — Personal info, bio, social links
projects            — Portfolio projects with images and tags
project_images      — One-to-many gallery for each project
skills              — Skill catalogue grouped by category
certificates        — Certifications and credentials
timeline_items      — Education / work history entries
services            — Services offered (freelance)
blog_posts          — Markdown posts with publish state
blog_comments       — Comments with approval workflow
linkedin_posts      — Cached LinkedIn feed
contact_messages    — Inbound contact form submissions
analytics           — Page views, sessions, device data
```

See [`supabase.sql`](./supabase.sql) for the full schema definition.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org) 18+ and npm
- A [Supabase](https://supabase.com) project (free tier is enough)

### Setup

```bash
git clone git@gitlab.com:mikaeldavidlopes/personal-portfolio.git
cd personal-portfolio
```

Apply the schema from `supabase.sql` to your Supabase project, then update the Supabase URL and anon key in:

- `portfolio/src/core/config.js`
- `panel/src/services/supabase.service.js`
- `bio/src/services/supabase.service.js`

### Run the public portfolio

```bash
cd portfolio
npm install
npm run dev          # http://localhost:5173
```

### Run the admin panel

```bash
cd panel
npm install
npm run dev          # http://localhost:5173
```

### Run the bio page

```bash
cd bio
npm install
npm run dev          # http://localhost:3001
```

### Build for production

Each app builds independently:

```bash
cd portfolio && npm run build
cd panel     && npm run build
cd bio       && npm run preview     # bio is plain HTML — no bundle step
```

## Project Structure

```
personal-portfolio/
├── portfolio/               # Public portfolio site
│   ├── index.html
│   ├── pages/               # about, resume, portfolio, blog, contact
│   ├── src/
│   │   ├── components/      # Sidebar, project details, dynamic assets
│   │   ├── core/            # config, app bootstrap
│   │   ├── pages/           # Dynamic page renderers (Supabase-backed)
│   │   ├── services/        # supabase, profile, blog, linkedin
│   │   └── styles/          # main.css and partials
│   ├── *.mermaid            # Class and ER diagrams
│   └── vite.config.js
│
├── panel/                   # Admin panel (Supabase Auth)
│   ├── index.html
│   └── src/
│       ├── components/      # blog editor, profile, projects, analytics
│       └── services/        # auth, supabase, upload (storage)
│
├── bio/                     # Linktree-style bio page (PWA)
│   ├── index.html
│   ├── sw.js                # Service worker
│   └── src/services/        # supabase
│
├── website-demo-image/      # Screenshots used in this README
├── supabase.sql             # Full Postgres schema
├── app-ads.txt              # Ads.txt for AdSense
└── README.md
```

## Diagrams

The `portfolio/` app ships with system diagrams (class diagram, ERD) authored in Mermaid:

- [`portfolio/class_diagram.mermaid`](./portfolio/class_diagram.mermaid)
- [`portfolio/erd_diagram.mermaid`](./portfolio/erd_diagram.mermaid)
- [`portfolio/system_diagrams.mermaid`](./portfolio/system_diagrams.mermaid)
- [`portfolio/diagrams_summary.md`](./portfolio/diagrams_summary.md)

## License

Distributed under the MIT License. See [`portfolio/LICENSE`](./portfolio/LICENSE) for details.

The original public portfolio template is based on the open-source [vCard](https://github.com/codewithsadee/vcard-personal-portfolio) project, then heavily extended with a dynamic Supabase backend, a custom admin panel, and a separate bio app.

---

<div align="center">
Built by <a href="https://github.com/MikaelDDavidd">Mikael David</a>
</div>
