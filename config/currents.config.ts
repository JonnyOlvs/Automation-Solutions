import { CurrentsConfig } from "@currents/playwright";

const config: CurrentsConfig = {
  projectId: process.env.CURRENTS_PROJECT_ID ?? "ixAdP0",
  recordKey: process.env.CURRENTS_RECORD_KEY!
};

export default config;

