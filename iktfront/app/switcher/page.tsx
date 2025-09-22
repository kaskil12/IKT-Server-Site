import ProtectedRoute from "@/components/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function Switcher(){
    const switchers = [
        { id: 1, name: "Switcher 1", ip: "192.168.1.1", model: "Cisco 2960", location: "Rack 1", status: "Online" },
        { id: 2, name: "Switcher 2", ip: "192.168.1.2", model: "Cisco 2960", location: "Rack 2", status: "Offline" },
        { id: 3, name: "Switcher 3", ip: "192.168.1.3", model: "Cisco 2960", location: "Rack 3", status: "Online" },
    ];
    const addSwitcher = () => {
        try {
            fetch("http://10.230.64.30:3000/switchers", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ name: "New Switcher", ip: "192.168.1.4", model: "Cisco 2960", location: "Rack 4", status: "Online" })
            });
        } catch (error) {
            console.error('Error adding switcher:', error);
        }
    };
    return(
        <ProtectedRoute>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-white flex justify-center">Switcher Oversikt</h1>
                <div className="flex gap-2">
                    <Button className="bg-green-700" >Innstillinger</Button>
                    <Button className="bg-green-700" >Legg til Switcher</Button>
                </div>
            </div>
            <div className="flex flex-row justify-center">
                {switchers.map((switcher) => (
                    <Card key={switcher.id} className="bg-white/10 text-white w-96 m-4 p-6 rounded-2xl shadow-md">
                        <h2 className="text-2xl font-bold mb-4">{switcher.name}</h2>
                        <p><strong>IP-adresse:</strong> {switcher.ip}</p>
                        <p><strong>Modell:</strong> {switcher.model}</p>
                        <p><strong>Plassering:</strong> {switcher.location}</p>
                        <p><strong>Status:</strong> {switcher.status}</p>
                        <p><strong>⚠️:</strong> <span className="text-yellow-500">Potensielt problem med tilkobling</span></p>
                    </Card>
                ))}
            </div>
        </ProtectedRoute>
    )
}