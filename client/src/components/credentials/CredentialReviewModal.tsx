import { useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { CredentialRequest } from "@/types";
import { useToast } from "@/hooks/use-toast";

interface CredentialReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: CredentialRequest | null;
}

export default function CredentialReviewModal({ isOpen, onClose, request }: CredentialReviewModalProps) {
  const [badgeId, setBadgeId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  const handleApprove = async () => {
    if (!request) return;
    if (!badgeId.trim()) {
      toast({
        title: "Badge ID required",
        description: "Please enter a badge ID to issue this credential",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await apiRequest('PUT', `/api/credentials/${request.id}`, {
        status: 'approved',
        badgeId: badgeId,
        issueDate: new Date().toISOString()
      });
      
      // Invalidate queries to refetch data
      queryClient.invalidateQueries({ queryKey: ['/api/credentials/requests'] });
      
      toast({
        title: "Credential approved",
        description: "The credential has been approved and the badge has been issued",
        variant: "default"
      });
      
      onClose();
    } catch (error) {
      console.error("Error approving credential:", error);
      toast({
        title: "Error",
        description: "Failed to approve credential",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleReject = async () => {
    if (!request) return;
    
    setIsSubmitting(true);
    
    try {
      await apiRequest('PUT', `/api/credentials/${request.id}`, {
        status: 'rejected'
      });
      
      // Invalidate queries to refetch data
      queryClient.invalidateQueries({ queryKey: ['/api/credentials/requests'] });
      
      toast({
        title: "Credential rejected",
        description: "The credential request has been rejected",
        variant: "default"
      });
      
      onClose();
    } catch (error) {
      console.error("Error rejecting credential:", error);
      toast({
        title: "Error",
        description: "Failed to reject credential",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (!request) return null;
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <div className="fixed inset-0 bg-black bg-opacity-25 z-10" onClick={onClose}></div>
      <div className="fixed z-20 inset-0 overflow-y-auto">
        <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
            <div className="sm:flex sm:items-start">
              <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-primary-100 sm:mx-0 sm:h-10 sm:w-10">
                <i className="fas fa-certificate text-primary-600"></i>
              </div>
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Review Credential Request
                </h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    {request.providerName} has requested a {request.credentialType} credential
                  </p>
                </div>
              </div>
            </div>
            
            <div className="mt-5 sm:mt-4 border-t border-gray-200 pt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Requester Information</label>
                <div className="mt-1 flex items-center">
                  {request.providerImageUrl ? (
                    <img className="h-12 w-12 rounded-full" src={request.providerImageUrl} alt="Provider" />
                  ) : (
                    <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                      <i className="fas fa-user-md text-gray-400"></i>
                    </div>
                  )}
                  <div className="ml-3">
                    <div className="text-sm font-medium text-gray-900">{request.providerName}</div>
                    <div className="text-sm text-gray-500">{request.providerSpecialty}</div>
                  </div>
                </div>
              </div>
              
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700">Credential Details</label>
                <dl className="mt-1 divide-y divide-gray-200 border-t border-b border-gray-200">
                  <div className="py-3 flex justify-between text-sm">
                    <dt className="text-gray-500">Type</dt>
                    <dd className="text-gray-900 text-right">{request.credentialType}</dd>
                  </div>
                  <div className="py-3 flex justify-between text-sm">
                    <dt className="text-gray-500">Issuing Authority</dt>
                    <dd className="text-gray-900 text-right">{request.issuingAuthority}</dd>
                  </div>
                  <div className="py-3 flex justify-between text-sm">
                    <dt className="text-gray-500">Requested Date</dt>
                    <dd className="text-gray-900 text-right">{new Date(request.requestDate).toLocaleDateString()}</dd>
                  </div>
                  {request.details && (
                    <div className="py-3 flex flex-col text-sm">
                      <dt className="text-gray-500">Additional Details</dt>
                      <dd className="text-gray-900 mt-1">{request.details}</dd>
                    </div>
                  )}
                </dl>
              </div>
              
              <div className="mt-4">
                <label htmlFor="badge-id" className="block text-sm font-medium text-gray-700">Badge ID for NIP-58</label>
                <div className="mt-1">
                  <Input
                    type="text"
                    id="badge-id"
                    value={badgeId}
                    onChange={(e) => setBadgeId(e.target.value)}
                    placeholder="Enter a unique badge identifier"
                    className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">This will be used to create the NIP-58 badge credential</p>
              </div>
              
              <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                <Button
                  onClick={handleApprove}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Processing...' : 'Approve & Issue Badge'}
                </Button>
                <Button
                  onClick={handleReject}
                  variant="secondary"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:w-auto sm:text-sm"
                  disabled={isSubmitting}
                >
                  Reject
                </Button>
                <Button
                  onClick={onClose}
                  variant="outline"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Dialog>
  );
}
