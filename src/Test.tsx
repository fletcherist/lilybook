import {
  group,
  absolute,
  beam,
  note4,
  dot,
  note8,
  note16,
  staff,
  relative,
} from "./lib";

const lick = group(
  beam(note8("d"), note8("e"), note8("f"), note8("g")),
  note4("e"),
  note8("c"),
  note8("d"),
);

export const theme1 = staff({
  clef: "treble",
  key: ["a", "minor"],
  time: "4/4",
}, lick);

export const lickBass = group(
  absolute(
    beam(
      note4("f"),
      note4("g"),
      note4("a"),
      note4("d"),
    ),
  ),
);
