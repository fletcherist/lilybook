import { serve, ServerRequest } from "https://deno.land/std/http/server.ts";
import { createHash } from "https://deno.land/std/hash/mod.ts";

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
  await Deno.writeTextFile(`./${lilyFilePath}`, lilyText);
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

  const svgFilePath = `./${outputDir}/${layerName}-from-1.0.1-to-999.0.1-clip.svg`;
  const svgFileText = await Deno.readTextFile(svgFilePath);
  const newSvgFileText = svgFileText
    .replaceAll("<![CDATA[", "")
    .replaceAll("tspan { white-space: pre; }", "")
    .replaceAll('<style text="style/css">', "");
  await Deno.writeTextFile(svgFilePath, newSvgFileText);
  return newSvgFileText;
};

const handle = async (req: ServerRequest): Promise<void> => {
  const defaultHeaders: Record<string, string> = {
    "Access-Control-Allow-Headers": "*",
    "Access-Control-Allow-Origin": "*",
  };
  const headers = new Headers({
    ...defaultHeaders,
  });
  if (req.method === "GET") {
    const svgFilePath = `./output/temp-from-1.0.1-to-999.0.1-clip.svg`;
    const svgFileText = await Deno.readTextFile(svgFilePath);
    return await req.respond({
      status: 200,
      headers: new Headers({
        ...defaultHeaders,
        "content-type": "image/svg+xml .svg .svgz",
      }),
      body: svgFileText,
    });
    // await req.respond({ status: 404, headers });
  } else if (req.method === "POST") {
    const buf = await Deno.readAll(req.body);
    const text = new TextDecoder().decode(buf);

    // const hash = createHash("md5");
    // hash.update(text)

    // console.log(text);
    const svg = await handleLilyMarkup(text);

    return await req.respond({
      status: 200,
      headers,
      body: JSON.stringify({
        path: svg,
      }),
    });
  }
  await req.respond({ status: 403, headers });
};
export const createServer = async (port: number): Promise<void> => {
  const addr: string = `:${port}`;
  const s = serve(addr);
  console.log(`server is running on ${addr}`);
  for await (const req of s) {
    handle(req).catch(console.error);
  }
};

await createServer(8080);
