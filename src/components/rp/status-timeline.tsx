import { RIDE_STEPS, stepIndex, type RideStatus } from "@/lib/ridepool";
import { Diamond } from "@/components/rp/shell";

export function StatusTimeline({ status }: { status: RideStatus }) {
  const current = stepIndex(status);
  const cancelled = status === "cancelled";

  return (
    <div className="flex items-center px-1">
      {RIDE_STEPS.map((step, i) => (
        <div key={step.key} className="contents">
          {i > 0 && (
            <div
              className={`-mt-4 h-[2px] flex-1 ${
                !cancelled && i <= current ? "bg-leaf" : "bg-foreground/15"
              }`}
            />
          )}
          <div className="flex flex-1 flex-col items-center">
            <Diamond
              className={`h-3 w-3 ${
                cancelled
                  ? "bg-destructive/40"
                  : i < current
                    ? "bg-leaf"
                    : i === current
                      ? "bg-leafdark ring-4 ring-leaf/25"
                      : "bg-foreground/20"
              }`}
            />
            <span
              className={`mt-1 text-[9px] ${
                i === current && !cancelled
                  ? "font-semibold text-foreground"
                  : "text-muted-foreground"
              }`}
            >
              {step.label}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
