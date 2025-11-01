import { PropsWithChildren } from "react";

export const Layout = ({ children }: PropsWithChildren) => {
  return (
    <div className="flex flex-col gap-16 mx-auto px-2 py-6 w-full max-w-3xl text-base-content">
      <header className="navbar bg-neutral text-neutral-content fixed top-0 right-0 left-0">
        <div className="flex-1">
          <a
            className="btn btn-ghost text-3xl font-['MuseoModerno'] tracking-tight"
            href="/"
          >
            nudedisco
          </a>
        </div>
        <div className="flex-none">
          <a href="/logout" className="btn btn-ghost">
            Logout
          </a>
        </div>
      </header>
      <main className="flex flex-col gap-8 mt-24">{children}</main>
    </div>
  );
};
