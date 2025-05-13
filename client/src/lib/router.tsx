import { createRootRoute, createRouter, RouterProvider, createRoute } from '@tanstack/react-router'
import { Outlet } from '@tanstack/react-router'

import Dashboard from '../pages/dashboard'
import JobDetailsPage from '../pages/job-details'
import PipelineDetailsPage from '../pages/pipeline-details'
import NotFound from '../pages/not-found'
import Layout from '../components/Layout'

// Create a root route
const rootRoute = createRootRoute({
  component: () => (
    <Layout>
      <Outlet />
    </Layout>
  ),
})

// Create an index route
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: Dashboard,
})

// Create a job details route
const jobDetailsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/job/$id',
  component: JobDetailsPage,
})

// Create a pipeline details route
const pipelineDetailsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/pipeline/$id',
  component: PipelineDetailsPage,
})

// Create a catch-all route for 404s
const notFoundRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '*',
  component: NotFound,
})

// Create the route tree
const routeTree = rootRoute.addChildren([
  indexRoute,
  jobDetailsRoute,
  pipelineDetailsRoute,
  notFoundRoute,
])

// Create the router
const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
})

// Register the router for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

export { router, RouterProvider, jobDetailsRoute, pipelineDetailsRoute }