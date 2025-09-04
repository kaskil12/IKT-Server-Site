import snmp from 'net-snmp';
import React, { useState } from 'react';


export default function Printer() {
    const [pingResult, setPingResult] = useState<string>('');
    const [colorResult, setColorResult] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);

    async function pingPrinter() {
        setLoading(true);
        setPingResult('');
        setColorResult('');
        try {
            const pingRes = await fetch('/api/ping?ip=10.230.144.43');
            const pingData = await pingRes.json();
            if (pingData.success) {
                setPingResult(`Ping successful: ${pingData.roundtripTime} ms`);
                await getColor();
            } else {
                setPingResult(`Ping failed: ${pingData.status}`);
            }
        } catch (err: any) {
            setPingResult(`Error: ${err.message}`);
        }
        setLoading(false);
    }

    async function getColor() {
        try {
            const colorRes = await fetch('/api/printer/color?ip=10.230.144.43');
            const colorData = await colorRes.json();
            setColorResult(colorData.value?.toString() ?? 'No value');
        } catch (err: any) {
            setColorResult(`Error: ${err.message}`);
        }
    }

    return (
        <div>
            <button onClick={pingPrinter} disabled={loading}>
                {loading ? 'Pinging...' : 'Ping Printer'}
            </button>
            <div>
                <strong>Ping:</strong> {pingResult}
            </div>
            <div>
                <strong>Color:</strong> {colorResult}
            </div>
        </div>
    );
}

