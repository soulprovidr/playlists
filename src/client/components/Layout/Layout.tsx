import { PropsWithChildren } from "react";
import { Header } from "./Header";

export const Layout = ({ children }: PropsWithChildren) => {
  return (
    <div className="flex flex-col gap-16 mx-auto px-2 py-6 w-full max-w-3xl text-base-content">
      <Header />
      <main className="flex flex-col gap-8 mt-24">{children}</main>
    </div>
  );
};
