import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { EyeIcon, EyeOffIcon, AlertTriangleIcon, UnlockIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  validateNostrKey, 
  getPublicKeyFromPrivate, 
  hasNip07Extension,
  getNip07PublicKey
} from "@/lib/nostr";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function LoginForm() {
  const { login, loginWithNip07, loading } = useAuth();
  const { toast } = useToast();
  const [role, setRole] = useState("user");
  const [nostrPrivkey, setNostrPrivkey] = useState("");
  const [derivedPublicKey, setDerivedPublicKey] = useState<string | null>(null);
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [infoDialogOpen, setInfoDialogOpen] = useState(false);
  const [hasExtension, setHasExtension] = useState<boolean>(false);
  const [loadingExtension, setLoadingExtension] = useState<boolean>(false);
  
  // Check for NIP-07 extension
  useEffect(() => {
    setHasExtension(hasNip07Extension());
  }, []);
  
  // Derive public key when private key changes
  useEffect(() => {
    if (nostrPrivkey && nostrPrivkey.startsWith('nsec1')) {
      try {
        const pubkey = getPublicKeyFromPrivate(nostrPrivkey);
        setDerivedPublicKey(pubkey);
        console.log("Public key derived:", pubkey);
      } catch (error) {
        console.error("Failed to derive public key:", error);
        setDerivedPublicKey(null);
      }
    } else {
      setDerivedPublicKey(null);
    }
  }, [nostrPrivkey]);
  
  const handleLogin = async () => {
    if (!nostrPrivkey || !nostrPrivkey.startsWith('nsec1')) {
      toast({
        title: "Invalid key",
        description: "Please enter a valid Nostr private key (nsec1...)",
        variant: "destructive"
      });
      return;
    }
    
    if (!validateNostrKey(nostrPrivkey)) {
      toast({
        title: "Invalid key format",
        description: "Your private key doesn't seem to be in the correct format",
        variant: "destructive"
      });
      return;
    }
    
    const pubkey = getPublicKeyFromPrivate(nostrPrivkey);
    if (!pubkey) {
      toast({
        title: "Could not derive public key",
        description: "Unable to derive a public key from your private key",
        variant: "destructive"
      });
      return;
    }
    
    // Login with the derived public key
    await login(pubkey, nostrPrivkey, role);
  };
  
  // Handle NIP-07 browser extension login
  const handleExtensionLogin = async () => {
    setLoadingExtension(true);
    
    try {
      if (!hasNip07Extension()) {
        toast({
          title: "No extension detected",
          description: "Please install a Nostr browser extension like nos2x or Alby",
          variant: "destructive"
        });
        setLoadingExtension(false);
        return;
      }
      
      // Use the loginWithNip07 function from auth.ts which handles all the details
      // including connecting to relays and using the extension for signing
      await loginWithNip07(role);
      
    } catch (error) {
      console.error("Extension login failed:", error);
      toast({
        title: "Login Failed",
        description: "There was an error logging in with the extension. Please try again or use a private key.",
        variant: "destructive"
      });
    } finally {
      setLoadingExtension(false);
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
      <Card className="max-w-md w-full space-y-8">
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-primary-100">
              <svg className="h-8 w-8 text-primary-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
              </svg>
            </div>
            <h2 className="mt-6 text-3xl font-bold text-gray-900">MedCred</h2>
            <p className="mt-2 text-sm text-gray-600">Healthcare credential management on Nostr</p>
          </div>
          
          <div className="mt-8 space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="login-type">I am a</Label>
                <Select defaultValue={role} onValueChange={setRole}>
                  <SelectTrigger id="login-type" className="mt-1">
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User (Patient)</SelectItem>
                    <SelectItem value="provider">Healthcare Provider</SelectItem>
                    <SelectItem value="authority">Credential Issuing Authority</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Tabs defaultValue={hasExtension ? "extension" : "privatekey"} className="mt-6">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="extension" disabled={!hasExtension}>
                    <div className="flex items-center">
                      <UnlockIcon className="mr-2 h-4 w-4" />
                      Browser Extension
                    </div>
                  </TabsTrigger>
                  <TabsTrigger value="privatekey">Private Key</TabsTrigger>
                </TabsList>
                
                {/* Extension Login Tab */}
                <TabsContent value="extension" className="space-y-4">
                  {hasExtension ? (
                    <div className="pt-4">
                      <div className="bg-green-50 p-3 rounded-md border border-green-200 mb-4">
                        <p className="text-sm text-green-800 flex items-center">
                          <svg className="h-4 w-4 mr-2 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 6 9 17l-5-5" />
                          </svg>
                          Nostr extension detected
                        </p>
                      </div>
                      <p className="text-sm text-gray-600 mb-4">
                        Your browser has a Nostr extension installed. You can sign in securely without entering your private key.
                      </p>
                      <Button 
                        className="w-full" 
                        onClick={handleExtensionLogin}
                        disabled={loadingExtension}
                      >
                        {loadingExtension ? "Connecting..." : "Sign in with Extension"}
                      </Button>
                    </div>
                  ) : (
                    <div className="pt-4">
                      <div className="bg-amber-50 p-3 rounded-md border border-amber-200 mb-4">
                        <p className="text-sm text-amber-800 flex items-center">
                          <AlertTriangleIcon className="h-4 w-4 mr-2 text-amber-500" />
                          No Nostr extension detected
                        </p>
                      </div>
                      <p className="text-sm text-gray-600 mb-4">
                        Install a Nostr extension like <a href="https://github.com/fiatjaf/nos2x" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">nos2x</a> or <a href="https://getalby.com/" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">Alby</a> to sign in without entering your private key.
                      </p>
                    </div>
                  )}
                </TabsContent>
                
                {/* Private Key Login Tab */}
                <TabsContent value="privatekey" className="space-y-4">
                  <div className="pt-4">
                    <div>
                      <Label htmlFor="nostr-private-key">Nostr Private Key (nsec)</Label>
                      <div className="mt-1 relative">
                        <Input 
                          type={showPrivateKey ? "text" : "password"} 
                          id="nostr-private-key" 
                          placeholder="nsec1..." 
                          value={nostrPrivkey}
                          onChange={(e) => setNostrPrivkey(e.target.value)}
                          className="pr-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute inset-y-0 right-0 flex items-center pr-3"
                          onClick={() => setShowPrivateKey(!showPrivateKey)}
                        >
                          {showPrivateKey ? (
                            <EyeOffIcon className="h-4 w-4 text-gray-400" />
                          ) : (
                            <EyeIcon className="h-4 w-4 text-gray-400" />
                          )}
                        </Button>
                      </div>
                      <p className="mt-1 text-xs text-gray-500">Your keys are never stored on our servers</p>
                    </div>
                    
                    {derivedPublicKey && (
                      <div className="bg-green-50 p-3 rounded-md border border-green-200 mt-4">
                        <p className="text-xs font-medium text-green-800">
                          Public key derived: {derivedPublicKey.substring(0, 10)}...{derivedPublicKey.substring(derivedPublicKey.length - 5)}
                        </p>
                      </div>
                    )}
                    
                    {nostrPrivkey && !nostrPrivkey.startsWith('nsec1') && (
                      <div className="bg-amber-50 p-3 rounded-md border border-amber-200 flex mt-4">
                        <AlertTriangleIcon className="h-4 w-4 text-amber-500 mr-2 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-amber-800">
                          Your private key should start with "nsec1"
                        </p>
                      </div>
                    )}
                    
                    <Button 
                      className="w-full mt-4" 
                      onClick={handleLogin}
                      disabled={loading || !(nostrPrivkey && nostrPrivkey.startsWith('nsec1'))}
                    >
                      {loading ? "Signing in..." : "Sign in with Private Key"}
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
              
            </div>
            
            <div className="text-center">
              <Dialog open={infoDialogOpen} onOpenChange={setInfoDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="link" className="text-primary-600 hover:text-primary-500 text-sm">
                    What is a Nostr key?
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>About Nostr Keys</DialogTitle>
                    <DialogDescription>
                      <div className="mt-2 space-y-4 text-sm text-gray-600">
                        <p>
                          <strong>Nostr</strong> (Notes and Other Stuff Transmitted by Relays) is a protocol for a censorship-resistant social network.
                        </p>
                        <p>
                          <strong>nsec</strong> is your private key, which you use to sign messages and prove ownership of your identity. 
                          <strong> Never share this with anyone!</strong>
                        </p>
                        <p>
                          We automatically derive your public key (npub) from your private key (nsec), so you only need to enter your private key.
                        </p>
                        <p>
                          <strong>Browser extensions</strong> like nos2x or Alby let you use Nostr without exposing your private key. They securely sign messages on your behalf.
                        </p>
                        <p>
                          For testing MedCred, you can use any value that starts with "nsec1" followed by random characters.
                        </p>
                      </div>
                    </DialogDescription>
                  </DialogHeader>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
