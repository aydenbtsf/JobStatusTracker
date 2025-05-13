import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useRoute } from "wouter";
import { Sidebar } from "@/components/sidebar";
import { StatusTabs } from "@/components/status-tabs";
import { JobFilters } from "@/components/job-filters";
import { JobCard } from "@/components/job-card";
import { CreateJobModal } from "@/components/create-job-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { JobWithTriggers } from "@/lib/types";
import { Search, Menu, Bell, Plus } from "lucide-react";
import { JobStatus } from "@shared/schema";

interface StatusCount {
  status: "all" | JobStatus;
  count: number;
  label: string;
}

const statusCounts = [
  { status: "all" as const, count: 0, label: "All Jobs" },
  { status: "pending" as JobStatus, count: 0, label: "Pending" },
  { status: "processing" as JobStatus, count: 0, label: "Processing" },
  { status: "completed" as JobStatus, count: 0, label: "Completed" },
  { status: "failed" as JobStatus, count: 0, label: "Failed" },
];

export default function Dashboard() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [location, setLocation] = useLocation();
  
  // Parse query parameters
  const params = new URLSearchParams(location.split('?')[1] || '');
  const filterStatus = params.get('status') as JobStatus | null;
  
  const [filters, setFilters] = useState({
    type: "",
    status: filterStatus || "",
    dateFrom: "",
    dateTo: "",
  });
  
  // Fetch jobs with filters
  const { data, isLoading, error } = useQuery<JobWithTriggers[]>({
    queryKey: ['/api/jobs', filters],
    queryFn: async ({ queryKey }) => {
      const [_endpoint, appliedFilters] = queryKey as [string, typeof filters];
      const filterParams = new URLSearchParams();
      
      if (appliedFilters.type) filterParams.append('type', appliedFilters.type);
      if (appliedFilters.status) filterParams.append('status', appliedFilters.status);
      if (appliedFilters.dateFrom) filterParams.append('dateFrom', appliedFilters.dateFrom);
      if (appliedFilters.dateTo) filterParams.append('dateTo', appliedFilters.dateTo);
      
      const queryString = filterParams.toString() ? `?${filterParams.toString()}` : '';
      // Get the API base URL from environment or use default
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
      const fullUrl = `${apiBaseUrl}/api/jobs${queryString}`;
      const response = await fetch(fullUrl, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch jobs');
      }
      
      return response.json();
    }
  });
  
  // Update status counts
  const counts = statusCounts.map(item => {
    if (item.status === "all") {
      return { ...item, count: data?.length || 0 };
    }
    
    return {
      ...item,
      count: data?.filter(job => job.status === item.status).length || 0
    };
  }) as StatusCount[];
  
  const handleFilterChange = (newFilters: {
    type?: string;
    status?: string;
    dateFrom?: string;
    dateTo?: string;
  }) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    
    // Update URL if status filter changes
    if (newFilters.status !== undefined && newFilters.status !== filters.status) {
      if (newFilters.status) {
        setLocation(`/?status=${newFilters.status}`);
      } else {
        setLocation('/');
      }
    }
  };
  
  // Filter jobs by search term (client-side)
  const filteredJobs = data?.filter(job => 
    !searchTerm || 
    job.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      
      {/* Main content */}
      <div className="flex flex-col flex-1 w-0 overflow-hidden">
        {/* Top navbar */}
        <div className="relative z-10 flex flex-shrink-0 h-16 bg-white shadow">
          <button type="button" className="px-4 text-gray-500 md:hidden">
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex justify-between flex-1 px-4">
            <div className="flex flex-1">
              <div className="flex w-full md:ml-0">
                <div className="relative w-full text-gray-400 focus-within:text-gray-600">
                  <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none pl-3">
                    <Search className="w-5 h-5" />
                  </div>
                  <Input
                    placeholder="Search jobs"
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center ml-4 md:ml-6">
              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-500">
                <Bell className="w-6 h-6" />
              </Button>
              
              {/* Profile dropdown would go here */}
              <div className="relative ml-3">
                <Button variant="ghost" size="icon" className="overflow-hidden rounded-full">
                  <img 
                    className="w-8 h-8 rounded-full" 
                    src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" 
                    alt="User profile" 
                  />
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Main content area */}
        <main className="relative flex-1 overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="px-4 mx-auto max-w-7xl sm:px-6 md:px-8">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold text-gray-900">Job Dashboard</h1>
                <Button onClick={() => setIsCreateModalOpen(true)}>
                  <Plus className="-ml-1 mr-2 h-5 w-5" />
                  Create Job
                </Button>
              </div>
            </div>
            
            <div className="px-4 mx-auto max-w-7xl sm:px-6 md:px-8">
              {/* Job filters */}
              <JobFilters onFilterChange={handleFilterChange} />
              
              {/* Status tabs */}
              <StatusTabs counts={counts} />
              
              {/* Job list */}
              <div className="space-y-4">
                {isLoading ? (
                  // Loading state
                  Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="overflow-hidden bg-white rounded-lg shadow">
                      <div className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Skeleton className="h-6 w-32" />
                            <Skeleton className="h-5 w-16 rounded-full" />
                          </div>
                          <Skeleton className="h-5 w-24" />
                        </div>
                        <Skeleton className="h-4 w-48 mt-2" />
                      </div>
                    </div>
                  ))
                ) : error ? (
                  // Error state
                  <div className="p-6 text-center">
                    <p className="text-red-500">Failed to load jobs. Please try again.</p>
                    <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
                      Retry
                    </Button>
                  </div>
                ) : filteredJobs && filteredJobs.length > 0 ? (
                  // Display jobs
                  filteredJobs.map(job => (
                    <JobCard key={job.id} job={job} />
                  ))
                ) : (
                  // Empty state
                  <div className="text-center py-12 bg-white rounded-lg shadow">
                    <h3 className="mt-2 text-lg font-medium text-gray-900">No jobs found</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {searchTerm ? 'No jobs match your search criteria.' : 'There are no jobs with the selected filters.'}
                    </p>
                    <div className="mt-6">
                      <Button onClick={() => setIsCreateModalOpen(true)}>
                        Create a new job
                      </Button>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Pagination - to be implemented if needed */}
              {filteredJobs && filteredJobs.length > 0 && (
                <div className="flex items-center justify-between mt-6">
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        Showing <span className="font-medium">1</span> to <span className="font-medium">{filteredJobs.length}</span> of <span className="font-medium">{filteredJobs.length}</span> results
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
      
      {/* Create job modal */}
      <CreateJobModal 
        open={isCreateModalOpen} 
        onOpenChange={setIsCreateModalOpen} 
      />
    </div>
  );
}
