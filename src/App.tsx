import { useEffect } from "react";
import { create } from "zustand";
import { Stage1 } from "./components/machines/stage1";

import Decimal from "decimal.js";

type GameStore = {
  ticks: number;
  transactionsComplete: number;
  transactionsPerTick: Decimal;
  transactionAccumulator: Decimal;
  transactionValidationSpeed: Decimal;

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
  transactionsPerTick: new Decimal(0.1),
  transactionAccumulator: new Decimal(0),
  transactionValidationSpeed: new Decimal(5.0),

  transactionSpeedUpgrades: 0,
  transactionValidationSpeedUpgrades: 0,
  transactionMultithreadingUpgrades: 0,
  maxLoanAmountUpgrades: 0,
  expandCurrencyUpgrades: 0,
  quantumStabilityUpgrades: 0,

  setTicks: (ticks: number) => set({ ticks: ticks }),

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
      const totalAccumulated = state.transactionAccumulator.plus(
        state.transactionsPerTick.add(1 * state.transactionSpeedUpgrades),
      );

      return {
        ticks: state.ticks + 1,
        transactionsComplete:
          state.transactionsComplete + totalAccumulated.floor().toNumber(),
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
        Transactions: {transactionsComplete}
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
