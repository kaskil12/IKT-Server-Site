"use client";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface OID {
    name: string;
    oid: string;
    value: any;
}

interface Printer {
    id: number;
    modell: string;
    serienummer: string;
    PrinterIP: string;
    plassering: string;
    oids: OID[];
    feilkode: string;
    online: boolean;
}

export default function Printer() {
    const [printers, setPrinters] = useState<Printer[]>([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [editId, setEditId] = useState<number | null>(null);
    const [form, setForm] = useState({
        model: "",
        serienumber: "",
        location: "",
        ip: "",
        error: "",
        online: false,
        oids: [{ name: "", oid: "" }],
    });

    const fetchPrinters = async () => {
        try {
            const response = await fetch("http://localhost:64/getAll");
            const data = await response.json();
            setPrinters(data);
            setLoading(false);
        } catch (error) {
            console.error("Failed to fetch printers:", error);
            setPrinters([]);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPrinters();
        
        // Set up auto-refresh every 5 minutes
        const interval = setInterval(fetchPrinters, 5 * 60 * 1000);
        
        return () => clearInterval(interval);
    }, []);

    const handleAddPrinter = async () => {
        try {
            await fetch("http://localhost:64/add", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    modell: form.model,
                    serienummer: form.serienumber,
                    PrinterIP: form.ip,
                    plassering: form.location,
                    oids: form.oids,
                    feilkode: form.error,
                    online: form.online
                }),
            });
            setOpen(false);
            setForm({
                model: "",
                serienumber: "",
                location: "",
                ip: "",
                error: "",
                online: false,
                oids: [{ name: "", oid: "" }],
            });
            setEditMode(false);
            setEditId(null);
            fetchPrinters();
        } catch (error) {
            console.error("Failed to add printer:", error);
        }
    };

    const handleEditPrinter = async () => {
        if (editId === null) return;
        try {
            await fetch("http://localhost:64/update", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    id: editId,
                    modell: form.model,
                    serienummer: form.serienumber,
                    PrinterIP: form.ip,
                    plassering: form.location,
                    oids: form.oids,
                    feilkode: form.error,
                    online: form.online
                }),
            });
            setOpen(false);
            setForm({
                model: "",
                serienumber: "",
                location: "",
                ip: "",
                error: "",
                online: false,
                oids: [{ name: "", oid: "" }],
            });
            setEditMode(false);
            setEditId(null);
            fetchPrinters();
        } catch (error) {
            console.error("Failed to edit printer:", error);
        }
    };

    const handleDeletePrinter = async (id: number) => {
        try {
            await fetch("http://localhost:64/delete", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ id }),
            });
            fetchPrinters();
        } catch (error) {
            console.error("Failed to delete printer:", error);
        }
    };

    const openEditModal = (printer: Printer) => {
        setForm({
            model: printer.modell,
            serienumber: printer.serienummer,
            location: printer.plassering,
            ip: printer.PrinterIP,
            error: printer.feilkode,
            online: printer.online,
            oids: printer.oids && printer.oids.length > 0 ? printer.oids.map(oid => ({ name: oid.name, oid: oid.oid })) : [{ name: "", oid: "" }],
        });
        setEditMode(true);
        setEditId(printer.id);
        setOpen(true);
    };

    return (
        <div className="flex flex-col min-h-screen p-6 text-white">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Printer Management</h1>
                <Button onClick={() => setOpen(true)}>Add Printer</Button>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <p className="text-xl">Loading printers...</p>
                </div>
            ) : (
                <div className="grid gap-6">
                    {printers.map((printer) => (
                        <Card key={printer.id} className="p-6 bg-white/10 backdrop-blur-md border-none">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <h3 className="text-xl font-bold text-white mb-2">{printer.modell}</h3>
                                    <p className="text-white"><strong>Serial Number:</strong> {printer.serienummer}</p>
                                    <p className="text-white"><strong>IP Address:</strong> {printer.PrinterIP}</p>
                                    <p className="text-white"><strong>Location:</strong> {printer.plassering}</p>
                                </div>
                                <div>
                                    <p className="text-white"><strong>Status:</strong> 
                                        <span className={`ml-2 px-2 py-1 rounded ${printer.online ? 'bg-green-600' : 'bg-red-600'}`}>
                                            {printer.online ? 'Online' : 'Offline'}
                                        </span>
                                    </p>
                                    {printer.feilkode && (
                                        <p className="text-white"><strong>Error:</strong> {printer.feilkode}</p>
                                    )}
                                </div>
                            </div>
                            <div className="flex gap-2 mb-4">
                                <Button size="sm" onClick={() => openEditModal(printer)} className="bg-blue-600 hover:bg-blue-700">Edit</Button>
                                <Button size="sm" variant="destructive" onClick={() => handleDeletePrinter(printer.id)}>Delete</Button>
                            </div>
                            {printer.oids && printer.oids.length > 0 && (
                                <div>
                                    <h4 className="text-lg font-semibold text-white mb-2">SNMP OIDs</h4>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="text-white">Name</TableHead>
                                                <TableHead className="text-white">OID</TableHead>
                                                <TableHead className="text-white">Value</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {printer.oids.map((oid, idx) => (
                                                <TableRow key={idx}>
                                                    <TableCell className="text-white">{oid.name}</TableCell>
                                                    <TableCell className="text-white">{oid.oid}</TableCell>
                                                    <TableCell className="text-white">
                                                        {oid.value !== null ? oid.value.toString() : 'No data'}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}
                        </Card>
                    ))}
                </div>
            )}

            {open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                    <div className="bg-white rounded-xl shadow-2xl w-[500px] p-8 border border-gray-200 relative max-h-[90vh] overflow-y-auto">
                        <button
                            className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-xl font-bold"
                            onClick={() => {
                                setOpen(false);
                                setEditMode(false);
                                setEditId(null);
                                setForm({
                                    model: "",
                                    serienumber: "",
                                    location: "",
                                    ip: "",
                                    error: "",
                                    online: false,
                                    oids: [{ name: "", oid: "" }],
                                });
                            }}
                            aria-label="Close"
                        >×</button>
                        <h3 className="text-2xl font-bold mb-6 text-center text-gray-800">{editMode ? "Edit Printer" : "Add New Printer"}</h3>
                        <div className="space-y-4">
                            <input 
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 text-black" 
                                placeholder="Model" 
                                value={form.model} 
                                onChange={(e) => setForm(f => ({ ...f, model: e.target.value }))} 
                            />
                            <input 
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 text-black" 
                                placeholder="Serial Number" 
                                value={form.serienumber} 
                                onChange={(e) => setForm(f => ({ ...f, serienumber: e.target.value }))} 
                            />
                            <input 
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 text-black" 
                                placeholder="Location" 
                                value={form.location} 
                                onChange={(e) => setForm(f => ({ ...f, location: e.target.value }))} 
                            />
                            <input 
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 text-black" 
                                placeholder="IP Address" 
                                value={form.ip} 
                                onChange={(e) => setForm(f => ({ ...f, ip: e.target.value }))} 
                            />
                            <input 
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 text-black" 
                                placeholder="Error Code (optional)" 
                                value={form.error} 
                                onChange={(e) => setForm(f => ({ ...f, error: e.target.value }))} 
                            />
                            <div className="flex items-center space-x-2">
                                <input 
                                    type="checkbox" 
                                    id="online" 
                                    checked={form.online} 
                                    onChange={(e) => setForm(f => ({ ...f, online: e.target.checked }))}
                                    className="rounded"
                                />
                                <label htmlFor="online" className="text-gray-700">Is Online</label>
                            </div>
                            <div>
                                <div className="font-semibold mb-2 text-gray-700">SNMP OIDs</div>
                                {form.oids.map((oid, idx) => (
                                    <div key={idx} className="flex gap-2 mb-2">
                                        <input 
                                            className="flex-1 border border-gray-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-teal-500 text-black" 
                                            placeholder="OID Name" 
                                            value={oid.name} 
                                            onChange={(e) => {
                                                const oids = [...form.oids];
                                                oids[idx].name = e.target.value;
                                                setForm(f => ({ ...f, oids }));
                                            }} 
                                        />
                                        <input 
                                            className="flex-1 border border-gray-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-teal-500 text-black" 
                                            placeholder="OID Number" 
                                            value={oid.oid} 
                                            onChange={(e) => {
                                                const oids = [...form.oids];
                                                oids[idx].oid = e.target.value;
                                                setForm(f => ({ ...f, oids }));
                                            }} 
                                        />
                                        {form.oids.length > 1 && (
                                            <Button 
                                                variant="destructive" 
                                                size="sm" 
                                                onClick={() => {
                                                    setForm(f => ({ ...f, oids: f.oids.filter((_, i) => i !== idx) }));
                                                }}
                                            >
                                                Remove
                                            </Button>
                                        )}
                                    </div>
                                ))}
                                <Button 
                                    size="sm" 
                                    onClick={() => setForm(f => ({ ...f, oids: [...f.oids, { name: "", oid: "" }] }))}
                                    className="mt-2"
                                >
                                    Add OID
                                </Button>
                            </div>
                            <div className="flex justify-end gap-2 mt-6">
                                <Button variant="outline" onClick={() => {
                                    setOpen(false);
                                    setEditMode(false);
                                    setEditId(null);
                                    setForm({
                                        model: "",
                                        serienumber: "",
                                        location: "",
                                        ip: "",
                                        error: "",
                                        online: false,
                                        oids: [{ name: "", oid: "" }],
                                    });
                                }}>Cancel</Button>
                                <Button onClick={editMode ? handleEditPrinter : handleAddPrinter}>{editMode ? "Save Changes" : "Save Printer"}</Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
