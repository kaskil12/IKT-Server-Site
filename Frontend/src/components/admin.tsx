import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw, UserPlus, X } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

// Define account type
interface Account {
  id: number;
  name: string;
  password: string;
  isAdmin: boolean;
  createdAt?: string;
  updatedAt?: string;
}

function AdminPanel() {
  const [data, setData] = useState<Account[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null);
  const [isUserAdmin, setIsUserAdmin] = useState<boolean>(false);
  
  // New account state
  const [newAccount, setNewAccount] = useState<{name: string, password: string, isAdmin: boolean}>({
    name: "",
    password: "",
    isAdmin: false
  });
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  
  // Edit account state
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  
  // API base URL
  const API_BASE = "http://192.168.10.104:3001";

  // Check if current user is admin
  const checkAdminStatus = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/login"; // Redirect to login if no token
      return;
    }
    
    fetch(`${API_BASE}/verifyToken`, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    })
    .then(response => {
      if (!response.ok) {
        throw new Error("Not authorized");
      }
      return response.json();
    })
    .then(data => {
      if (!data.user.isAdmin) {
        // User is not admin, redirect to home
        setNotification({
          type: 'error',
          message: 'You do not have permission to access the admin panel'
        });
        setTimeout(() => {
          window.location.href = "/";
        }, 2000);
      } else {
        setIsUserAdmin(true);
        fetchAccounts();
      }
    })
    .catch(error => {
      console.error("Auth error:", error);
      // Redirect to login
      localStorage.removeItem("token");
      window.location.href = "/login";
    });
  };

  const fetchAccounts = () => {
    setLoading(true);
    setError(null);
    const token = localStorage.getItem("token");
    fetch(`${API_BASE}/getAll`, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    })
      .then((response) => {
        if (!response.ok) {
          console.error('Response status:', response.status);
          return response.text().then(text => { throw new Error(text) });
        }
        return response.json();
      })
      .then((data) => {
        setData(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching accounts data:", error);
        setError("Failed to load accounts. Please try again.");
        setLoading(false);
      });
  };

  const handleAddAccount = () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    fetch(`${API_BASE}/add`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(newAccount),
    })
    .then((response) => {
      if (!response.ok) {
        if (response.status === 409) {
          throw new Error('Account already exists');
        }
        return response.text().then(text => { throw new Error(text) });
      }
      return response.json();
    })
    .then((data) => {
      setNotification({
        type: 'success',
        message: 'Account added successfully'
      });
      
      // Reset form and close dialog
      setNewAccount({ name: "", password: "", isAdmin: false });
      setAddDialogOpen(false);
      
      // Refresh account list
      fetchAccounts();
    })
    .catch((error) => {
      console.error("Error adding account:", error);
      setNotification({
        type: 'error',
        message: `Failed to add account: ${error.message}`
      });
      setLoading(false);
    });
  };

  const handleEditAccount = () => {
    if (!editingAccount) return;
    
    setLoading(true);
    const token = localStorage.getItem("token");
    
    fetch(`${API_BASE}/update/${editingAccount.id}`, {
      method: "PUT",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        name: editingAccount.name,
        password: editingAccount.password,
        isAdmin: editingAccount.isAdmin
      }),
    })
    .then((response) => {
      if (!response.ok) {
        return response.text().then(text => { throw new Error(text) });
      }
      return response.json();
    })
    .then((data) => {
      setNotification({
        type: 'success',
        message: 'Account updated successfully'
      });
      
      // Reset form and close dialog
      setEditingAccount(null);
      setEditDialogOpen(false);
      
      // Refresh account list
      fetchAccounts();
    })
    .catch((error) => {
      console.error("Error updating account:", error);
      setNotification({
        type: 'error',
        message: `Failed to update account: ${error.message}`
      });
      setLoading(false);
    });
  };

  const handleDeleteAccount = (id: number) => {
    if (!window.confirm("Are you sure you want to delete this account?")) {
      return;
    }
    
    setLoading(true);
    const token = localStorage.getItem("token");
    
    fetch(`${API_BASE}/delete/${id}`, {
      method: "DELETE",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      }
    })
    .then((response) => {
      if (!response.ok) {
        return response.text().then(text => { throw new Error(text) });
      }
      return response.json();
    })
    .then(() => {
      setNotification({
        type: 'success',
        message: 'Account deleted successfully'
      });
      
      // Refresh account list
      fetchAccounts();
    })
    .catch((error) => {
      console.error("Error deleting account:", error);
      setNotification({
        type: 'error',
        message: `Failed to delete account: ${error.message}`
      });
      setLoading(false);
    });
  };

  // Clear notification after 5 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [notification]);

  useEffect(() => {
    // Check if user is admin
    checkAdminStatus();
  }, []);

  // Don't render anything until we've checked admin status
  if (!isUserAdmin) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Admin Panel</CardTitle>
          </CardHeader>
          <CardContent>
            {notification && (
              <Alert variant={notification.type === 'success' ? "default" : "destructive"}>
                {notification.type === 'error' ? <AlertCircle className="h-4 w-4" /> : null}
                <AlertTitle>{notification.type === 'success' ? "Success" : "Error"}</AlertTitle>
                <AlertDescription>{notification.message}</AlertDescription>
              </Alert>
            )}
            <div className="py-8 flex justify-center items-center">
              <div className="flex flex-col items-center gap-2">
                <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
                <p className="text-sm text-gray-500">Checking permissions...</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Card className="shadow-lg">
        <CardHeader className="">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-2xl font-bold">Admin Panel</CardTitle>
              <CardDescription>Manage system accounts</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={fetchAccounts}
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              
              <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add User
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Account</DialogTitle>
                    <DialogDescription>
                      Enter the details for the new account.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="name" className="text-right">
                        Username
                      </Label>
                      <Input
                        id="name"
                        value={newAccount.name}
                        onChange={(e) => setNewAccount({...newAccount, name: e.target.value})}
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="password" className="text-right">
                        Password
                      </Label>
                      <Input
                        id="password"
                        type="password"
                        value={newAccount.password}
                        onChange={(e) => setNewAccount({...newAccount, password: e.target.value})}
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="isAdmin" className="text-right">
                        Admin Access
                      </Label>
                      <div className="flex items-center space-x-2 col-span-3">
                        <Checkbox 
                          id="isAdmin" 
                          checked={newAccount.isAdmin}
                          onCheckedChange={(checked: boolean) => 
                            setNewAccount({...newAccount, isAdmin: checked === true})
                          }
                        />
                        <label
                          htmlFor="isAdmin"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Grant admin privileges
                        </label>
                      </div>
                    </div>
                  </div>
                  
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setAddDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleAddAccount}>Add Account</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {notification && (
            <Alert variant={notification.type === 'success' ? "default" : "destructive"} className="mb-6">
              {notification.type === 'error' ? <AlertCircle className="h-4 w-4" /> : null}
              <AlertTitle>{notification.type === 'success' ? "Success" : "Error"}</AlertTitle>
              <AlertDescription>{notification.message}</AlertDescription>
            </Alert>
          )}
          
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {loading && data.length === 0 ? (
            <div className="py-8 flex justify-center items-center">
              <div className="flex flex-col items-center gap-2">
                <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
                <p className="text-sm text-gray-500">Loading accounts...</p>
              </div>
            </div>
          ) : data.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Username</TableHead>
                  <TableHead>Admin</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((account) => (
                  <TableRow key={account.id}>
                    <TableCell className="font-medium">{account.id}</TableCell>
                    <TableCell>{account.name}</TableCell>
                    <TableCell>{account.isAdmin ? "Yes" : "No"}</TableCell>
                    <TableCell>{account.createdAt ? new Date(account.createdAt).toLocaleString() : 'N/A'}</TableCell>
                    <TableCell className="text-right">
                      <Dialog open={editDialogOpen && editingAccount?.id === account.id} 
                        onOpenChange={(open: boolean | ((prevState: boolean) => boolean)) => {
                          setEditDialogOpen(open);
                          if (!open) setEditingAccount(null);
                        }}>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 px-2"
                            onClick={() => {
                              setEditingAccount(account);
                              setEditDialogOpen(true);
                            }}>
                            Edit
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Edit Account</DialogTitle>
                            <DialogDescription>
                              Update the account details.
                            </DialogDescription>
                          </DialogHeader>
                          
                          {editingAccount && (
                            <div className="grid gap-4 py-4">
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="edit-name" className="text-right">
                                  Username
                                </Label>
                                <Input
                                  id="edit-name"
                                  value={editingAccount.name}
                                  onChange={(e) => setEditingAccount({...editingAccount, name: e.target.value})}
                                  className="col-span-3"
                                />
                              </div>
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="edit-password" className="text-right">
                                  Password
                                </Label>
                                <Input
                                  id="edit-password"
                                  type="password"
                                  value={editingAccount.password}
                                  onChange={(e) => setEditingAccount({...editingAccount, password: e.target.value})}
                                  className="col-span-3"
                                  placeholder="Enter new password"
                                />
                              </div>
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="edit-isAdmin" className="text-right">
                                  Admin Access
                                </Label>
                                <div className="flex items-center space-x-2 col-span-3">
                                  <Checkbox 
                                    id="edit-isAdmin" 
                                    checked={editingAccount.isAdmin}
                                    onCheckedChange={(checked: boolean) => 
                                      setEditingAccount({...editingAccount, isAdmin: checked === true})
                                    }
                                  />
                                  <label
                                    htmlFor="edit-isAdmin"
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                  >
                                    Grant admin privileges
                                  </label>
                                </div>
                              </div>
                            </div>
                          )}
                          
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>Cancel</Button>
                            <Button onClick={handleEditAccount}>Update Account</Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                      
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 px-2 text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleDeleteAccount(account.id)}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="py-8 text-center text-gray-500">
              No accounts found. Add one to get started.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default AdminPanel;