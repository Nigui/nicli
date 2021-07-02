import { getNetworkEpoch } from "./sdk";

const timestampFromDate = (date: string): number => {
  return new Date(date).getTime() / 1000;
};

export const getNetworkTimestamp = async (date: string): Promise<number> => {
  const epoch = await getNetworkEpoch();
  const epochTimestamp = timestampFromDate(epoch);
  return timestampFromDate(date) - epochTimestamp;
};
