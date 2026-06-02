import { Outlet } from "react-router-dom";

/**
 * Scoped wrapper applying the FarmUp-inspired sage & cream theme
 * (Outfit + Figtree typography, bento layout) to every livestock page.
 */
const LivestockLayout = () => {
  return (
    <div className="livestock-theme bg-background text-foreground -m-4 sm:-m-6 p-4 sm:p-6 min-h-full">
      <Outlet />
    </div>
  );
};

export default LivestockLayout;
