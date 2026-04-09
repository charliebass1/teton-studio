import { cn } from "@/lib/utils";
import { useState, createContext, useContext, type ReactNode, type HTMLAttributes } from "react";

const TabsContext = createContext<{
  value: string;
  onValueChange: (v: string) => void;
}>({ value: "", onValueChange: () => {} });

interface TabsProps extends HTMLAttributes<HTMLDivElement> {
  defaultValue: string;
  value?: string;
  onValueChange?: (v: string) => void;
}

export function Tabs({
  defaultValue,
  value: controlledValue,
  onValueChange: controlledOnChange,
  children,
  className,
  ...props
}: TabsProps) {
  const [internal, setInternal] = useState(defaultValue);
  const value = controlledValue ?? internal;
  const onValueChange = controlledOnChange ?? setInternal;

  return (
    <TabsContext.Provider value={{ value, onValueChange }}>
      <div className={cn("w-full", className)} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  );
}

export function TabsList({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "inline-flex h-10 items-center justify-center rounded-md bg-[var(--muted)] p-1 text-[var(--muted-foreground)]",
        className
      )}
      {...props}
    />
  );
}

interface TabsTriggerProps extends HTMLAttributes<HTMLButtonElement> {
  value: string;
}

export function TabsTrigger({
  value,
  className,
  ...props
}: TabsTriggerProps) {
  const ctx = useContext(TabsContext);
  const active = ctx.value === value;

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-[var(--background)] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2",
        active
          ? "bg-[var(--background)] text-[var(--foreground)] shadow-sm"
          : "hover:bg-[var(--background)]/50",
        className
      )}
      onClick={() => ctx.onValueChange(value)}
      {...props}
    />
  );
}

interface TabsContentProps extends HTMLAttributes<HTMLDivElement> {
  value: string;
  children: ReactNode;
}

export function TabsContent({
  value,
  className,
  children,
  ...props
}: TabsContentProps) {
  const ctx = useContext(TabsContext);
  if (ctx.value !== value) return null;

  return (
    <div
      className={cn(
        "mt-2 ring-offset-[var(--background)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
