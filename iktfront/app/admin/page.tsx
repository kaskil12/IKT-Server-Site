
 "use client";
 import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { backendUrl } from "@/lib/backend";
 import { Button } from "@/components/ui/button";

 interface UserRow {
     id: number;
     username: string;
     isAdmin: boolean;
 }

 export default function AdminPage() {
     const { isAdmin, isLoading } = useAuth();
     const [users, setUsers] = useState<UserRow[]>([]);
     const [loading, setLoading] = useState(true);
     const [error, setError] = useState("");
     const [editId, setEditId] = useState<number | null>(null);
     const [form, setForm] = useState({ username: "", password: "", isAdmin: false });
     const [adding, setAdding] = useState(false);

     // Fetch users
     const fetchUsers = async () => {
         setLoading(true);
         setError("");
         try {
             const url = await backendUrl("/admin/users");
             const res = await fetch(url, { credentials: "include" });
             if (!res.ok) throw new Error("Failed to fetch users");
             const data = await res.json();
             setUsers(data);
         } catch (e: any) {
             setError(e.message || "Unknown error");
         } finally {
             setLoading(false);
         }
     };

     useEffect(() => {
         if (isAdmin) fetchUsers();
     }, [isAdmin]);

     // Add or update user
     const handleSubmit = async (e: React.FormEvent) => {
         e.preventDefault();
         setAdding(true);
         setError("");
         try {
             if (editId) {
                 // Edit user
                 const url = await backendUrl(`/admin/users/${editId}`);
                 const res = await fetch(url, {
                     method: "PUT",
                     headers: { "Content-Type": "application/json" },
                     credentials: "include",
                     body: JSON.stringify(form),
                 });
                 if (!res.ok) throw new Error("Failed to update user");
             } else {
                 // Add user
                 const url = await backendUrl("/admin/users");
                 const res = await fetch(url, {
                     method: "POST",
                     headers: { "Content-Type": "application/json" },
                     credentials: "include",
                     body: JSON.stringify(form),
                 });
                 if (!res.ok) {
                     const data = await res.json();
                     throw new Error(data.error || "Failed to add user");
                 }
             }
             setForm({ username: "", password: "", isAdmin: false });
             setEditId(null);
             fetchUsers();
         } catch (e: any) {
             setError(e.message || "Unknown error");
         } finally {
             setAdding(false);
         }
     };

     // Delete user
     const handleDelete = async (id: number) => {
         if (!window.confirm("Are you sure you want to delete this user?")) return;
         setError("");
         try {
             const url = await backendUrl(`/admin/users/${id}`);
             const res = await fetch(url, {
                 method: "DELETE",
                 credentials: "include",
             });
             if (!res.ok) throw new Error("Failed to delete user");
             fetchUsers();
         } catch (e: any) {
             setError(e.message || "Unknown error");
         }
     };

     // Start editing
     const startEdit = (user: UserRow) => {
         setEditId(user.id);
         setForm({ username: user.username, password: "", isAdmin: user.isAdmin });
     };

     if (isLoading) return <div className="text-white p-8">Laster...</div>;
     if (!isAdmin) return <div className="text-red-400 p-8">Ingen tilgang</div>;

     return (
         <div className="max-w-2xl mx-auto p-8">
             <h1 className="text-3xl font-bold text-white mb-6">Admin - Brukeradministrasjon</h1>
             {error && <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-200 text-sm">{error}</div>}

             <form onSubmit={handleSubmit} className="mb-8 space-y-4 bg-white/10 p-6 rounded-xl border border-white/20">
                 <div>
                     <label className="block text-white mb-1">Brukernavn</label>
                     <input
                         type="text"
                         value={form.username}
                         onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                         required
                         className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                         placeholder="Brukernavn..."
                     />
                 </div>
                 <div>
                     <label className="block text-white mb-1">Passord {editId && <span className="text-xs text-gray-300">(la stå tomt for å ikke endre)</span>}</label>
                     <input
                         type="password"
                         value={form.password}
                         onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                         className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                         placeholder="Passord..."
                         autoComplete="new-password"
                     />
                 </div>
                 <div className="flex items-center gap-2">
                     <input
                         type="checkbox"
                         checked={form.isAdmin}
                         onChange={e => setForm(f => ({ ...f, isAdmin: e.target.checked }))}
                         id="isAdmin"
                     />
                     <label htmlFor="isAdmin" className="text-white">Administrator</label>
                 </div>
                 <Button type="submit" disabled={adding}>
                     {editId ? "Oppdater bruker" : "Legg til bruker"}
                 </Button>
                 {editId && (
                     <Button type="button" variant="outline" onClick={() => { setEditId(null); setForm({ username: "", password: "", isAdmin: false }); }}>
                         Avbryt
                     </Button>
                 )}
             </form>

             <h2 className="text-xl text-white mb-2">Alle brukere</h2>
             {loading ? (
                 <div className="text-white">Laster brukere...</div>
             ) : (
                 <table className="w-full text-white bg-white/10 rounded-xl overflow-hidden">
                     <thead>
                         <tr>
                             <th className="p-2 text-left">Brukernavn</th>
                             <th className="p-2 text-left">Admin</th>
                             <th className="p-2 text-left">Handlinger</th>
                         </tr>
                     </thead>
                     <tbody>
                         {users.map(user => (
                             <tr key={user.id} className="border-b border-white/20">
                                 <td className="p-2">{user.username}</td>
                                 <td className="p-2">{user.isAdmin ? "Ja" : "Nei"}</td>
                                 <td className="p-2 flex gap-2">
                                     <Button size="sm" className="text-black" variant="outline" onClick={() => startEdit(user)}>Rediger</Button>
                                     <Button size="sm" variant="destructive" onClick={() => handleDelete(user.id)}>Slett</Button>
                                 </td>
                             </tr>
                         ))}
                     </tbody>
                 </table>
             )}
         </div>
     );
 }