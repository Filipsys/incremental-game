import Decimal from "decimal.js";
import { create } from "zustand";
// import { debug } from "../utils";

import type { GameStore, Actions, Transaction } from "../types/store";
import { BigNumber } from "../BigNumber";

export const useStore = create<GameStore & Actions>((set) => ({
  ticks: 0,
  transactionsComplete: new BigNumber(0, 0n),
  transactionsPending: new BigNumber(0, 0n),
  transactionsPerTick: new Decimal(20.02), // 0.02
  transactionAccumulator: new Decimal(0),
  transactionValidationSpeed: new Decimal(4000),

  funds: new Decimal(0),
  maxTransferAmount: 100,
  instantTransferFee: new Decimal(0.02),

  transactionQueueAccumulator: new Decimal(0),
  transactionQueueAmount: 1,
  transactionQueueThreshold: 500,
  transactionQueue: [],
  supportedCurrencies: [],

  transactionSpeedUpgrades: 0,
  transactionValidationSpeedUpgrades: 0,
  // transactionMultithreadingUpgrades: 0,
  // maxLoanAmountUpgrades: 0,
  // expandCurrencyUpgrades: 0,
  // quantumStabilityUpgrades: 0,

  notation: "standard",

  setTicks: (ticks: GameStore["ticks"]) => set({ ticks: ticks }),

  addFunds: (funds: GameStore["funds"]) =>
    set((state) => ({ funds: state.funds.plus(funds) })),
  removeFunds: (funds: GameStore["funds"]) =>
    set((state) => ({ funds: state.funds.minus(funds) })),
  setFunds: (funds: GameStore["funds"]) => set(() => ({ funds: funds })),

  setTransactionAccumulator: (
    transactionsAccumulated: GameStore["transactionAccumulator"],
  ) => set(() => ({ transactionAccumulator: transactionsAccumulated })),

  increaseTransactionQueueAmount: () =>
    set((state) => ({
      transactionQueueAmount: state.transactionQueueAmount * 2,
    })),
  setTransactionQueueThreshold: (
    threshold: GameStore["transactionQueueThreshold"],
  ) => set({ transactionQueueThreshold: threshold }),
  setTransactionQueue: (queue: GameStore["transactionQueue"]) =>
    set(() => ({ transactionQueue: queue })),

  buyTransactionSpeedUpgrade: () =>
    set((state) => ({
      funds: state.funds.minus(40),
      transactionSpeedUpgrades: state.transactionSpeedUpgrades + 1,
    })),
  setTransactionSpeedUpgrade: (amount: number) =>
    set((state) => ({
      transactionSpeedUpgrades: state.transactionSpeedUpgrades + amount,
    })),
  buyTransactionValidationSpeedUpgrade: () =>
    set((state) => ({
      funds: state.funds.minus(120),
      transactionValidationSpeedUpgrades:
        state.transactionValidationSpeedUpgrades + 1,
    })),
  setTransactionValidationSpeedUpgrade: (amount: number) =>
    set((state) => ({
      transactionValidationSpeedUpgrades:
        state.transactionValidationSpeedUpgrades + amount,
    })),

  changeNotation: (newNotation: GameStore["notation"]) =>
    set({ notation: newNotation }),

  startTick: () =>
    set((state) => {
      const currentTime: EpochTimeStamp = Date.now();
      let completedTransactionsCount = 0;

      // I will probably want to remove this main loop feature
      // and switch the array with something less resource-intensive
      // at larger lengths.
      //
      // Remove the pending transactions if their time has passed & add
      // the completed transaction count to the completed transaction amount
      const filteredQueue = state.transactionQueue.filter((transaction) => {
        if (
          state.transactionValidationSpeed
            .sub(
              state.transactionValidationSpeed
                .mul(0.01)
                .mul(state.transactionValidationSpeedUpgrades),
            )
            .plus(transaction)
            .lessThan(currentTime)
        ) {
          completedTransactionsCount =
            completedTransactionsCount + state.transactionQueueAmount;

          return false;
        }

        return true;
      });

      // Gather the total accumulated transactions from the current transaction amount + the transaction amount from this tick
      const totalAccumulated = state.transactionAccumulator.plus(
        state.transactionsPerTick.add(0.02 * state.transactionSpeedUpgrades),
      );

      // debug(`Total accumulated: ${totalAccumulated.toNumber()}`);

      // Check if the accumulated transaction amount is higher than 1, if so, create a new transaction, else, skip and add to accumulated transaction amount
      if (
        state.transactionAccumulator
          .plus(totalAccumulated)
          .greaterThanOrEqualTo(1)
      ) {
        // completedTransactionsCount =
        //   completedTransactionsCount + totalAccumulated.floor().toNumber();

        totalAccumulated.minus(totalAccumulated.mod(1));
      } else {
        state.setTransactionAccumulator(
          state.transactionAccumulator.plus(totalAccumulated),
        );
      }

      // debug(
      //   `Total completed transactions count: ${completedTransactionsCount}`,
      // );

      // Add the funds according to the completed transactions from this tick
      // maxTransferAmount is a placeholder. The amounts will be created later
      let newFunds: Decimal = new Decimal(0);
      if (completedTransactionsCount > 0) {
        newFunds = new Decimal(10)
          .mul(state.instantTransferFee)
          .mul(completedTransactionsCount);
      }

      // Check if the transaction queue is past the threshold, if so,
      // increase the transactions amount in the queue
      if (state.transactionQueue.length > state.transactionQueueThreshold) {
        state.increaseTransactionQueueAmount();
        state.setTransactionQueueThreshold(
          Math.round(state.transactionQueueThreshold * 1.1),
        );

        // debug(`!!! Transaction queue amount: ${state.transactionQueueAmount}`);
      }

      // Add the new transactions to the transaction queue
      const newTransactionQueue: Transaction[] = [...filteredQueue];

      if (totalAccumulated.greaterThanOrEqualTo(state.transactionQueueAmount)) {
        for (
          let i = 0;
          i <
          Math.floor(
            totalAccumulated.floor().toNumber() / state.transactionQueueAmount,
          );
          i++
        ) {
          newTransactionQueue.push(Date.now());
        }
      }

      // debug(`Transactions queue: ${newTransactionQueue}`);
      // debug(`New transactions count: ${completedTransactionsCount}`);

      return {
        ticks: state.ticks + 1,
        transactionsComplete: state.transactionsComplete.add(
          new BigNumber(completedTransactionsCount, 0n),
        ),
        transactionsPending: new BigNumber(filteredQueue.length, 0n),
        transactionAccumulator: totalAccumulated.mod(1),
        transactionQueue: newTransactionQueue,
        funds: state.funds.plus(newFunds),
      };
    }),
}));
