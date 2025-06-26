import { useStore } from "../store/mainStore";

export const NotationPicker = () => {
  const changeNotation = useStore((state) => state.changeNotation);

  return (
    <div>
      <input
        defaultChecked
        type="radio"
        id="standardNotation"
        name="notationType"
        onChange={() => changeNotation("standard")}
      />
      <label htmlFor="standardNotation">Standard</label>
      <input
        type="radio"
        id="scientificNotation"
        name="notationType"
        onChange={() => changeNotation("scientific")}
      />
      <label htmlFor="scientificNotation">Scientific</label>
    </div>
  );
};
