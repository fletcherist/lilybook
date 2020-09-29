import React from "react";
import { useState, useEffect } from "react";
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from "@storybook/react/types-6-0";

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

// \\layout {
//     clip-regions
//     = #(list
//         (cons
//           (make-rhythmic-location 1 0 0)
//           (make-rhythmic-location 999 0 1)))
//   }
const renderLilyTemplate = (lilyMarkup: string): string => {
  console.log("renderLilyTemplate", lilyMarkup);
  return `
#(set-global-staff-size 30)
\\version "2.20.0"
\\language "english"
\\header {
    title = ""
    composer = ""
    tagline = "" % remove footer
  }
\\score {
    <<
      ${lilyMarkup}
    >>
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
          // width={300}
          //   width={""}
          height={window.innerHeight}
        /> // height={300}
        //   width={"100%"}
        //   height={"100%"}
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
        // backgroundColor: "rgba(0,0,0,0.01)",
        // borderBottom: "1px solid rgba(0,0,0,0.1)",
        display: "flex",
        // alignItems: "center",
        // justifyContent: "center",
        width: "100%",
        height: "100%",
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
      {/* <Lily data={renderLilyTemplate(lickBass.join(" "))} /> */}
    </div>
  );
};

export default {
  title: "Chords/Chords",
  component: App,
  argTypes: {
    backgroundColor: { control: "color" },
  },
} as Meta;

const Template: Story = (args) => <App {...args} />;
Template.storyName = "fmaj9";
export const Primary = Template.bind({});
Primary.storyName = "fmaj9";
Primary.args = {
  primary: true,
  label: "Button123123",
};
