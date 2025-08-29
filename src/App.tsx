import { useEffect } from "react";
import { useStore } from "./store/mainStore";
import { Stage1 } from "./components/machines/Stage1";
import { Debug } from "./components/Debug";
import { BigNumber } from "./BigNumber";
import { NotationPicker } from "./components/NotationPicker";
import { calculateValidationSpeed } from "./utils/utils";

import type Decimal from "decimal.js";

function useCurrentTransactionsPerTick(): Decimal {
  const transactionsPerTick = useStore((state) => state.transactionsPerTick);
  const transactionSpeedUpgrades = useStore(
    (state) => state.transactionSpeedUpgrades,
  );

  return transactionsPerTick.add(1 * transactionSpeedUpgrades);
}

// const createTransactionDetails = (): TransctionDetails => {
//   return {
//     senderID: "ABC",
//     senderName: NAMES[Math.floor(Math.random() * NAMES.length)],
//     senderSurname: SURNAMES[Math.floor(Math.random() * SURNAMES.length)],
//     recieverID: "ABC",
//     recieverName: NAMES[Math.floor(Math.random() * NAMES.length)],
//     recieverSurname: SURNAMES[Math.floor(Math.random() * SURNAMES.length)],

//     transactionID: "ABC",
//     transactionState: "pending",
//     transactionType: "SEND",
//     transactionAmount: 100,
//     currency: "EUR",
//     timestamp: Date.now(),
//   };
// };

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
  const transactionQueue = useStore((state) => state.transactionQueue);
  const transactionQueueThreshold = useStore(
    (state) => state.transactionQueueThreshold,
  );
  const transactionQueueMaxAmount = useStore(
    (state) => state.transactionQueueMaxAmount,
  );
  const transactionQueueAccumulator = useStore(
    (state) => state.transactionQueueAccumulator,
  );
  const startTick = useStore((state) => state.startTick);
  const transactionValidationSpeedUpgrades = useStore(
    (state) => state.transactionValidationSpeedUpgrades,
  );
  const buyTransactionSpeedUpgrade = useStore(
    (state) => state.buyTransactionSpeedUpgrade,
  );
  const buyTransactionValidationSpeed = useStore(
    (state) => state.buyTransactionValidationSpeedUpgrade,
  );

  // Game tick loop
  const slowTicks = useStore((state) => state.slowTicks);

  useEffect(() => {
    const intervalLoop = setInterval(() => startTick(), slowTicks ? 1000 : 100);

    return () => clearInterval(intervalLoop);
  }, [slowTicks, startTick]);

  return (
    <div style={{ padding: "1em" }}>
      <Debug />
      {/*<pre style={{ fontFamily: "monospace", margin: 0 }}>
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
      </pre>*/}
      <NotationPicker />
      <p>
        Ticks: {ticks}
        <br />
        Accumulator: {transactionAccumulator.toNumber()}
        <br />
        Transactions per tick: {currentTransactionsPerTick.toNumber()}
        <br />
        Transaction queue max amount: {transactionQueueMaxAmount}
        <br />
        Current transaction queue length: {transactionQueue.length}
        <br />
        Transaction queue threshold: {transactionQueueThreshold}
        <br />
        Transaction queue accumulator: {transactionQueueAccumulator}
        <br />
        Transaction validation speed: {calculateValidationSpeed().toNumber()}
        ms
        <br />
        Transactions complete: {transactionsComplete.currentNotation()}
        <br />
        Transactions pending: {transactionsPending.currentNotation()}
        <br />
        Funds: {funds.currentNotation()} EUR
        <br />
        <br />
        Transaction upgrades:
        <br />
        Transaction speed: {transactionSpeedUpgrades}
        <br />
        Transaction validation speed: {transactionValidationSpeedUpgrades}
      </p>
      <button
        type="button"
        onClick={() => buyTransactionSpeedUpgrade()}
        disabled={funds.subtract(new BigNumber(40)).lessThan(new BigNumber(0))}
      >
        <p>Transaction speed upgrade</p>
        <p>40 EUR</p>
      </button>{" "}
      <button
        type="button"
        onClick={() => buyTransactionValidationSpeed()}
        disabled={funds.subtract(new BigNumber(120)).lessThan(new BigNumber(0))}
      >
        <p>Transaction validation speed upgrade</p>
        <p>120 EUR</p>
      </button>
    </div>
  );
}

export default App;
