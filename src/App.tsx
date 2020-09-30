import React from "react";
import { useState, useEffect } from "react";
import { Story, Meta } from "@storybook/react/types-6-0";
import { storiesOf } from "@storybook/react";

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
      const json = (await res.json()) as { hash: string };
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
          height={window.innerHeight}
        />
      );
    }
    return null;
  };
  return <div>{renderSvg()}</div>;
};

const renderLilyTemplate = (lilyMarkup: string): string => {
  console.log("renderLilyTemplate", lilyMarkup);
  return `
        #(set-global-staff-size 50)
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

export const story = (name: string, data: string): Story => {
  const Template: Story = (args) => <Lily data={renderLilyTemplate(data)} />;
  const Story = Template.bind({});
  Story.storyName = name;
  return Story;
};
export const stories = (title: string): Meta => {
  return { title };
};
