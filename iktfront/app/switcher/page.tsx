import ProtectedRoute from "@/components/ProtectedRoute";

export default function Switcher(){
    return(
        <ProtectedRoute>


        <div className="flex flex-row justify-center">
            <p className="text-white text-7xl p-7">Under utvikling...</p>
        </div>
        </ProtectedRoute>
    )
}