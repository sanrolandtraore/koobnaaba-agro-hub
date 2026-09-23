import { Outlet } from "react-router-dom";

/**
 * Enveloppe visuelle dédiée au module Élevage & Zootechnie NAFA - AGRITECH.
 */
const LivestockLayout = () => {
  return (
    <div className="livestock-theme bg-background -mx-4 -my-4 md:-mx-8 md:-my-6 px-4 py-4 md:px-8 md:py-6 min-h-[calc(100vh-3.5rem)] md:min-h-screen">
      <Outlet />
    </div>
  );
};

export default LivestockLayout;
