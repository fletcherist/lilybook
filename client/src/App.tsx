import React, { useEffect } from "react";

type Pitch = "c" | "d" | "e" | "f" | "g" | "a" | "b";
export const note = (
  pitch: Pitch,
  duration: 1 | 2 | 4 | 8 | 16 | 32
): string => {
  if (duration) {
    return `${pitch}${duration}`;
  }
  return pitch;
};
export const note2 = (pitch: Pitch): string => note(pitch, 2);
export const note4 = (pitch: Pitch): string => note(pitch, 4);
export const note8 = (pitch: Pitch): string => note(pitch, 8);
export const note16 = (pitch: Pitch): string => note(pitch, 16);

export const dot = (note: string): string => {
  return `${note}.`;
};

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

const group = (...notes: Array<string | string[]>): string[] => {
  return [...notes.flat()];
};

const lick = group(
  beam(note8("d"), note8("e"), note8("f"), note8("g"), note4("e")),
  beam(note8("c"), note8("d"))
);

const expr = `
\\version "2.20.0"
\\header {
    title = ""
    composer = ""
    tagline = "" % remove footer
}
\\score {
    \\relative c' {
      ${lick.join(" ")}
    }
    \\layout {
      clip-regions
      = #(list
          (cons
           (make-rhythmic-location 1 0 0)
           (make-rhythmic-location 999 0 1)))
    }
}
`;
const App: React.FC = () => {
  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch("http://localhost:8080", {
        body: expr,
        method: "POST",
      });
      const json = await res.json();
      console.log(json);
    };
    fetchData();
  }, []);
  return (
    <div
      style={{
        height: 200,
        width: 400,
        backgroundColor: "rgba(0,0,0,0.1)",
        display: "flex",
        alignItems: "center",
        padding: "1rem",
      }}
    >
      <img src={`http://localhost:8080`} height="100%" width="100%" />
    </div>
  );
};

export default App;
