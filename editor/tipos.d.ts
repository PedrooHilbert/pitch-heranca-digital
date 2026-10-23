// O projeto não tem @types/react-dom (conflito de peer deps no npm); só precisamos de createRoot.
declare module "react-dom/client" {
  import type { ReactNode } from "react";
  export function createRoot(el: Element | DocumentFragment): { render(n: ReactNode): void; unmount(): void };
}
