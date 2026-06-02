import { Outlet } from "react-router-dom";

/**
 * Scoped wrapper applying the FarmUp-inspired sage & cream theme
 * (Outfit + Figtree typography, bento layout) to every livestock page.
 * Negative margins bleed the cream background out to the edge of the main panel.
 */
const LivestockLayout = () => {
  return (
    <div className="livestock-theme bg-background -mx-4 -my-4 md:-mx-8 md:-my-6 px-4 py-4 md:px-8 md:py-6 min-h-[calc(100vh-3.5rem)] md:min-h-screen">
      <Outlet />
    </div>
  );
};

export default LivestockLayout;
