import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";  // Import Sonner's toast function

const API_BASE = "http://localhost:3001";  // Replace with your actual API base URL

function AuthForm() {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Function to handle login
  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");  // Clear previous error
    
    try {
      const response = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, password }),
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const data = await response.json();
      
      // Save token to local storage
      localStorage.setItem('token', data.token);
      
      // Redirect based on user role
      if (data.isAdmin) {
        navigate('/admin');  // Redirect to admin panel
      } else {
        navigate('/');  // Redirect to home page
      }

      toast.success("Logged in successfully!");
    } catch (error) {
      setError("Invalid username or password");
      if (error instanceof Error) {
        toast.error(error.message || "Something went wrong");
      } else {
        toast.error("Something went wrong");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Function to handle signup
  const trySignup = async () => {
    if (!name || !password) {
      toast.error("Please enter both username and password");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("http://localhost:3001/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, password }),
      });

      if (response.ok) {
        toast.success("Account created successfully! You can now log in.");
        // Switch to login tab after successful signup
        (document.querySelector('[data-state="inactive"][data-value="login"]') as HTMLElement)?.click();
      } else {
        const errorText = await response.text();
        toast.error(errorText || "Failed to create account");
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
      console.error("Signup failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent, actionType: 'login' | 'signup') => {
    if (e.key === 'Enter') {
      actionType === 'login' ? handleLogin(e as unknown as React.FormEvent<HTMLFormElement>) : trySignup();
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Welcome</CardTitle>
          <CardDescription className="text-center">
            Sign in or create an account to continue
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <div className="space-y-4">
                {error && <div className="text-red-500">{error}</div>}
                <div className="space-y-2">
                  <Label htmlFor="login-name">Username</Label>
                  <Input 
                    id="login-name"
                    type="text" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Username"
                    onKeyPress={(e) => handleKeyPress(e, 'login')}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <Input 
                    id="login-password"
                    type="password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    onKeyPress={(e) => handleKeyPress(e, 'login')}
                  />
                </div>
                <Button 
                  className="w-full mt-2" 
                  onClick={() => handleLogin(new Event('submit') as unknown as React.FormEvent<HTMLFormElement>)}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Logging in...
                    </>
                  ) : (
                    "Login"
                  )}
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="signup">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">Username</Label>
                  <Input 
                    id="signup-name"
                    type="text" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Username"
                    onKeyPress={(e) => handleKeyPress(e, 'signup')}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input 
                    id="signup-password"
                    type="password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    onKeyPress={(e) => handleKeyPress(e, 'signup')}
                  />
                </div>
                <Button 
                  className="w-full mt-2" 
                  onClick={trySignup}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    "Create Account"
                  )}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-center text-sm text-gray-500">
          Secure authentication powered by JWT
        </CardFooter>
      </Card>
    </div>
  );
}

export default AuthForm;
