import { get, post } from "../http";
import { Transactions, Utils } from "@uns/ark-crypto";
import {
  DELEGATE_ID,
  DELEGATE_PASSPHRASE,
  VOTERS_BLACKLIST,
} from "../constants";
import { getNetworkTimestamp } from "./utils";

export const getVoters = (delegate: string): Promise<any[]> =>
  get(`delegates/${delegate}/voters`).then((voters: any) =>
    voters.filter(({ publicKey }: any) => !VOTERS_BLACKLIST.includes(publicKey))
  );

type Share = { id: string; amount: number };

const computeShares = (voters: string[]): Share[] => {
  const SECONDS_IN_A_MONTH = 3600 * 24 * 30;
  const BLOCKS_IN_A_MONTH = SECONDS_IN_A_MONTH / 8;
  console.log("BLOCKS_IN_A_MONTH", BLOCKS_IN_A_MONTH);
  const BLOCK_FORGED_BY_DELEGATES_IN_A_MONTH = BLOCKS_IN_A_MONTH / 23;
  const DELEGATE_REWARDS_IN_A_MONTH = BLOCK_FORGED_BY_DELEGATES_IN_A_MONTH * 2;
  console.log("DELEGATE_REWARDS_IN_A_MONTH", DELEGATE_REWARDS_IN_A_MONTH);

  const nbVoters = voters.length;

  const sharedReward = Math.floor(DELEGATE_REWARDS_IN_A_MONTH * 0.2);

  return voters.map((v) => ({
    id: v,
    amount: sharedReward / nbVoters,
  }));
};

const getNextWalletNonce = (walletId: string): Promise<any> =>
  get(`wallets/${walletId}`)
    .then(({ nonce }) => nonce)
    .then((nonce) => {
      Utils.BigNumber.make(nonce).plus(1).toFixed();
    });

const buildTransaction = async (shares: Share[]): Promise<any> => {
  const nonce = await getNextWalletNonce(DELEGATE_ID);
  const builder = Transactions.BuilderFactory.multiPayment()
    .version(2)
    .nonce(nonce)
    .vendorField(`🍾 @nigui monthly reward shares`);

  for (let { id, amount } of shares) {
    builder.addPayment(id, `${amount}`);
  }

  return builder.sign(DELEGATE_PASSPHRASE).build().toJson();
};

export const computeForgedBlocks = async (
  delegateId: string,
  fromDate: string,
  toDate: string
): Promise<number> => {
  const fromTimestamp = await getNetworkTimestamp(fromDate);
  const toTimestamp = await getNetworkTimestamp(toDate);

  const body = {
    timestamp: {
      from: fromTimestamp,
      to: toTimestamp,
    },
    generatorPublicKey: delegateId,
  };

  const response = await post("v2/blocks/search", body);

  return response.meta.totalCount;
};
