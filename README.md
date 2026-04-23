# Homie

> Premium short-term rental management for properties in Lima, Peru.

Landing page for **Homie**, a service that handles end-to-end management of short-term rental properties (Airbnb-style) in Lima Top districts. Property owners get a turnkey solution and a monthly performance report.

🌐 **Live site:** [homiebnb.com](https://homiebnb.com)

---

## Tech Stack

- **Framework:** [Vite](https://vitejs.dev/) + [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/)
- **Animations:** Framer Motion
- **Analytics:** Google Analytics 4
- **Hosting:** Hostinger (shared hosting + Apache `.htaccess` SPA routing)
- **Built with:** [Lovable](https://lovable.dev/)

---

## Features

- Responsive landing page optimized for mobile-first traffic
- Lead capture flow with WhatsApp integration
- Sections: Advantages, Process, Testimonials, FAQ, Contact
- SEO-ready with semantic HTML and meta tags
- Google Analytics event tracking
- SPA routing with client-side navigation

---

## Getting Started

### Prerequisites

- Node.js 20+ and npm (or [Bun](https://bun.sh/))
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/javocraq/Homie.git
cd Homie

# Install dependencies
npm install

# Start the development server
npm run dev
```

The dev server will start at `http://localhost:5173`.

### Build for Production

```bash
npm run build
```

The production-ready files will be generated in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

---

## Deployment

This project is deployed manually to Hostinger shared hosting. The build output (`dist/`) is uploaded to `public_html/` via the Hostinger File Manager or FTP.

A custom `.htaccess` file is required at the root of `public_html/` to enable SPA routing:

```apache
RewriteEngine On
RewriteBase /
RewriteRule ^index\.html$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]
```

---

## Project Structure
Homie/
├── public/              # Static assets (images, favicons, images/)
├── src/
│   ├── components/      # React components (UI + sections)
│   ├── pages/           # Route-level page components
│   ├── lib/             # Utilities and helpers
│   └── main.tsx         # App entry point
├── index.html           # HTML template
├── tailwind.config.ts   # Tailwind configuration
├── vite.config.ts       # Vite configuration
└── package.json

---

## Built By

Developed by **[Javier Flores Macías](https://github.com/javocraq)** ([@medicen_javo](https://www.youtube.com/@medicen_javo)), founder of [Núcleo Lab](https://nucleo.la) — an AI automation agency based in Lima, Peru.

**Client / Product Owner:** [Fabrizio Sil](https://github.com/FabrizioSil)

---

## License

This project is private and proprietary. All rights reserved © Homie.
