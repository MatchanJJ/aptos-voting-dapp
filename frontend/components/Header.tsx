import { WalletSelector } from "./WalletSelector";
import { Link, useLocation } from "react-router-dom";
import { Button } from "./ui/button";

export function Header() {
  const location = useLocation();

  return (
    <div className="flex items-center justify-between px-4 py-2 max-w-screen-xl mx-auto w-full flex-wrap">
      <div className="flex items-center gap-8">
        <h1 className="display">Voting dApp</h1>
        <nav className="flex gap-4">
          <Link to="/">
            <Button variant={location.pathname === "/" ? "default" : "ghost"}>
              Results
            </Button>
          </Link>
          <Link to="/voting">
            <Button variant={location.pathname === "/voting" ? "default" : "ghost"}>
              Proposals
            </Button>
          </Link>
          <Link to="/create">
            <Button variant={location.pathname === "/create" ? "default" : "ghost"}>
              Create Proposal
            </Button>
          </Link>
        </nav>
      </div>

      <div className="flex gap-2 items-center flex-wrap">
        <WalletSelector />
      </div>
    </div>
  );
}
