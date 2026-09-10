type Props = {
  pickupLabel: string;
  dropLabel: string;
};

/**
 * Abstract route preview. Modular on purpose: a real map (Google/Mapbox)
 * can replace this component without touching the screens that use it.
 */
export function RoutePreview({ pickupLabel, dropLabel }: Props) {
  return (
    <div className="relative h-44 overflow-hidden rounded-[14px] bg-secondary ring-1 ring-border">
      <div className="rp-grid absolute inset-0 opacity-60" />
      <div className="absolute inset-x-3 top-1/2 flex -translate-y-1/2 items-center">
        <div className="h-3 w-3 shrink-0 rounded-full bg-leaf ring-4 ring-leaf/20" />
        <div className="h-[3px] flex-1 rounded-full bg-leaf" />
        <div className="h-3 w-3 shrink-0 rounded-full bg-clay ring-4 ring-clay/20" />
      </div>
      <span className="absolute left-5 top-[calc(50%-22px)] text-[11px] font-semibold text-foreground/70">
        Pickup
      </span>
      <span className="absolute right-5 top-[calc(50%-22px)] text-[11px] font-semibold text-foreground/70">
        Drop
      </span>
      <span className="absolute left-5 top-[calc(50%+14px)] max-w-[42%] truncate text-[11px] text-muted-foreground">
        {pickupLabel}
      </span>
      <span className="absolute right-5 top-[calc(50%+14px)] max-w-[42%] truncate text-right text-[11px] text-muted-foreground">
        {dropLabel}
      </span>
    </div>
  );
}
