import { get, post } from "../http";
import { Transactions, Utils } from "@uns/ark-crypto";
import {
  DELEGATE_ID,
  DELEGATE_PASSPHRASE,
  DELEGATE_PUBLIC_KEY,
  VOTERS_BLACKLIST,
} from "../constants";
import { getNetworkTimestamp } from "./utils";

export const getVoters = (delegate: string): Promise<any[]> =>
  get(`delegates/${delegate}/voters`).then((voters: any) =>
    voters.filter(({ publicKey }: any) => !VOTERS_BLACKLIST.includes(publicKey))
  );

type VoterIds = string[];
type RewardShare = { id: string; amount: number }[];
export type Period = { start: number; end: number };

type VotersVotingStartDate = { id: string; startDateTS: number }[];
const getVotingStartDate = async (
  voters: VoterIds,
  period: Period
): Promise<VotersVotingStartDate> => {
  const promises = voters.map(async (id: string) => {
    // find all delegate vote transaction during period
    const body = {
      transactions: {
        from: period.start,
        to: period.end,
      },
      type: 5,
      typeGroup: 2001,
      senderPublicKey: id,
      asset: {
        votes: [`+${DELEGATE_PUBLIC_KEY}`],
      },
    };
    const response = await post("v2/transactions/search", body);
    return response.meta.totalCount > 0
      ? { id, startDateTS: response.data[0].timestamp.epoch } // get last transaction date (must be ordered by date)
      : { id, startDateTS: period.start };
  });
  return Promise.all(promises);
};

type VotersVotingPercentage = { id: string; timePercent: number }[];
const computeTimeSpentVoting = (
  votersStartDate: VotersVotingStartDate,
  period: Period
): VotersVotingPercentage => {
  return votersStartDate.map(({ id, startDateTS }) => {
    return {
      id,
      timePercent: (startDateTS - period.start) / (period.end - period.start),
    };
  });
};

type VotersAvgStakedTokens = { id: string; amount: number }[];
const computeAvgTokenStakedOnPeriod = (
  votersStartDate: VotersVotingStartDate,
  endDate: number
): Promise<VotersAvgStakedTokens> => {
  const promises = votersStartDate.map(async ({ id, startDateTS }) => {
    const { balance, address } = await getWallet(id);

    // get outcoming transaction
    const response = await post("v2/transactions/search", {
      transactions: {
        from: startDateTS,
        to: endDate,
      },
      senderPublicKey: id,
    });
    response.data.map(({ amount, fees }) => {});
    // TODO handle multipayment transactions

    // get incoming transactions
    const responseIncoming = await post("v2/transactions/search", {
      transactions: {
        from: startDateTS,
        to: endDate,
      },
      recipient: address,
    });
    // TODO handle multipayment transaction
  });

  return Promise.all(promises);
};

type VotersRewardPercentage = { id: string; rewardPercent: number }[];
const computeVoterRewardPercentage = (
  votingPercentages: VotersVotingPercentage,
  avgTokenStakedOnPeriod: VotersAvgStakedTokens
): VotersRewardPercentage => {
  // TODO
  return [];
};

const applyRewardPercentage = (
  voterRewardPercentage: VotersRewardPercentage,
  amountToShare: number
): RewardShare => {
  // TODO
  return [];
};

export const computeRewardShares = async (
  voters: VoterIds,
  toShare: number,
  periodDates: Period
): Promise<RewardShare> => {
  // const SECONDS_IN_A_MONTH = 3600 * 24 * 30;
  // const BLOCKS_IN_A_MONTH = SECONDS_IN_A_MONTH / 8;
  // console.log("BLOCKS_IN_A_MONTH", BLOCKS_IN_A_MONTH);
  // const BLOCK_FORGED_BY_DELEGATES_IN_A_MONTH = BLOCKS_IN_A_MONTH / 23;
  // const DELEGATE_REWARDS_IN_A_MONTH = BLOCK_FORGED_BY_DELEGATES_IN_A_MONTH * 2;
  // console.log("DELEGATE_REWARDS_IN_A_MONTH", DELEGATE_REWARDS_IN_A_MONTH);

  // const nbVoters = voters.length;

  // const sharedReward = Math.floor(DELEGATE_REWARDS_IN_A_MONTH * 0.2);

  // 1. Compute voting start date timestamp
  const votingStartDate: VotersVotingStartDate = await getVotingStartDate(
    voters,
    periodDates
  );

  // 2. Compute percentage time spent voting during period
  const votingPercentages: VotersVotingPercentage =
    await computeTimeSpentVoting(votingStartDate, periodDates);

  // 3. Compute average tokens staked on voting period
  const avgTokenStakedOnPeriod: VotersAvgStakedTokens =
    await computeAvgTokenStakedOnPeriod(votingStartDate, periodDates.end);

  // 4. Compute voter reward percentage
  const voterRewardPercentage: VotersRewardPercentage =
    await computeVoterRewardPercentage(
      votingPercentages,
      avgTokenStakedOnPeriod
    );

  // 5. Apply reward percentage
  return applyRewardPercentage(voterRewardPercentage, toShare);
};

const getNextWalletNonce = (walletId: string): Promise<any> =>
  get(`wallets/${walletId}`)
    .then(({ nonce }) => nonce)
    .then((nonce) => {
      Utils.BigNumber.make(nonce).plus(1).toFixed();
    });

const buildTransaction = async (shares: RewardShare): Promise<any> => {
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
  period: Period
): Promise<number> => {
  const body = {
    timestamp: {
      from: period.start,
      to: period.end,
    },
    generatorPublicKey: delegateId,
  };

  const response = await post("v2/blocks/search", body);

  return response.meta.totalCount;
};
