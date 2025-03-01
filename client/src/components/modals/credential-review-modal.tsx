import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { createNIP58Badge } from "@/lib/nostr";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { BadgeCheck, CheckCircle, XCircle } from "lucide-react";

// Types
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

interface Provider {
  id: number;
  username: string;
  displayName: string;
  role: string;
  nostrPubkey: string;
  location?: string;
  specialty?: string;
  institution?: string;
  about?: string;
  avatar?: string;
}

interface CredentialReviewModalProps {
  request: CredentialRequest;
  provider?: Provider;
  isOpen: boolean;
  onClose: () => void;
}

export default function CredentialReviewModal({
  request,
  provider,
  isOpen,
  onClose
}: CredentialReviewModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [badgeId, setBadgeId] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Format date for display
  const formatDate = (dateString: Date) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };
  
  // Review credential request mutation
  const reviewRequestMutation = useMutation({
    mutationFn: async (data: { status: string, badgeId?: string }) => {
      if (!user) throw new Error("User not authenticated");
      
      console.log("Updating credential request with data:", {
        status: data.status,
        reviewedById: user.id,
        badgeId: data.badgeId
      });
      
      const response = await apiRequest('PATCH', `/api/credential-requests/${request.id}`, {
        status: data.status,
        reviewedById: user.id,
        badgeId: data.badgeId
      });
      
      return await response.json();
    },
    onSuccess: () => {
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/credential-requests'] });
      queryClient.invalidateQueries({ queryKey: [`/api/credentials?providerId=${request.providerId}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/credentials'] });
      queryClient.invalidateQueries({ queryKey: ['/api/audit-logs'] });
      
      // Close modal
      onClose();
      
      // Show success message
      toast({
        title: "Request Processed",
        description: "The credential request has been processed successfully.",
      });
    },
    onError: (error) => {
      console.error("Failed to process request", error);
      toast({
        title: "Processing Failed",
        description: "There was an error processing the credential request.",
        variant: "destructive"
      });
    },
    onSettled: () => {
      setIsProcessing(false);
    }
  });
  
  const handleApprove = () => {
    // We don't require a badge ID anymore since we generate it automatically
    // We keep the field for backward compatibility but it's optional
    
    setIsProcessing(true);
    
    // In a real app, we would create an actual NIP-58 badge here
    // For now, we just use the mock badge ID entered by the user
    if (provider && user) {
      // This is just a mock of what would happen in a real implementation
      const badgeInfo = {
        name: `${request.type} Certification`,
        description: `${request.type} credential issued by ${request.issuingAuthority}`,
        image: "",
        thumbs: []
      };
      
      // Create a real NIP-58 badge
      try {
        // Get the private key from local storage (if using direct login)
        // or use empty string for NIP-07 extension
        const privateKey = localStorage.getItem('medcred_privkey') || '';
        
        createNIP58Badge(privateKey, provider.nostrPubkey, badgeInfo)
          .then(realBadgeId => {
            if (realBadgeId) {
              console.log("Created badge with ID:", realBadgeId);
              
              // Use the generated badge ID instead of the one entered by user
              reviewRequestMutation.mutate({
                status: 'approved',
                badgeId: realBadgeId
              });
            } else {
              throw new Error("Failed to create badge - no badge ID returned");
            }
          })
          .catch(error => {
            console.error("Error creating NIP-58 badge:", error);
            toast({
              title: "Failed to Create Badge",
              description: "There was an error creating the NIP-58 badge. Please try again.",
              variant: "destructive"
            });
            setIsProcessing(false);
          });
      } catch (error) {
        console.error("Error approving credential:", error);
        toast({
          title: "Approval Failed",
          description: "There was an error approving the credential request.",
          variant: "destructive"
        });
        setIsProcessing(false);
      }
    }
  };
  
  const handleReject = () => {
    setIsProcessing(true);
    
    // Process the request as rejected
    reviewRequestMutation.mutate({
      status: 'rejected'
    });
  };
  
  if (!provider) return null;
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center">
            <BadgeCheck className="h-6 w-6 text-primary-600 mr-2" />
            <DialogTitle>Review Credential Request</DialogTitle>
          </div>
          <DialogDescription>
            {provider.displayName} has requested a {request.type} credential
          </DialogDescription>
        </DialogHeader>
        
        <div className="mt-4 border-t border-gray-200 pt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Requester Information</label>
            <div className="mt-1 flex items-center">
              <Avatar className="h-12 w-12">
                <AvatarImage src={provider.avatar} />
                <AvatarFallback>
                  {provider.displayName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="ml-3">
                <div className="text-sm font-medium text-gray-900">{provider.displayName}</div>
                <div className="text-sm text-gray-500 truncate">{provider.nostrPubkey}</div>
              </div>
            </div>
          </div>
          
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700">Credential Details</label>
            <dl className="mt-1 divide-y divide-gray-200 border-t border-b border-gray-200">
              <div className="py-3 flex justify-between text-sm">
                <dt className="text-gray-500">Type</dt>
                <dd className="text-gray-900 text-right">{request.type}</dd>
              </div>
              <div className="py-3 flex justify-between text-sm">
                <dt className="text-gray-500">Issuing Authority</dt>
                <dd className="text-gray-900 text-right">{request.issuingAuthority}</dd>
              </div>
              <div className="py-3 flex justify-between text-sm">
                <dt className="text-gray-500">Requested Date</dt>
                <dd className="text-gray-900 text-right">{formatDate(request.createdAt)}</dd>
              </div>
              {request.details && (
                <div className="py-3 flex flex-col text-sm">
                  <dt className="text-gray-500">Additional Details</dt>
                  <dd className="text-gray-900 mt-1">{request.details}</dd>
                </div>
              )}
            </dl>
          </div>
          
          {request.status === 'pending' && (
            <div className="mt-4">
              <label htmlFor="badge-id" className="block text-sm font-medium text-gray-700">
                Custom Badge ID (Optional)
              </label>
              <div className="mt-1">
                <Input
                  type="text"
                  id="badge-id"
                  placeholder="Auto-generated if not provided"
                  value={badgeId}
                  onChange={(e) => setBadgeId(e.target.value)}
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                A NIP-58 badge credential will be created automatically
              </p>
            </div>
          )}
        </div>
        
        {request.status === 'pending' ? (
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={isProcessing}
              className="gap-1"
            >
              <XCircle className="h-4 w-4" />
              Reject
            </Button>
            <Button
              onClick={handleApprove}
              disabled={isProcessing}
              className="gap-1"
            >
              <CheckCircle className="h-4 w-4" />
              Approve & Issue Badge
            </Button>
          </DialogFooter>
        ) : (
          <DialogFooter>
            <Button
              onClick={onClose}
            >
              Close
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
