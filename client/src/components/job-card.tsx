import { useState } from "react";
import { Link } from "wouter";
import { JobWithTriggers } from "@/lib/types";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatDate, formatFullDate, getStatusVariant, prettyJSON } from "@/lib/utils";
import { ChevronDown, ChevronUp } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";

interface JobCardProps {
  job: JobWithTriggers;
}

export function JobCard({ job }: JobCardProps) {
  const [expanded, setExpanded] = useState(false);
  const { toast } = useToast();

  const handleRetry = async () => {
    try {
      await apiRequest("POST", `/api/jobs/${job.id}/retry`, {});
      toast({
        title: "Job retry request sent",
        description: "The job has been submitted for retry",
      });
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
    <Card className="overflow-hidden">
      <CardHeader className="px-4 py-5 sm:px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <h3 className="text-lg font-medium leading-6 text-gray-900">{job.type}</h3>
            <Badge variant={getStatusVariant(job.status)} className="ml-3">
              {job.status}
            </Badge>
          </div>
          <div className="flex space-x-2">
            <span className="text-sm text-gray-500">{formatDate(job.createdAt)}</span>
            <button
              className="p-1 text-gray-400 hover:text-gray-500"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? (
                <ChevronUp className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
        <p className="mt-1 text-sm text-gray-500">{job.id}</p>
      </CardHeader>
      
      {expanded && (
        <CardContent className="px-4 py-5 border-t border-gray-200 sm:px-6 bg-gray-50">
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
                <dd className="mt-1 text-sm text-red-600">{job.errorMessage}</dd>
              </div>
            )}
            
            <div className="sm:col-span-2">
              <dt className="text-sm font-medium text-gray-500">Arguments</dt>
              <dd className="mt-1 text-sm text-gray-900">
                <div className="p-2 overflow-auto font-mono bg-gray-100 rounded-md" style={{ maxHeight: "100px" }}>
                  <pre>{prettyJSON(job.args)}</pre>
                </div>
              </dd>
            </div>
            
            {job.triggers && job.triggers.length > 0 && (
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500">Triggers</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {job.triggers.map(trigger => (
                    <div key={trigger.id} className="flex items-center p-2 mb-2 bg-white border border-gray-200 rounded-md">
                      <Badge variant={getStatusVariant(trigger.status)}>{trigger.status}</Badge>
                      <span className="ml-2 font-medium">{trigger.type}</span>
                      <span className="ml-2 text-gray-500">{trigger.id}</span>
                    </div>
                  ))}
                </dd>
              </div>
            )}
            
            {job.waveForecastData && job.waveForecastData.data && job.waveForecastData.data.length > 0 && (
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500">Wave Forecast Data</dt>
                <dd className="mt-1 text-sm text-gray-900">
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
                </dd>
              </div>
            )}
          </dl>
          
          <div className="flex justify-end mt-6 space-x-3">
            <Button 
              variant="outline" 
              onClick={handleRetry}
              disabled={job.status === 'processing' || job.status === 'completed'}
            >
              Retry
            </Button>
            <Button asChild>
              <Link href={`/jobs/${job.id}`}>View Full Details</Link>
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
