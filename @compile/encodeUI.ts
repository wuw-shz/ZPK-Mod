import * as fs from "fs";
import * as utf8 from "utf8";
import { config } from "../config";

export const encodeUIConfig: {
  sourceDir: string;
  buildDir: string;
  excludeDir?: string[];
  excludeFiles?: string[];
} = {
  sourceDir: "./resource_packs/RPG-Server-Dev/ui",
  buildDir: "./resource_packs/RPG-Server/ui",
};
export function encodeUI(dir: fs.PathLike, outDir: string): () => void {
  if (!config.ENCRYPTOR) return () => {};
  dir = dir + "/ui";
  outDir = outDir + "/ui";
  return () => {
    try {
      fs.rmdirSync(outDir, {
        recursive: true,
      });
    } catch {}
    try {
      fs.mkdirSync(outDir);
    } catch {}
    let files = fs.readdirSync(dir);
    for (let file of files) {
      let fileName = file + "";
      if (!fileName.includes(".") && !(encodeUIConfig.excludeDir || []).includes(fileName)) {
        try {
          fs.mkdirSync(outDir + "/" + fileName);
        } catch {}
        encodeUI(dir + "/" + fileName, outDir + "/" + fileName);
      } else
        try {
          if (fileName.endsWith(".json") && !encodeUIConfig.excludeFiles?.includes(fileName)) {
            let ignored = fs.readFileSync("./ignorelist.txt") + "";
            let jsonStr = fs.readFileSync(dir + "/" + fileName) + "";

            (jsonStr.match(/\"[\da-zA-Z_\+\-\*\/]*\"\:/g) || []).forEach((m, i) => {
              if (ignored.includes(m)) return;
              m = m.replace('"', "");
              m = m.replace('"', "");
              m = m.replace(":", "");
              jsonStr = jsonStr.split(m).join(`${getRandomChinese(m)}`);
            });

            for (let loop = 0; loop < 10; loop++) {
              jsonStr = utf8.encode(jsonStr); // Y
              jsonStr = jsonStr.split("Â").join("");
            }

            let contents = jsonStr.split("\n");
            let newContents = "";
            for (let i = 0; i < contents.length; i++) {
              let line = contents[i].trim();
              let key = line.match(/\"[^"]*"|'[^']*'/g);
              if (!key) {
                newContents += line + "\n";
                continue;
              }
              newContents += commentLine(
                line.replace(
                  key[0].replace('"', "").replace('"', ""),
                  unicodeEscape(key[0].replace('"', "").replace('"', ""))
                ) + "\n"
              );
            }

            fs.writeFileSync(outDir + "/" + fileName, newContents);
          } else {
            fs.copyFileSync(dir + "/" + fileName, outDir + "/" + fileName);
          }
        } catch (err) {
          console.log(err);
        }
    }
  };
}

function getRandomChinese(str: string): string {
  const start = 0x4e00;
  const end = 0x9fff;
  let result = "";
  for (let i = 0; i < str.length; i++) {
    result += String.fromCodePoint(Math.floor(Math.random() * (end - start + 1)) + start);
  }
  return result;
}

const unicodeEscape = (str: string) => {
  let result = "";
  let charCode = str.charCodeAt(0);
  for (let i = 0; !isNaN(charCode); i++) {
    result += "\\u" + ("0000" + charCode.toString(16)).slice(-4);
    charCode = str.charCodeAt(i + 1);
  }
  return result;
};

const randomCharStr = (length: number) => {
  let result = "";
  const getChar = () => {
    let result = String.fromCharCode(Math.random() * 500);
    return result ? result : getChar();
  };
  for (let i = 0; i < length; i++) result += getChar();
  return result;
};

const commentLine = (str: string) =>
  (Math.random() > Math.random() ? `/*${randomCharStr(Math.random() * 40 + 5)}*/` : "") +
  str +
  (Math.random() > Math.random() ? `/*${randomCharStr(Math.random() * 40 + 5)}*/` : "");
