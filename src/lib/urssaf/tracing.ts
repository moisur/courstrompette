function formatPayload(payload: unknown) {
  try {
    return JSON.stringify(payload, null, 2);
  } catch {
    return String(payload);
  }
}

export type StoredUrssafTrace = {
  id: string;
  method: "M010" | "M020" | "M050" | "M070" | "AUTH";
  phase: "REQUEST" | "RESPONSE";
  label: string;
  payload: string;
  status?: number;
  createdAt: string;
};

const traceStore: StoredUrssafTrace[] = [];
const MAX_TRACES = 50;

export function getRecentUrssafTraces() {
  return [...traceStore].reverse();
}

export function clearRecentUrssafTraces() {
  traceStore.length = 0;
}

export function logUrssafTrace(options: {
  method: "M010" | "M020" | "M050" | "M070" | "AUTH";
  phase: "REQUEST" | "RESPONSE";
  label: string;
  payload: unknown;
  status?: number;
}) {
  const statusSuffix = typeof options.status === "number" ? ` [HTTP ${options.status}]` : "";
  const payload = formatPayload(options.payload);

  traceStore.push({
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    method: options.method,
    phase: options.phase,
    label: options.label,
    payload,
    status: options.status,
    createdAt: new Date().toISOString(),
  });

  if (traceStore.length > MAX_TRACES) {
    traceStore.splice(0, traceStore.length - MAX_TRACES);
  }

  console.log("=======================================================");
  console.log(`TRACE API (${options.method}) - ${options.phase}${statusSuffix} - ${options.label}`);
  console.log("=======================================================");
  console.log(payload);
  console.log("=======================================================");
}
