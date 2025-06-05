import { useEffect } from "react";
import { useStore } from "./store/mainStore";
import { Stage1 } from "./components/machines/Stage1";

import type Decimal from "decimal.js";
import type { TransctionDetails } from "./types/main";
import { NAMES, SURNAMES } from "./assets/static";

function useCurrentTransactionsPerTick(): Decimal {
  const transactionsPerTick = useStore((state) => state.transactionsPerTick);
  const transactionSpeedUpgrades = useStore(
    (state) => state.transactionSpeedUpgrades,
  );

  return transactionsPerTick.add(1 * transactionSpeedUpgrades);
}

const createTransactionDetails = (): TransctionDetails => {
  return {
    senderID: "ABC",
    senderName: NAMES[Math.floor(Math.random() * NAMES.length)],
    senderSurname: SURNAMES[Math.floor(Math.random() * SURNAMES.length)],
    recieverID: "ABC",
    recieverName: NAMES[Math.floor(Math.random() * NAMES.length)],
    recieverSurname: SURNAMES[Math.floor(Math.random() * SURNAMES.length)],

    transactionID: "ABC",
    transactionState: "pending",
    transactionType: "SEND",
    transactionAmount: 100,
    currency: "EUR",
    timestamp: Date.now(),
  };
};

function App() {
  const ticks = useStore((state) => state.ticks);
  const funds = useStore((state) => state.funds);
  const currentTransactionsPerTick = useCurrentTransactionsPerTick();
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

  // Game tick loop
  useEffect(() => {
    const intervalLoop = setInterval(() => startTick(), 100);

    return () => clearInterval(intervalLoop);
  }, [startTick]);

  // console.log(createTransactionDetails());

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
        Funds: {funds.toNumber().toFixed(2)} EUR
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
