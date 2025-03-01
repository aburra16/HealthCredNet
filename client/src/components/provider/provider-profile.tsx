import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
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
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export default function ProviderProfile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [institution, setInstitution] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zip, setZip] = useState("");
  const [about, setAbout] = useState("");
  
  // Fetch specialties for dropdown
  const { data: specialties } = useQuery<string[]>({
    queryKey: ['/api/specialties'],
  });
  
  // Initialize form with user data
  useEffect(() => {
    if (user) {
      const nameParts = user.displayName.split(' ');
      setFirstName(nameParts[0] || '');
      setLastName(nameParts.slice(1).join(' ') || '');
      setSpecialty(user.specialty || '');
      setInstitution(user.institution || '');
      
      if (user.location) {
        const locationParts = user.location.split(',');
        if (locationParts.length > 1) {
          const stateZip = locationParts[1].trim().split(' ');
          setCity(locationParts[0].trim());
          setState(stateZip[0] || '');
          setZip(stateZip[1] || '');
        } else {
          setCity(user.location);
        }
      }
      
      setAbout(user.about || '');
    }
  }, [user]);
  
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    setIsSaving(true);
    
    try {
      // Construct updated user data
      const updatedUser = {
        displayName: `${firstName} ${lastName}`.trim(),
        specialty,
        institution,
        location: `${city}, ${state} ${zip}`.trim(),
        about
      };
      
      // Update user profile
      const response = await apiRequest('PATCH', `/api/users/${user.id}`, updatedUser);
      
      if (response.ok) {
        toast({
          title: "Profile Updated",
          description: "Your profile has been successfully updated.",
        });
      }
    } catch (error) {
      console.error("Failed to update profile", error);
      toast({
        title: "Update Failed",
        description: "There was an error updating your profile. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <div>
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900">My Provider Profile</h1>
        <p className="mt-1 text-sm text-gray-500">Update your professional information and credentials</p>
      </div>
      
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-5 sm:p-6">
          <div className="md:grid md:grid-cols-3 md:gap-6">
            <div className="md:col-span-1">
              <div className="px-4 sm:px-0">
                <h3 className="text-lg font-medium leading-6 text-gray-900">Profile Information</h3>
                <p className="mt-1 text-sm text-gray-500">This information will be displayed publicly to potential patients.</p>
              </div>
            </div>
            
            <div className="mt-5 md:mt-0 md:col-span-2">
              <form onSubmit={handleSaveProfile}>
                <div className="grid grid-cols-6 gap-6">
                  <div className="col-span-6 sm:col-span-3">
                    <Label htmlFor="first-name">First name</Label>
                    <Input
                      type="text"
                      id="first-name"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  
                  <div className="col-span-6 sm:col-span-3">
                    <Label htmlFor="last-name">Last name</Label>
                    <Input
                      type="text"
                      id="last-name"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  
                  <div className="col-span-6 sm:col-span-4">
                    <Label htmlFor="specialty">Specialty</Label>
                    <Select value={specialty} onValueChange={setSpecialty}>
                      <SelectTrigger id="specialty" className="mt-1">
                        <SelectValue placeholder="Select a specialty" />
                      </SelectTrigger>
                      <SelectContent>
                        {specialties?.map(spec => (
                          <SelectItem key={spec} value={spec}>
                            {spec}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="col-span-6 sm:col-span-4">
                    <Label htmlFor="npub-address">Nostr Public Key (npub)</Label>
                    <Input
                      type="text"
                      id="npub-address"
                      value={user?.nostrPubkey || ''}
                      className="mt-1 bg-gray-50"
                      readOnly
                    />
                  </div>
                  
                  <div className="col-span-6 sm:col-span-6">
                    <Label htmlFor="institution">Institution</Label>
                    <Input
                      type="text"
                      id="institution"
                      value={institution}
                      onChange={(e) => setInstitution(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  
                  <div className="col-span-6 sm:col-span-6 lg:col-span-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      type="text"
                      id="city"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  
                  <div className="col-span-6 sm:col-span-3 lg:col-span-2">
                    <Label htmlFor="state">State</Label>
                    <Input
                      type="text"
                      id="state"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  
                  <div className="col-span-6 sm:col-span-3 lg:col-span-2">
                    <Label htmlFor="postal-code">ZIP / Postal</Label>
                    <Input
                      type="text"
                      id="postal-code"
                      value={zip}
                      onChange={(e) => setZip(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  
                  <div className="col-span-6">
                    <Label htmlFor="about">About</Label>
                    <Textarea
                      id="about"
                      rows={3}
                      value={about}
                      onChange={(e) => setAbout(e.target.value)}
                      className="mt-1"
                    />
                    <p className="mt-2 text-sm text-gray-500">Brief description of your practice and expertise.</p>
                  </div>
                  
                  <div className="col-span-6">
                    <Label>Profile photo</Label>
                    <div className="mt-2 flex items-center">
                      <span className="inline-block h-12 w-12 rounded-full overflow-hidden bg-gray-100">
                        {user?.avatar ? (
                          <img 
                            src={user.avatar} 
                            alt="Profile photo" 
                            className="h-full w-full object-cover" 
                          />
                        ) : (
                          <svg className="h-full w-full text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                          </svg>
                        )}
                      </span>
                      <Button
                        type="button"
                        variant="outline"
                        className="ml-5"
                      >
                        Change
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end">
                  <Button type="submit" disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save"
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
