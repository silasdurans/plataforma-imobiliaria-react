/**
 * Componente base de interface reutilizável (skeleton). Encapsula comportamento e estilos compartilhados para uso em várias telas.
 */
import { cn } from "./utils";

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("bg-accent animate-pulse rounded-md", className)}
      {...props}
    />
  );
}

export { Skeleton };
