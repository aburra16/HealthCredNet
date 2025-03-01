import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { getAuth } from "@/lib/auth";
import CredentialReviewModal from "@/components/credentials/CredentialReviewModal";
import { CredentialRequest } from "@/types";

// Form validation schema
const credentialSchema = z.object({
  providerId: z.string().min(1, "Provider is required"),
  type: z.string().min(1, "Credential type is required"),
  issuingAuthority: z.string().min(1, "Issuing authority is required"),
  details: z.string().optional()
});

type CredentialFormValues = z.infer<typeof credentialSchema>;

export default function IssueCredential() {
  const { toast } = useToast();
  const [selectedRequest, setSelectedRequest] = useState<CredentialRequest | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('pending');
  const auth = getAuth();
  
  // Fetch providers
  const { data: providers, isLoading: isLoadingProviders } = useQuery({
    queryKey: ['/api/providers'],
    select: (data: any) => data.map((p: any) => ({
      id: p.id,
      name: `Dr. ${p.firstName} ${p.lastName}`,
      specialty: p.specialty
    }))
  });
  
  // Fetch credential requests
  const { data: requests, isLoading: isLoadingRequests } = useQuery({
    queryKey: ['/api/credential-requests', statusFilter],
    queryFn: async () => {
      const res = await fetch(`/api/credential-requests?status=${statusFilter}`, {
        credentials: 'include'
      });
      if (!res.ok) throw new Error('Failed to fetch requests');
      return res.json();
    },
    select: (data: any) => {
      return data.map((request: any) => ({
        id: request.id,
        providerId: request.provider.id,
        providerName: `Dr. ${request.provider.firstName} ${request.provider.lastName}`,
        providerSpecialty: request.provider.specialty,
        providerImageUrl: request.provider.profileImageUrl,
        providerPublicKey: request.provider.nostrPubkey,
        credentialType: request.type,
        issuingAuthority: request.issuingAuthority,
        requestDate: request.createdAt || request.requestDate,
        status: request.status,
        details: request.details
      }));
    }
  });
  
  // Form setup
  const form = useForm<CredentialFormValues>({
    resolver: zodResolver(credentialSchema),
    defaultValues: {
      providerId: "",
      type: "",
      issuingAuthority: "",
      details: ""
    }
  });
  
  const onSubmit = async (values: CredentialFormValues) => {
    if (!auth) return;
    
    try {
      // Create new credential request
      const response = await apiRequest('POST', '/api/credential-requests', {
        providerId: parseInt(values.providerId),
        authorityId: auth.id,
        type: values.type,
        issuingAuthority: values.issuingAuthority,
        status: 'pending',
        details: values.details
      });
      
      // Reset form
      form.reset();
      
      // Invalidate queries to refetch data
      queryClient.invalidateQueries({ queryKey: ['/api/credential-requests'] });
      
      toast({
        title: "Credential request created",
        description: "The credential request has been created successfully",
        variant: "default"
      });
    } catch (error) {
      console.error("Error creating credential:", error);
      toast({
        title: "Error",
        description: "Failed to create credential request",
        variant: "destructive"
      });
    }
  };
  
  const openReviewModal = (request: CredentialRequest) => {
    setSelectedRequest(request);
    setIsModalOpen(true);
  };
  
  const closeReviewModal = () => {
    setIsModalOpen(false);
    setSelectedRequest(null);
  };
  
  return (
    <div className="fade-in">
      <div className="px-6 py-5 sm:px-6 border-b border-gray-200 bg-white shadow-sm rounded-lg mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Issue Credentials</h1>
        <p className="mt-1 text-sm text-gray-500">Create and manage healthcare provider credentials</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white shadow-sm rounded-lg border border-gray-100 overflow-hidden">
            <div className="px-6 py-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Credential Management</h3>
                  <p className="mt-1 text-sm text-gray-500">View and manage all credential requests</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">Filter:</span>
                  <select
                    className="block w-auto py-1.5 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="">All</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>
              
              <div className="mt-6">
                {isLoadingRequests ? (
                  <div className="p-8 flex justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
                  </div>
                ) : requests?.length === 0 ? (
                  <div className="p-8 text-center text-gray-500 bg-gray-50 rounded-lg border border-gray-100">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mx-auto mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M8 12h8" />
                    </svg>
                    <p className="text-lg font-medium">No credentials found</p>
                    <p className="text-sm mt-1">Create your first credential using the form on the right</p>
                  </div>
                ) : (
                  <ul className="divide-y divide-gray-100">
                    {requests?.map((request: any) => (
                      <li key={request.id} className="px-4 py-4 hover:bg-gray-50 rounded-md transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              {request.providerImageUrl ? (
                                <img className="h-10 w-10 rounded-full object-cover ring-2 ring-white" src={request.providerImageUrl} alt="" />
                              ) : (
                                <div className="h-10 w-10 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                                    <circle cx="9" cy="7" r="4" />
                                    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                                  </svg>
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{request.providerName}</div>
                              <div className="flex items-center mt-1">
                                <div className="text-sm text-gray-500 mr-2">{request.credentialType}</div>
                                <div className="text-xs text-gray-400">
                                  {new Date(request.requestDate).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric'
                                  })}
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                              request.status === 'approved' ? 'bg-green-100 text-green-800 border border-green-200' :
                              request.status === 'pending' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
                              'bg-red-100 text-red-800 border border-red-200'
                            }`}>
                              {request.status === 'approved' ? 'Approved' :
                               request.status === 'pending' ? 'Pending Review' :
                               'Rejected'}
                            </span>
                            <button
                              className={`inline-flex items-center px-3 py-1.5 border shadow-sm text-xs font-medium rounded-md ${
                                request.status === 'pending' 
                                  ? 'text-white bg-primary-600 hover:bg-primary-700 border-primary-600' 
                                  : 'text-gray-700 bg-white hover:bg-gray-50 border-gray-300'
                              }`}
                              onClick={() => openReviewModal(request)}
                            >
                              {request.status === 'pending' ? 'Review' : 'View'}
                            </button>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <div className="lg:col-span-1">
          <div className="bg-white shadow-sm rounded-lg border border-gray-100 overflow-hidden h-full">
            <div className="px-6 py-6">
              <h3 className="text-lg font-bold text-gray-900">Issue New Credential</h3>
              <p className="mt-1 text-sm text-gray-500">Issue a new credential for a healthcare provider</p>
              
              <div className="mt-6">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                    <FormField
                      control={form.control}
                      name="providerId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700 font-medium">Provider</FormLabel>
                          <FormControl>
                            <select
                              className="form-input"
                              {...field}
                              disabled={isLoadingProviders}
                            >
                              <option value="">Select a provider</option>
                              {providers?.map((provider: any) => (
                                <option key={provider.id} value={provider.id}>
                                  {provider.name} - {provider.specialty}
                                </option>
                              ))}
                            </select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700 font-medium">Credential Type</FormLabel>
                          <FormControl>
                            <select
                              className="form-input"
                              {...field}
                            >
                              <option value="">Select a credential type</option>
                              <option value="Board Certification">Board Certification</option>
                              <option value="Medical License">Medical License</option>
                              <option value="Fellowship">Fellowship</option>
                              <option value="Specialty Certification">Specialty Certification</option>
                              <option value="Hospital Affiliation">Hospital Affiliation</option>
                            </select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="issuingAuthority"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700 font-medium">Issuing Authority</FormLabel>
                          <FormControl>
                            <Input
                              className="form-input"
                              placeholder="e.g., American Board of Medical Specialties"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="details"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700 font-medium">Additional Details</FormLabel>
                          <FormControl>
                            <Textarea
                              className="form-input"
                              placeholder="Enter any additional details about this credential"
                              rows={3}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="pt-2">
                      <Button 
                        type="submit" 
                        disabled={form.formState.isSubmitting}
                        className="w-full"
                      >
                        {form.formState.isSubmitting ? 'Issuing...' : 'Issue Credential'}
                      </Button>
                    </div>
                  </form>
                </Form>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <CredentialReviewModal
        isOpen={isModalOpen}
        onClose={closeReviewModal}
        request={selectedRequest}
      />
    </div>
  );
}
