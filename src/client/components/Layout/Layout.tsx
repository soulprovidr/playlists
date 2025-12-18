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
        <div className="flex-none">
          <ul className="menu menu-horizontal px-1">
            <li>
              <Link href="/debug">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                Debug
              </Link>
            </li>
          </ul>
        </div>
      </header>
      <main className="flex flex-col gap-8 mt-24">{children}</main>
    </div>
  );
};
