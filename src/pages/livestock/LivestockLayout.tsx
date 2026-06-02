import { Outlet } from "react-router-dom";

/**
 * Scoped wrapper applying the FarmUp-inspired sage & cream theme
 * (Outfit + Figtree typography, bento layout) to every livestock page.
 */
const LivestockLayout = () => {
  return (
    <div className="livestock-theme">
      <Outlet />
    </div>
  );
};

export default LivestockLayout;
