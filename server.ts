import { serve, ServerRequest } from "https://deno.land/std/http/server.ts";
import { createHash } from "https://deno.land/std/hash/mod.ts";
import { exists as dirExists } from "https://deno.land/std/fs/mod.ts";

const handleLilyMarkup = async (
  layerName: string,
  lilyText: string,
): Promise<string> => {
  const outputDir = "output";
  const outputPath = `${outputDir}/${layerName}`;
  const outputFilename = "out";
  const lilyInputFilePath = `${outputPath}/${outputFilename}.ly`;
  try {
    await Deno.remove(outputPath, { recursive: true });
  } catch (error) {
    console.log(error);
  }
  await Deno.mkdir(`${outputDir}/${layerName}`);
  await Deno.writeTextFile(`./${lilyInputFilePath}`, lilyText);
  const p = Deno.run({
    cmd: [
      "lilypond",
      "-dbackend=svg",
      // "-dclip-systems",
      `--output=${outputPath}`,
      lilyInputFilePath,
    ],
    stdout: "piped",
  });

  const status = await p.status();
  console.log("status:", status);

  // const svgFilePath =
  //   `./${outputDir}/${layerName}/${outputFilename}-from-1.0.1-to-999.0.1-clip.svg`;
  const svgFilePath = `./${outputDir}/${layerName}/${outputFilename}.svg`;
  const svgFileText = await Deno.readTextFile(svgFilePath);
  const newSvgFileText = svgFileText;
  // .replaceAll("<![CDATA[", "")
  // .replaceAll("tspan { white-space: pre; }", "")
  // .replaceAll('<style text="style/css">', "")
  // .replaceAll(`width="mm"`, `width="100px"`)
  // .replaceAll(`height="mm"`, `height="100px"`);
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
    const hash = req.url.replace("/", "");
    // const svgFilePath = `./output/${hash}/out-from-1.0.1-to-999.0.1-clip.svg`;
    const svgFilePath = `./output/${hash}/out.svg`;
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

    const layerName = createHash("md5").update(text).toString("hex");
    // was already cached, dont need to do anything, return cached version
    if (await dirExists(`./output/${layerName}`)) {
      console.log("cached", layerName);
      return await req.respond({
        status: 200,
        headers,
        body: JSON.stringify({
          hash: layerName,
        }),
      });
    }
    // process the input lily data and then return processed version
    await handleLilyMarkup(layerName, text);
    return await req.respond({
      status: 200,
      headers,
      body: JSON.stringify({
        hash: layerName,
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
