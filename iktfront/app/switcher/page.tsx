import ProtectedRoute from "@/components/ProtectedRoute";
import SwitchCards from "@/app/switcher/Components/switch_cards";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChartAreaInteractive } from "@/app/switcher/Components/chart";

export default function Switcher(){
    
    
    return(
        <ProtectedRoute>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-white flex justify-center">Switcher Oversikt</h1>
                <div className="flex gap-2">
                    <Button className="bg-green-700" >Innstillinger</Button>
                    <Button className="bg-green-700" >Legg til Switcher</Button>
                </div>
            </div>
            <div className="flex flex-row w-full pb-5">
                <div className="flex-1">
                    <ChartAreaInteractive/>
                </div>
            </div>
            <div className="flex flex-row justify-center border-t">
                <SwitchCards />
                
            </div>
        </ProtectedRoute>
    )
}