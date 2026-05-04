/**
 * Funções utilitárias de interface. Centralizam composição de classes e pequenos helpers visuais.
 */
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
