import { cn } from "../../lib/utils";
import { MagneticBtn } from "./magnetic-btn";

export function BorderBeamBtn({ children, className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <MagneticBtn className={cn("border-beam group relative p-[1px] rounded-xl overflow-hidden transition-all active:scale-95", className)} {...props}>
      <div className="bg-background/90 px-8 py-4 rounded-xl flex items-center gap-3 group-hover:bg-background/70 transition-colors w-full h-full">
        {children}
      </div>
    </MagneticBtn>
  );
}
