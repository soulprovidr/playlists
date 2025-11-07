import { PropsWithChildren } from "react";
import { Link } from "wouter";

export const Layout = ({ children }: PropsWithChildren) => {
  return (
    <div className="flex flex-col gap-16 mx-auto px-2 py-6 w-full max-w-3xl text-base-content">
      <header className="navbar bg-neutral text-neutral-content fixed top-0 right-0 left-0 z-50">
        <div className="flex-1">
          <Link className="btn btn-ghost brand" href="/">
            nudedisco
          </Link>
        </div>
      </header>
      <main className="flex flex-col gap-8 mt-24">{children}</main>
    </div>
  );
};
