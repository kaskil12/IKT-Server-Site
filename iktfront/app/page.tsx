import Image from "next/image";
import { Button } from "@/components/ui/button";
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
} from "@/components/ui/table"

import DeviceBox from "@/components/DeviceBox/devicebox"

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

export default function Home() {
  return (
    <div className="flex flex-row justify-center items-start">
      <div className="w-5xl h-screen flex-initial items-center justify-center gap-6 p-12 text-white">
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
      <div className="w-3xl h-3xl flex-initial gap-6 p-12 flex flex-col">
        <ChartLineLabel cardTitle="Nettverkstrafikk" cardDescription="Siste 30 dager" trendingText="+5% siden forrige måned" footerText="Oppetid 99.99%" chartData={[{ month: "January", desktop: 186 },
          { month: "February", desktop: 305 },
          { month: "March", desktop: 237 },
          { month: "April", desktop: 73 },
          { month: "May", desktop: 209 },
          { month: "June", desktop: 214}]} />
        <DeviceBox
          devices={[
            { name: "Router #12", error: "Connection lost", location: "Server Room A" },
            { name: "Switch #5", error: "Overheating", location: "Rack B2" },
            { name: "AP #7", error: "No power", location: "Hallway" },
          ]}
        />

      </div>
    </div>
  );
}
