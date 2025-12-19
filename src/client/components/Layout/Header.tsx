import { PropsWithChildren } from "react";
import { Link } from "wouter";

export const Header = ({ children }: PropsWithChildren) => (
  <header className="navbar bg-neutral text-neutral-content fixed top-0 right-0 left-0 z-50">
    <div className="flex-1">
      <Link className="btn btn-ghost brand" href="/">
        nudedisco
      </Link>
    </div>
    <div className="flex-none">
      {children || (
        <ul className="menu menu-horizontal px-1">
          <li>
            <Link href="/">Dashboard</Link>
          </li>
          <li>
            <Link href="/debug">Console</Link>
          </li>
        </ul>
      )}
    </div>
  </header>
);
