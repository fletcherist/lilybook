import React, { useEffect, useState } from "react";
import { lickBass, theme1 } from "./Test";

// {
//   \\override NoteHead.output-attributes =
//       #'((id . 123)
//       (class . "this that")
//       (data-whatever . something))
//       <<
//         ${lilyMarkup}
//       >>

//   }
const renderLilyTemplate = (lilyMarkup: string): string => {
  console.log("renderLilyTemplate", lilyMarkup);
  return `
\\version "2.20.0"

\\score {
    <<
      ${lilyMarkup}
    >>
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
      return (
        <img
          src={`http://localhost:8080/${hash}`}
          width={300}
          height={300}
        />
      );
      // return (
      //   <div
      //     style={{
      //       background: `url(http://localhost:8080/${hash})`,
      //       backgroundSize: "contain",
      //       backgroundRepeat: "no-repeat",
      //       height: "100%",
      //       width: "100%",
      //     }}
      //   />
      // );
    }
    return null;
  };
  return (
    <div
      style={{
        backgroundColor: "rgba(0,0,0,0.01)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderBottom: "1px solid rgba(0,0,0,0.1)",
        width: "100%",
        height: 300,
      }}
    >
      {renderSvg()}
    </div>
  );
};
const App: React.FC = () => {
  return (
    <div>
      <Lily data={renderLilyTemplate(theme1)} />
      <Lily data={renderLilyTemplate(lickBass.join(" "))} />
    </div>
  );
};

export default App;
