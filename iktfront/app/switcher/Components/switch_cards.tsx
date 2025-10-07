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

    return (
        <>
            {Array.isArray(switches) && switches.map((switcher) => {
                const history = trafficHistory[switcher.id] || [];
                const chartData = history.map(entry => {
                    const date = new Date(entry.timestamp).toISOString().slice(0, 10);
                    return {
                        date,
                        incoming: entry.incoming ?? 0,
                        outgoing: entry.outgoing ?? 0,
                        total: entry.total ?? 0
                    };
                });
                return (
                    <Card key={switcher.id} className="bg-white/10 text-white w-screen h-auto m-4 p-6 rounded-2xl shadow-md">
                        <div className="flex justify-between">
                            <h2 className="text-2xl font-bold mb-4">Switch {switcher.id}</h2>
                            <button className="bg-red-600 text-white px-3 py-1 rounded-lg float-right" onClick={async () => {
                                await deleteSwitcher(switcher.id);
                            }}>Slett</button>
                        </div>
                        <div className="flex flex-row mb-4">
                            <div className="flex flex-col">
                                <p><strong>Modell:</strong> {switcher.modell}</p>
                                <p><strong>IP:</strong> {switcher.ip}</p>
                                <p><strong>Lokasjon og Rack:</strong> {switcher.lokasjon} - {switcher.rack}</p>
                                <p><strong>TrafikkMengde:</strong> {switcher.trafikkMengde}</p>
                                <p><strong>Online:</strong> <span className={switcher.online ? "text-green-400" : "text-red-400"}>{switcher.online ? "Ja" : "Nei"}</span></p>
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
                                    <XAxis dataKey="date" tick={{ fill: "#fff" }} tickLine={false} axisLine={false} minTickGap={24} />
                                    <Tooltip />
                                    <Legend />
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