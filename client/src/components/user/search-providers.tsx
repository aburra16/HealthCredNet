import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, BadgeCheck } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

// Provider type definition
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

// Credential type definition
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

export default function SearchProviders() {
  const [searchTerm, setSearchTerm] = useState("");
  const [specialtyFilter, setSpecialtyFilter] = useState("");
  const [selectedProviderId, setSelectedProviderId] = useState<number | null>(null);
  
  // Fetch providers
  const { data: providers, isLoading: isLoadingProviders } = useQuery<Provider[]>({
    queryKey: ['/api/providers'],
  });
  
  // Fetch specialties
  const { data: specialties } = useQuery<string[]>({
    queryKey: ['/api/specialties'],
  });
  
  // Filter providers based on search term and specialty
  const filteredProviders = providers?.filter(provider => {
    const matchesSearch = searchTerm === "" || 
      provider.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      provider.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      provider.specialty?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      provider.institution?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSpecialty = specialtyFilter === "" || provider.specialty === specialtyFilter;
    
    return matchesSearch && matchesSpecialty;
  });
  
  // Function to get credentials for a provider
  const getCredentialsForProvider = (providerId: number) => {
    return useQuery<Credential[]>({
      queryKey: [`/api/credentials?providerId=${providerId}`],
      enabled: selectedProviderId === providerId
    });
  };
  
  const handleViewProfile = (providerId: number) => {
    setSelectedProviderId(providerId);
    
    // In a real app, this would navigate to a provider profile page
    // For now, let's just log this action
    console.log(`Viewing profile for provider ${providerId}`);
  };
  
  const renderProviderItem = (provider: Provider) => {
    const { data: credentials } = getCredentialsForProvider(provider.id);
    const isVerified = credentials && credentials.some(c => c.status === 'approved');
    
    return (
      <li key={provider.id} className="py-4">
        <div className="flex items-center space-x-4">
          <div className="flex-shrink-0">
            <div className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
              {provider.avatar ? (
                <img
                  src={provider.avatar}
                  alt={provider.displayName}
                  className="h-16 w-16 rounded-full object-cover"
                />
              ) : (
                provider.displayName.charAt(0).toUpperCase()
              )}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-lg font-medium text-gray-900 truncate">{provider.displayName}</p>
            <div className="flex items-center mt-1">
              {provider.specialty && (
                <Badge className="mr-2 bg-green-100 text-green-800 hover:bg-green-100">
                  {provider.specialty}
                </Badge>
              )}
              {isVerified && (
                <Badge variant="outline" className="bg-purple-100 text-purple-800 hover:bg-purple-100">
                  <BadgeCheck className="h-3 w-3 mr-1" /> Verified
                </Badge>
              )}
            </div>
            <p className="mt-1 text-sm text-gray-500">
              {provider.institution}{provider.institution && provider.location ? ' • ' : ''}{provider.location}
            </p>
          </div>
          <div>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => handleViewProfile(provider.id)}
              className="text-primary-700 bg-primary-100 hover:bg-primary-200"
            >
              View Profile
            </Button>
          </div>
        </div>
      </li>
    );
  };
  
  const renderSkeleton = () => {
    return (
      <li className="py-4">
        <div className="flex items-center space-x-4">
          <Skeleton className="h-16 w-16 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-8 w-24" />
        </div>
      </li>
    );
  };
  
  return (
    <div>
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900">Find Healthcare Providers</h1>
        <p className="mt-1 text-sm text-gray-500">Search for verified healthcare providers by name, specialty, or location</p>
      </div>
      
      <div className="px-4 py-5 sm:p-6 bg-white shadow sm:rounded-md">
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="sm:col-span-2 lg:col-span-2">
              <label htmlFor="search-term" className="block text-sm font-medium text-gray-700">Search</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <Input
                  type="text"
                  id="search-term"
                  placeholder="Search by name, specialty, or location"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
              </div>
            </div>
            
            <div>
              <label htmlFor="specialty-filter" className="block text-sm font-medium text-gray-700">Specialty</label>
              <Select value={specialtyFilter} onValueChange={setSpecialtyFilter}>
                <SelectTrigger id="specialty-filter" className="mt-1">
                  <SelectValue placeholder="All Specialties" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Specialties</SelectItem>
                  {specialties?.map(specialty => (
                    <SelectItem key={specialty} value={specialty}>
                      {specialty}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Results</h3>
            <ul className="mt-5 divide-y divide-gray-200">
              {isLoadingProviders ? (
                <>
                  {[1, 2, 3].map(i => (
                    <div key={i}>{renderSkeleton()}</div>
                  ))}
                </>
              ) : filteredProviders && filteredProviders.length > 0 ? (
                filteredProviders.map(provider => renderProviderItem(provider))
              ) : (
                <li className="py-4 text-center text-gray-500">
                  No providers found. Try adjusting your search criteria.
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
