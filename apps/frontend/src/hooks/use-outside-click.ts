import { useEffect } from "react";

type UseOutsideClickProps = {
  ref: React.RefObject<HTMLElement | null>;
  handler: (event: MouseEvent | TouchEvent) => void;
};

export function useOutsideClick({ ref, handler }: UseOutsideClickProps) {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      const el = ref?.current;
      if (!el || el.contains(event.target as Node)) {
        return;
      }
      handler(event);
    };

    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);

    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, handler]);
}
