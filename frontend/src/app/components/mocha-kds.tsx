import { useState } from "react";
import { KDSTerminalLogin } from "./kds-terminal-login";
import { KDSProductionQueue } from "./kds-production-queue";
import { useAuth } from "@/utils/auth-context";

type StationType = "FRY" | "CURRY" | "RICE" | "PREP" | "GRILL" | "DESSERT" | "HEAD_CHEF";

const VALID_STATIONS: StationType[] = ["FRY", "CURRY", "RICE", "PREP", "GRILL", "DESSERT", "HEAD_CHEF"];

export function MochaKDS() {
  const { user } = useAuth();

  // Auto-derive station from the logged-in chef's kitchenStation.
  // Admins/managers always see the full picker (null → show login screen).
  const autoStation: StationType | null =
    user?.role === 'chef' && user.kitchenStation && VALID_STATIONS.includes(user.kitchenStation as StationType)
      ? (user.kitchenStation as StationType)
      : null;

  const [loggedInStation, setLoggedInStation] = useState<StationType | null>(autoStation);

  const handleLogin = (station: StationType) => {
    setLoggedInStation(station);
  };

  const handleLogout = () => {
    // Chef goes back to their own station automatically on next render.
    setLoggedInStation(autoStation);
  };

  if (!loggedInStation) {
    return <KDSTerminalLogin onLogin={handleLogin} />;
  }

  return <KDSProductionQueue station={loggedInStation} onLogout={handleLogout} />;
}
