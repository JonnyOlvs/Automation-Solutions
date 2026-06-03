import { CurrentsConfig } from "@currents/playwright";

const config: CurrentsConfig = {
  projectId: "ixAdP0",
  recordKey: process.env.CURRENTS_RECORD_KEY!
};

export default config;

