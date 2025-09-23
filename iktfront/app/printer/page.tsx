"use client";
import { useEffect, useState } from "react";

const fetchSettingsStrings = async () => {
    try {
        const response = await fetch("http://10.230.64.30:3000/settings");
        if (!response.ok) throw new Error("Failed to fetch settings");
        return await response.json();
    } catch (e) {
        return [];
    }
};
import io from "socket.io-client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { IoIosPin } from "react-icons/io";
import { GoRss } from "react-icons/go";
import { RiQrScanFill } from "react-icons/ri";
import { PiGlobeSimpleBold } from "react-icons/pi";
import { PiGlobeSimpleXBold } from "react-icons/pi";
import { FaEdit } from "react-icons/fa";
import { MdDeleteForever } from "react-icons/md";
import ProtectedRoute from "@/components/ProtectedRoute";
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
    const [openSettings, setOpenSettings] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [editId, setEditId] = useState<number | null>(null);
    const [form, setForm] = useState({
        model: "",
        serienumber: "",
        location: "",
        ip: "",
        error: "",
        online: false,
        oids: [
            { name: "black", oid: "" },
            { name: "cyan", oid: "" },
            { name: "magenta", oid: "" },
            { name: "yellow", oid: "" },
            { name: "feilkode", oid: "" },
        ],
    });
    const [settingsStrings, setSettingsStrings] = useState<string[]>([]);
    const [newSetting, setNewSetting] = useState("");
    const [addingSetting, setAddingSetting] = useState(false);
    const handleAddSettingString = async () => {
        if (!newSetting.trim()) return;
        setAddingSetting(true);
        try {
            const res = await fetch("http://10.230.64.30:3000/settings/add", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ value: newSetting.trim() })
            });
            if (res.ok) {
                setNewSetting("");
                fetchSettingsStrings().then(setSettingsStrings);
            }
        } catch (e) {}
        setAddingSetting(false);
    };
    const handleDeleteSettingString = async (str: string) => {
        try {
            const res = await fetch("http://10.230.64.30:3000/settings/delete", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ value: str })
            });
            if (res.ok) {
                fetchSettingsStrings().then(setSettingsStrings);
            }
        } catch (e) {}
    };

    const fetchPrinters = async () => {
        try {
            const response = await fetch("http://10.230.64.30:3000/getAll");
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
        fetchSettingsStrings().then(setSettingsStrings);

        const interval = setInterval(fetchPrinters, 5 * 60 * 1000);

        const socket = io("http://10.230.64.30:3000");
        socket.on("printersUpdated", (data: Printer[]) => {
            setPrinters(data);
            setLoading(false);
        });

        return () => {
            clearInterval(interval);
            socket.disconnect();
        };
    }, []);

    const handleAddPrinter = async () => {
        const requiredOids = ["black", "cyan", "magenta", "yellow", "feilkode"];
        const oidsValid = form.oids.length >= 5 && requiredOids.every((name, idx) => form.oids[idx].name === name && form.oids[idx].oid.trim());
        if (
            !form.model.trim() ||
            !form.serienumber.trim() ||
            !form.location.trim() ||
            !form.ip.trim() ||
            !oidsValid
        ) {
            alert("Alle felter og de 5 første OID-ene (black, cyan, magenta, yellow, feilkode) må fylles ut.");
            return;
        }
        try {
            await fetch("http://10.230.64.30:3000/add", {
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
                oids: [
                    { name: "black", oid: "" },
                    { name: "cyan", oid: "" },
                    { name: "magenta", oid: "" },
                    { name: "yellow", oid: "" },
                    { name: "feilkode", oid: "" },
                ],
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
            await fetch("http://10.230.64.30:3000/update", {
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
            await fetch("http://10.230.64.30:3000/delete", {
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
        const requiredOids = ["black", "cyan", "magenta", "yellow", "feilkode"];
        let oids = requiredOids.map(name => {
            const found = printer.oids.find(oid => oid.name === name);
            return found ? { name, oid: found.oid } : { name, oid: "" };
        });
        if (printer.oids && printer.oids.length > 5) {
            oids = oids.concat(printer.oids.slice(5));
        }
        setForm({
            model: printer.modell,
            serienumber: printer.serienummer,
            location: printer.plassering,
            ip: printer.PrinterIP,
            error: printer.feilkode,
            online: printer.online,
            oids,
        });
        setEditMode(true);
        setEditId(printer.id);
        setOpen(true);
    };

    return (
        <ProtectedRoute>
        <div className="flex flex-col min-h-screen p-6 text-white">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Printer Oversikt</h1>
                <div className="flex gap-2">
                    <Button className="bg-green-700" onClick={() => setOpenSettings(true)}>Innstillinger</Button>
                    <Button className="bg-green-700" onClick={() => setOpen(true)}>Legg til Printer</Button>
                </div>
            </div>
        

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <p className="text-xl">Loading printers...</p>
                </div>
            ) : (
                <div
                    className="grid gap-4"
                    style={{
                        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                        width: '100%',
                        overflowX: 'auto',
                    }}
                >
                    {printers.map((printer) => (
                        <Card
                            key={printer.id}
                            className="p-3 bg-white/10 backdrop-blur-md border-none relative flex flex-col justify-between"
                            style={{
                                minWidth: 0,
                                maxWidth: '100%',
                                minHeight: '120px',
                                wordBreak: 'break-word',
                                overflow: 'hidden',
                            }}
                        >
                            <div className="absolute top-2 right-2 flex flex-col gap-1 z-10">
                                <Button
                                    size="sm"
                                    className="bg-transparent hover:bg-gray-100 hover:text-black px-2 py-1 text-xs"
                                    onClick={() => openEditModal(printer)}
                                >
                                    <FaEdit className="mb-0"/>
                                </Button>
                                <Button
                                    size="sm"
                                    className="bg-transparent text-red-600 hover:bg-red-50 hover:text-red-700 px-2 py-1 text-xs"
                                    onClick={() => handleDeletePrinter(printer.id)}
                                >
                                    <MdDeleteForever className="mb-0"/>
                                </Button>
                            </div>
                            <div className="mb-2">
                                <p
                                    className="text-white text-2xl flex flex-row items-center break-all whitespace-pre-line"
                                    style={{ wordBreak: 'break-all', maxWidth: '100%', minHeight: '32px', overflowWrap: 'break-word' }}
                                >
                                    <IoIosPin style={{ marginBottom: '-2px' }} /> {printer.plassering}
                                </p>
                                <p className="text-white text-md flex flex-row items-center">
                                    <GoRss  style={{ marginBottom: '2px' }}/> {printer.PrinterIP}
                                </p>
                                <p className="text-white text-md flex flex-row items-center "> <RiQrScanFill className="mb-0"/> {printer.serienummer}</p>
                                <p className="text-white text-md flex flex-row items-center">{printer.online  ? <PiGlobeSimpleBold className="mb-0 size-5"/> : <PiGlobeSimpleXBold className="mb-0"/>}
                                    <span className={`ml-1 px-2 py-0.5 rounded text-md ${printer.online ? 'bg-green-600' : 'bg-red-600'}`}>
                                        {printer.online ? 'Online' : 'Offline'}
                                    </span>
                                </p>
                                    {printer.feilkode && (
                                        <p className="text-white text-xs mt-1">
                                            <strong>Error:</strong> {printer.feilkode}
                                            {Array.isArray(settingsStrings) && settingsStrings.length > 0 && settingsStrings.some(str => str && printer.feilkode && printer.feilkode.includes(str)) ? (
                                                <span className="ml-2 text-yellow-400 text-lg font-bold">✅</span>
                                            ) : (
                                                <span className="ml-2 text-red-500 text-lg font-bold">‼️</span>
                                            )}
                                        </p>
                                    )}
                            </div>
                            {printer.oids && printer.oids.length > 0 && (
                                <div>
                                    <h4 className="text-xs font-semibold text-white mb-1">SNMP</h4>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="text-white text-xs font-bold">Name</TableHead>
                                                <TableHead className="text-white text-xs font-bold">Value</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {printer.oids.map((oid, idx) => {
                                                let value = oid.value;
                                                if (value && typeof value === 'object') {
                                                    if (Array.isArray(value.data)) {
                                                        try {
                                                            value = Buffer.from(value.data).toString();
                                                        } catch {
                                                            value = '[unreadable octet string]';
                                                        }
                                                    } else if (value.type === 'Buffer' && Array.isArray(value.data)) {
                                                        try {
                                                            value = Buffer.from(value.data).toString();
                                                        } catch {
                                                            value = '[unreadable octet string]';
                                                        }
                                                    } else {
                                                        value = String(value);
                                                    }
                                                }
                                                const colorEmojis: Record<string, string> = {
                                                    yellow: '🟡',
                                                    magenta: '🟣',
                                                    cyan: '🔵',
                                                    black: '⚫',
                                                };
                                                let displayName = oid.name ?? '';
                                                let isFeilkode = displayName.toLowerCase() === 'feilkode';
                                                if (!isFeilkode && colorEmojis[displayName.toLowerCase()]) {
                                                    displayName = colorEmojis[displayName.toLowerCase()];
                                                }
                                                let valueDisplay = value;
                                                   let isWhitelisted = false;
                                                   if (isFeilkode && value) {
                                                       isWhitelisted = Array.isArray(settingsStrings) && settingsStrings.length > 0 && settingsStrings.some(str => str && value.includes(str));
                                                       valueDisplay = (
                                                           <span className={isWhitelisted ? 'text-yellow-400' : 'text-red-500'}>
                                                               {value}
                                                           </span>
                                                       );
                                                   }
                                                   if (isFeilkode) {
                                                       displayName = isWhitelisted ? '✅' : '‼️';
                                                   }
                                                return (
                                                    <TableRow key={idx}>
                                                        <TableCell className="text-white text-xs font-bold">{displayName}</TableCell>
                                                        <TableCell className="text-white text-xs font-bold">{isFeilkode ? valueDisplay : (value !== undefined && value !== null ? value : 'No data')}</TableCell>
                                                    </TableRow>
                                                );
                                            })}
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
                                    oids: [
                                        { name: "black", oid: "" },
                                        { name: "cyan", oid: "" },
                                        { name: "magenta", oid: "" },
                                        { name: "yellow", oid: "" },
                                        { name: "feilkode", oid: "" },
                                    ],
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
                            <div className="font-semibold mb-2 text-gray-700">SNMP OIDs (de 5 første er obligatoriske)</div>
                            <div className="space-y-2">
                                {form.oids.slice(0, 5).map((oid, idx) => (
                                    <div key={oid.name} className="flex gap-2 mb-2 items-center">
                                        <span className="w-28 font-medium capitalize text-gray-700">{oid.name}</span>
                                        <input
                                            className="flex-1 border border-gray-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-teal-500 text-black"
                                            placeholder={`OID for ${oid.name}`}
                                            value={oid.oid}
                                            onChange={e => {
                                                const newOids = [...form.oids];
                                                newOids[idx].oid = e.target.value;
                                                setForm(f => ({ ...f, oids: newOids }));
                                            }}
                                        />
                                    </div>
                                ))}
                                {form.oids.slice(5).map((oid, idx) => (
                                    <div key={5 + idx} className="flex gap-2 mb-2 items-center">
                                        <input
                                            className="w-28 border border-gray-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-teal-500 text-black"
                                            placeholder="Navn"
                                            value={oid.name}
                                            onChange={e => {
                                                const newOids = [...form.oids];
                                                newOids[5 + idx].name = e.target.value;
                                                setForm(f => ({ ...f, oids: newOids }));
                                            }}
                                        />
                                        <input
                                            className="flex-1 border border-gray-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-teal-500 text-black"
                                            placeholder="OID"
                                            value={oid.oid}
                                            onChange={e => {
                                                const newOids = [...form.oids];
                                                newOids[5 + idx].oid = e.target.value;
                                                setForm(f => ({ ...f, oids: newOids }));
                                            }}
                                        />
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => {
                                                setForm(f => ({ ...f, oids: f.oids.filter((_, i) => i !== 5 + idx) }));
                                            }}
                                        >
                                            Fjern
                                        </Button>
                                    </div>
                                ))}
                                <Button
                                    size="sm"
                                    className="mt-2"
                                    onClick={() => setForm(f => ({ ...f, oids: [...f.oids, { name: "", oid: "" }] }))}
                                >
                                    Legg til OID
                                </Button>
                            </div>
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
                            <div className="flex justify-end gap-2 mt-6">
                                <Button variant="outline" className="text-black" onClick={() => {
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
                                        oids: [
                                            { name: "black", oid: "" },
                                            { name: "cyan", oid: "" },
                                            { name: "magenta", oid: "" },
                                            { name: "yellow", oid: "" },
                                            { name: "feilkode", oid: "" },
                                        ],
                                    });
                                }}>Cancel</Button>
                                <Button onClick={editMode ? handleEditPrinter : handleAddPrinter}>{editMode ? "Save Changes" : "Save Printer"}</Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
                {openSettings && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                        <div className="bg-white rounded-xl shadow-2xl w-[400px] p-8 border border-gray-200 relative max-h-[90vh] overflow-y-auto">
                            <button
                                className="absolute top-3 left-3 text-gray-400 hover:text-gray-700 text-xl font-bold"
                                onClick={() => setOpenSettings(false)}
                                aria-label="Close"
                            >
                                &times;
                            </button>
                            <h3 className="text-2xl font-bold mb-6 text-center text-gray-800">Whitelist feilkoder</h3>
                            <div className="space-y-4">
                                <ul className="mb-4 max-h-40 overflow-y-auto">
                                    {settingsStrings.map((str, idx) => (
                                        <li key={idx} className="flex justify-between items-center">
                                            <span className="text-black border-b py-1">{str}</span>
                                            <button className="text-red-600 border rounded-md bg-red-100 hover:bg-red-200" onClick={() => handleDeleteSettingString(str)}>Delete</button>
                                        </li>
                                    ))}
                                    
                                </ul>
                                <div className="flex gap-2 mb-2">
                                    <input
                                        type="text"
                                        className="border rounded px-2 py-1 flex-1 text-black"
                                        placeholder="Legg til ny feilkode..."
                                        value={typeof newSetting !== 'undefined' ? newSetting : ''}
                                        onChange={e => setNewSetting(e.target.value)}
                                        onKeyDown={e => { if (e.key === 'Enter') handleAddSettingString(); }}
                                        disabled={addingSetting}
                                    />
                                    <button
                                        className="bg-green-600 text-white px-3 py-1 rounded"
                                        onClick={handleAddSettingString}
                                        disabled={addingSetting || !newSetting?.trim()}
                                    >Legg til</button>
                                </div>
                                <button className="mt-2 text-sm text-gray-600 underline" onClick={() => setOpenSettings(false)}>Lukk</button>
                            </div>
                        </div>
                    </div>
                )}
                </div>
                </ProtectedRoute>
        );
    }

