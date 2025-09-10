"use client";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sheet } from "@/components/ui/sheet";


export default function Printer() {
    const [snmpData, setSnmpData] = useState<any>(null);
    const [open, setOpen] = useState(false);
    const [form, setForm] = useState({
        model: "",
        serienumber: "",
        location: "",
        ip: "",
        oids: [{ name: "", number: "" }],
    });

    useEffect(() => {
        fetch("http://localhost:64/getAll")
            .then((res) => res.json())
            .then((data) => setSnmpData(data))
            .catch(() => setSnmpData(null));
    }, []);

    const handleAddPrinter = async () => {
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
                oids: form.oids.map(o => o.number),
                feilkode: "",
                online: false
            }),
        });
        setOpen(false);
        setForm({
            model: "",
            serienumber: "",
            location: "",
            ip: "",
            oids: [{ name: "", number: "" }],
        });
        fetch("http://localhost:64/getAll")
            .then((res) => res.json())
            .then((data) => setSnmpData(data))
            .catch(() => setSnmpData(null));
    };

    return (
        <div className="flex flex-col items-center min-h-screen relative">
            <div className="absolute top-8 right-8 z-10">
                <Button onClick={() => setOpen(true)}>Add</Button>
            </div>
            <Card className="w-full max-w-md p-6 mt-16">
                <h2 className="text-xl font-bold mb-4">Printer SNMP Data</h2>
                {snmpData ? (
                    <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto">
                        {JSON.stringify(snmpData, null, 2)}
                    </pre>
                ) : (
                    <p>Loading SNMP data...</p>
                )}
            </Card>
            {open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 transition-opacity animate-fadein">
                    <div className="bg-white rounded-xl shadow-2xl w-[400px] p-8 border border-gray-200 relative animate-popin">
                        <button
                            className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-xl font-bold"
                            onClick={() => setOpen(false)}
                            aria-label="Close"
                        >×</button>
                        <h3 className="text-2xl font-bold mb-6 text-center text-gray-800">Add Printer</h3>
                        <div className="space-y-4">
                            <input className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500" placeholder="Model" value={form.model} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, model: e.target.value }))} />
                            <input className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500" placeholder="Serienumber" value={form.serienumber} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, serienumber: e.target.value }))} />
                            <input className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500" placeholder="Location" value={form.location} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, location: e.target.value }))} />
                            <input className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500" placeholder="IP" value={form.ip} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, ip: e.target.value }))} />
                            <div>
                                <div className="font-semibold mb-2 text-gray-700">OID List</div>
                                {form.oids.map((oid, idx) => (
                                    <div key={idx} className="flex gap-2 mb-2">
                                        <input className="border border-gray-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-teal-500" placeholder="OID Name" value={oid.name} onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                            const oids = [...form.oids];
                                            oids[idx].name = e.target.value;
                                            setForm(f => ({ ...f, oids }));
                                        }} />
                                        <input className="border border-gray-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-teal-500" placeholder="OID Number" value={oid.number} onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                            const oids = [...form.oids];
                                            oids[idx].number = e.target.value;
                                            setForm(f => ({ ...f, oids }));
                                        }} />
                                        {form.oids.length > 1 && (
                                            <Button variant="destructive" size="sm" onClick={() => {
                                                setForm(f => ({ ...f, oids: f.oids.filter((_, i) => i !== idx) }));
                                            }}>Remove</Button>
                                        )}
                                    </div>
                                ))}
                                <Button size="sm" onClick={() => setForm(f => ({ ...f, oids: [...f.oids, { name: "", number: "" }] }))}>Add OID</Button>
                            </div>
                            <div className="flex justify-end gap-2 mt-6">
                                <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                                <Button onClick={handleAddPrinter}>Save</Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
