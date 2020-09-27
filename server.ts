import { serve, ServerRequest } from "https://deno.land/std/http/server.ts";
// https://deno.land/std@0.71.0/http/file_server.ts

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
// const expr = `
// \\version "2.20.0"
// \\header {
//     title = ""
//     composer = ""
//     tagline = "" % remove footer
// }
// \\score {
//     \\relative c' {
//       c d e f g a bes c d ees8( e) c4 b c~ c1
//     }
//     \\layout {
//       clip-regions
//       = #(list
//           (cons
//            (make-rhythmic-location 1 0 0)
//            (make-rhythmic-location 999 0 1)))
//     }
// }
// `;

const handleLilyMarkup = async (lilyText: string): Promise<string> => {
  const layerName = "temp";
  const outputDir = "output";
  const outputPath = `${outputDir}/${layerName}`;
  const lilyFilePath = `${outputDir}/${layerName}.ly`;
  try {
    await Deno.remove(`${outputDir}`, { recursive: true });
  } catch (error) {
    console.log(error);
  }
  await Deno.mkdir(outputDir);
  const file = await Deno.writeTextFile(`./${lilyFilePath}`, lilyText);
  const p = Deno.run({
    cmd: [
      "lilypond",
      "-dbackend=svg",
      "-dclip-systems",
      `--output=${outputPath}`,
      lilyFilePath,
    ],
    stdout: "piped",
  });

  const status = await p.status();
  console.log("status:", status);

  const svgFilePath =
    `./${outputDir}/${layerName}-from-1.0.1-to-999.0.1-clip.svg`;
  const svgFileText = await Deno.readTextFile(svgFilePath);
  const newSvgFileText = svgFileText
    .replaceAll("<![CDATA[", "")
    .replaceAll("tspan { white-space: pre; }", "")
    .replaceAll('<style text="style/css">', "");
  await Deno.writeTextFile(svgFilePath, newSvgFileText);
  return newSvgFileText;
};

const handle = async (req: ServerRequest): Promise<void> => {
  if (req.method === "post") {
    return await req.respond({
      status: 200,
      body: JSON.stringify({
        path: "123",
      }),
    });
  }
  await req.respond({
    status: 404,
  });
};
export const server = (
  port: number,
): {
  close: () => void;
  run: () => Promise<void>;
} => {
  const addr: string = `:${port}`;
  const s = serve(addr);
  console.log(`server is running on ${addr}`);
  const run = async (): Promise<void> => {
    for await (const req of s) {
      handle(req).catch(console.error);
    }
  };
  return { close: () => s.close(), run };
};

server(8080);
