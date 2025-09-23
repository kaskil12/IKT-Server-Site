
"use client";
import Image from "next/image";
import { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import ProtectedRoute from "@/components/ProtectedRoute";

import {
  ChartLineLabel,
} from "@/components/chart-line-label/chart-line-label";
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

export default function Home() {
  const [printers, setPrinters] = useState<Printer[]>([]);
  const [settingsStrings, setSettingsStrings] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    let socket: any = null;
    const fetchData = async () => {
      try {
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
        const [printerRes, settingsRes] = await Promise.all([
          fetch(`${backendUrl}/getAll`, { credentials: 'include' }),
          fetch(`${backendUrl}/settings`, { credentials: 'include' })
        ]);
        const printers = await printerRes.json();
        const settings = await settingsRes.json();
        setPrinters(printers);
        setSettingsStrings(settings);
      } catch (e) {
        setPrinters([]);
        setSettingsStrings([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();


    const io = require("socket.io-client");
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  socket = io(backendUrl);
    socket.on("printersUpdated", (data: Printer[]) => {
      setPrinters(data);
      setLoading(false);
    });

    return () => {
      if (socket) socket.disconnect();
    };
  }, []);

  console.log("printers", printers);
  console.log("settingsStrings", settingsStrings);
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
    console.log("printersWithFeilkode", printersWithFeilkode);
    const filtered = printersWithFeilkode.filter((printer) => {
      const normError = normalize(printer.feilkodeFromOid);
      let isWhitelisted = false;
      settingsStrings.forEach(str => {
        if (!str) return;
        const normWhite = normalize(str);
        const match = normError === normWhite || normError.includes(normWhite) || normWhite.includes(normError);
        console.log(
          `\n---\nRAW feilkode: '${printer.feilkodeFromOid}'\nRAW whitelist: '${str}'\nNORMALIZED feilkode: '${normError}'\nNORMALIZED whitelist: '${normWhite}'\nMatch:`,
          match
        );
        if (match) isWhitelisted = true;
      });
      return !isWhitelisted;
    });
    console.log("errorPrinters", filtered);
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

          {/* {errorPrinters.length > 0 && (
            <div className="mt-8 p-4 bg-red-900/80 rounded-xl shadow-lg">
              <h2 className="text-lg font-bold text-red-300 mb-2">Printere med feil (ikke whitelisted):</h2>
              <ul className="space-y-2">
                {errorPrinters.map((printer) => (
                  <li key={printer.id} className="flex flex-col gap-1">
                    <span className="font-semibold">{printer.modell} ({printer.PrinterIP})</span>
                    <span className="text-red-200">Feilkode: {printer.feilkode}</span>
                    <span className="text-xs text-gray-300">Plassering: {printer.plassering}</span>
                  </li>
                ))}
              </ul>
            </div>
          )} */}
        </div>
        <div className="w-3xl h-3xl flex-initial gap-6 p-6 flex flex-col">
          <ChartLineLabel cardTitle="Nettverkstrafikk" cardDescription="Siste 30 dager" trendingText="+5% siden forrige måned" footerText="Oppetid 99.99%"
          chartData={[{ month: "January", antall: 186 },
            { month: "February", antall: 305 },
            { month: "March", antall: 237 },
            { month: "April", antall: 73 },
            { month: "Mai", antall: 209 },
            { month: "Juni", antall: 214}]} />
          <DeviceBox
            devices={errorPrinters.map(printer => ({
              name: printer.modell + ' (' + printer.PrinterIP + ')',
              error: printer.feilkodeFromOid,
              location: printer.plassering
            }))}
          />
        </div>
      </div>
    </ProtectedRoute>
  );
}
