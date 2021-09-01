import { Command } from "@oclif/command";
import { cli } from "cli-ux";
import {
  computeForgedBlocks,
  computeRewardShares,
  getVoters,
  Period,
} from "../blockchain/functions";
import { getNetworkTimestamp } from "../blockchain/utils";
import { DELEGATE_ID, DELEGATE_PUBLIC_KEY } from "../constants";

export default class Foo extends Command {
  static description = "describe the command here";

  static examples = [`$ ni foo`];

  static flags = {};

  static args = [];

  async run() {
    const { args, flags } = this.parse(Foo);

    const from = "2021-07-01T00:00:00.000Z";
    const fromTS = await getNetworkTimestamp(from);
    const to = "2021-08-01T00:00:00.000Z";
    const toTS = await getNetworkTimestamp(to);

    const period: Period = { start: fromTS, end: toTS };

    const delegate = DELEGATE_PUBLIC_KEY;

    const num = await computeForgedBlocks(delegate, period);

    const rewards = num * 2;
    const toShare = rewards * 0.2;

    const voters = await getVoters(DELEGATE_ID);

    const nbVoters = voters.length;

    // old formula
    // const rewardByVoter = Math.floor(toShare / voters.length);

    const rewardByVoter = await computeRewardShares(voters, toShare, period);

    this.log(`${delegate} forged ${num} blocks between ${from} and ${to}`);
    this.log(`and got ${rewards} UNIKs`);
    this.log(`to share : ${toShare}`);
    this.log(`between : ${nbVoters} voters`);
    this.log(`by voter : ${rewardByVoter} UNIKs`);

    const shares = voters.map((v) => ({
      address: v.address,
      amount: rewardByVoter,
    }));
    cli.table(shares, { address: {}, amount: {} }, { printLine: this.log });
  }
}
