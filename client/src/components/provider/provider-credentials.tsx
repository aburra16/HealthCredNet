import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { CalendarCheck, Key, BadgeCheck, CheckCircle, Clock, FileUp } from "lucide-react";

// Types
interface Credential {
  id: number;
  providerId: number;
  type: string;
  issuerId: number;
  status: string;
  badgeId?: string;
  issuingAuthority: string;
  details?: string;
  issuedAt?: Date;
  expiresAt?: Date;
}

interface CredentialRequest {
  id: number;
  providerId: number;
  type: string;
  issuingAuthority: string;
  details?: string;
  status: string;
  createdAt: Date;
  reviewedAt?: Date;
  reviewedById?: number;
}

export default function ProviderCredentials() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Form state
  const [credentialType, setCredentialType] = useState("");
  const [issuingAuthority, setIssuingAuthority] = useState("");
  const [details, setDetails] = useState("");
  const [fileSelected, setFileSelected] = useState(false);
  
  // Fetch credentials for the current provider
  const { data: credentials, isLoading: isLoadingCredentials } = useQuery<Credential[]>({
    queryKey: [`/api/credentials?providerId=${user?.id}`],
    enabled: !!user?.id,
  });
  
  // Fetch pending requests for the current provider
  const { data: requests, isLoading: isLoadingRequests } = useQuery<CredentialRequest[]>({
    queryKey: [`/api/credential-requests?providerId=${user?.id}`],
    enabled: !!user?.id,
  });
  
  // Fetch credential types
  const { data: credentialTypes } = useQuery<string[]>({
    queryKey: ['/api/credential-types'],
  });
  
  // Submit credential request
  const submitRequestMutation = useMutation({
    mutationFn: async (requestData: any) => {
      const response = await apiRequest('POST', '/api/credential-requests', requestData);
      return await response.json();
    },
    onSuccess: () => {
      // Reset form
      setCredentialType("");
      setIssuingAuthority("");
      setDetails("");
      setFileSelected(false);
      
      // Show success message
      toast({
        title: "Request Submitted",
        description: "Your credential request has been submitted for review.",
      });
      
      // Refresh data
      queryClient.invalidateQueries({ queryKey: [`/api/credential-requests?providerId=${user?.id}`] });
    },
    onError: (error) => {
      console.error("Failed to submit request", error);
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your request. Please try again.",
        variant: "destructive"
      });
    }
  });
  
  const handleSubmitRequest = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    // Validate form
    if (!credentialType || !issuingAuthority) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }
    
    // Submit request
    submitRequestMutation.mutate({
      providerId: user.id,
      type: credentialType,
      issuingAuthority,
      details
    });
  };
  
  const handleFileChange = () => {
    setFileSelected(true);
    // In a real app, this would upload the file to a server
  };
  
  const formatDate = (dateString?: Date) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };
  
  return (
    <div>
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900">My Credentials</h1>
        <p className="mt-1 text-sm text-gray-500">View and manage your professional credentials</p>
      </div>
      
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-5 sm:p-6">
          <div className="mb-5">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Active Credentials</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">These are your verified credentials on the Nostr network.</p>
          </div>
          
          {isLoadingCredentials ? (
            <div className="text-center py-4">
              <div className="inline-block animate-spin mr-2">
                <Clock className="h-6 w-6 text-primary-500" />
              </div>
              <span>Loading credentials...</span>
            </div>
          ) : credentials && credentials.length > 0 ? (
            credentials.map(credential => (
              <div key={credential.id} className="bg-gray-50 p-4 rounded-lg mb-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0 pt-0.5">
                    <BadgeCheck className="h-6 w-6 text-accent-500" />
                  </div>
                  <div className="ml-3 flex-1">
                    <h4 className="text-md font-medium text-gray-900">{credential.type}</h4>
                    <p className="text-sm text-gray-500">Issued by: {credential.issuingAuthority}</p>
                    {credential.issuedAt && (
                      <div className="mt-2 flex items-center text-sm text-gray-500">
                        <CalendarCheck className="mr-1.5 h-4 w-4 text-green-500 flex-shrink-0" />
                        <p>Issued: {formatDate(credential.issuedAt)}</p>
                      </div>
                    )}
                    {credential.badgeId && (
                      <div className="mt-1 flex items-center text-sm text-gray-500">
                        <Key className="mr-1.5 h-4 w-4 text-primary-500 flex-shrink-0" />
                        <p className="truncate">NIP-58 Badge ID: {credential.badgeId}</p>
                      </div>
                    )}
                    <Badge variant="outline" className="mt-2 flex items-center w-fit bg-green-100 text-green-800 border-green-200">
                      <CheckCircle className="h-3 w-3 mr-1" /> Active
                    </Badge>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-4 text-gray-500">
              You don't have any active credentials yet.
            </div>
          )}
          
          {/* Pending Requests */}
          {requests && requests.length > 0 && (
            <div className="mt-8 border-t border-gray-200 pt-4">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Pending Requests</h3>
              <div className="mt-2 space-y-4">
                {requests.filter(r => r.status === 'pending').map(request => (
                  <div key={request.id} className="bg-yellow-50 p-4 rounded-lg">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 pt-0.5">
                        <Clock className="h-6 w-6 text-yellow-500" />
                      </div>
                      <div className="ml-3 flex-1">
                        <h4 className="text-md font-medium text-gray-900">{request.type}</h4>
                        <p className="text-sm text-gray-500">Issuing Authority: {request.issuingAuthority}</p>
                        <div className="mt-2 flex items-center text-sm text-gray-500">
                          <CalendarCheck className="mr-1.5 h-4 w-4 text-gray-500 flex-shrink-0" />
                          <p>Requested: {formatDate(request.createdAt)}</p>
                        </div>
                        <Badge variant="outline" className="mt-2 bg-yellow-100 text-yellow-800 border-yellow-200">
                          Pending Review
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="mb-5 pt-5 border-t border-gray-200 mt-8">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Request New Credential</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">Submit a request for a new credential to be verified by the credential authority.</p>
          </div>
          
          <form onSubmit={handleSubmitRequest}>
            <div className="grid grid-cols-6 gap-6">
              <div className="col-span-6 sm:col-span-3">
                <Label htmlFor="credential-type">Credential Type</Label>
                <Select value={credentialType} onValueChange={setCredentialType}>
                  <SelectTrigger id="credential-type" className="mt-1">
                    <SelectValue placeholder="Select a credential type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="select">Select a credential type</SelectItem>
                    {credentialTypes?.map(type => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="col-span-6 sm:col-span-3">
                <Label htmlFor="issuing-authority">Issuing Authority</Label>
                <Input
                  type="text"
                  id="issuing-authority"
                  placeholder="e.g., American Board of Neurology"
                  value={issuingAuthority}
                  onChange={(e) => setIssuingAuthority(e.target.value)}
                  className="mt-1"
                />
              </div>
              
              <div className="col-span-6">
                <Label htmlFor="credential-details">Additional Details</Label>
                <Textarea
                  id="credential-details"
                  rows={3}
                  placeholder="Please provide any additional information about this credential"
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  className="mt-1"
                />
              </div>
              
              <div className="col-span-6">
                <Label>Supporting Documentation</Label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                  <div className="space-y-1 text-center">
                    <FileUp className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                      <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500">
                        <span>Upload a file</span>
                        <input
                          id="file-upload"
                          name="file-upload"
                          type="file"
                          className="sr-only"
                          onChange={handleFileChange}
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">
                      PNG, JPG, PDF up to 10MB
                    </p>
                    {fileSelected && (
                      <p className="text-xs text-green-500">
                        File selected. Ready to upload.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end">
              <Button 
                type="submit" 
                disabled={submitRequestMutation.isPending}
              >
                {submitRequestMutation.isPending ? (
                  <>
                    <Clock className="animate-spin mr-2 h-4 w-4" />
                    Submitting...
                  </>
                ) : (
                  "Submit Request"
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
