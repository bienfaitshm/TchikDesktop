import { Button } from "@/renderer/components/ui/button";
import { Link } from "react-router-dom";

export default function Launcher() {
    return (
        <div>
            <h1>Bienvenu sur Tshik</h1>
            <Link to="/">
                <Button>Ouvrir</Button>
            </Link>
        </div>
    )
} 