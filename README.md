# Project Management Board

A modern project management application built with Next.js App Router, featuring drag-and-drop functionality, user authentication, and comprehensive task management capabilities.

## Features

- 🎯 **Task Management**: Create, edit, and organize tasks with priorities and due dates
- 🔄 **Drag & Drop**: Intuitive drag-and-drop interface powered by @dnd-kit
- 👤 **Authentication**: Secure user authentication with NextAuth.js
- 📊 **Progress Tracking**: Visual progress indicators and analytics with Recharts
- 🌙 **Dark Mode**: Built-in theme switching with next-themes
- 📱 **Responsive Design**: Mobile-first design with Tailwind CSS
- 🔍 **API Documentation**: Interactive API documentation available
- 📝 **Form Validation**: Robust form handling with React Hook Form and Zod

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Runtime**: Bun
- **Database**: MongoDB with Prisma ORM
- **Authentication**: Auth.js v5
- **UI Components**: Shadcn
- **Styling**: Tailwind CSS v4
- **Drag & Drop**: @dnd-kit
- **Forms**: React Hook Form with Zod validation
- **Charts**: Recharts
- **Animations**: Framer Motion

## Prerequisites

- [Bun](https://bun.sh/) (latest version)
- MongoDB database
- Node.js 18+ (for compatibility)

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/Aymenbachiri/project-management-board.git
cd project-managment-board
```

### 2. Install dependencies

```bash
bun install
```

### 3. Environment Setup

Create a `.env` file in the root directory and copy the contents from `env.example`:

```bash
cp env.example .env
```

Then fill in your environment variables in the `.env` file with your actual values.

### 4. Database Setup

Generate Prisma client and run migrations:

```bash
bunx prisma generate
bunx prisma db push
```

### 5. Run the development server

```bash
bun dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

## Available Scripts

- `bun dev` - Start development server with Turbopack
- `bun run build` - Build the application for production
- `bun start` - Start the production server
- `bun lint` - Run ESLint for code linting

## API Documentation

Interactive API documentation is available at `/api-doc` when the application is running.

Visit [http://localhost:3000/api-doc](http://localhost:3000/api-doc) to explore the API endpoints and test them directly in the browser.

## Key Dependencies

- **@dnd-kit/core & @dnd-kit/sortable**: Drag and drop functionality
- **@prisma/client**: Database ORM
- **next-auth**: Authentication solution
- **@radix-ui/\***: Accessible UI primitives
- **react-hook-form**: Form state management
- **zod**: Schema validation
- **recharts**: Data visualization
- **tailwindcss**: Utility-first CSS framework
