"use client";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";

export default function Printer() {
    const [snmpData, setSnmpData] = useState<any>(null);

    useEffect(() => {
        fetch("http://localhost:64/snmp-data")
            .then((res) => res.json())
            .then((data) => setSnmpData(data))
            .catch(() => setSnmpData(null));
    }, []);

    return (
        <div className="flex justify-center items-center min-h-screen">
            <Card className="w-full max-w-md p-6">
                <h2 className="text-xl font-bold mb-4">Printer SNMP Data</h2>
                {snmpData ? (
                    <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto">
                        {JSON.stringify(snmpData, null, 2)}
                    </pre>
                ) : (
                    <p>Loading SNMP data...</p>
                )}
            </Card>
        </div>
    );
}
