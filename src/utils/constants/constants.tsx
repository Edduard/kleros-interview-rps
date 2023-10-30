export type Move = {
  name: string;
  value: number;
  imageSrc: any;
};

export const undisclosedMove: Move = {
  name: "Not played",
  value: -1,
  imageSrc: require("./../../assets/moves/hidden.png"),
};

export const emptyMove: Move = {
  name: "Null",
  value: 0,
  imageSrc: require("./../../assets/moves/not-played.png"),
};

export const availableMoves: Move[] = [
  {
    name: "Rock",
    value: 1,
    imageSrc: require("./../../assets/moves/rock.png"),
  },
  {
    name: "Paper",
    value: 2,
    imageSrc: require("./../../assets/moves/paper.png"),
  },
  {
    name: "Scissors",
    value: 3,
    imageSrc: require("./../../assets/moves/scissors.png"),
  },
  {
    name: "Spock",
    value: 4,
    imageSrc: require("./../../assets/moves/spock.png"),
  },
  {
    name: "Lizard",
    value: 5,
    imageSrc: require("./../../assets/moves/lizard.png"),
  },
];
