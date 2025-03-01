import { useEffect, useState } from "react";
import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle, MapPin, Building, Award, ChevronsLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import CredentialBadge from "@/components/ui/credential-badge";

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

export default function ProviderProfile() {
  // Get provider ID from URL
  const params = useParams<{ id: string }>();
  const providerId = parseInt(params.id || '0');
  const [, navigate] = useLocation();

  // Fetch provider data
  const { data: provider, isLoading: isLoadingProvider } = useQuery<Provider>({
    queryKey: [`/api/users/${providerId}`],
    enabled: !isNaN(providerId)
  });

  // Fetch provider credentials
  const { data: credentials, isLoading: isLoadingCredentials } = useQuery<Credential[]>({
    queryKey: ['/api/credentials', providerId],
    enabled: !isNaN(providerId)
  });

  const handleGoBack = () => {
    navigate('/dashboard');
  };

  if (isLoadingProvider) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-6">
          <Button variant="ghost" onClick={handleGoBack} className="mr-2">
            <ChevronsLeft className="mr-1 h-4 w-4" />
            Back to providers
          </Button>
        </div>
        <div className="flex flex-col md:flex-row gap-6">
          <div className="md:w-1/3">
            <Card>
              <CardHeader className="flex flex-col items-center">
                <Skeleton className="h-32 w-32 rounded-full" />
                <Skeleton className="h-8 w-48 mt-4" />
                <Skeleton className="h-4 w-32 mt-2" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="md:w-2/3">
            <Card>
              <CardHeader>
                <Skeleton className="h-8 w-48" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Provider not found</h1>
        <Button variant="secondary" onClick={handleGoBack}>
          <ChevronsLeft className="mr-1 h-4 w-4" />
          Back to providers
        </Button>
      </div>
    );
  }

  // Count verified credentials
  const verifiedCredentials = credentials?.filter(cred => cred.status === 'approved') || [];
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
        <Button variant="ghost" onClick={handleGoBack} className="mr-2">
          <ChevronsLeft className="mr-1 h-4 w-4" />
          Back to providers
        </Button>
      </div>
      
      <div className="flex flex-col md:flex-row gap-6">
        <div className="md:w-1/3">
          <Card>
            <CardHeader className="flex flex-col items-center">
              <Avatar className="h-32 w-32">
                {provider.avatar ? (
                  <AvatarImage src={provider.avatar} alt={provider.displayName} />
                ) : (
                  <AvatarFallback className="text-4xl">
                    {provider.displayName.charAt(0)}
                  </AvatarFallback>
                )}
              </Avatar>
              <CardTitle className="mt-4 text-center">{provider.displayName}</CardTitle>
              {provider.specialty && (
                <Badge className="mt-2 bg-green-100 text-green-800 hover:bg-green-100">
                  {provider.specialty}
                </Badge>
              )}
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {provider.institution && (
                  <div className="flex items-center text-sm">
                    <Building className="mr-2 h-4 w-4 text-gray-500" />
                    <span>{provider.institution}</span>
                  </div>
                )}
                {provider.location && (
                  <div className="flex items-center text-sm">
                    <MapPin className="mr-2 h-4 w-4 text-gray-500" />
                    <span>{provider.location}</span>
                  </div>
                )}
                <div className="flex items-center text-sm">
                  <Award className="mr-2 h-4 w-4 text-gray-500" />
                  <span>{verifiedCredentials.length} Verified Credentials</span>
                </div>
              </div>
              
              <Separator className="my-4" />
              
              <div className="mt-4">
                <h3 className="text-sm font-medium mb-2">Nostr Public Key</h3>
                <p className="text-xs text-gray-500 break-all">{provider.nostrPubkey}</p>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="md:w-2/3">
          <Tabs defaultValue="about">
            <TabsList className="mb-4">
              <TabsTrigger value="about">About</TabsTrigger>
              <TabsTrigger value="credentials">Credentials</TabsTrigger>
            </TabsList>
            
            <TabsContent value="about">
              <Card>
                <CardHeader>
                  <CardTitle>About {provider.displayName}</CardTitle>
                </CardHeader>
                <CardContent>
                  {provider.about ? (
                    <p className="whitespace-pre-line">{provider.about}</p>
                  ) : (
                    <p className="text-gray-500 italic">No information provided.</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="credentials">
              <Card>
                <CardHeader>
                  <CardTitle>Verified Credentials</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoadingCredentials ? (
                    <div className="space-y-4">
                      <Skeleton className="h-16 w-full" />
                      <Skeleton className="h-16 w-full" />
                    </div>
                  ) : credentials && credentials.length > 0 ? (
                    <div className="space-y-4">
                      {credentials.map(credential => (
                        <div key={credential.id} className="flex items-center p-4 border rounded-md">
                          <div className="flex-1">
                            <div className="flex items-center">
                              <h3 className="font-medium">{credential.type}</h3>
                              <CredentialBadge 
                                type={credential.type}
                                status={credential.status}
                                badgeId={credential.badgeId}
                                issuingAuthority={credential.issuingAuthority}
                                className="ml-2"
                              />
                            </div>
                            <p className="text-sm text-gray-500">
                              Issued by: {credential.issuingAuthority}
                            </p>
                            {credential.details && (
                              <p className="text-sm mt-1">{credential.details}</p>
                            )}
                          </div>
                          {credential.status === 'approved' && (
                            <CheckCircle className="h-5 w-5 text-green-500 ml-2" />
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 italic">No credentials found.</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}