import { get } from "../http";

import { Managers } from "@uns/ark-crypto";

const initSDK = async () => {
  Managers.configManager.setFromPreset("livenet");
  const height = await get("node/status").then(({ now }) => now);
  Managers.configManager.setHeight(height);
};

export const getNetworkEpoch = (): Promise<string> =>
  get("node/configuration").then((response) => response.constants.epoch);
