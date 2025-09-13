import { Button } from "@/renderer/components/ui/button";
import { Link } from "react-router";

export default function Launcher() {
    return (
        <div className="h-screen flex justify-center items-center">
            <h1>Bienvenu sur Tshik</h1>
            <Link to="/">
                <Button>Ouvrir</Button>
            </Link>
        </div>
    )
} 