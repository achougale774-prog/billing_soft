# Advance Billing System

A full-featured billing and invoicing system built with Next.js, using local storage for data persistence.

## Features

- **Customer Management** - Add, edit, delete customers with GST support
- **Product/Service Catalog** - Manage products with GST rates, stock, categories
- **Invoice Generation** - Create professional invoices with auto-numbering
- **Payment Tracking** - Record partial/full payments with multiple methods
- **Expense Management** - Track business expenses by category
- **Reports & Analytics** - Revenue, expense, and profit analytics with charts
- **GST Support** - Automatic GST calculation on invoices
- **Print & Export** - Print invoices or export as JSON
- **Data Backup** - Export/import all data as JSON

## Tech Stack

- Next.js 15 (Static Export)
- React 19
- TypeScript
- Tailwind CSS
- Zustand (State Management)
- Recharts (Charts)
- Local Storage (Database)

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

## Build (Static Export)

```bash
npm run build
```

The static files will be generated in the `dist` folder, ready for hosting on any static hosting service.

## Data Storage

All data is stored in the browser's local storage:
- `billing_customers` - Customer data
- `billing_products` - Product catalog
- `billing_invoices` - Invoices and payments
- `billing_expenses` - Business expenses
- `billing_settings` - App settings

## Hosting

Since this is a static export with local storage, you can host it on:
- Netlify
- Vercel
- GitHub Pages
- Any static web server

No backend server or database is required!
