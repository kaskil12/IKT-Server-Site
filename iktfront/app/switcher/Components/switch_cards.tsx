"use client"
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { use, useEffect, useState } from "react";
import { backendUrl } from "@/lib/backend";
import { AreaChart, Area, CartesianGrid, XAxis, Tooltip, Legend } from "recharts";
export interface Switcher {
    id: number;
    modell: string;
    ip: string;
    lokasjon: string;
    rack: string;
    trafikkMengde: string;
    online: boolean;
    oids: string[];
    port?: number;
    speedOid?: string;
    community?: string;
    monitor: boolean;
}
interface SwitchCardsProps {
    switches: Switcher[];
    trafficHistory?: Record<string, any[]>;
}

export default function SwitchCards({ switches = [], trafficHistory = {} }: SwitchCardsProps) {
    const deleteSwitcher = async (id: number) => {
        try {
            const url = await backendUrl(`/switcher/delete/${id}`);
            const res = await fetch(url, { method: "POST" });
        } catch (error) {
            console.error("Error deleting switcher:", error);
        }
    };

    const updateSwitcher = async (id: number, updates: any) => {
        try {
            const url = await backendUrl(`/switcher/update/${id}`);
            const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updates) });
            if (!res.ok) console.error('Failed to update switcher', await res.text());
        } catch (e) {
            console.error('Error updating switcher', e);
        }
    };

    return (
        <>
            {Array.isArray(switches) && switches.map((switcher) => {
                const [editing, setEditing] = useState(false);
                const [local, setLocal] = useState<any>({
                    modell: switcher.modell,
                    ip: switcher.ip,
                    lokasjon: switcher.lokasjon,
                    rack: switcher.rack,
                    oids: switcher.oids || [{ name: 'incoming', oid: '' }, { name: 'outgoing', oid: '' }],
                    port: switcher.port ?? 4,
                    speedOid: switcher.speedOid ?? '',
                    community: switcher.community ?? 'public',
                    monitor: switcher.monitor
                });
                const history = Array.isArray(trafficHistory?.[switcher.id]) ? trafficHistory[switcher.id] : [];
                const chartData = history.map(entry => {
                    const dateIso = (typeof entry.timestamp === 'number') ? new Date(entry.timestamp).toISOString() : String(entry.timestamp);
                    return {
                        date: dateIso,
                        incoming: typeof entry.incoming === 'number' ? entry.incoming : (entry.incoming ? Number(entry.incoming) : 0),
                        outgoing: typeof entry.outgoing === 'number' ? entry.outgoing : (entry.outgoing ? Number(entry.outgoing) : 0),
                        total: typeof entry.total === 'number' ? entry.total : (entry.total ? Number(entry.total) : 0)
                    };
                });
                return (
                    <Card key={switcher.id} className="bg-white/10 text-white w-screen h-auto m-4 p-6 rounded-2xl shadow-md">
                        <div className="flex justify-between">
                            <div>
                                <h2 className="text-2xl font-bold mb-4">Switch {switcher.id}</h2>
                                <div className="text-sm text-gray-300">{switcher.modell} — {switcher.ip}</div>
                            </div>
                            <div className="flex gap-2">
                                {editing ? (
                                    <button className="bg-green-600 text-white px-3 py-1 rounded-lg" onClick={async () => {
                                        await updateSwitcher(switcher.id, local);
                                        setEditing(false);
                                    }}>Save</button>
                                ) : (
                                    <button className="bg-blue-600 text-white px-3 py-1 rounded-lg" onClick={() => setEditing(true)}>Edit</button>
                                )}
                                <button className="bg-red-600 text-white px-3 py-1 rounded-lg float-right" onClick={async () => {
                                    await deleteSwitcher(switcher.id);
                                }}>Slett</button>
                            </div>
                        </div>
                        <div className="flex flex-row mb-4">
                            <div className="flex flex-col">
                                {editing ? (
                                    <>
                                        <label className="text-sm">Modell</label>
                                        <input className="p-1 rounded bg-gray-700 text-white" value={local.modell} onChange={(e) => setLocal({ ...local, modell: e.target.value })} />
                                        <label className="text-sm mt-2">IP</label>
                                        <input className="p-1 rounded bg-gray-700 text-white" value={local.ip} onChange={(e) => setLocal({ ...local, ip: e.target.value })} />
                                        <label className="text-sm mt-2">Lokasjon</label>
                                        <input className="p-1 rounded bg-gray-700 text-white" value={local.lokasjon} onChange={(e) => setLocal({ ...local, lokasjon: e.target.value })} />
                                        <label className="text-sm mt-2">Rack</label>
                                        <input className="p-1 rounded bg-gray-700 text-white" value={local.rack} onChange={(e) => setLocal({ ...local, rack: e.target.value })} />
                                        <label className="text-sm mt-2">Port index</label>
                                        <input type="number" className="p-1 rounded bg-gray-700 text-white w-28" value={local.port} onChange={(e) => setLocal({ ...local, port: Number(e.target.value) })} />
                                        <label className="text-sm mt-2">Speed OID (base)</label>
                                        <input className="p-1 rounded bg-gray-700 text-white" value={local.speedOid} onChange={(e) => setLocal({ ...local, speedOid: e.target.value })} />
                                    </>
                                ) : (
                                    <>
                                        <p><strong>Modell:</strong> {switcher.modell}</p>
                                        <p><strong>IP:</strong> {switcher.ip}</p>
                                        <p><strong>Lokasjon og Rack:</strong> {switcher.lokasjon} - {switcher.rack}</p>
                                        <p><strong>TrafikkMengde:</strong> {switcher.trafikkMengde}</p>
                                        <p><strong>Online:</strong> <span className={switcher.online ? "text-green-400" : "text-red-400"}>{switcher.online ? "Ja" : "Nei"}</span></p>
                                    </>
                                )}
                            </div>
                            <div className="flex-1">
                                <AreaChart width={350} height={180} data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id={`incoming${switcher.id}`} x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#34d399" stopOpacity={0.8}/>
                                            <stop offset="95%" stopColor="#34d399" stopOpacity={0.1}/>
                                        </linearGradient>
                                        <linearGradient id={`outgoing${switcher.id}`} x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.8}/>
                                            <stop offset="95%" stopColor="#60a5fa" stopOpacity={0.1}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" tick={{ fill: "#fff" }} tickLine={false} axisLine={false} minTickGap={24}
                                        tickFormatter={(value) => {
                                            try {
                                                const d = new Date(value);
                                                return d.toLocaleString();
                                            } catch { return String(value); }
                                        }}
                                    />
                                    <Tooltip />
                                    <Legend />
                                    <Area type="monotone" dataKey="total" stroke="#f59e0b" fillOpacity={0.2} name="Total" />
                                    <Area type="monotone" dataKey="incoming" stroke="#34d399" fill={`url(#incoming${switcher.id})`} name="Incoming" />
                                    <Area type="monotone" dataKey="outgoing" stroke="#60a5fa" fill={`url(#outgoing${switcher.id})`} name="Outgoing" />
                                </AreaChart>
                            </div>
                        </div>
                    </Card>
                );
            })}
        </>
    );
}