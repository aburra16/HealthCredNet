import { useState, useEffect } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { CredentialRequest } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { createNIP58Badge, getNip07PublicKey, hasNip07Extension } from "@/lib/nostr";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface CredentialReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: CredentialRequest | null;
}

export default function CredentialReviewModal({ isOpen, onClose, request }: CredentialReviewModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [badgeDetails, setBadgeDetails] = useState({
    name: "",
    description: "",
    image: "", // URL to badge image (optional)
    thumbs: [] as string[], // Optional thumbnail images
  });
  const [issuingMethod, setIssuingMethod] = useState<"extension" | "privateKey">("extension");
  const [privateKey, setPrivateKey] = useState("");
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [badgeId, setBadgeId] = useState("");
  const { toast } = useToast();
  
  // Reset form values when the modal opens or closes
  const resetForm = () => {
    setBadgeDetails({
      name: request?.credentialType ? `${request.credentialType} Certification` : "",
      description: request ? `${request.credentialType} credential for ${request.providerName} issued by ${request.issuingAuthority}` : "",
      image: "",
      thumbs: []
    });
    setBadgeId("");
    setPrivateKey("");
    setShowPrivateKey(false);
    setIssuingMethod(hasNip07Extension() ? "extension" : "privateKey");
  };
  
  // Initialize form when request changes
  useEffect(() => {
    if (request) {
      resetForm();
    }
  }, [request]);
  
  const handleApprove = async () => {
    if (!request) return;
    
    // Validate badge details
    if (!badgeDetails.name || !badgeDetails.description) {
      toast({
        title: "Missing badge details",
        description: "Please provide a name and description for the badge",
        variant: "destructive"
      });
      return;
    }
    
    // If using private key, validate it's provided
    if (issuingMethod === "privateKey" && !privateKey) {
      toast({
        title: "Private key required",
        description: "Please enter your Nostr private key to issue the badge",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      let generatedBadgeId = "";
      
      // Get subject public key (provider's nostr public key)
      const subjectPubkey = request.providerPublicKey || "";
      
      if (!subjectPubkey) {
        throw new Error("Provider public key not found");
      }
      
      // Create NIP-58 badge
      if (issuingMethod === "extension") {
        // Use NIP-07 extension
        generatedBadgeId = await createNIP58Badge(
          "", // Empty string indicates to use extension
          subjectPubkey,
          badgeDetails
        ) || "";
      } else {
        // Use private key
        generatedBadgeId = await createNIP58Badge(
          privateKey,
          subjectPubkey,
          badgeDetails
        ) || "";
      }
      
      if (!generatedBadgeId) {
        throw new Error("Failed to create NIP-58 badge");
      }
      
      // Update the credential with the badge ID
      await apiRequest('PATCH', `/api/credential-requests/${request.id}`, {
        status: 'approved',
        badgeId: generatedBadgeId,
        issueDate: new Date().toISOString()
      });
      
      // Invalidate queries to refetch data
      queryClient.invalidateQueries({ queryKey: ['/api/credential-requests'] });
      
      toast({
        title: "Credential approved",
        description: "The credential has been approved and the NIP-58 badge has been issued",
        variant: "default"
      });
      
      onClose();
    } catch (error) {
      console.error("Error approving credential:", error);
      toast({
        title: "Error",
        description: typeof error === 'object' && error !== null ? (error as Error).message : "Failed to approve credential",
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
      await apiRequest('PATCH', `/api/credential-requests/${request.id}`, {
        status: 'rejected'
      });
      
      // Invalidate queries to refetch data
      queryClient.invalidateQueries({ queryKey: ['/api/credential-requests'] });
      
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
                  Issue NIP-58 Badge Credential
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
              
              <div className="mt-6">
                <h4 className="text-base font-medium text-gray-900">NIP-58 Badge Information</h4>
                <p className="text-xs text-gray-500 mb-4">This information will be used to create a verifiable NIP-58 badge for this credential.</p>
                
                <div className="space-y-4">
                  <div>
                    <label htmlFor="badge-name" className="block text-sm font-medium text-gray-700">Badge Name</label>
                    <Input
                      id="badge-name"
                      value={badgeDetails.name}
                      onChange={(e) => setBadgeDetails({...badgeDetails, name: e.target.value})}
                      placeholder="e.g., Board Certified Cardiologist"
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="badge-description" className="block text-sm font-medium text-gray-700">Badge Description</label>
                    <Textarea
                      id="badge-description"
                      value={badgeDetails.description}
                      onChange={(e) => setBadgeDetails({...badgeDetails, description: e.target.value})}
                      placeholder="Describe what this badge represents"
                      rows={3}
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="badge-image" className="block text-sm font-medium text-gray-700">Badge Image URL (optional)</label>
                    <Input
                      id="badge-image"
                      value={badgeDetails.image}
                      onChange={(e) => setBadgeDetails({...badgeDetails, image: e.target.value})}
                      placeholder="https://example.com/badge-image.png"
                      className="mt-1"
                    />
                    <p className="mt-1 text-xs text-gray-500">URL to an image that will represent this badge</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <h4 className="text-base font-medium text-gray-900">Signing Method</h4>
                <p className="text-xs text-gray-500 mb-2">Choose how to sign the badge</p>
                
                <Tabs 
                  defaultValue={hasNip07Extension() ? "extension" : "privateKey"}
                  onValueChange={(value) => setIssuingMethod(value as "extension" | "privateKey")}
                  className="mt-4"
                >
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger 
                      value="extension" 
                      disabled={!hasNip07Extension()}
                      title={!hasNip07Extension() ? "No Nostr extension detected" : ""}
                    >
                      Browser Extension
                    </TabsTrigger>
                    <TabsTrigger value="privateKey">Private Key</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="extension" className="mt-4">
                    {hasNip07Extension() ? (
                      <div className="p-4 bg-green-50 rounded-md">
                        <p className="text-sm text-green-800">
                          You'll be prompted by your Nostr extension to sign the badge when you approve.
                        </p>
                      </div>
                    ) : (
                      <div className="p-4 bg-amber-50 rounded-md">
                        <p className="text-sm text-amber-800">
                          No Nostr extension detected. Please install a NIP-07 compatible extension like nos2x or use private key signing.
                        </p>
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="privateKey" className="mt-4">
                    <div>
                      <label htmlFor="private-key" className="block text-sm font-medium text-gray-700">
                        Nostr Private Key (nsec)
                      </label>
                      <div className="mt-1 relative">
                        <Input
                          id="private-key"
                          type={showPrivateKey ? "text" : "password"}
                          value={privateKey}
                          onChange={(e) => setPrivateKey(e.target.value)}
                          placeholder="nsec1..."
                          className="pr-12"
                        />
                        <button
                          type="button"
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          onClick={() => setShowPrivateKey(!showPrivateKey)}
                        >
                          {showPrivateKey ? "Hide" : "Show"}
                        </button>
                      </div>
                      <p className="mt-1 text-xs text-gray-500">
                        Your private key is only used to sign the badge and is not stored.
                      </p>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
              
              <div className="mt-6 sm:mt-5 sm:flex sm:flex-row-reverse">
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
