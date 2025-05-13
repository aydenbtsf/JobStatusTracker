import { useState } from 'react';
import { useRoute, Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Sidebar } from '@/components/sidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { JobWithTriggers } from '@/lib/types';
import { formatDate, formatFullDate, getStatusVariant, prettyJSON } from '@/lib/utils';
import { ChevronLeft, RefreshCw } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { queryClient } from '@/lib/queryClient';

export default function JobDetailsPage() {
  const [_, params] = useRoute('/jobs/:id');
  const jobId = params?.id;
  const { toast } = useToast();
  
  const { data: job, isLoading, error } = useQuery<JobWithTriggers>({
    queryKey: [`/api/jobs/${jobId}`],
    enabled: !!jobId,
    retry: 1,
  });
  
  const handleRetry = async () => {
    if (!jobId) return;
    
    try {
      await apiRequest("POST", `/api/jobs/${jobId}/retry`, {});
      
      toast({
        title: "Job retry request sent",
        description: "The job has been submitted for retry",
      });
      
      queryClient.invalidateQueries({ queryKey: [`/api/jobs/${jobId}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/jobs'] });
    } catch (error) {
      toast({
        title: "Failed to retry job",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    }
  };
  
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      
      {/* Main content */}
      <div className="flex flex-col flex-1 w-0 overflow-hidden">
        {/* Top navbar - simplified for details page */}
        <div className="relative z-10 flex flex-shrink-0 h-16 bg-white shadow">
          <div className="flex justify-between flex-1 px-4">
            <div className="flex items-center">
              <Link href="/">
                <Button variant="ghost" className="text-gray-500">
                  <ChevronLeft className="w-5 h-5 mr-1" />
                  Back to Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
        
        {/* Main content area */}
        <main className="relative flex-1 overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="px-4 mx-auto max-w-7xl sm:px-6 md:px-8">
              {isLoading ? (
                // Loading state
                <div>
                  <Skeleton className="h-10 w-64 mb-6" />
                  <Card>
                    <CardHeader>
                      <div className="flex justify-between">
                        <Skeleton className="h-8 w-40" />
                        <Skeleton className="h-8 w-32" />
                      </div>
                      <Skeleton className="h-5 w-56 mt-2" />
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <Skeleton className="h-24" />
                          <Skeleton className="h-24" />
                          <Skeleton className="h-40 col-span-2" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : error ? (
                // Error state
                <div className="text-center py-12">
                  <h3 className="text-lg font-medium text-red-600">Failed to load job details</h3>
                  <p className="mt-2 text-gray-500">Please try again or return to the dashboard.</p>
                  <div className="mt-6 space-x-4">
                    <Button onClick={() => window.location.reload()}>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Retry
                    </Button>
                    <Button variant="outline" asChild>
                      <Link href="/">Go to Dashboard</Link>
                    </Button>
                  </div>
                </div>
              ) : job ? (
                // Job details view
                <>
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h1 className="text-2xl font-semibold text-gray-900">{job.type} Job Details</h1>
                      <p className="mt-1 text-gray-500">{job.id}</p>
                    </div>
                    <div className="flex space-x-3">
                      <Button 
                        variant="outline" 
                        onClick={handleRetry}
                        disabled={job.status === 'processing' || job.status === 'completed'}
                      >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Retry Job
                      </Button>
                    </div>
                  </div>
                  
                  <Card className="mb-6">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <h3 className="text-lg font-medium leading-6 text-gray-900">Status Information</h3>
                          <Badge variant={getStatusVariant(job.status)} className="ml-3">
                            {job.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-500">
                          Last Updated: {formatDate(job.updatedAt)}
                        </p>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                        <div className="sm:col-span-1">
                          <dt className="text-sm font-medium text-gray-500">Created At</dt>
                          <dd className="mt-1 text-sm text-gray-900">{formatFullDate(job.createdAt)}</dd>
                        </div>
                        <div className="sm:col-span-1">
                          <dt className="text-sm font-medium text-gray-500">Updated At</dt>
                          <dd className="mt-1 text-sm text-gray-900">{formatFullDate(job.updatedAt)}</dd>
                        </div>
                        
                        {job.errorMessage && (
                          <div className="sm:col-span-2">
                            <dt className="text-sm font-medium text-gray-500">Error Message</dt>
                            <dd className="mt-1 text-sm text-red-600 p-3 bg-red-50 rounded-md border border-red-100">
                              {job.errorMessage}
                            </dd>
                          </div>
                        )}
                      </dl>
                    </CardContent>
                  </Card>
                  
                  <Card className="mb-6">
                    <CardHeader>
                      <h3 className="text-lg font-medium leading-6 text-gray-900">Job Arguments</h3>
                    </CardHeader>
                    <CardContent>
                      <div className="p-3 overflow-auto font-mono bg-gray-100 rounded-md" style={{ maxHeight: "300px" }}>
                        <pre>{prettyJSON(job.args)}</pre>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {job.triggers && job.triggers.length > 0 && (
                    <Card className="mb-6">
                      <CardHeader>
                        <h3 className="text-lg font-medium leading-6 text-gray-900">Trigger Jobs</h3>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {job.triggers.map(trigger => (
                            <div key={trigger.id} className="flex items-center p-3 bg-white border border-gray-200 rounded-md">
                              <Badge variant={getStatusVariant(trigger.status)}>{trigger.status}</Badge>
                              <span className="ml-3 font-medium">{trigger.type}</span>
                              <span className="ml-3 text-gray-500">{trigger.id}</span>
                              <div className="flex-grow" />
                              <Button variant="ghost" size="sm" asChild>
                                <Link href={`/jobs/${trigger.id}`}>View Details</Link>
                              </Button>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                  
                  {job.waveForecastData && job.waveForecastData.data && job.waveForecastData.data.length > 0 && (
                    <Card className="mb-6">
                      <CardHeader>
                        <h3 className="text-lg font-medium leading-6 text-gray-900">Wave Forecast Data</h3>
                        {job.waveForecastData.location && (
                          <p className="text-sm text-gray-500">Location: {job.waveForecastData.location}</p>
                        )}
                      </CardHeader>
                      <CardContent>
                        <div className="overflow-hidden border border-gray-200 rounded-md shadow-sm">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Time</th>
                                <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Height (m)</th>
                                <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Direction</th>
                                <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Period (s)</th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {job.waveForecastData.data.map((entry, index) => (
                                <tr key={index}>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">{entry.time}</div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">{entry.height}</div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">{entry.direction}</div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">{entry.period}</div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </>
              ) : (
                // Job not found
                <div className="text-center py-12">
                  <h3 className="text-lg font-medium text-gray-900">Job not found</h3>
                  <p className="mt-2 text-gray-500">The job you're looking for doesn't exist or has been deleted.</p>
                  <Button className="mt-6" asChild>
                    <Link href="/">Return to Dashboard</Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
