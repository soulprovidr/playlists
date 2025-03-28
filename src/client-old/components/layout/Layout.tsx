import { ReactNode } from "react";
import { Link } from "wouter";
import css from "./layout.module.scss";

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  return (
    <div className={css.layout}>
      <header>
        <Link href="/" asChild>
          <div className={css.brand}>nudedisco</div>
        </Link>
      </header>
      <main>{children}</main>
    </div>
  );
};
