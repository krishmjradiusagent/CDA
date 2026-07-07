import { useState } from "react";
import { resolveBroker, formatGenDate } from "../lib/broker";

type Props = {
  state?: string;
  team?: string;
  ericLicensed?: boolean;
  date?: string;
};

export function BrokerSignature({ state, team, ericLicensed, date }: Props) {
  const broker = resolveBroker(state, team, ericLicensed);
  const [imgFailed, setImgFailed] = useState(false);
  const genDate = date || formatGenDate();

  return (
    <div className="space-y-2">
      <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
        Managing Broker
      </div>
      <div className="h-12 flex items-end border-b border-border">
        {broker.sigSrc && !imgFailed ? (
          <img
            src={broker.sigSrc}
            alt={`${broker.name} signature`}
            className="max-h-10 max-w-[180px] object-contain object-left mb-0.5"
            onError={() => setImgFailed(true)}
          />
        ) : (
          <span
            className="leading-none pb-1 text-foreground"
            style={{ fontFamily: "'Homemade Apple', 'Caveat', cursive", fontSize: "22px" }}
          >
            {broker.name}
          </span>
        )}
      </div>
      <div className="flex justify-between items-baseline text-xs">
        <span className="font-medium text-foreground">
          {broker.name} <span className="text-muted-foreground">· {broker.title}</span>
        </span>
        <span className="text-muted-foreground">{genDate}</span>
      </div>
    </div>
  );
}
