import { PropsWithChildren } from "react";
import css from "./Layout.module.scss";

export const Layout = ({ children }: PropsWithChildren) => {
  return (
    <div className={css.layout}>
      <header>
        <a href="/">
          <div className={css.brand}>nudedisco</div>
        </a>
      </header>
      <main>{children}</main>
    </div>
  );
};
