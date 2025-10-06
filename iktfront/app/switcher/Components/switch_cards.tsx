"use client"
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { use, useEffect, useState } from "react";
import { backendUrl } from "@/lib/backend";
import { ChartAreaInteractive } from "./chart";
import { ChartAreaDefault } from "./chart-area-default";
interface Switcher {
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
export default function SwitchCards() {
    const [switches, setSwitches] = useState<Switcher[]>([]);
    useEffect(() => {
        const fetchData = async () => {
            try {
                const url = await backendUrl("/switcher/all");
                const response = await fetch(url);
                const data = await response.json();
                console.log("Fetched switches data:", data);
                setSwitches(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error("Error fetching switches:", error);
            }
        };
        fetchData();
    }, []);
    const fetchSwitches = async () => {
        try {
            const response = await fetch(`${backendUrl}/switcher/all`);
            const data = await response.json();
            console.log("Fetched switches data:", data);
            setSwitches(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Error fetching switches:", error);
        }
    };
    const deleteSwitcher = async (id: number) => {
        try {
            const url = await backendUrl(`/switcher/delete/${id}`);
            const res = await fetch(url, { method: "POST" });
            if (res.ok) {
                setSwitches(switches.filter(s => s.id !== id));
            } else {
                console.error("Failed to delete switcher");
            }
        } catch (error) {
            console.error("Error deleting switcher:", error);
        }
    };

    return (
        <>
            {Array.isArray(switches) && switches.map((switcher) => (
                <Card key={switcher.id} className="bg-white/10 text-white w-96 m-4 p-6 rounded-2xl shadow-md">
                    <div className="flex justify-between">
                        <h2 className="text-2xl font-bold mb-4">Switch {switcher.id}</h2>
                        <button className="bg-red-600 text-white px-3 py-1 rounded-lg float-right" onClick={async () => {
                            await deleteSwitcher(switcher.id);
                    }}>Slett</button>
                    </div>
                    <p><strong>Modell:</strong> {switcher.modell}</p>
                    <p><strong>IP:</strong> {switcher.ip}</p>
                    <p><strong>Lokasjon og Rack:</strong> {switcher.lokasjon} - {switcher.rack}</p>
                    <p><strong>TrafikkMengde:</strong> {switcher.trafikkMengde}</p>
                    <p><strong>Online:</strong> <span className={switcher.online ? "text-green-400" : "text-red-400"}>{switcher.online ? "Ja" : "Nei"}</span></p>
                    <ChartAreaDefault />
                </Card>
            ))}
        </>
    );
}