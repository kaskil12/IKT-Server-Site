import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface Device {
  name: string
  error: string
  location: string
}

interface DeviceTableProps {
  devices: Device[]
}

export default function DeviceBox({ devices }: DeviceTableProps) {
  return (
    <Table className="w-full max-w-3xl rounded-2xl shadow-md text-white ">
      <TableCaption className="text-white">Liste av overvåkede enheter</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[200px] text-white">Enhet</TableHead>
          <TableHead className="text-white">Feil</TableHead>
          <TableHead className="text-right text-white">Plassering</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {devices.map((device, i) => (
          <TableRow key={i}>
            <TableCell className="font-medium">{device.name}</TableCell>
            <TableCell className="text-red-500">{device.error}</TableCell>
            <TableCell className="text-right">{device.location}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
