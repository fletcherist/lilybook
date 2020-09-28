import { group, absolute, beam, note4, dot, note8, note16, staff } from "./lib";

const notes1 = group(
  beam(note4("a"), `e'`),
  dot(note8("d")),
  note16("c"),
  note16("b"),
  note8("c"),
  note8("a"),
  note16("a"),
);

export const theme1 = staff({
  clef: "bass",
  key: ["a", "minor"],
  time: "4/4",
}, notes1);

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
