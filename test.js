const { SaxEventType, SAXParser } = require("sax-wasm");
const fs = require("fs");
const path = require("path");

const saxPath = require.resolve("sax-wasm/lib/sax-wasm.wasm");

const buffer = fs.readFileSync(saxPath);

const options = { highWaterMark: 32 * 1024 };
const parser = new SAXParser(SaxEventType.CloseTag, options);

const content = `📚<div href="./123/123">hey there</div>`;

parser.eventHandler = (event, data) => {
  if (event === SaxEventType.CloseTag) {
    const { start, end } = data.attributes[0].value;

    const res = replaceBetween({ content, start, end, replacement: "234" });

    console.log(res)
  }
};

parser.prepareWasm(buffer).then((ready) => {
  if (ready) {
    const readable = fs.createReadStream(
      path.resolve(path.resolve(".", "template.html")),
      options
    );
    readable.on("data", (chunk) => {
      parser.write(chunk);
    });
    readable.on("end", () => parser.end());
  }
});

// HTML recognises the following emoji has being comprised of two unicode characters.
function replaceBetween({ content, start, end, replacement = "" }) {
  const lines = content.split("\n");
  const i = start.line;
  const line = lines[i];
  const upToChange = line.slice(0, start.character);
  const afterChange = line.slice(end.character);

  lines[i] = `${upToChange}${replacement}${afterChange}`;

  return lines.join("\n");
}
