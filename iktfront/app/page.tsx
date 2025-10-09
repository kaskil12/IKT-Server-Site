"use client"
import { useEffect, useState, useMemo } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { backendUrl } from "@/lib/backend";


import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import DeviceBox from "@/components/DeviceBox/devicebox";
import { ChartLineLabel } from "@/components/chart-line-label/chart-line-label";
import type { Switcher } from "@/app/switcher/Components/switch_cards";
import { ChartAreaInteractive } from "@/app/switcher/Components/chart-area-interactive";

type Printer = {
  id: number;
  modell: string;
  serienummer: string;
  PrinterIP: string;
  plassering: string;
  oids: any[];
  feilkode: string;
  online: boolean;
};

const tableData = [
  { dato: "11.05.2025", status: "Under behandling", tittel: "Knust PC", navn: "Ole Dole" },
  { dato: "12.05.2025", status: "Løst", tittel: "Nettverksproblem", navn: "Kari Nordmann" },
  { dato: "13.05.2025", status: "Venter på deler", tittel: "Defekt skjerm", navn: "Per Hansen" },
  { dato: "14.05.2025", status: "Under behandling", tittel: "Virus infeksjon", navn: "Anne Larsen" },
  { dato: "15.05.2025", status: "Fullført", tittel: "Programvareinstallasjon", navn: "Erik Johansen" },
  { dato: "16.05.2025", status: "Under behandling", tittel: "Treg ytelse", navn: "Lise Andersen" },
  { dato: "17.05.2025", status: "Venter på bruker", tittel: "Passord reset", navn: "Tom Nielsen" },
  { dato: "18.05.2025", status: "Løst", tittel: "E-post konfigurasjon", navn: "Ida Kristiansen" }
];

export default function DashboardPage() {
  const [printers, setPrinters] = useState<Printer[]>([]);
  const [settingsStrings, setSettingsStrings] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [switches, setSwitches] = useState<Switcher[]>([]);
  const [trafficHistory, setTrafficHistory] = useState<Record<string, any[]>>({});

  useEffect(() => {
    let socket: any = null;
    const fetchData = async () => {
      try {
        const url1 = await backendUrl("/getAll");
        const url2 = await backendUrl("/settings");
        const url3 = await backendUrl("/switcher/all");
        const [printerRes, settingsRes, switcherRes] = await Promise.all([
          fetch(url1, { credentials: 'include' }),
          fetch(url2, { credentials: 'include' }),
          fetch(url3, { credentials: 'include' })
        ]);
        const printers = await printerRes.json();
        const settings = await settingsRes.json();
        const switchesRaw = await switcherRes.json();
        const monitoredSwitches = (switchesRaw || []).map((sw: any) => ({
          ...sw,
          trafikkMengde: Array.isArray(sw.trafikkMengde) ? (sw.trafikkMengde.length ? Number(sw.trafikkMengde[sw.trafikkMengde.length - 1].totaltraffic || 0) : 0) : (typeof sw.trafikkMengde === 'string' ? Number(sw.trafikkMengde) : sw.trafikkMengde)
        })).filter((sw: any) => sw.monitor);
        setPrinters(printers);
        setSettingsStrings(settings);
        setSwitches(monitoredSwitches);
      } catch (e) {
        setPrinters([]);
        setSettingsStrings([]);
        setSwitches([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    import("socket.io-client").then(({ default: io }) => {
      backendUrl("").then((base) => {
        socket = io(base.replace(/\/$/, ""));
        socket.on("printersUpdated", (data: Printer[]) => {
          setPrinters(data);
          setLoading(false);
        });
        socket.on("switchersTrafficUpdate", (data: { switchers: any[]; trafficHistory?: Record<string, any[]> }) => {
          const monitoredSwitches = (data.switchers || []).filter((sw: any) => sw.monitor);
          setSwitches(monitoredSwitches);
          if (data.trafficHistory && typeof data.trafficHistory === 'object') {
            setTrafficHistory(data.trafficHistory);
          }
        });
      });
    });

    return () => {
      if (socket) socket.disconnect();
    };
  }, []);

  function normalize(str: string) {
    return str.toLowerCase().replace(/[^a-z0-9æøåäöüéèáà. ]/gi, '').replace(/[.,!?;:]/g, '').trim();
  }

  interface OidValueBuffer {
    type: 'Buffer';
    data: number[];
  }

  interface Oid {
    name: string;
    value: string | number | OidValueBuffer | { data: number[] } | any;
  }

  function getFeilkodeFromOids(printer: { oids: Oid[] }): string {
    if (!printer.oids || !Array.isArray(printer.oids)) return "";
    const feilkodeOid = printer.oids.find(
      (oid: Oid) => oid.name && oid.name.toLowerCase() === "feilkode"
    );
    if (!feilkodeOid || feilkodeOid.value == null) return "";
    let value: any = feilkodeOid.value;
    if (value && typeof value === 'object') {
      if (Array.isArray((value as { data?: any[] }).data)) {
        try {
          value = Buffer.from((value as { data: number[] }).data).toString();
        } catch {
          value = '[unreadable octet string]';
        }
      } else if ((value as OidValueBuffer).type === 'Buffer' && Array.isArray((value as OidValueBuffer).data)) {
        try {
          value = Buffer.from((value as OidValueBuffer).data).toString();
        } catch {
          value = '[unreadable octet string]';
        }
      } else {
        value = String(value);
      }
    }
    return value;
  }

  const errorPrinters = useMemo(() => {
    const printersWithFeilkode = printers
      .map(printer => ({ ...printer, feilkodeFromOid: getFeilkodeFromOids(printer) }))
      .filter(printer => printer.feilkodeFromOid && printer.feilkodeFromOid.trim() !== "");
    const filtered = printersWithFeilkode.filter((printer) => {
      const normError = normalize(printer.feilkodeFromOid);
      let isWhitelisted = false;
      settingsStrings.forEach(str => {
        if (!str) return;
        const normWhite = normalize(str);
        const match = normError === normWhite || normError.includes(normWhite) || normWhite.includes(normError);
        if (match) isWhitelisted = true;
      });
      return !isWhitelisted;
    });
    return filtered;
  }, [printers, settingsStrings]);

  return (
    <ProtectedRoute>
      <div className="flex flex-row justify-center gap-0">
        <div className="w-5xl h-screen flex-initial items-center justify-center gap-6 p-6 text-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px] text-white font-bold">Dato</TableHead>
                <TableHead className="text-white font-bold">Status</TableHead>
                <TableHead className="text-white font-bold">Tittel</TableHead>
                <TableHead className="text-right text-white font-bold">Navn</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tableData.map((row, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{row.dato}</TableCell>
                  <TableCell>{row.status}</TableCell>
                  <TableCell>{row.tittel}</TableCell>
                  <TableCell className="text-right">{row.navn}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="w-3xl h-3xl flex-initial gap-6 p-6 flex flex-col">
          <ChartAreaInteractive switches={switches.filter(sw => sw.monitor).map(sw => ({ ...sw, trafikkMengde: typeof sw.trafikkMengde === 'string' ? Number(sw.trafikkMengde) : sw.trafikkMengde }))} trafficHistory={trafficHistory} />
          <DeviceBox
            devices={[
              ...errorPrinters.map(printer => ({
                name: printer.modell + ' (' + printer.PrinterIP + ')',
                error: printer.feilkodeFromOid,
                location: printer.plassering
              })),
              ...switches.map(sw => ({
                name: sw.modell + ' (' + sw.ip + ')',
                error: sw.online ? '' : 'Offline',
                location: sw.lokasjon + ' - ' + sw.rack
              }))
            ]}
          />
        </div>
      </div>
    </ProtectedRoute>
  );
}

