import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { validatePublicKey, validatePrivateKey, hasNip07Extension, getNip07PublicKey } from "@/lib/nostr";
import { login } from "@/lib/auth";
import { UserRole } from "@/types";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Login() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [loginType, setLoginType] = useState<UserRole>('user');
  const [publicKey, setPublicKey] = useState('');
  const [privateKey, setPrivateKey] = useState('');
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasExtension, setHasExtension] = useState(false);
  
  useEffect(() => {
    // Check if browser has Nostr extension
    setHasExtension(hasNip07Extension());
  }, []);
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!publicKey) {
      toast({
        title: "Missing information",
        description: "Please enter your Nostr public key (npub)",
        variant: "destructive"
      });
      return;
    }
    
    if (!validatePublicKey(publicKey)) {
      toast({
        title: "Invalid public key",
        description: "Please enter a valid Nostr public key (npub)",
        variant: "destructive"
      });
      return;
    }
    
    if (privateKey && !validatePrivateKey(privateKey)) {
      toast({
        title: "Invalid private key",
        description: "Please enter a valid Nostr private key (nsec)",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Authenticate user
      const user = await login(publicKey, loginType);
      
      // Navigate to appropriate dashboard based on role
      switch (user.role) {
        case 'authority':
          navigate('/authority/dashboard');
          break;
        case 'provider':
          navigate('/provider/profile');
          break;
        case 'user':
          navigate('/user/search');
          break;
        default:
          throw new Error('Unknown user role');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Authentication failed",
        description: "Could not authenticate with the provided keys",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleExtensionLogin = async () => {
    try {
      setIsLoading(true);
      const npub = await getNip07PublicKey();
      
      if (!npub) {
        toast({
          title: "Extension error",
          description: "Could not get public key from extension",
          variant: "destructive"
        });
        return;
      }
      
      setPublicKey(npub);
      
      // Authenticate user
      const user = await login(npub, loginType);
      
      // Navigate to appropriate dashboard based on role
      switch (user.role) {
        case 'authority':
          navigate('/authority/dashboard');
          break;
        case 'provider':
          navigate('/provider/profile');
          break;
        case 'user':
          navigate('/user/search');
          break;
        default:
          throw new Error('Unknown user role');
      }
    } catch (error) {
      console.error('Extension login error:', error);
      toast({
        title: "Authentication failed",
        description: "Could not authenticate with the extension",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const togglePrivateKeyVisibility = () => {
    setShowPrivateKey(!showPrivateKey);
  };
  
  const showNPUBInfo = (e: React.MouseEvent) => {
    e.preventDefault();
    toast({
      title: "About Nostr Keys",
      description: "Nostr uses public/private key pairs. Your npub is your public identity, nsec is your private key which should be kept secret. Never share your nsec with anyone.",
      duration: 8000
    });
  };
  
  // Role-specific descriptions and icons
  const roleInfo = {
    user: {
      title: "Patient Login",
      description: "Access your personal health records and find verified healthcare providers",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
          <circle cx="12" cy="7" r="4"></circle>
        </svg>
      ),
      color: "bg-blue-50 text-blue-600 border-blue-100"
    },
    provider: {
      title: "Provider Login",
      description: "Manage your credentials and professional profile",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
          <polyline points="9 22 9 12 15 12 15 22"></polyline>
          <path d="M12 7h.01"></path>
        </svg>
      ),
      color: "bg-green-50 text-green-600 border-green-100"
    },
    authority: {
      title: "Authority Login",
      description: "Issue and verify healthcare credentials for trusted providers",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
        </svg>
      ),
      color: "bg-purple-50 text-purple-600 border-purple-100"
    }
  };
  
  const currentRole = roleInfo[loginType];
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold text-gray-900">MedCred</h2>
          <p className="mt-2 text-sm text-gray-600">Healthcare credential management on Nostr</p>
        </div>
        
        <div className="bg-white p-8 rounded-xl shadow-md space-y-6">
          <Tabs 
            value={loginType} 
            onValueChange={(value) => setLoginType(value as UserRole)}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="user" className="text-sm">
                <div className="flex flex-col items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                  <span className="mt-1">Patient</span>
                </div>
              </TabsTrigger>
              <TabsTrigger value="provider" className="text-sm">
                <div className="flex flex-col items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
                  </svg>
                  <span className="mt-1">Provider</span>
                </div>
              </TabsTrigger>
              <TabsTrigger value="authority" className="text-sm">
                <div className="flex flex-col items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                  <span className="mt-1">Authority</span>
                </div>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="user" className="mt-4 space-y-4">
              <div className={`p-4 rounded-md border ${roleInfo.user.color} flex items-start`}>
                {roleInfo.user.icon}
                <div className="ml-3">
                  <h3 className="text-sm font-medium">{roleInfo.user.title}</h3>
                  <p className="text-xs mt-1">{roleInfo.user.description}</p>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="provider" className="mt-4 space-y-4">
              <div className={`p-4 rounded-md border ${roleInfo.provider.color} flex items-start`}>
                {roleInfo.provider.icon}
                <div className="ml-3">
                  <h3 className="text-sm font-medium">{roleInfo.provider.title}</h3>
                  <p className="text-xs mt-1">{roleInfo.provider.description}</p>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="authority" className="mt-4 space-y-4">
              <div className={`p-4 rounded-md border ${roleInfo.authority.color} flex items-start`}>
                {roleInfo.authority.icon}
                <div className="ml-3">
                  <h3 className="text-sm font-medium">{roleInfo.authority.title}</h3>
                  <p className="text-xs mt-1">{roleInfo.authority.description}</p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="mt-6 border-t border-gray-100 pt-6">
            <h3 className="text-lg font-medium text-gray-900">Sign In</h3>
            
            {hasExtension && (
              <Button
                type="button"
                className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2"
                onClick={handleExtensionLogin}
                disabled={isLoading}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
                Sign in with Nostr Extension
              </Button>
            )}
            
            {hasExtension && (
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or sign in manually</span>
                </div>
              </div>
            )}
            
            <form className="mt-4 space-y-4" onSubmit={handleLogin}>
              <div>
                <label htmlFor="nostr-key" className="block text-sm font-medium text-gray-700">Nostr Public Key (npub)</label>
                <input
                  type="text"
                  id="nostr-key"
                  className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  placeholder="npub1..."
                  value={publicKey}
                  onChange={(e) => setPublicKey(e.target.value)}
                />
              </div>
              
              <div>
                <label htmlFor="nostr-private-key" className="block text-sm font-medium text-gray-700">
                  Nostr Private Key (nsec)
                  <span className="text-xs text-gray-500 ml-1">(optional)</span>
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <input
                    type={showPrivateKey ? "text" : "password"}
                    id="nostr-private-key"
                    className="block w-full pr-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    placeholder="nsec1..."
                    value={privateKey}
                    onChange={(e) => setPrivateKey(e.target.value)}
                  />
                  <button
                    type="button"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-500"
                    onClick={togglePrivateKeyVisibility}
                  >
                    {showPrivateKey ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                        <line x1="1" y1="1" x2="23" y2="23"></line>
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                    )}
                  </button>
                </div>
                <p className="mt-1 text-xs text-gray-500 flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-gray-400 mr-1 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="16" x2="12" y2="12"></line>
                    <line x1="12" y1="8" x2="12.01" y2="8"></line>
                  </svg>
                  Your keys are never stored on our servers
                </p>
              </div>

              <div>
                <Button
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center gap-2"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Signing in...
                    </span>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                        <polyline points="10 17 15 12 10 7"></polyline>
                        <line x1="15" y1="12" x2="3" y2="12"></line>
                      </svg>
                      Sign in
                    </>
                  )}
                </Button>
              </div>
            </form>
            
            <div className="mt-6 text-center">
              <a
                href="#"
                className="text-sm text-blue-600 hover:text-blue-500 flex items-center justify-center"
                onClick={showNPUBInfo}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="16" x2="12" y2="12"></line>
                  <line x1="12" y1="8" x2="12.01" y2="8"></line>
                </svg>
                What is an npub/nsec key?
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
