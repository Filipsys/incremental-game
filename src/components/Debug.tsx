import { useStore } from "../store/mainStore";
import { BigNumber } from "../BigNumber";

export const Debug: React.FC = () => {
  const setFunds = useStore((state) => state.setFunds);
  const setTransactionSpeedUpgrade = useStore(
    (state) => state.setTransactionSpeedUpgrade,
  );
  const setTransactionValidationSpeed = useStore(
    (state) => state.setTransactionValidationSpeedUpgrade,
  );

  const slowTicks = useStore((state) => state.slowTicks);
  const setSlowTicks = useStore((state) => state.setSlowTicks);

  return (
    <div
      style={{
        position: "absolute",
        display: "flex",
        flexDirection: "column",
        top: 0,
        right: 0,
      }}
    >
      <p>Debug menu</p>

      <div>
        <input
          type="checkbox"
          onChange={(event) => setSlowTicks(event.target.checked)}
        />
        <label htmlFor="">Slow ticks</label>
      </div>

      <div>
        <label htmlFor="">Funds: </label>
        <input
          type="text"
          onChange={(event) => {
            if (event.currentTarget.value === "") return;

            const stringNumber = event.currentTarget.value.toString();

            if (stringNumber.includes("e")) {
              const [base, exponent] = stringNumber.split("e");

              setFunds(new BigNumber(Number(base), BigInt(exponent)));
              return;
            }

            setFunds(new BigNumber(event.currentTarget.value));
          }}
        />
      </div>

      <p>Upgrades:</p>

      <div>
        <label htmlFor="">Transaction speed: </label>
        <input
          type="number"
          onChange={(event) => {
            if (event.currentTarget.value !== "") {
              setTransactionSpeedUpgrade(Number(event.currentTarget.value));
            }
          }}
        />
      </div>
      <div>
        <label htmlFor="">Transaction validation speed: </label>
        <input
          type="number"
          onChange={(event) => {
            if (event.currentTarget.value !== "") {
              setTransactionValidationSpeed(Number(event.currentTarget.value));
            }
          }}
        />
      </div>
    </div>
  );
};
