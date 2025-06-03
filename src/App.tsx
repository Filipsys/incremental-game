import { useEffect } from "react";
import { create } from "zustand";
import { Stage1 } from "./components/machines/stage1";

import Decimal from "decimal.js";

type GameStore = {
  ticks: number;
  transactionsComplete: number;
  transactionsPending: number;
  transactionsPerTick: Decimal;
  transactionAccumulator: Decimal;
  transactionValidationSpeed: GameStore["ticks"];

  transactionQueue: [Decimal, EpochTimeStamp][];

  // Upgrades
  transactionSpeedUpgrades: number;
  transactionValidationSpeedUpgrades: number;
  transactionMultithreadingUpgrades: number;
  maxLoanAmountUpgrades: number;
  expandCurrencyUpgrades: number;
  quantumStabilityUpgrades: number;
};

type Actions = {
  setTicks: (ticks: GameStore["ticks"]) => void;

  setTransactionQueue: (queue: GameStore["transactionQueue"]) => void;
  // pushToTransactionQueue: (transaction: [Decimal, EpochTimeStamp]) => void;

  buyTransactionSpeedUpgrade: () => void;
  buyTransactionValidationSpeedUpgrade: () => void;
  buyTransactionMultithreadingUpgrade: () => void;
  buyMaxLoanAmountUpgrade: () => void;
  buyExpandCurrencyUpgrade: () => void;
  buyQuantumStabilityUpgrade: () => void;

  startTick: () => void;
};

const useStore = create<GameStore & Actions>((set) => ({
  ticks: 0,
  transactionsComplete: 0,
  transactionsPending: 0,
  transactionsPerTick: new Decimal(0.1),
  transactionAccumulator: new Decimal(0),
  transactionValidationSpeed: 2000,

  transactionQueue: [],

  transactionSpeedUpgrades: 0,
  transactionValidationSpeedUpgrades: 0,
  transactionMultithreadingUpgrades: 0,
  maxLoanAmountUpgrades: 0,
  expandCurrencyUpgrades: 0,
  quantumStabilityUpgrades: 0,

  setTicks: (ticks: GameStore["ticks"]) => set({ ticks: ticks }),

  setTransactionQueue: (queue: GameStore["transactionQueue"]) =>
    set(() => ({ transactionQueue: queue })),
  // pushToTransactionQueue: (transaction: [Decimal, EpochTimeStamp]) =>
  //   set((state) => ({
  //     transactionQueue: [...state.transactionQueue, transaction],
  //   })),

  buyTransactionSpeedUpgrade: () =>
    set((state) => ({
      transactionsComplete: state.transactionsComplete - 40,
      transactionSpeedUpgrades: state.transactionSpeedUpgrades + 1,
    })),
  buyTransactionValidationSpeedUpgrade: () =>
    set((state) => ({
      transactionsComplete: state.transactionsComplete - 40,
      transactionValidationSpeedUpgrades:
        state.transactionValidationSpeedUpgrades + 1,
    })),
  buyTransactionMultithreadingUpgrade: () =>
    set((state) => ({
      transactionsComplete: state.transactionsComplete - 40,
      transactionMultithreadingUpgrades:
        state.transactionMultithreadingUpgrades + 1,
    })),
  buyMaxLoanAmountUpgrade: () =>
    set((state) => ({
      transactionsComplete: state.transactionsComplete - 40,
      maxLoanAmountUpgrades: state.maxLoanAmountUpgrades + 1,
    })),
  buyExpandCurrencyUpgrade: () =>
    set((state) => ({
      transactionsComplete: state.transactionsComplete - 40,
      expandCurrencyUpgrades: state.expandCurrencyUpgrades + 1,
    })),
  buyQuantumStabilityUpgrade: () =>
    set((state) => ({
      transactionsComplete: state.transactionsComplete - 40,
      quantumStabilityUpgrades: state.quantumStabilityUpgrades + 1,
    })),

  startTick: () =>
    set((state) => {
      let completedTransactionsAmount = new Decimal(0);
      const currentTime: EpochTimeStamp = Date.now();

      // Remove the pending transactions if their time has passed
      const filteredQueue = state.transactionQueue.filter((transaction) => {
        if (state.transactionValidationSpeed + transaction[1] < currentTime) {
          completedTransactionsAmount = completedTransactionsAmount.plus(
            transaction[0],
          );

          return false;
        }

        return true;
      });

      const totalAccumulated = state.transactionAccumulator.plus(
        state.transactionsPerTick.add(1 * state.transactionSpeedUpgrades),
      );

      state.setTransactionQueue([
        ...filteredQueue,
        [totalAccumulated, Date.now()],
      ]);

      return {
        ticks: state.ticks + 1,
        transactionsComplete:
          state.transactionsComplete +
          completedTransactionsAmount.floor().toNumber(),
        transactionsPending: filteredQueue.length,
        transactionAccumulator: totalAccumulated.mod(1),
      };
    }),
}));

function useCurrentTransactionsPerTick(): Decimal {
  const transactionsPerTick = useStore((state) => state.transactionsPerTick);
  const transactionSpeedUpgrades = useStore(
    (state) => state.transactionSpeedUpgrades,
  );

  return transactionsPerTick.add(1 * transactionSpeedUpgrades);
}

function App() {
  const ticks = useStore((state) => state.ticks);
  const transactionsComplete = useStore((state) => state.transactionsComplete);
  const transactionsPending = useStore((state) => state.transactionsPending);
  const transactionSpeedUpgrades = useStore(
    (state) => state.transactionSpeedUpgrades,
  );
  const transactionAccumulator = useStore(
    (state) => state.transactionAccumulator,
  );
  const startTick = useStore((state) => state.startTick);
  const buyTransactionSpeedUpgrade = useStore(
    (state) => state.buyTransactionSpeedUpgrade,
  );

  const currentTransactionsPerTick = useCurrentTransactionsPerTick();

  useEffect(() => {
    const intervalLoop = setInterval(() => startTick(), 100);

    return () => clearInterval(intervalLoop);
  }, [startTick]);

  return (
    <div style={{ padding: "1em" }}>
      <pre style={{ fontFamily: "monospace", margin: 0 }}>
        <Stage1
          data={[
            "s",
            "s",
            "s",
            "s",
            "s",
            "s",
            "s",
            "s",
            "s",
            "s",
            "s",
            "s",
            "s",
            "s",
            "s",
            "s",
            "s",
            "s",
            "s",
            "s",
          ]}
        />
      </pre>

      <p>
        Ticks: {ticks}
        <br />
        Accumulator: {transactionAccumulator.toNumber()}
        <br />
        Transactions per tick: {currentTransactionsPerTick.toNumber()}
        <br />
        Transactions complete: {transactionsComplete}
        <br />
        Transactions pending: {transactionsPending}
        <br />
        <br />
        Transaction upgrades:
        <br />
        Transaction speed: {transactionSpeedUpgrades}
      </p>

      <button
        type="button"
        onClick={() => buyTransactionSpeedUpgrade()}
        disabled={transactionsComplete - 40 < 0}
      >
        <p>Transaction speed upgrade</p>
        <p>40tC</p>
      </button>
    </div>
  );
}

export default App;
