import React, { useEffect } from "react";
// import logo from "./logo.svg";
import "./App.css";

const expr = `
\\version "2.20.0"
\\header {
    title = ""
    composer = ""
    tagline = "" % remove footer
}
\\score {
    \\relative c' {
      c d e f g a bes c d ees8( e) c4 b
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
        height: 100,
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
