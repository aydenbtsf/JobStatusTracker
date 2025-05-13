# Job Tracking System - React Frontend

This is the frontend component of the Job Tracking System, built with React, TypeScript, and Tailwind CSS.

## Getting Started

1. Install the required dependencies:

```bash
npm install
```

2. Set environment variables in `.env`:

```
VITE_API_BASE_URL=http://localhost:8000
```

3. Run the development server:

```bash
npm run dev
```

## Components

- Dashboard - Main page showing job listings and filters
- JobCard - Card component displaying job information
- CreateJobModal - Modal for creating new jobs
- JobFilters - Filters for the job listing
- StatusTabs - Tabs for filtering by job status
- Sidebar - Application navigation sidebar

## Pages

- Dashboard - Main dashboard view
- JobDetails - Detailed view of a specific job
- NotFound - 404 page

## Libraries Used

- React Query - For data fetching and state management
- Wouter - For routing
- Shadcn UI - For UI components
- Tailwind CSS - For styling
- Vite - For development and building