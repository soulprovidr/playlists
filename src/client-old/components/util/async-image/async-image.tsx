import cx from "classnames";
import { ImgHTMLAttributes, ReactEventHandler, useState } from "react";
import css from "./async-image.module.scss";

export const AsyncImage = ({
  className = "",
  onLoad = undefined,
  ...rest
}: ImgHTMLAttributes<HTMLImageElement>) => {
  const [isLoaded, setIsLoaded] = useState(false);

  const handleLoad: ReactEventHandler<HTMLImageElement> = (e) => {
    setIsLoaded(true);
    onLoad?.(e);
  };

  return (
    <img
      className={cx(css.asyncImage, className, { [css.isVisible]: isLoaded })}
      {...rest}
      onLoad={handleLoad}
    />
  );
};
