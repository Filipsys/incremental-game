import Decimal from "decimal.js";
import { useStore } from "../store/mainStore";

export const Debug: React.FC = () => {
  const setFunds = useStore((state) => state.setFunds);

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

      {/* <div>
        <label htmlFor="tpt">Transactions per tick: </label>
        <input name="tpt" type="number" />
      </div> */}

      <div>
        <label htmlFor="tpt">Funds: </label>
        <input
          name="tpt"
          type="number"
          onChange={(event) => {
            if (event.currentTarget.value !== "") {
              setFunds(new Decimal(event.currentTarget.value));
            }
          }}
        />
      </div>

      <p>Upgrades:</p>
      <div>
        <label htmlFor="tpt">Transaction speed: </label>
        <input name="tpt" type="number" />
      </div>
    </div>
  );
};
