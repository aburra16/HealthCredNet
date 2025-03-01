import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function UserProfile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [editing, setEditing] = useState(false);
  
  // Profile form state
  const [formState, setFormState] = useState({
    displayName: user?.displayName || '',
    location: user?.location || '',
    about: user?.about || '',
  });
  
  if (!user) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Please login to view your profile</p>
      </div>
    );
  }
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSaveProfile = async () => {
    try {
      // In a real implementation, we would call an API to update the profile
      // For now, let's just show a toast message
      toast({
        title: "Profile Updated",
        description: "Your profile information has been saved successfully.",
      });
      setEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Update Failed",
        description: "There was an error updating your profile. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const getInitials = (name: string) => {
    if (!name) return "U";
    return name.split(" ").map(n => n[0]).join("").toUpperCase();
  };
  
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-8">My Profile</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Public Key</CardTitle>
              <CardDescription>Your Nostr public key</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center mb-4">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={user.avatar} alt={user.displayName} />
                  <AvatarFallback className="text-lg">{getInitials(user.displayName)}</AvatarFallback>
                </Avatar>
              </div>
              
              <div className="bg-muted p-3 rounded-md overflow-auto break-all text-sm text-muted-foreground">
                {user.nostrPubkey}
              </div>
              
              <div className="mt-4 text-center">
                <p className="text-sm text-muted-foreground">
                  You're logged in as <span className="font-semibold">{user.username}</span>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>Manage your personal details</CardDescription>
                </div>
                <Button 
                  variant={editing ? "outline" : "default"} 
                  onClick={() => setEditing(!editing)}
                >
                  {editing ? "Cancel" : "Edit Profile"}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="displayName">Display Name</Label>
                  <Input 
                    id="displayName"
                    name="displayName"
                    value={formState.displayName}
                    onChange={handleInputChange}
                    disabled={!editing}
                    placeholder="Enter your full name"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input 
                    id="location"
                    name="location"
                    value={formState.location || ''}
                    onChange={handleInputChange}
                    disabled={!editing}
                    placeholder="e.g. San Francisco, CA"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="about">About</Label>
                  <Textarea 
                    id="about"
                    name="about"
                    value={formState.about || ''}
                    onChange={handleInputChange}
                    disabled={!editing}
                    placeholder="Tell us a bit about yourself"
                    rows={4}
                  />
                </div>
                
                {editing && (
                  <Button onClick={handleSaveProfile}>
                    Save Changes
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}