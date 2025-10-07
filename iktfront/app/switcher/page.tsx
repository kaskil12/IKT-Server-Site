"use client"
import { useEffect, useCallback } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import SwitchCards from "@/app/switcher/Components/switch_cards";
import type { Switcher } from "@/app/switcher/Components/switch_cards";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChartAreaInteractive, Switcher as ChartSwitcher } from "@/app/switcher/Components/chart-area-interactive";
import { useState } from "react";
import { backendUrl } from "@/lib/backend";
import fetchSwitches from "@/app/switcher/Components/switch_cards";
import * as RadixCheckbox from "@radix-ui/react-checkbox";
import type { Socket } from "socket.io-client";
export default function Switcher(){
    const [openAdd, SetOpenAdd] = useState(false);
    const [form, setForm] = useState({
        modell: "",
        ip: "",
        lokasjon: "",
        rack: "",
        trafikkMengde: 0,
        online: true,
        oids: [
            { name: "incoming", oid: "" },
            { name: "outgoing", oid: "" }
        ],
        community: "",
        monitor: false,
    });
    const [switches, setSwitches] = useState<ChartSwitcher[]>([]);
    const [trafficHistory, setTrafficHistory] = useState<Record<string, any[]>>({});
    const handleAddSwitcher = async () => {
        const url = await backendUrl("/switcher/add");
        const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                modell: form.modell,
                ip: form.ip,
                lokasjon: form.lokasjon,
                rack: form.rack,
                trafikkMengde: form.trafikkMengde,
                online: form.online,
                oids: form.oids,
                community: form.community,
                monitor: form.monitor,
            })
        });
        if (!res.ok) {
            console.error("Failed to add switcher");
            return;
        }
        SetOpenAdd(false);
        window.location.reload();
    }
    const fetchInitialSwitchers = useCallback(async () => {
        const url = await backendUrl("/switcher/all");
        const res = await fetch(url);
        if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data)) {
                const normalizedSwitches = data.map((sw: any) => ({
                    ...sw,
                    trafikkMengde: typeof sw.trafikkMengde === "string" ? Number(sw.trafikkMengde) : sw.trafikkMengde
                }));
                setSwitches(normalizedSwitches);
            } else if (Array.isArray(data.switchers)) {
                const normalizedSwitches = data.switchers.map((sw: any) => ({
                    ...sw,
                    trafikkMengde: typeof sw.trafikkMengde === "string" ? Number(sw.trafikkMengde) : sw.trafikkMengde
                }));
                setSwitches(normalizedSwitches);
                if (data.trafficHistory) setTrafficHistory(data.trafficHistory);
            }
        }
    }, []);

    useEffect(() => {
        let socketInstance: ReturnType<typeof io> | null = null;
        fetchInitialSwitchers(); 
        async function connectSocket() {
            const ioClient = (await import("socket.io-client")).default;
            const { getBackendIp } = await import("@/lib/backend");
            const ip = await getBackendIp();
            socketInstance = ioClient(`http://${ip}`, { transports: ["websocket", "polling"] });
            socketInstance.on("switchersTrafficUpdate", (data: { switchers: any[]; trafficHistory: Record<string, any[]> }) => {
                if (Array.isArray(data.switchers)) {
                    const normalizedSwitches = data.switchers.map((sw: any) => ({
                        ...sw,
                        trafikkMengde: typeof sw.trafikkMengde === "string" ? Number(sw.trafikkMengde) : sw.trafikkMengde
                    }));
                    setSwitches(normalizedSwitches);
                }
                if (data.trafficHistory && typeof data.trafficHistory === "object") {
                    setTrafficHistory(data.trafficHistory);
                }
            });
        }
        connectSocket();
        return () => {
            if (socketInstance) socketInstance.disconnect();
        };
    }, [fetchInitialSwitchers]);
    
    return(
        <ProtectedRoute>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-white flex justify-center">Switcher Oversikt</h1>
                <div className="flex gap-2">
                    <Button className="bg-green-700" >Innstillinger</Button>
                    <Button className="bg-green-700" onClick={() => SetOpenAdd(true)} >Legg til Switcher</Button>
                    <Button className="bg-blue-700" onClick={fetchInitialSwitchers}>Refresh</Button>
                </div>
            </div>
            { openAdd &&
                <Card className="p-4 mb-6 bg-gray-800">
                    <div className="flex flex-col md:flex-row gap-4">
                        <input type="text" placeholder="Modell" value={form.modell} onChange={(e) => setForm({ ...form, modell: e.target.value })} className="p-2 rounded bg-gray-700 text-white flex-1" />
                        <input type="text" placeholder="IP Adresse" value={form.ip} onChange={(e) => setForm({ ...form, ip: e.target.value })} className="p-2 rounded bg-gray-700 text-white flex-1" />
                        <input type="text" placeholder="Lokasjon" value={form.lokasjon} onChange={(e) => setForm({ ...form, lokasjon: e.target.value })} className="p-2 rounded bg-gray-700 text-white flex-1" />
                        <input type="text" placeholder="Rack" value={form.rack} onChange={(e) => setForm({ ...form, rack: e.target.value })} className="p-2 rounded bg-gray-700 text-white flex-1" />
                        <input type="text" placeholder="OID Incoming" value={form.oids[0].oid} onChange={(e) => setForm({ ...form, oids: [{ ...form.oids[0], oid: e.target.value }, form.oids[1]] })} className="p-2 rounded bg-gray-700 text-white flex-1" />
                        <input type="text" placeholder="OID Outgoing" value={form.oids[1].oid} onChange={(e) => setForm({ ...form, oids: [form.oids[0], { ...form.oids[1], oid: e.target.value }] })} className="p-2 rounded bg-gray-700 text-white flex-1" />
                        <input type="text" placeholder="Community" value={form.community} onChange={(e) => setForm({ ...form, community: e.target.value })} className="p-2 rounded bg-gray-700 text-white flex-1" />
                        
                        <div className="flex items-center">
                            <RadixCheckbox.Root
                                checked={form.monitor}
                                onCheckedChange={(checked) => setForm({ ...form, monitor: !!checked })}
                                className="w-5 h-5 bg-gray-700 border rounded flex items-center justify-center"
                                id="monitor-checkbox"
                            >
                                <RadixCheckbox.Indicator className="text-green-500">
                                    ✓
                                </RadixCheckbox.Indicator>
                            </RadixCheckbox.Root>
                            <label htmlFor="monitor-checkbox" className="ml-2 text-white">Overvåk</label>
                        </div>
                    </div>
                    <div className="flex justify-end gap-2 mt-4">
                        <Button className="bg-green-700" onClick={handleAddSwitcher}>Legg til</Button>
                        <Button className="bg-red-700" onClick={() => SetOpenAdd(false)}>Avbryt</Button>
                    </div>
                </Card>
            }
            <div className="flex flex-row w-full pb-5">
                <div className="flex-1">
                    <ChartAreaInteractive switches={switches.filter((s: ChartSwitcher) => s.monitor)} trafficHistory={trafficHistory} />
                </div>
            </div>
            <div className="flex flex-row justify-center border-t">
                <SwitchCards switches={switches.map(sw => ({ ...sw, trafikkMengde: String(sw.trafikkMengde) }))} trafficHistory={trafficHistory} />
            </div>
        </ProtectedRoute>
    )
}