type Pitch = "c" | "d" | "e" | "f" | "g" | "a" | "b";
type Duration = 1 | 2 | 4 | 8 | 16 | 32;
type Time = "4/4" | "3/4";
type NestedArray = Array<string | string[]>;

export const note = (pitch: Pitch, duration: Duration): string => {
  if (duration) {
    return `${pitch}${duration}`;
  }
  return pitch;
};
export const note2 = (pitch: Pitch): string => note(pitch, 2);
export const note4 = (pitch: Pitch): string => note(pitch, 4);
export const note8 = (pitch: Pitch): string => note(pitch, 8);
export const note16 = (pitch: Pitch): string => note(pitch, 16);
// @todo: add double sharp
export const sharp = (note: string): string => `${note}/-sharp`;
// @todo: add double flat
export const flat = (note: string): string => `${note}/-flat`;

// Rest is a pause by given duration
export const rest = (duration: Duration) => {
  return `r${duration}`;
};

export const dot = (note: string): string => `${note}.`;

export const beam = (...notes: string[]): string[] => {
  return notes.map((note, index) => {
    const isFirstNote = index === 0;
    const isLastNote = index === notes.length - 1;
    if (isFirstNote) {
      return `${note}(`;
    } else if (isLastNote) {
      return `${note})`;
    }
    return note;
  });
};

export const absolute = (...notes: NestedArray): string => {
  return `\\absolute { ${notes.flat().join(" ")} }`;
};

export const relative = (...notes: NestedArray): string => {
  return `\\relative { ${notes.flat().join(" ")} }`;
};

export const group = (...notes: NestedArray): string[] => {
  return [...notes.flat()];
};

export const staff = (
  options: {
    clef: "treble" | "bass";
    time: Time;
    key: [Pitch, "major" | "minor"];
  },
  notes: string[]
) => {
  const [pitch, scale] = options.key;
  return `\\new Staff {
        \\clef ${options.clef}
        \\time ${options.time}
        \\key ${pitch} \\${scale}
        \\relative c' { ${notes.join(" ")} }
    }`;
};
