import React, { useEffect, useState } from "react";

type Pitch = "c" | "d" | "e" | "f" | "g" | "a" | "b";
type Duration = 1 | 2 | 4 | 8 | 16 | 32;
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

const group = (...notes: Array<string | string[]>): string[] => {
  return [...notes.flat()];
};

const lick = group(
  beam(note8("d"), note8("e"), note8("f"), note8("g"), note4("e")),
  beam(note8("c"), note8("d")),
  rest(4),
);

const lickBass = group(
  note4("f"),
  note4("g"),
  note4("a"),
  note4("d"),
);

// const expr = `
// \\header {
//     title = ""
//     composer = ""
//     tagline = "" % remove footer
// }
// \\score {
//     {
//     \\once \\override NoteHead.output-attributes =
//         #'((id . 123)
//         (class . "this that")
//         (data-whatever . something))
//         d
//     }
//     \\layout {}
// }`;
const renderLilyTemplate = (lilyMarkup: string): string => {
  return `
\\version "2.20.0"
\\header {
    title = ""
    composer = ""
    tagline = "" % remove footer
}
\\score {
    \\relative c' {
      ${lilyMarkup}
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
};

const Lily: React.FC<{
  data: string;
}> = ({ data }) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hash, setHash] = useState<string | undefined>(undefined);
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const res = await fetch("http://localhost:8080", {
        body: data,
        method: "POST",
      });
      const json = await res.json() as { hash: string };
      setIsLoading(false);
      setHash(json.hash);
      console.log(json);
    };
    fetchData();
  }, [setIsLoading, setHash, data]);
  const renderSvg = () => {
    if (isLoading) {
      return null;
    }
    if (hash) {
      return <img
        src={`http://localhost:8080/${hash}`}
        height="100%"
        width="100%"
      />;
    }
    return null;
  };
  return (
    <div
      style={{
        height: 200,
        width: 400,
        backgroundColor: "rgba(0,0,0,0.05)",
        display: "flex",
        alignItems: "center",
        padding: "1rem",
      }}
    >
      {renderSvg()}
    </div>
  );
};
const App: React.FC = () => {
  return (
    <div>
      <Lily data={renderLilyTemplate(lick.join(" "))} />
      <Lily data={renderLilyTemplate(lickBass.join(" "))} />
    </div>
  );
};

export default App;
