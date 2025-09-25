"use client"
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useState } from "react";

interface Switcher {
    id: number;
    modell: string;
    ip: string;
    lokasjon: string;
    rack: string;
    trafikkMengde: string;
    online: boolean;
}
export default function SwitchCards() {
    const [switches, setSwitches] = useState<Switcher[]>([]);
    return (
        <>
            {switches.map((switcher) => (
                <Card key={switcher.id} className="bg-white/10 text-white w-96 m-4 p-6 rounded-2xl shadow-md">
                    <h2 className="text-2xl font-bold mb-4">Switch {switcher.id}</h2>
                    <p><strong>Modell:</strong> {switcher.modell}</p>
                    <p><strong>IP:</strong> {switcher.ip}</p>
                    <p><strong>Lokasjon og Rack:</strong> {switcher.lokasjon} - {switcher.rack}</p>
                    <p><strong>TrafikkMengde:</strong> {switcher.trafikkMengde}</p>
                    <p><strong>Online:</strong> <span className={switcher.online ? "text-green-400" : "text-red-400"}>{switcher.online ? "Ja" : "Nei"}</span></p>
                </Card>
            ))}
        </>
    );
}