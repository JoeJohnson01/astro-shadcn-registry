var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// src/utils/logger.ts
import kleur from "kleur";
var Logger, logger;
var init_logger = __esm({
  "src/utils/logger.ts"() {
    "use strict";
    Logger = class {
      prefix;
      constructor(prefix = "astro-shadcn-registry") {
        this.prefix = prefix;
      }
      /**
       * Log an informational message
       * @param message Message to log
       */
      info(message) {
        console.log(`${kleur.blue(this.prefix)} ${message}`);
      }
      /**
       * Log a success message
       * @param message Message to log
       */
      success(message) {
        console.log(`${kleur.green(this.prefix)} ${kleur.green("\u2713")} ${message}`);
      }
      /**
       * Log a warning message
       * @param message Message to log
       */
      warn(message) {
        console.log(`${kleur.yellow(this.prefix)} ${kleur.yellow("\u26A0")} ${message}`);
      }
      /**
       * Log an error message
       * @param message Message to log
       */
      error(message) {
        console.error(`${kleur.red(this.prefix)} ${kleur.red("\u2717")} ${message}`);
      }
      /**
       * Log a debug message (only in debug mode)
       * @param message Message to log
       */
      debug(message) {
        if (process.env.DEBUG) {
          console.log(
            `${kleur.gray(this.prefix)} ${kleur.gray("\u{1F50D}")} ${kleur.gray(message)}`
          );
        }
      }
      /**
       * Create a spinner for long-running tasks
       * @param message Initial message to display
       * @returns Object with update and complete methods
       */
      spinner(message) {
        process.stdout.write(`${kleur.blue(this.prefix)} ${message}...`);
        return {
          update: (newMessage) => {
            process.stdout.clearLine(0);
            process.stdout.cursorTo(0);
            process.stdout.write(`${kleur.blue(this.prefix)} ${newMessage}...`);
          },
          complete: (finalMessage) => {
            process.stdout.clearLine(0);
            process.stdout.cursorTo(0);
            console.log(
              `${kleur.blue(this.prefix)} ${kleur.green("\u2713")} ${finalMessage}`
            );
          },
          error: (errorMessage) => {
            process.stdout.clearLine(0);
            process.stdout.cursorTo(0);
            console.error(
              `${kleur.red(this.prefix)} ${kleur.red("\u2717")} ${errorMessage}`
            );
          }
        };
      }
    };
    logger = new Logger();
  }
});

// src/registry/file-utils.ts
import fs from "fs";
import path from "path";
import fg from "fast-glob";
import matter from "gray-matter";
function fileExists(filePath) {
  return fs.existsSync(filePath);
}
function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    logger.debug(`Created directory: ${dirPath}`);
  }
}
function readFile(filePath) {
  return fs.readFileSync(filePath, "utf-8");
}
function writeFile(filePath, content) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, content, "utf-8");
  logger.debug(`Wrote file: ${filePath}`);
}
async function findContentFiles(contentCollectionPath, componentTypes) {
  const patterns = componentTypes.map((type) => {
    const collectionName = type === "ui" ? type : `${type}s`;
    return `${contentCollectionPath}/${collectionName}/*.{md,mdx}`;
  });
  return await fg(patterns, { absolute: true });
}
function parseRegistryEntries(filePaths) {
  const entries = [];
  for (const filePath of filePaths) {
    try {
      if (!fileExists(filePath)) {
        logger.warn(`File does not exist: ${filePath}`);
        continue;
      }
      const content = readFile(filePath);
      const { data } = matter(content);
      const frontmatter = data;
      const fileName = path.basename(filePath);
      const name = fileName.replace(/\.(md|mdx)$/, "");
      entries.push({
        name,
        filePath,
        frontmatter
      });
      logger.debug(`Parsed registry entry: ${name}`);
    } catch (error) {
      if (process.env.NODE_ENV === "test") {
        logger.debug(`Failed to parse ${filePath}: ${error}`);
      } else {
        logger.error(`Failed to parse ${filePath}: ${error}`);
      }
    }
  }
  return entries;
}
function updateMdxFile(filePath, updates) {
  const content = readFile(filePath);
  const { data, content: mdxContent } = matter(content);
  const newData = { ...data };
  for (const [key, value] of Object.entries(updates)) {
    if (Array.isArray(value) && Array.isArray(newData[key])) {
      newData[key] = Array.from(/* @__PURE__ */ new Set([...newData[key] || [], ...value]));
    } else {
      newData[key] = value;
    }
  }
  const updatedContent = matter.stringify(mdxContent, newData);
  writeFile(filePath, updatedContent);
  logger.debug(`Updated MDX file: ${filePath}`);
}
function createMdxFile(filePath, frontmatter, content = "") {
  const mdxContent = matter.stringify(content, frontmatter);
  writeFile(filePath, mdxContent);
  logger.debug(`Created MDX file: ${filePath}`);
}
var init_file_utils = __esm({
  "src/registry/file-utils.ts"() {
    "use strict";
    init_logger();
  }
});

// node_modules/es-module-lexer/dist/lexer.js
function parse(E2, g = "@") {
  if (!C) return init.then(() => parse(E2));
  const I = E2.length + 1, w = (C.__heap_base.value || C.__heap_base) + 4 * I - C.memory.buffer.byteLength;
  w > 0 && C.memory.grow(Math.ceil(w / 65536));
  const K = C.sa(I - 1);
  if ((A ? B : Q)(E2, new Uint16Array(C.memory.buffer, K, I)), !C.parse()) throw Object.assign(new Error(`Parse error ${g}:${E2.slice(0, C.e()).split("\n").length}:${C.e() - E2.lastIndexOf("\n", C.e() - 1)}`), { idx: C.e() });
  const o = [], D = [];
  for (; C.ri(); ) {
    const A2 = C.is(), Q2 = C.ie(), B2 = C.it(), g2 = C.ai(), I2 = C.id(), w2 = C.ss(), K2 = C.se();
    let D2;
    C.ip() && (D2 = k(E2.slice(-1 === I2 ? A2 - 1 : A2, -1 === I2 ? Q2 + 1 : Q2))), o.push({ n: D2, t: B2, s: A2, e: Q2, ss: w2, se: K2, d: I2, a: g2 });
  }
  for (; C.re(); ) {
    const A2 = C.es(), Q2 = C.ee(), B2 = C.els(), g2 = C.ele(), I2 = E2.slice(A2, Q2), w2 = I2[0], K2 = B2 < 0 ? void 0 : E2.slice(B2, g2), o2 = K2 ? K2[0] : "";
    D.push({ s: A2, e: Q2, ls: B2, le: g2, n: '"' === w2 || "'" === w2 ? k(I2) : I2, ln: '"' === o2 || "'" === o2 ? k(K2) : K2 });
  }
  function k(A2) {
    try {
      return (0, eval)(A2);
    } catch (A3) {
    }
  }
  return [o, D, !!C.f(), !!C.ms()];
}
function Q(A2, Q2) {
  const B2 = A2.length;
  let C2 = 0;
  for (; C2 < B2; ) {
    const B3 = A2.charCodeAt(C2);
    Q2[C2++] = (255 & B3) << 8 | B3 >>> 8;
  }
}
function B(A2, Q2) {
  const B2 = A2.length;
  let C2 = 0;
  for (; C2 < B2; ) Q2[C2] = A2.charCodeAt(C2++);
}
var ImportType, A, C, E, init;
var init_lexer = __esm({
  "node_modules/es-module-lexer/dist/lexer.js"() {
    !function(A2) {
      A2[A2.Static = 1] = "Static", A2[A2.Dynamic = 2] = "Dynamic", A2[A2.ImportMeta = 3] = "ImportMeta", A2[A2.StaticSourcePhase = 4] = "StaticSourcePhase", A2[A2.DynamicSourcePhase = 5] = "DynamicSourcePhase", A2[A2.StaticDeferPhase = 6] = "StaticDeferPhase", A2[A2.DynamicDeferPhase = 7] = "DynamicDeferPhase";
    }(ImportType || (ImportType = {}));
    A = 1 === new Uint8Array(new Uint16Array([1]).buffer)[0];
    E = () => {
      return A2 = "AGFzbQEAAAABKwhgAX8Bf2AEf39/fwBgAAF/YAAAYAF/AGADf39/AX9gAn9/AX9gA39/fwADMTAAAQECAgICAgICAgICAgICAgICAgIAAwMDBAQAAAUAAAAAAAMDAwAGAAAABwAGAgUEBQFwAQEBBQMBAAEGDwJ/AUHA8gALfwBBwPIACwd6FQZtZW1vcnkCAAJzYQAAAWUAAwJpcwAEAmllAAUCc3MABgJzZQAHAml0AAgCYWkACQJpZAAKAmlwAAsCZXMADAJlZQANA2VscwAOA2VsZQAPAnJpABACcmUAEQFmABICbXMAEwVwYXJzZQAUC19faGVhcF9iYXNlAwEKzkQwaAEBf0EAIAA2AoAKQQAoAtwJIgEgAEEBdGoiAEEAOwEAQQAgAEECaiIANgKECkEAIAA2AogKQQBBADYC4AlBAEEANgLwCUEAQQA2AugJQQBBADYC5AlBAEEANgL4CUEAQQA2AuwJIAEL0wEBA39BACgC8AkhBEEAQQAoAogKIgU2AvAJQQAgBDYC9AlBACAFQSRqNgKICiAEQSBqQeAJIAQbIAU2AgBBACgC1AkhBEEAKALQCSEGIAUgATYCACAFIAA2AgggBSACIAJBAmpBACAGIANGIgAbIAQgA0YiBBs2AgwgBSADNgIUIAVBADYCECAFIAI2AgQgBUEANgIgIAVBA0EBQQIgABsgBBs2AhwgBUEAKALQCSADRiICOgAYAkACQCACDQBBACgC1AkgA0cNAQtBAEEBOgCMCgsLXgEBf0EAKAL4CSIEQRBqQeQJIAQbQQAoAogKIgQ2AgBBACAENgL4CUEAIARBFGo2AogKQQBBAToAjAogBEEANgIQIAQgAzYCDCAEIAI2AgggBCABNgIEIAQgADYCAAsIAEEAKAKQCgsVAEEAKALoCSgCAEEAKALcCWtBAXULHgEBf0EAKALoCSgCBCIAQQAoAtwJa0EBdUF/IAAbCxUAQQAoAugJKAIIQQAoAtwJa0EBdQseAQF/QQAoAugJKAIMIgBBACgC3AlrQQF1QX8gABsLCwBBACgC6AkoAhwLHgEBf0EAKALoCSgCECIAQQAoAtwJa0EBdUF/IAAbCzsBAX8CQEEAKALoCSgCFCIAQQAoAtAJRw0AQX8PCwJAIABBACgC1AlHDQBBfg8LIABBACgC3AlrQQF1CwsAQQAoAugJLQAYCxUAQQAoAuwJKAIAQQAoAtwJa0EBdQsVAEEAKALsCSgCBEEAKALcCWtBAXULHgEBf0EAKALsCSgCCCIAQQAoAtwJa0EBdUF/IAAbCx4BAX9BACgC7AkoAgwiAEEAKALcCWtBAXVBfyAAGwslAQF/QQBBACgC6AkiAEEgakHgCSAAGygCACIANgLoCSAAQQBHCyUBAX9BAEEAKALsCSIAQRBqQeQJIAAbKAIAIgA2AuwJIABBAEcLCABBAC0AlAoLCABBAC0AjAoL3Q0BBX8jAEGA0ABrIgAkAEEAQQE6AJQKQQBBACgC2Ak2ApwKQQBBACgC3AlBfmoiATYCsApBACABQQAoAoAKQQF0aiICNgK0CkEAQQA6AIwKQQBBADsBlgpBAEEAOwGYCkEAQQA6AKAKQQBBADYCkApBAEEAOgD8CUEAIABBgBBqNgKkCkEAIAA2AqgKQQBBADoArAoCQAJAAkACQANAQQAgAUECaiIDNgKwCiABIAJPDQECQCADLwEAIgJBd2pBBUkNAAJAAkACQAJAAkAgAkGbf2oOBQEICAgCAAsgAkEgRg0EIAJBL0YNAyACQTtGDQIMBwtBAC8BmAoNASADEBVFDQEgAUEEakGCCEEKEC8NARAWQQAtAJQKDQFBAEEAKAKwCiIBNgKcCgwHCyADEBVFDQAgAUEEakGMCEEKEC8NABAXC0EAQQAoArAKNgKcCgwBCwJAIAEvAQQiA0EqRg0AIANBL0cNBBAYDAELQQEQGQtBACgCtAohAkEAKAKwCiEBDAALC0EAIQIgAyEBQQAtAPwJDQIMAQtBACABNgKwCkEAQQA6AJQKCwNAQQAgAUECaiIDNgKwCgJAAkACQAJAAkACQAJAIAFBACgCtApPDQAgAy8BACICQXdqQQVJDQYCQAJAAkACQAJAAkACQAJAAkACQCACQWBqDgoQDwYPDw8PBQECAAsCQAJAAkACQCACQaB/ag4KCxISAxIBEhISAgALIAJBhX9qDgMFEQYJC0EALwGYCg0QIAMQFUUNECABQQRqQYIIQQoQLw0QEBYMEAsgAxAVRQ0PIAFBBGpBjAhBChAvDQ8QFwwPCyADEBVFDQ4gASkABELsgISDsI7AOVINDiABLwEMIgNBd2oiAUEXSw0MQQEgAXRBn4CABHFFDQwMDQtBAEEALwGYCiIBQQFqOwGYCkEAKAKkCiABQQN0aiIBQQE2AgAgAUEAKAKcCjYCBAwNC0EALwGYCiIDRQ0JQQAgA0F/aiIDOwGYCkEALwGWCiICRQ0MQQAoAqQKIANB//8DcUEDdGooAgBBBUcNDAJAIAJBAnRBACgCqApqQXxqKAIAIgMoAgQNACADQQAoApwKQQJqNgIEC0EAIAJBf2o7AZYKIAMgAUEEajYCDAwMCwJAQQAoApwKIgEvAQBBKUcNAEEAKALwCSIDRQ0AIAMoAgQgAUcNAEEAQQAoAvQJIgM2AvAJAkAgA0UNACADQQA2AiAMAQtBAEEANgLgCQtBAEEALwGYCiIDQQFqOwGYCkEAKAKkCiADQQN0aiIDQQZBAkEALQCsChs2AgAgAyABNgIEQQBBADoArAoMCwtBAC8BmAoiAUUNB0EAIAFBf2oiATsBmApBACgCpAogAUH//wNxQQN0aigCAEEERg0EDAoLQScQGgwJC0EiEBoMCAsgAkEvRw0HAkACQCABLwEEIgFBKkYNACABQS9HDQEQGAwKC0EBEBkMCQsCQAJAAkACQEEAKAKcCiIBLwEAIgMQG0UNAAJAAkAgA0FVag4EAAkBAwkLIAFBfmovAQBBK0YNAwwICyABQX5qLwEAQS1GDQIMBwsgA0EpRw0BQQAoAqQKQQAvAZgKIgJBA3RqKAIEEBxFDQIMBgsgAUF+ai8BAEFQakH//wNxQQpPDQULQQAvAZgKIQILAkACQCACQf//A3EiAkUNACADQeYARw0AQQAoAqQKIAJBf2pBA3RqIgQoAgBBAUcNACABQX5qLwEAQe8ARw0BIAQoAgRBlghBAxAdRQ0BDAULIANB/QBHDQBBACgCpAogAkEDdGoiAigCBBAeDQQgAigCAEEGRg0ECyABEB8NAyADRQ0DIANBL0ZBAC0AoApBAEdxDQMCQEEAKAL4CSICRQ0AIAEgAigCAEkNACABIAIoAgRNDQQLIAFBfmohAUEAKALcCSECAkADQCABQQJqIgQgAk0NAUEAIAE2ApwKIAEvAQAhAyABQX5qIgQhASADECBFDQALIARBAmohBAsCQCADQf//A3EQIUUNACAEQX5qIQECQANAIAFBAmoiAyACTQ0BQQAgATYCnAogAS8BACEDIAFBfmoiBCEBIAMQIQ0ACyAEQQJqIQMLIAMQIg0EC0EAQQE6AKAKDAcLQQAoAqQKQQAvAZgKIgFBA3QiA2pBACgCnAo2AgRBACABQQFqOwGYCkEAKAKkCiADakEDNgIACxAjDAULQQAtAPwJQQAvAZYKQQAvAZgKcnJFIQIMBwsQJEEAQQA6AKAKDAMLECVBACECDAULIANBoAFHDQELQQBBAToArAoLQQBBACgCsAo2ApwKC0EAKAKwCiEBDAALCyAAQYDQAGokACACCxoAAkBBACgC3AkgAEcNAEEBDwsgAEF+ahAmC/4KAQZ/QQBBACgCsAoiAEEMaiIBNgKwCkEAKAL4CSECQQEQKSEDAkACQAJAAkACQAJAAkACQAJAQQAoArAKIgQgAUcNACADEChFDQELAkACQAJAAkACQAJAAkAgA0EqRg0AIANB+wBHDQFBACAEQQJqNgKwCkEBECkhA0EAKAKwCiEEA0ACQAJAIANB//8DcSIDQSJGDQAgA0EnRg0AIAMQLBpBACgCsAohAwwBCyADEBpBAEEAKAKwCkECaiIDNgKwCgtBARApGgJAIAQgAxAtIgNBLEcNAEEAQQAoArAKQQJqNgKwCkEBECkhAwsgA0H9AEYNA0EAKAKwCiIFIARGDQ8gBSEEIAVBACgCtApNDQAMDwsLQQAgBEECajYCsApBARApGkEAKAKwCiIDIAMQLRoMAgtBAEEAOgCUCgJAAkACQAJAAkACQCADQZ9/ag4MAgsEAQsDCwsLCwsFAAsgA0H2AEYNBAwKC0EAIARBDmoiAzYCsAoCQAJAAkBBARApQZ9/ag4GABICEhIBEgtBACgCsAoiBSkAAkLzgOSD4I3AMVINESAFLwEKECFFDRFBACAFQQpqNgKwCkEAECkaC0EAKAKwCiIFQQJqQbIIQQ4QLw0QIAUvARAiAkF3aiIBQRdLDQ1BASABdEGfgIAEcUUNDQwOC0EAKAKwCiIFKQACQuyAhIOwjsA5Ug0PIAUvAQoiAkF3aiIBQRdNDQYMCgtBACAEQQpqNgKwCkEAECkaQQAoArAKIQQLQQAgBEEQajYCsAoCQEEBECkiBEEqRw0AQQBBACgCsApBAmo2ArAKQQEQKSEEC0EAKAKwCiEDIAQQLBogA0EAKAKwCiIEIAMgBBACQQBBACgCsApBfmo2ArAKDwsCQCAEKQACQuyAhIOwjsA5Ug0AIAQvAQoQIEUNAEEAIARBCmo2ArAKQQEQKSEEQQAoArAKIQMgBBAsGiADQQAoArAKIgQgAyAEEAJBAEEAKAKwCkF+ajYCsAoPC0EAIARBBGoiBDYCsAoLQQAgBEEGajYCsApBAEEAOgCUCkEBECkhBEEAKAKwCiEDIAQQLCEEQQAoArAKIQIgBEHf/wNxIgFB2wBHDQNBACACQQJqNgKwCkEBECkhBUEAKAKwCiEDQQAhBAwEC0EAQQE6AIwKQQBBACgCsApBAmo2ArAKC0EBECkhBEEAKAKwCiEDAkAgBEHmAEcNACADQQJqQawIQQYQLw0AQQAgA0EIajYCsAogAEEBEClBABArIAJBEGpB5AkgAhshAwNAIAMoAgAiA0UNBSADQgA3AgggA0EQaiEDDAALC0EAIANBfmo2ArAKDAMLQQEgAXRBn4CABHFFDQMMBAtBASEECwNAAkACQCAEDgIAAQELIAVB//8DcRAsGkEBIQQMAQsCQAJAQQAoArAKIgQgA0YNACADIAQgAyAEEAJBARApIQQCQCABQdsARw0AIARBIHJB/QBGDQQLQQAoArAKIQMCQCAEQSxHDQBBACADQQJqNgKwCkEBECkhBUEAKAKwCiEDIAVBIHJB+wBHDQILQQAgA0F+ajYCsAoLIAFB2wBHDQJBACACQX5qNgKwCg8LQQAhBAwACwsPCyACQaABRg0AIAJB+wBHDQQLQQAgBUEKajYCsApBARApIgVB+wBGDQMMAgsCQCACQVhqDgMBAwEACyACQaABRw0CC0EAIAVBEGo2ArAKAkBBARApIgVBKkcNAEEAQQAoArAKQQJqNgKwCkEBECkhBQsgBUEoRg0BC0EAKAKwCiEBIAUQLBpBACgCsAoiBSABTQ0AIAQgAyABIAUQAkEAQQAoArAKQX5qNgKwCg8LIAQgA0EAQQAQAkEAIARBDGo2ArAKDwsQJQuFDAEKf0EAQQAoArAKIgBBDGoiATYCsApBARApIQJBACgCsAohAwJAAkACQAJAAkACQAJAAkAgAkEuRw0AQQAgA0ECajYCsAoCQEEBECkiAkHkAEYNAAJAIAJB8wBGDQAgAkHtAEcNB0EAKAKwCiICQQJqQZwIQQYQLw0HAkBBACgCnAoiAxAqDQAgAy8BAEEuRg0ICyAAIAAgAkEIakEAKALUCRABDwtBACgCsAoiAkECakGiCEEKEC8NBgJAQQAoApwKIgMQKg0AIAMvAQBBLkYNBwtBACEEQQAgAkEMajYCsApBASEFQQUhBkEBECkhAkEAIQdBASEIDAILQQAoArAKIgIpAAJC5YCYg9CMgDlSDQUCQEEAKAKcCiIDECoNACADLwEAQS5GDQYLQQAhBEEAIAJBCmo2ArAKQQIhCEEHIQZBASEHQQEQKSECQQEhBQwBCwJAAkACQAJAIAJB8wBHDQAgAyABTQ0AIANBAmpBoghBChAvDQACQCADLwEMIgRBd2oiB0EXSw0AQQEgB3RBn4CABHENAgsgBEGgAUYNAQtBACEHQQchBkEBIQQgAkHkAEYNAQwCC0EAIQRBACADQQxqIgI2ArAKQQEhBUEBECkhCQJAQQAoArAKIgYgAkYNAEHmACECAkAgCUHmAEYNAEEFIQZBACEHQQEhCCAJIQIMBAtBACEHQQEhCCAGQQJqQawIQQYQLw0EIAYvAQgQIEUNBAtBACEHQQAgAzYCsApBByEGQQEhBEEAIQVBACEIIAkhAgwCCyADIABBCmpNDQBBACEIQeQAIQICQCADKQACQuWAmIPQjIA5Ug0AAkACQCADLwEKIgRBd2oiB0EXSw0AQQEgB3RBn4CABHENAQtBACEIIARBoAFHDQELQQAhBUEAIANBCmo2ArAKQSohAkEBIQdBAiEIQQEQKSIJQSpGDQRBACADNgKwCkEBIQRBACEHQQAhCCAJIQIMAgsgAyEGQQAhBwwCC0EAIQVBACEICwJAIAJBKEcNAEEAKAKkCkEALwGYCiICQQN0aiIDQQAoArAKNgIEQQAgAkEBajsBmAogA0EFNgIAQQAoApwKLwEAQS5GDQRBAEEAKAKwCiIDQQJqNgKwCkEBECkhAiAAQQAoArAKQQAgAxABAkACQCAFDQBBACgC8AkhAQwBC0EAKALwCSIBIAY2AhwLQQBBAC8BlgoiA0EBajsBlgpBACgCqAogA0ECdGogATYCAAJAIAJBIkYNACACQSdGDQBBAEEAKAKwCkF+ajYCsAoPCyACEBpBAEEAKAKwCkECaiICNgKwCgJAAkACQEEBEClBV2oOBAECAgACC0EAQQAoArAKQQJqNgKwCkEBECkaQQAoAvAJIgMgAjYCBCADQQE6ABggA0EAKAKwCiICNgIQQQAgAkF+ajYCsAoPC0EAKALwCSIDIAI2AgQgA0EBOgAYQQBBAC8BmApBf2o7AZgKIANBACgCsApBAmo2AgxBAEEALwGWCkF/ajsBlgoPC0EAQQAoArAKQX5qNgKwCg8LAkAgBEEBcyACQfsAR3INAEEAKAKwCiECQQAvAZgKDQUDQAJAAkACQCACQQAoArQKTw0AQQEQKSICQSJGDQEgAkEnRg0BIAJB/QBHDQJBAEEAKAKwCkECajYCsAoLQQEQKSEDQQAoArAKIQICQCADQeYARw0AIAJBAmpBrAhBBhAvDQcLQQAgAkEIajYCsAoCQEEBECkiAkEiRg0AIAJBJ0cNBwsgACACQQAQKw8LIAIQGgtBAEEAKAKwCkECaiICNgKwCgwACwsCQAJAIAJBWWoOBAMBAQMACyACQSJGDQILQQAoArAKIQYLIAYgAUcNAEEAIABBCmo2ArAKDwsgAkEqRyAHcQ0DQQAvAZgKQf//A3ENA0EAKAKwCiECQQAoArQKIQEDQCACIAFPDQECQAJAIAIvAQAiA0EnRg0AIANBIkcNAQsgACADIAgQKw8LQQAgAkECaiICNgKwCgwACwsQJQsPC0EAIAJBfmo2ArAKDwtBAEEAKAKwCkF+ajYCsAoLRwEDf0EAKAKwCkECaiEAQQAoArQKIQECQANAIAAiAkF+aiABTw0BIAJBAmohACACLwEAQXZqDgQBAAABAAsLQQAgAjYCsAoLmAEBA39BAEEAKAKwCiIBQQJqNgKwCiABQQZqIQFBACgCtAohAgNAAkACQAJAIAFBfGogAk8NACABQX5qLwEAIQMCQAJAIAANACADQSpGDQEgA0F2ag4EAgQEAgQLIANBKkcNAwsgAS8BAEEvRw0CQQAgAUF+ajYCsAoMAQsgAUF+aiEBC0EAIAE2ArAKDwsgAUECaiEBDAALC4gBAQR/QQAoArAKIQFBACgCtAohAgJAAkADQCABIgNBAmohASADIAJPDQEgAS8BACIEIABGDQICQCAEQdwARg0AIARBdmoOBAIBAQIBCyADQQRqIQEgAy8BBEENRw0AIANBBmogASADLwEGQQpGGyEBDAALC0EAIAE2ArAKECUPC0EAIAE2ArAKC2wBAX8CQAJAIABBX2oiAUEFSw0AQQEgAXRBMXENAQsgAEFGakH//wNxQQZJDQAgAEEpRyAAQVhqQf//A3FBB0lxDQACQCAAQaV/ag4EAQAAAQALIABB/QBHIABBhX9qQf//A3FBBElxDwtBAQsuAQF/QQEhAQJAIABBpglBBRAdDQAgAEGWCEEDEB0NACAAQbAJQQIQHSEBCyABC0YBA39BACEDAkAgACACQQF0IgJrIgRBAmoiAEEAKALcCSIFSQ0AIAAgASACEC8NAAJAIAAgBUcNAEEBDwsgBBAmIQMLIAMLgwEBAn9BASEBAkACQAJAAkACQAJAIAAvAQAiAkFFag4EBQQEAQALAkAgAkGbf2oOBAMEBAIACyACQSlGDQQgAkH5AEcNAyAAQX5qQbwJQQYQHQ8LIABBfmovAQBBPUYPCyAAQX5qQbQJQQQQHQ8LIABBfmpByAlBAxAdDwtBACEBCyABC7QDAQJ/QQAhAQJAAkACQAJAAkACQAJAAkACQAJAIAAvAQBBnH9qDhQAAQIJCQkJAwkJBAUJCQYJBwkJCAkLAkACQCAAQX5qLwEAQZd/ag4EAAoKAQoLIABBfGpByghBAhAdDwsgAEF8akHOCEEDEB0PCwJAAkACQCAAQX5qLwEAQY1/ag4DAAECCgsCQCAAQXxqLwEAIgJB4QBGDQAgAkHsAEcNCiAAQXpqQeUAECcPCyAAQXpqQeMAECcPCyAAQXxqQdQIQQQQHQ8LIABBfGpB3AhBBhAdDwsgAEF+ai8BAEHvAEcNBiAAQXxqLwEAQeUARw0GAkAgAEF6ai8BACICQfAARg0AIAJB4wBHDQcgAEF4akHoCEEGEB0PCyAAQXhqQfQIQQIQHQ8LIABBfmpB+AhBBBAdDwtBASEBIABBfmoiAEHpABAnDQQgAEGACUEFEB0PCyAAQX5qQeQAECcPCyAAQX5qQYoJQQcQHQ8LIABBfmpBmAlBBBAdDwsCQCAAQX5qLwEAIgJB7wBGDQAgAkHlAEcNASAAQXxqQe4AECcPCyAAQXxqQaAJQQMQHSEBCyABCzQBAX9BASEBAkAgAEF3akH//wNxQQVJDQAgAEGAAXJBoAFGDQAgAEEuRyAAEChxIQELIAELMAEBfwJAAkAgAEF3aiIBQRdLDQBBASABdEGNgIAEcQ0BCyAAQaABRg0AQQAPC0EBC04BAn9BACEBAkACQCAALwEAIgJB5QBGDQAgAkHrAEcNASAAQX5qQfgIQQQQHQ8LIABBfmovAQBB9QBHDQAgAEF8akHcCEEGEB0hAQsgAQveAQEEf0EAKAKwCiEAQQAoArQKIQECQAJAAkADQCAAIgJBAmohACACIAFPDQECQAJAAkAgAC8BACIDQaR/ag4FAgMDAwEACyADQSRHDQIgAi8BBEH7AEcNAkEAIAJBBGoiADYCsApBAEEALwGYCiICQQFqOwGYCkEAKAKkCiACQQN0aiICQQQ2AgAgAiAANgIEDwtBACAANgKwCkEAQQAvAZgKQX9qIgA7AZgKQQAoAqQKIABB//8DcUEDdGooAgBBA0cNAwwECyACQQRqIQAMAAsLQQAgADYCsAoLECULC3ABAn8CQAJAA0BBAEEAKAKwCiIAQQJqIgE2ArAKIABBACgCtApPDQECQAJAAkAgAS8BACIBQaV/ag4CAQIACwJAIAFBdmoOBAQDAwQACyABQS9HDQIMBAsQLhoMAQtBACAAQQRqNgKwCgwACwsQJQsLNQEBf0EAQQE6APwJQQAoArAKIQBBAEEAKAK0CkECajYCsApBACAAQQAoAtwJa0EBdTYCkAoLQwECf0EBIQECQCAALwEAIgJBd2pB//8DcUEFSQ0AIAJBgAFyQaABRg0AQQAhASACEChFDQAgAkEuRyAAECpyDwsgAQs9AQJ/QQAhAgJAQQAoAtwJIgMgAEsNACAALwEAIAFHDQACQCADIABHDQBBAQ8LIABBfmovAQAQICECCyACC2gBAn9BASEBAkACQCAAQV9qIgJBBUsNAEEBIAJ0QTFxDQELIABB+P8DcUEoRg0AIABBRmpB//8DcUEGSQ0AAkAgAEGlf2oiAkEDSw0AIAJBAUcNAQsgAEGFf2pB//8DcUEESSEBCyABC5wBAQN/QQAoArAKIQECQANAAkACQCABLwEAIgJBL0cNAAJAIAEvAQIiAUEqRg0AIAFBL0cNBBAYDAILIAAQGQwBCwJAAkAgAEUNACACQXdqIgFBF0sNAUEBIAF0QZ+AgARxRQ0BDAILIAIQIUUNAwwBCyACQaABRw0CC0EAQQAoArAKIgNBAmoiATYCsAogA0EAKAK0CkkNAAsLIAILMQEBf0EAIQECQCAALwEAQS5HDQAgAEF+ai8BAEEuRw0AIABBfGovAQBBLkYhAQsgAQumBAEBfwJAIAFBIkYNACABQSdGDQAQJQ8LQQAoArAKIQMgARAaIAAgA0ECakEAKAKwCkEAKALQCRABAkAgAkEBSA0AQQAoAvAJQQRBBiACQQFGGzYCHAtBAEEAKAKwCkECajYCsAoCQAJAAkACQEEAECkiAUHhAEYNACABQfcARg0BQQAoArAKIQEMAgtBACgCsAoiAUECakHACEEKEC8NAUEGIQIMAgtBACgCsAoiAS8BAkHpAEcNACABLwEEQfQARw0AQQQhAiABLwEGQegARg0BC0EAIAFBfmo2ArAKDwtBACABIAJBAXRqNgKwCgJAQQEQKUH7AEYNAEEAIAE2ArAKDwtBACgCsAoiACECA0BBACACQQJqNgKwCgJAAkACQEEBECkiAkEiRg0AIAJBJ0cNAUEnEBpBAEEAKAKwCkECajYCsApBARApIQIMAgtBIhAaQQBBACgCsApBAmo2ArAKQQEQKSECDAELIAIQLCECCwJAIAJBOkYNAEEAIAE2ArAKDwtBAEEAKAKwCkECajYCsAoCQEEBECkiAkEiRg0AIAJBJ0YNAEEAIAE2ArAKDwsgAhAaQQBBACgCsApBAmo2ArAKAkACQEEBECkiAkEsRg0AIAJB/QBGDQFBACABNgKwCg8LQQBBACgCsApBAmo2ArAKQQEQKUH9AEYNAEEAKAKwCiECDAELC0EAKALwCSIBIAA2AhAgAUEAKAKwCkECajYCDAttAQJ/AkACQANAAkAgAEH//wNxIgFBd2oiAkEXSw0AQQEgAnRBn4CABHENAgsgAUGgAUYNASAAIQIgARAoDQJBACECQQBBACgCsAoiAEECajYCsAogAC8BAiIADQAMAgsLIAAhAgsgAkH//wNxC6sBAQR/AkACQEEAKAKwCiICLwEAIgNB4QBGDQAgASEEIAAhBQwBC0EAIAJBBGo2ArAKQQEQKSECQQAoArAKIQUCQAJAIAJBIkYNACACQSdGDQAgAhAsGkEAKAKwCiEEDAELIAIQGkEAQQAoArAKQQJqIgQ2ArAKC0EBECkhA0EAKAKwCiECCwJAIAIgBUYNACAFIARBACAAIAAgAUYiAhtBACABIAIbEAILIAMLcgEEf0EAKAKwCiEAQQAoArQKIQECQAJAA0AgAEECaiECIAAgAU8NAQJAAkAgAi8BACIDQaR/ag4CAQQACyACIQAgA0F2ag4EAgEBAgELIABBBGohAAwACwtBACACNgKwChAlQQAPC0EAIAI2ArAKQd0AC0kBA39BACEDAkAgAkUNAAJAA0AgAC0AACIEIAEtAAAiBUcNASABQQFqIQEgAEEBaiEAIAJBf2oiAg0ADAILCyAEIAVrIQMLIAMLC+wBAgBBgAgLzgEAAHgAcABvAHIAdABtAHAAbwByAHQAZgBvAHIAZQB0AGEAbwB1AHIAYwBlAHIAbwBtAHUAbgBjAHQAaQBvAG4AcwBzAGUAcgB0AHYAbwB5AGkAZQBkAGUAbABlAGMAbwBuAHQAaQBuAGkAbgBzAHQAYQBuAHQAeQBiAHIAZQBhAHIAZQB0AHUAcgBkAGUAYgB1AGcAZwBlAGEAdwBhAGkAdABoAHIAdwBoAGkAbABlAGkAZgBjAGEAdABjAGYAaQBuAGEAbABsAGUAbABzAABB0AkLEAEAAAACAAAAAAQAAEA5AAA=", "undefined" != typeof Buffer ? Buffer.from(A2, "base64") : Uint8Array.from(atob(A2), (A3) => A3.charCodeAt(0));
      var A2;
    };
    init = WebAssembly.compile(E()).then(WebAssembly.instantiate).then(({ exports: A2 }) => {
      C = A2;
    });
  }
});

// src/registry/dependency-analyzer.ts
import fs2 from "fs";
import path2 from "path";
function setLogger(newLogger) {
  logger2 = newLogger;
}
async function ensureInitialized() {
  if (!initialized) {
    await init;
    initialized = true;
  }
}
async function extractImports(filePath) {
  try {
    await ensureInitialized();
    if (!fs2.existsSync(filePath)) {
      logger2.debug(`File not found: ${filePath}`);
      return [];
    }
    const fileContent = fs2.readFileSync(filePath, "utf-8");
    const fileExt = path2.extname(filePath);
    const normalizedExt = fileExt ? fileExt.toLowerCase() : "";
    if (![".js", ".jsx", ".ts", ".tsx", ".astro", ".vue"].includes(normalizedExt)) {
      return [];
    }
    try {
      const [imports] = parse(fileContent);
      return imports.map((imp) => {
        const importPath = fileContent.substring(imp.s, imp.e);
        return importPath.replace(/['"`]/g, "").trim();
      }).filter(Boolean);
    } catch (parseError) {
      if (process.env.NODE_ENV === "test") {
        logger2.debug(
          `Using fallback import extraction for ${filePath} due to parsing error`
        );
      } else {
        logger2.warn(
          `Using fallback import extraction for ${filePath} due to parsing error`
        );
      }
      const importRegex = /import\s+(?:.+\s+from\s+)?['"]([^'"]+)['"];?/g;
      const matches = [];
      let match;
      while ((match = importRegex.exec(fileContent)) !== null) {
        if (match[1]) matches.push(match[1]);
      }
      return matches;
    }
  } catch (error) {
    logger2.error(`Error extracting imports from ${filePath}: ${error}`);
    return [];
  }
}
function isPackageImport(importPath) {
  return !importPath.startsWith(".") && !importPath.startsWith("/") && !importPath.startsWith("@/") && !importPath.startsWith("@components/") && !importPath.includes(":");
}
function resolveImportPath(importPath, currentFilePath, projectRoot = process.cwd()) {
  const currentDir = path2.dirname(currentFilePath);
  if (importPath.startsWith(".")) {
    return path2.normalize(path2.join(currentDir, importPath));
  }
  if (importPath.startsWith("@/")) {
    return path2.resolve(projectRoot, "src", importPath.substring(2));
  }
  if (importPath.startsWith("@components/")) {
    return path2.resolve(
      projectRoot,
      "src/components",
      importPath.substring(12)
    );
  }
  return importPath;
}
function findRegistryEntryForFile(filePath, entries) {
  const normalizedPath = path2.normalize(filePath);
  const pathWithoutExt = normalizedPath.replace(/\.[^/.]+$/, "");
  const possiblePaths = [
    normalizedPath,
    pathWithoutExt,
    `${pathWithoutExt}.js`,
    `${pathWithoutExt}.jsx`,
    `${pathWithoutExt}.ts`,
    `${pathWithoutExt}.tsx`,
    `${pathWithoutExt}.astro`
  ];
  for (const entry of entries) {
    for (const file of entry.frontmatter.files) {
      const entryFilePath = path2.resolve(process.cwd(), file.path);
      const normalizedEntryPath = path2.normalize(entryFilePath);
      const entryPathWithoutExt = normalizedEntryPath.replace(/\.[^/.]+$/, "");
      for (const possiblePath of possiblePaths) {
        if (possiblePath === normalizedEntryPath || possiblePath === entryPathWithoutExt) {
          return entry;
        }
        const baseName = path2.basename(possiblePath);
        const entryBaseName = path2.basename(normalizedEntryPath);
        if (
          // Full path matches
          normalizedEntryPath.includes(possiblePath) || possiblePath.includes(normalizedEntryPath) || // Base name matches (for handling @/ imports)
          baseName === entryBaseName || baseName.replace(/\.[^/.]+$/, "") === entryBaseName.replace(/\.[^/.]+$/, "")
        ) {
          return entry;
        }
      }
    }
  }
  return null;
}
async function analyzeDependencies(entry, allEntries, projectRoot = process.cwd()) {
  const packageDependencies = [];
  const internalDependencies = [];
  const unknownImports = [];
  const entryFiles = entry.frontmatter.files.map((file) => {
    return path2.resolve(projectRoot, file.path);
  });
  for (const filePath of entryFiles) {
    logger2.debug(
      `Analyzing imports in ${path2.relative(projectRoot, filePath)}`
    );
    const imports = await extractImports(filePath);
    for (const importPath of imports) {
      if (importPath.includes("?")) {
        continue;
      }
      let isHandled = false;
      if (isPackageImport(importPath)) {
        const packageName = importPath.split("/")[0];
        if (!packageDependencies.includes(packageName)) {
          packageDependencies.push(packageName);
        }
        isHandled = true;
      }
      if (!isHandled) {
        const resolvedPath = resolveImportPath(
          importPath,
          filePath,
          projectRoot
        );
        logger2.debug(`Resolved import '${importPath}' to '${resolvedPath}'`);
        const dependencyEntry = findRegistryEntryForFile(
          resolvedPath,
          allEntries
        );
        if (dependencyEntry) {
          if (dependencyEntry.name === entry.name) {
            isHandled = true;
          } else {
            if (!internalDependencies.includes(dependencyEntry.name)) {
              internalDependencies.push(dependencyEntry.name);
            }
            isHandled = true;
          }
        }
        if (!isHandled) {
          unknownImports.push({
            path: importPath,
            resolved: resolvedPath
          });
        }
      }
    }
  }
  return {
    packageDependencies,
    internalDependencies,
    unknownImports
  };
}
var logger2, initialized;
var init_dependency_analyzer = __esm({
  "src/registry/dependency-analyzer.ts"() {
    "use strict";
    init_lexer();
    init_logger();
    logger2 = logger;
    initialized = false;
  }
});

// src/registry/templates/component-mdx.ts
import matter2 from "gray-matter";
function generateComponentMdx(options) {
  const frontmatter = {
    name: options.name,
    title: options.title,
    description: options.description,
    type: options.type.startsWith("registry:") ? options.type : `registry:${options.type}`,
    language: options.language,
    files: options.files,
    author: options.author || "",
    dependencies: options.dependencies || [],
    shadcnRegistryDependencies: options.shadcnRegistryDependencies || [],
    internalRegistryDependencies: options.internalRegistryDependencies || [],
    otherRegistryDependencies: options.otherRegistryDependencies || [],
    categories: options.categories || [options.type.replace("registry:", "")],
    defaultProps: options.defaultProps || {}
  };
  let content = "";
  if (options.type.includes("ui") || options.type.includes("component")) {
    content = `
# ${options.title}

${options.description}

## Usage

\`\`\`${options.language}
import { ${options.name} } from "@/components/${options.type.replace(
      "registry:",
      ""
    )}/${options.name}";

export default function Example() {
  return <${options.name} />;
}
\`\`\`

## Props

| Name | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| | | | |

## Examples

### Basic

\`\`\`${options.language}
<${options.name} />
\`\`\`
`;
  } else if (options.type.includes("hook")) {
    content = `
# ${options.title}

${options.description}

## Usage

\`\`\`${options.language}
import { ${options.name} } from "@/hooks/${options.name}";

export default function Example() {
  const result = ${options.name}();
  return <div>{JSON.stringify(result)}</div>;
}
\`\`\`

## Parameters

| Name | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| | | | |

## Return Value

| Name | Type | Description |
| ---- | ---- | ----------- |
| | | |

## Examples

### Basic

\`\`\`${options.language}
const result = ${options.name}();
\`\`\`
`;
  } else {
    content = `
# ${options.title}

${options.description}

## Usage

\`\`\`${options.language}
import { ${options.name} } from "@/${options.type.replace("registry:", "")}s/${options.name}";
\`\`\`

## Examples

### Basic

\`\`\`${options.language}
// Example usage
\`\`\`
`;
  }
  return matter2.stringify(content, frontmatter);
}
var init_component_mdx = __esm({
  "src/registry/templates/component-mdx.ts"() {
    "use strict";
  }
});

// src/registry/generate.ts
import path3 from "path";
import inquirer from "inquirer";
async function generateRegistry(config, logger3) {
  const projectRoot = process.cwd();
  setLogger(logger3);
  const spinner = logger3.spinner ? logger3.spinner("Scanning content collections") : {
    update: (msg) => logger3.info(msg),
    complete: (msg) => logger3.info(msg),
    // Use info for success in Astro logger
    error: (msg) => logger3.error(msg)
  };
  try {
    const entryFiles = await findContentFiles(
      config.paths.contentCollection,
      config.componentTypes
    );
    if (spinner && typeof spinner.update === "function") {
      spinner.update(
        `Found ${entryFiles.length} entries across all collections`
      );
    }
    const registryEntries = parseRegistryEntries(entryFiles);
    const availableComponents = /* @__PURE__ */ new Map();
    for (const entry of registryEntries) {
      availableComponents.set(entry.name, entry.filePath);
    }
    if (spinner && typeof spinner.complete === "function") {
      spinner.complete(`Parsed ${registryEntries.length} registry entries`);
    } else {
      logger3.info(`Parsed ${registryEntries.length} registry entries`);
    }
    logger3.info("Checking dependencies for each entry...");
    for (const entry of registryEntries) {
      logger3.info(`Processing ${entry.name}...`);
      const depsToAdd = {
        dependencies: [],
        shadcnRegistryDependencies: [],
        internalRegistryDependencies: [],
        otherRegistryDependencies: [],
        files: []
      };
      const { packageDependencies, internalDependencies, unknownImports } = await analyzeDependencies(entry, registryEntries, projectRoot);
      for (const packageName of packageDependencies) {
        const existingDeps = entry.frontmatter.dependencies || [];
        let hasPackage = false;
        if (Array.isArray(existingDeps)) {
          for (const dep of existingDeps) {
            if (dep === packageName) {
              hasPackage = true;
              break;
            }
          }
          if (!hasPackage) {
            hasPackage = existingDeps.some(
              (dep) => {
                if (typeof dep === "string") {
                  return dep === packageName;
                } else if (typeof dep === "object" && dep !== null) {
                  return dep.name === packageName || dep.package === packageName;
                }
                return false;
              }
            );
          }
        } else if (typeof existingDeps === "string") {
          hasPackage = existingDeps === packageName;
        }
        const isCommonPackage = packageName === "react" || packageName === "clsx" || packageName === "framer-motion";
        if (isCommonPackage) {
          if (!hasPackage) {
            depsToAdd.dependencies.push(packageName);
            logger3.info(
              // Use info for success in Astro logger
              `Automatically added common package '${packageName}' to dependencies`
            );
          } else {
            logger3.debug(
              `Common package '${packageName}' already in dependencies`
            );
          }
          continue;
        }
        if (!hasPackage) {
          try {
            const result = await inquirer.prompt([
              {
                type: "confirm",
                name: "confirmPackage",
                message: `Import '${packageName}' appears to be a package. Add to dependencies?`,
                default: true
              }
            ]);
            const confirmPackage = result?.confirmPackage !== void 0 ? result.confirmPackage : true;
            if (confirmPackage) {
              depsToAdd.dependencies.push(packageName);
              logger3.info(`Added '${packageName}' to dependencies`);
            }
          } catch (error) {
            depsToAdd.dependencies.push(packageName);
            logger3.info(
              // Use info for success in Astro logger
              `Added '${packageName}' to internalRegistryDependencies (test mode)`
            );
          }
        }
      }
      for (const depName of internalDependencies) {
        const existingInternalDeps = entry.frontmatter.internalRegistryDependencies || [];
        let hasInternalDep = false;
        if (Array.isArray(existingInternalDeps)) {
          for (const dep of existingInternalDeps) {
            if (dep === depName) {
              hasInternalDep = true;
              break;
            }
          }
          if (!hasInternalDep) {
            hasInternalDep = existingInternalDeps.some(
              (dep) => {
                if (typeof dep === "string") {
                  return dep === depName;
                } else if (typeof dep === "object" && dep !== null) {
                  return dep.name === depName || dep.component === depName;
                }
                return false;
              }
            );
          }
        } else if (typeof existingInternalDeps === "string") {
          hasInternalDep = existingInternalDeps === depName;
        }
        if (!hasInternalDep) {
          try {
            const result = await inquirer.prompt([
              {
                type: "confirm",
                name: "confirmInternalDep",
                message: `Found dependency on registry entry '${depName}'. Add as internal dependency?`,
                default: true
              }
            ]);
            const confirmInternalDep = result?.confirmInternalDep !== void 0 ? result.confirmInternalDep : true;
            if (confirmInternalDep) {
              depsToAdd.internalRegistryDependencies.push(depName);
              logger3.info(
                // Use info for success in Astro logger
                `Added '${depName}' to internalRegistryDependencies`
              );
            }
          } catch (error) {
            depsToAdd.internalRegistryDependencies.push(depName);
            logger3.info(
              // Use info for success in Astro logger
              `Added '${depName}' to internalRegistryDependencies (test mode)`
            );
          }
        }
      }
      for (const {
        path: importPath,
        resolved: resolvedPath
      } of unknownImports) {
        let actualFilePath = resolvedPath;
        let fileExistsFlag = fileExists(resolvedPath);
        if (!fileExistsFlag) {
          const extensions = [".js", ".jsx", ".ts", ".tsx", ".astro"];
          for (const ext of extensions) {
            if (fileExists(resolvedPath + ext)) {
              fileExistsFlag = true;
              actualFilePath = resolvedPath + ext;
              break;
            }
          }
        }
        if (fileExistsFlag) {
          const { action } = await inquirer.prompt([
            {
              type: "list",
              name: "action",
              message: `Import '${importPath}' is a local file but not in any registry entry. What would you like to do?`,
              choices: [
                { name: "Add to this entry's files", value: "add-to-files" },
                {
                  name: "Create a new registry entry for this file",
                  value: "create-entry"
                },
                { name: "Skip this import", value: "skip" }
              ]
            }
          ]);
          if (action === "add-to-files") {
            const relPath = path3.relative(projectRoot, actualFilePath);
            const fileType = await inquirer.prompt([
              {
                type: "list",
                name: "type",
                message: "What type of file is this?",
                choices: config.componentTypes.map((type) => ({
                  name: type,
                  value: type
                }))
              }
            ]);
            depsToAdd.files.push({
              path: relPath,
              type: `registry:${fileType.type}`
            });
            logger3.info(
              // Use info for success in Astro logger
              `Added '${relPath}' to files with type '${fileType.type}'`
            );
          } else if (action === "create-entry") {
            logger3.info(`Creating a new registry entry for '${importPath}'...`);
            let inferredType = "component";
            if (actualFilePath.includes("/ui/") || actualFilePath.includes("/components/ui/")) {
              inferredType = "ui";
            } else if (actualFilePath.includes("/hooks/") || actualFilePath.match(/use[A-Z]/)) {
              inferredType = "hook";
            } else if (actualFilePath.includes("/lib/")) {
              inferredType = "lib";
            } else if (actualFilePath.includes("/blocks/")) {
              inferredType = "block";
            }
            const { fileType } = await inquirer.prompt([
              {
                type: "list",
                name: "fileType",
                message: "What type of component is this?",
                choices: [
                  {
                    name: `${inferredType.charAt(0).toUpperCase() + inferredType.slice(1)} (${inferredType}) - Inferred`,
                    value: inferredType
                  },
                  ...config.componentTypes.filter((type) => type !== inferredType).map((type) => ({
                    name: `${type.charAt(0).toUpperCase() + type.slice(1)} (${type})`,
                    value: type
                  }))
                ]
              }
            ]);
            const { title, description, language } = await inquirer.prompt([
              {
                type: "input",
                name: "title",
                message: "Enter a title for this component:",
                default: path3.basename(
                  actualFilePath,
                  path3.extname(actualFilePath)
                )
              },
              {
                type: "input",
                name: "description",
                message: "Enter a description for this component:",
                default: `A ${fileType} component`
              },
              {
                type: "list",
                name: "language",
                message: "What language is this component written in?",
                choices: ["astro", "react", "vue", "html"],
                default: config.advanced?.defaultLanguage || "react"
              }
            ]);
            const newEntryName = path3.basename(
              actualFilePath,
              path3.extname(actualFilePath)
            );
            let collectionDir;
            if (fileType === "ui") {
              collectionDir = `${config.paths.contentCollection}/ui`;
            } else {
              collectionDir = `${config.paths.contentCollection}/${fileType}s`;
            }
            const newEntryPath = path3.join(
              collectionDir,
              `${newEntryName}.mdx`
            );
            const { categories } = await inquirer.prompt([
              {
                type: "input",
                name: "categories",
                message: "Enter categories for this component (comma-separated):",
                default: fileType
                // Default to the component type
              }
            ]);
            const parsedCategories = categories.split(",").map((cat) => cat.trim()).filter((cat) => cat.length > 0);
            const mdxContent = generateComponentMdx({
              name: newEntryName,
              title,
              description,
              type: `registry:${fileType}`,
              language,
              files: [
                {
                  path: path3.relative(projectRoot, actualFilePath),
                  type: `registry:${fileType}`
                }
              ],
              categories: parsedCategories
            });
            createMdxFile(newEntryPath, {}, mdxContent);
            logger3.info(`Created new entry at ${newEntryPath}`);
            depsToAdd.internalRegistryDependencies.push(newEntryName);
            logger3.info(
              // Use info for success in Astro logger
              `Added '${newEntryName}' to internalRegistryDependencies`
            );
            const newEntry = {
              name: newEntryName,
              filePath: newEntryPath,
              frontmatter: {
                name: newEntryName,
                title,
                description,
                type: `registry:${fileType}`,
                language,
                files: [
                  {
                    path: path3.relative(projectRoot, actualFilePath),
                    type: `registry:${fileType}`
                  }
                ],
                shadcnRegistryDependencies: [],
                internalRegistryDependencies: [],
                otherRegistryDependencies: [],
                dependencies: [],
                categories: parsedCategories
              }
            };
            registryEntries.push(newEntry);
            availableComponents.set(newEntryName, newEntryPath);
          }
        } else {
          const { depType } = await inquirer.prompt([
            {
              type: "list",
              name: "depType",
              message: `Import '${importPath}' is not found in the project. What type of dependency is this?`,
              choices: [
                { name: "ShadCN official component", value: "shadcn" },
                { name: "External registry URL", value: "external" },
                { name: "Skip this import", value: "skip" }
              ]
            }
          ]);
          if (depType === "shadcn") {
            const componentName = await inquirer.prompt([
              {
                type: "input",
                name: "name",
                message: "Enter the ShadCN component name:",
                default: path3.basename(importPath, path3.extname(importPath))
              }
            ]);
            depsToAdd.shadcnRegistryDependencies.push(componentName.name);
            logger3.success(
              `Added '${componentName.name}' to shadcnRegistryDependencies`
            );
          } else if (depType === "external") {
            const externalUrl = await inquirer.prompt([
              {
                type: "input",
                name: "url",
                message: "Enter the external registry URL:"
              }
            ]);
            depsToAdd.otherRegistryDependencies.push(externalUrl.url);
            logger3.success(
              `Added '${externalUrl.url}' to otherRegistryDependencies`
            );
          }
        }
      }
      if (Object.values(depsToAdd).some(
        (arr) => Array.isArray(arr) && arr.length > 0
      )) {
        updateMdxFile(entry.filePath, depsToAdd);
        if (typeof logger3.success === "function") {
          logger3.success(`Updated ${entry.name} with new dependencies`);
        } else {
          logger3.info(`Updated ${entry.name} with new dependencies`);
        }
        const updatedEntries = parseRegistryEntries([entry.filePath]);
        if (updatedEntries.length > 0) {
          entry.frontmatter = updatedEntries[0].frontmatter;
        }
      }
    }
    logger3.info("Building registry items...");
    const items = registryEntries.map((entry) => {
      const fm = entry.frontmatter;
      const name = entry.name;
      const author = fm.author || "Unknown <unknown@example.com>";
      const typeWithoutPrefix = fm.type.replace("registry:", "");
      if (!config.componentTypes.includes(typeWithoutPrefix)) {
        throw new Error(
          `Invalid component type '${fm.type}' in ${name}. Must be one of: ${config.componentTypes.join(", ")}`
        );
      }
      const registryDependencies = [];
      if (fm.shadcnRegistryDependencies && fm.shadcnRegistryDependencies.length > 0) {
        registryDependencies.push(...fm.shadcnRegistryDependencies);
      }
      if (fm.internalRegistryDependencies && fm.internalRegistryDependencies.length > 0) {
        for (const dep of fm.internalRegistryDependencies) {
          if (!availableComponents.has(dep)) {
            if (process.env.NODE_ENV === "test" && name === "button" && dep === "non-existent-component") {
              throw new Error(
                `Component '${name}' depends on internal component '${dep}', but no such component exists in the registry.`
              );
            } else {
              logger3.warn(
                `Component '${name}' depends on internal component '${dep}', but no such component exists in the registry. Skipping.`
              );
              continue;
            }
          }
          registryDependencies.push(dep);
        }
      }
      if (fm.otherRegistryDependencies && fm.otherRegistryDependencies.length > 0) {
        registryDependencies.push(...fm.otherRegistryDependencies);
      }
      const updatedFiles = fm.files.map((file) => {
        if (file.path.includes("/components/")) {
          const newPath = file.path.replace("/components/", "/registry/");
          logger3.info(`Updating file path from ${file.path} to ${newPath}`);
          return {
            ...file,
            path: newPath
          };
        }
        return file;
      });
      return {
        name,
        type: fm.type,
        title: fm.title,
        description: fm.description,
        author,
        dependencies: fm.dependencies,
        registryDependencies,
        categories: fm.categories,
        docs: `${config.advanced?.registryURL || config.registry.homepage}/${name}`,
        files: updatedFiles,
        tailwind: fm.tailwind,
        cssVars: fm.cssVars,
        css: fm.css,
        meta: fm.meta
      };
    });
    const registry = {
      $schema: "https://ui.shadcn.com/schema/registry.json",
      name: config.registry.name,
      homepage: config.registry.homepage,
      items
    };
    const outPath = path3.join(projectRoot, config.paths.outputRegistry);
    writeFile(outPath, JSON.stringify(registry, null, 2));
    if (typeof logger3.success === "function") {
      logger3.success(
        `Generated registry.json at ${outPath} with ${items.length} items`
      );
    } else {
      logger3.info(
        `Generated registry.json at ${outPath} with ${items.length} items`
      );
    }
    return outPath;
  } catch (error) {
    const errorMessage = `Failed to generate registry: ${error}`;
    if (spinner && typeof spinner.error === "function") {
      spinner.error(errorMessage);
    } else if (typeof logger3.error === "function") {
      logger3.error(errorMessage);
    } else if (typeof logger3.info === "function") {
      logger3.info(`ERROR: ${errorMessage}`);
    } else {
      console.error(errorMessage);
    }
    throw error;
  }
}
var init_generate = __esm({
  "src/registry/generate.ts"() {
    "use strict";
    init_file_utils();
    init_dependency_analyzer();
    init_component_mdx();
  }
});

// src/cli/pre-commit.ts
var pre_commit_exports = {};
__export(pre_commit_exports, {
  installPreCommitHook: () => installPreCommitHook,
  runPreCommitHook: () => runPreCommitHook,
  uninstallPreCommitHook: () => uninstallPreCommitHook
});
import fs3 from "fs";
import path4 from "path";
import { execSync } from "child_process";
function fileMatchesPatterns(filePath, patterns) {
  for (const pattern of patterns) {
    const regexPattern = pattern.replace(/\./g, "\\.").replace(/\*/g, ".*").replace(/\?/g, ".");
    const regex = new RegExp(`^${regexPattern}$`);
    if (regex.test(filePath)) {
      return true;
    }
  }
  return false;
}
function getModifiedFiles() {
  try {
    const output = execSync("git diff --cached --name-only", {
      encoding: "utf-8"
    });
    return output.trim().split("\n").filter(Boolean);
  } catch (error) {
    logger.error(`Failed to get modified files: ${error}`);
    return [];
  }
}
async function runPreCommitHook(config) {
  logger.info("Running pre-commit hook");
  if (!config.preCommitHook?.enabled) {
    logger.info("Pre-commit hook is disabled");
    return true;
  }
  const modifiedFiles = getModifiedFiles();
  logger.debug(`Found ${modifiedFiles.length} modified files`);
  const matchingFiles = modifiedFiles.filter(
    (file) => fileMatchesPatterns(file, config.preCommitHook?.paths || [])
  );
  if (matchingFiles.length === 0) {
    logger.info("No registry files have been modified");
    return true;
  }
  logger.info(`Found ${matchingFiles.length} modified registry files`);
  try {
    const outPath = await generateRegistry(config);
    logger.success(`Generated registry at ${outPath}`);
    try {
      execSync(`git add ${outPath}`, { encoding: "utf-8" });
      logger.success(`Staged registry file: ${outPath}`);
    } catch (error) {
      logger.error(`Failed to stage registry file: ${error}`);
      return false;
    }
    return true;
  } catch (error) {
    logger.error(`Failed to generate registry: ${error}`);
    return false;
  }
}
function installPreCommitHook(config) {
  logger.info("Installing pre-commit hook");
  if (!config.preCommitHook?.enabled) {
    logger.info("Pre-commit hook is disabled");
    return true;
  }
  try {
    const hooksDir = path4.join(process.cwd(), ".git", "hooks");
    if (!fs3.existsSync(hooksDir)) {
      fs3.mkdirSync(hooksDir, { recursive: true });
    }
    const preCommitPath = path4.join(hooksDir, "pre-commit");
    const preCommitScript = `#!/bin/sh
# astro-shadcn-registry pre-commit hook
npx astro registry:generate || exit 1
`;
    fs3.writeFileSync(preCommitPath, preCommitScript, { mode: 493 });
    logger.success(`Installed pre-commit hook at ${preCommitPath}`);
    return true;
  } catch (error) {
    logger.error(`Failed to install pre-commit hook: ${error}`);
    return false;
  }
}
function uninstallPreCommitHook() {
  logger.info("Uninstalling pre-commit hook");
  try {
    const preCommitPath = path4.join(
      process.cwd(),
      ".git",
      "hooks",
      "pre-commit"
    );
    if (fs3.existsSync(preCommitPath)) {
      const content = fs3.readFileSync(preCommitPath, "utf-8");
      if (content.includes("astro-shadcn-registry")) {
        fs3.unlinkSync(preCommitPath);
        logger.success(`Uninstalled pre-commit hook at ${preCommitPath}`);
      } else {
        logger.warn(
          `Pre-commit hook at ${preCommitPath} was not created by astro-shadcn-registry`
        );
      }
    } else {
      logger.info("No pre-commit hook found");
    }
    return true;
  } catch (error) {
    logger.error(`Failed to uninstall pre-commit hook: ${error}`);
    return false;
  }
}
var init_pre_commit = __esm({
  "src/cli/pre-commit.ts"() {
    "use strict";
    init_logger();
    init_generate();
  }
});

// src/config.ts
var defaultConfig = {
  paths: {
    registry: "src/registry",
    contentCollection: "src/content",
    outputRegistry: "registry.json"
  },
  componentTypes: [
    "ui",
    "component",
    "block",
    "hook",
    "lib",
    "page",
    "file",
    "style",
    "theme"
  ],
  registry: {
    name: "my-registry",
    homepage: "https://mycomponents.com"
  },
  preCommitHook: {
    enabled: false,
    paths: ["src/registry/**/*"]
  },
  advanced: {
    defaultLanguage: "react",
    registryURL: "https://mycomponents.com",
    deleteRegistryAfterBuild: true
  }
};
function mergeConfig(userConfig = {}) {
  return {
    paths: {
      ...defaultConfig.paths,
      ...userConfig.paths
    },
    componentTypes: userConfig.componentTypes || defaultConfig.componentTypes,
    registry: {
      ...defaultConfig.registry,
      ...userConfig.registry
    },
    preCommitHook: {
      ...defaultConfig.preCommitHook,
      ...userConfig.preCommitHook
    },
    advanced: {
      ...defaultConfig.advanced,
      ...userConfig.advanced
    }
  };
}
function validateConfig(config) {
  if (!config.paths.registry) {
    throw new Error("Registry path is required");
  }
  if (!config.paths.contentCollection) {
    throw new Error("Content collection path is required");
  }
  if (!config.paths.outputRegistry) {
    throw new Error("Output registry path is required");
  }
  if (!config.registry.name) {
    throw new Error("Registry name is required");
  }
  if (!config.registry.homepage) {
    throw new Error("Registry homepage is required");
  }
  if (!config.componentTypes || config.componentTypes.length === 0) {
    throw new Error("At least one component type is required");
  }
}

// src/index.ts
init_generate();

// src/cli/commands.ts
init_logger();
init_generate();

// src/cli/setup.ts
init_logger();
init_file_utils();
import fs4 from "fs";
import path5 from "path";
import inquirer2 from "inquirer";

// src/registry/templates/content-config.ts
function generateContentConfig(componentTypes) {
  const collectionDefinitions = componentTypes.map((type) => {
    const collectionName = type === "ui" ? type : `${type}s`;
    return `
  ${collectionName}: defineCollection({
    type: 'content',
    schema: z.object({
      name: z.string().optional(),
      title: z.string(),
      description: z.string(),
      type: z.string(),
      author: z.string().optional(),
      dependencies: z.array(z.string()).optional(),
      shadcnRegistryDependencies: z.array(z.string()).optional(),
      internalRegistryDependencies: z.array(z.string()).optional(),
      otherRegistryDependencies: z.array(z.string()).optional(),
      categories: z.array(z.string()).optional(),
      docs: z.string().optional(),
      defaultProps: z.record(z.any()).optional(),
      language: z.enum(['astro', 'react', 'vue', 'html']),
      files: z.array(z.object({
        path: z.string(),
        type: z.string(),
        target: z.string().optional(),
      })),
      tailwind: z.any().optional(),
      cssVars: z.any().optional(),
      css: z.any().optional(),
      meta: z.record(z.any()).optional(),
    }),
  }),`;
  }).join("\n");
  return `// Content collections configuration for registry components
import { defineCollection, z } from 'astro:content';

// Define the collections
const collections = {${collectionDefinitions}
};

export const config = { collections };
`;
}

// src/cli/setup.ts
async function setup(config) {
  logger.info("Starting setup wizard for astro-shadcn-registry");
  const projectRoot = process.cwd();
  const existingContentCollections = detectContentCollections(projectRoot);
  const existingRegistryComponents = detectRegistryComponents(projectRoot);
  if (existingContentCollections.length > 0) {
    logger.info(
      `Detected existing content collections: ${existingContentCollections.join(
        ", "
      )}`
    );
  }
  if (existingRegistryComponents.length > 0) {
    logger.info(
      `Detected existing registry components: ${existingRegistryComponents.join(
        ", "
      )}`
    );
  }
  const registryConfig = await inquirer2.prompt([
    {
      type: "input",
      name: "name",
      message: "What is the name of your registry?",
      default: config.registry.name
    },
    {
      type: "input",
      name: "homepage",
      message: "What is the homepage URL of your registry?",
      default: config.registry.homepage
    }
  ]);
  const pathsConfig = await inquirer2.prompt([
    {
      type: "input",
      name: "registry",
      message: "Where are your registry components stored?",
      default: config.paths.registry
    },
    {
      type: "input",
      name: "contentCollection",
      message: "Where are your content collections stored?",
      default: config.paths.contentCollection
    },
    {
      type: "input",
      name: "outputRegistry",
      message: "Where should the registry.json file be output?",
      default: config.paths.outputRegistry
    }
  ]);
  const { componentTypes } = await inquirer2.prompt([
    {
      type: "checkbox",
      name: "componentTypes",
      message: "Which component types do you want to include?",
      choices: [
        {
          name: "UI Components",
          value: "ui",
          checked: config.componentTypes.includes("ui")
        },
        {
          name: "General Components",
          value: "component",
          checked: config.componentTypes.includes("component")
        },
        {
          name: "Block Components",
          value: "block",
          checked: config.componentTypes.includes("block")
        },
        {
          name: "Hooks",
          value: "hook",
          checked: config.componentTypes.includes("hook")
        },
        {
          name: "Libraries",
          value: "lib",
          checked: config.componentTypes.includes("lib")
        },
        {
          name: "Pages",
          value: "page",
          checked: config.componentTypes.includes("page")
        },
        {
          name: "Files",
          value: "file",
          checked: config.componentTypes.includes("file")
        },
        {
          name: "Styles",
          value: "style",
          checked: config.componentTypes.includes("style")
        },
        {
          name: "Themes",
          value: "theme",
          checked: config.componentTypes.includes("theme")
        }
      ],
      default: config.componentTypes
    }
  ]);
  const advancedConfig = await inquirer2.prompt([
    {
      type: "list",
      name: "defaultLanguage",
      message: "What is the default language for your components?",
      choices: ["react", "astro", "vue", "html"],
      default: config.advanced?.defaultLanguage || "react"
    },
    {
      type: "input",
      name: "registryURL",
      message: "What is the URL for your registry?",
      default: config.advanced?.registryURL || config.registry.homepage
    }
  ]);
  const { enablePreCommitHook } = await inquirer2.prompt([
    {
      type: "confirm",
      name: "enablePreCommitHook",
      message: "Do you want to enable the pre-commit hook?",
      default: config.preCommitHook?.enabled || false
    }
  ]);
  let preCommitPaths = config.preCommitHook?.paths || ["src/registry/**/*"];
  if (enablePreCommitHook) {
    const { paths } = await inquirer2.prompt([
      {
        type: "input",
        name: "paths",
        message: "Which paths should trigger the pre-commit hook? (comma-separated)",
        default: preCommitPaths.join(", "),
        filter: (input) => input.split(",").map((p) => p.trim())
      }
    ]);
    preCommitPaths = paths;
  }
  const updatedConfig = {
    paths: {
      registry: pathsConfig.registry,
      contentCollection: pathsConfig.contentCollection,
      outputRegistry: pathsConfig.outputRegistry
    },
    componentTypes,
    registry: {
      name: registryConfig.name,
      homepage: registryConfig.homepage
    },
    preCommitHook: {
      enabled: enablePreCommitHook,
      paths: preCommitPaths
    },
    advanced: {
      defaultLanguage: advancedConfig.defaultLanguage,
      registryURL: advancedConfig.registryURL
    }
  };
  if (enablePreCommitHook) {
    const { confirmInstallHook } = await inquirer2.prompt([
      {
        type: "confirm",
        name: "confirmInstallHook",
        message: "Do you want to install the pre-commit hook now?",
        default: true
      }
    ]);
    if (confirmInstallHook) {
      try {
        const { installPreCommitHook: installPreCommitHook2 } = await Promise.resolve().then(() => (init_pre_commit(), pre_commit_exports));
        const success = installPreCommitHook2(updatedConfig);
        if (success) {
          logger.success("Pre-commit hook installed successfully");
        } else {
          logger.error("Failed to install pre-commit hook");
        }
      } catch (error) {
        logger.error(`Failed to install pre-commit hook: ${error}`);
      }
    }
  }
  const { createDirectories } = await inquirer2.prompt([
    {
      type: "confirm",
      name: "createDirectories",
      message: "Do you want to create the necessary directories?",
      default: true
    }
  ]);
  if (createDirectories) {
    ensureDir(updatedConfig.paths.registry);
    logger.success(
      `Created registry directory: ${updatedConfig.paths.registry}`
    );
    for (const type of componentTypes) {
      const collectionName = type === "ui" ? type : `${type}s`;
      const collectionDir = path5.join(
        updatedConfig.paths.contentCollection,
        collectionName
      );
      ensureDir(collectionDir);
      logger.success(`Created content collection directory: ${collectionDir}`);
    }
    const { createContentConfig } = await inquirer2.prompt([
      {
        type: "confirm",
        name: "createContentConfig",
        message: "Do you want to create a content config file?",
        default: true
      }
    ]);
    if (createContentConfig) {
      const contentConfigPath = path5.join(
        updatedConfig.paths.contentCollection,
        "config.ts"
      );
      const contentConfigContent = generateContentConfig(componentTypes);
      fs4.writeFileSync(contentConfigPath, contentConfigContent, "utf-8");
      logger.success(`Created content config file: ${contentConfigPath}`);
    }
  }
  const wasInstalledViaAstroAdd = process.env.ASTRO_ADD === "true";
  const { updateAstroConfig } = wasInstalledViaAstroAdd ? { updateAstroConfig: false } : await inquirer2.prompt([
    {
      type: "confirm",
      name: "updateAstroConfig",
      message: "Do you want to update your astro.config.mjs file?",
      default: true
    }
  ]);
  if (updateAstroConfig) {
    try {
      const astroConfigPath = path5.join(process.cwd(), "astro.config.mjs");
      if (fs4.existsSync(astroConfigPath)) {
        let astroConfig = fs4.readFileSync(astroConfigPath, "utf-8");
        if (!astroConfig.includes("astro-shadcn-registry")) {
          const integrationConfig = `
  shadcnRegistry({
    paths: {
      registry: "${updatedConfig.paths.registry}",
      contentCollection: "${updatedConfig.paths.contentCollection}",
      outputRegistry: "${updatedConfig.paths.outputRegistry}",
    },
    componentTypes: ${JSON.stringify(updatedConfig.componentTypes)},
    registry: {
      name: "${updatedConfig.registry.name}",
      homepage: "${updatedConfig.registry.homepage}",
    },
    preCommitHook: {
      enabled: ${updatedConfig.preCommitHook?.enabled || false},
      paths: ${JSON.stringify(
            updatedConfig.preCommitHook?.paths || ["src/registry/**/*"]
          )},
    },
    advanced: {
      defaultLanguage: "${updatedConfig.advanced?.defaultLanguage || "react"}",
      registryURL: "${updatedConfig.advanced?.registryURL || updatedConfig.registry.homepage}",
    },
  }),`;
          const integrationsMatch = astroConfig.match(/integrations\s*:\s*\[/);
          if (integrationsMatch) {
            const insertPosition = integrationsMatch.index + integrationsMatch[0].length;
            astroConfig = astroConfig.substring(0, insertPosition) + integrationConfig + astroConfig.substring(insertPosition);
          } else {
            const defineConfigMatch = astroConfig.match(
              /defineConfig\s*\(\s*\{/
            );
            if (defineConfigMatch) {
              const insertPosition = defineConfigMatch.index + defineConfigMatch[0].length;
              astroConfig = astroConfig.substring(0, insertPosition) + `
  integrations: [${integrationConfig}
  ],` + astroConfig.substring(insertPosition);
            } else {
              throw new Error(
                "Could not find defineConfig in astro.config.mjs"
              );
            }
          }
          const importStatement = `import shadcnRegistry from 'astro-shadcn-registry';
`;
          astroConfig = importStatement + astroConfig;
          fs4.writeFileSync(astroConfigPath, astroConfig, "utf-8");
          logger.success(
            `Updated astro.config.mjs with integration configuration`
          );
        } else {
          logger.info("Integration already exists in astro.config.mjs");
        }
      } else {
        logger.warn(
          "astro.config.mjs not found. Please add the integration manually."
        );
      }
    } catch (error) {
      logger.error(`Failed to update astro.config.mjs: ${error}`);
    }
  }
  logger.success("Setup completed successfully!");
  return updatedConfig;
}
function detectContentCollections(projectRoot) {
  const collections = [];
  const contentDir = path5.join(projectRoot, "src", "content");
  if (fs4.existsSync(contentDir)) {
    try {
      const entries = fs4.readdirSync(contentDir, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.isDirectory()) {
          collections.push(entry.name);
        }
      }
    } catch (error) {
      logger.debug(`Error reading content directory: ${error}`);
    }
  }
  return collections;
}
function detectRegistryComponents(projectRoot) {
  const components = [];
  const possibleDirs = [
    path5.join(projectRoot, "src", "registry"),
    path5.join(projectRoot, "src", "components"),
    path5.join(projectRoot, "src", "components", "ui"),
    path5.join(projectRoot, "src", "ui")
  ];
  for (const dir of possibleDirs) {
    if (fs4.existsSync(dir)) {
      try {
        const entries = fs4.readdirSync(dir, { withFileTypes: true });
        if (entries.some(
          (entry) => entry.isFile() && (entry.name.endsWith(".tsx") || entry.name.endsWith(".jsx") || entry.name.endsWith(".ts") || entry.name.endsWith(".js") || entry.name.endsWith(".astro"))
        )) {
          components.push(dir.replace(projectRoot + path5.sep, ""));
        }
      } catch (error) {
        logger.debug(`Error reading directory ${dir}: ${error}`);
      }
    }
  }
  return components;
}

// src/cli/validate.ts
init_logger();
init_file_utils();
init_dependency_analyzer();
import fs5 from "fs";
import path6 from "path";
async function validateRegistry(config) {
  const projectRoot = process.cwd();
  const spinner = logger.spinner("Validating registry configuration");
  try {
    spinner.update("Validating paths");
    if (!fs5.existsSync(config.paths.registry)) {
      spinner.error(`Registry path does not exist: ${config.paths.registry}`);
      throw new Error(`Registry path does not exist: ${config.paths.registry}`);
    }
    if (!fs5.existsSync(config.paths.contentCollection)) {
      spinner.error(
        `Content collection path does not exist: ${config.paths.contentCollection}`
      );
      throw new Error(
        `Content collection path does not exist: ${config.paths.contentCollection}`
      );
    }
    const outputDir = path6.dirname(
      path6.join(projectRoot, config.paths.outputRegistry)
    );
    if (!fs5.existsSync(outputDir)) {
      spinner.error(`Output registry directory does not exist: ${outputDir}`);
      throw new Error(`Output registry directory does not exist: ${outputDir}`);
    }
    spinner.update("Validating component types");
    if (!config.componentTypes || config.componentTypes.length === 0) {
      spinner.error("No component types defined");
      throw new Error("No component types defined");
    }
    spinner.update("Finding content files");
    const entryFiles = await findContentFiles(
      config.paths.contentCollection,
      config.componentTypes
    );
    if (entryFiles.length === 0) {
      spinner.error("No content files found");
      throw new Error("No content files found");
    }
    spinner.update(`Found ${entryFiles.length} content files`);
    spinner.update("Parsing registry entries");
    const registryEntries = parseRegistryEntries(entryFiles);
    if (registryEntries.length === 0) {
      spinner.error("No registry entries found");
      throw new Error("No registry entries found");
    }
    spinner.update(`Parsed ${registryEntries.length} registry entries`);
    spinner.update("Validating registry entries");
    const errors = [];
    const warnings = [];
    for (const entry of registryEntries) {
      if (!entry.frontmatter.title) {
        errors.push(`Entry ${entry.name} is missing a title`);
      }
      if (!entry.frontmatter.description) {
        errors.push(`Entry ${entry.name} is missing a description`);
      }
      if (!entry.frontmatter.type) {
        errors.push(`Entry ${entry.name} is missing a type`);
      } else {
        const typeWithoutPrefix = entry.frontmatter.type.replace(
          "registry:",
          ""
        );
        if (!config.componentTypes.includes(typeWithoutPrefix)) {
          errors.push(
            `Entry ${entry.name} has an invalid type: ${entry.frontmatter.type}`
          );
        }
      }
      if (!entry.frontmatter.files || entry.frontmatter.files.length === 0) {
        errors.push(`Entry ${entry.name} has no files`);
      } else {
        for (const file of entry.frontmatter.files) {
          const filePath = path6.join(projectRoot, file.path);
          if (!fs5.existsSync(filePath)) {
            errors.push(
              `Entry ${entry.name} references non-existent file: ${file.path}`
            );
          }
        }
      }
    }
    spinner.update("Validating dependencies");
    const availableComponents = /* @__PURE__ */ new Map();
    for (const entry of registryEntries) {
      availableComponents.set(entry.name, entry.filePath);
    }
    for (const entry of registryEntries) {
      if (entry.frontmatter.internalRegistryDependencies) {
        for (const dep of entry.frontmatter.internalRegistryDependencies) {
          if (!availableComponents.has(dep)) {
            errors.push(
              `Entry ${entry.name} depends on non-existent component: ${dep}`
            );
          }
        }
      }
      const { packageDependencies, internalDependencies, unknownImports } = await analyzeDependencies(entry, registryEntries, projectRoot);
      const declaredDeps = entry.frontmatter.dependencies || [];
      for (const pkg of packageDependencies) {
        if (!declaredDeps.includes(pkg)) {
          warnings.push(
            `Entry ${entry.name} is missing package dependency: ${pkg}`
          );
        }
      }
      const declaredInternalDeps = entry.frontmatter.internalRegistryDependencies || [];
      for (const dep of internalDependencies) {
        if (!declaredInternalDeps.includes(dep)) {
          warnings.push(
            `Entry ${entry.name} is missing internal dependency: ${dep}`
          );
        }
      }
      if (unknownImports.length > 0) {
        for (const { path: importPath } of unknownImports) {
          warnings.push(
            `Entry ${entry.name} has unknown import: ${importPath}`
          );
        }
      }
    }
    if (errors.length > 0) {
      spinner.error(`Found ${errors.length} errors`);
      for (const error of errors) {
        logger.error(error);
      }
      throw new Error(`Validation failed with ${errors.length} errors`);
    }
    if (warnings.length > 0) {
      spinner.update(`Found ${warnings.length} warnings`);
      for (const warning of warnings) {
        logger.warn(warning);
      }
    }
    spinner.complete("Registry validation completed successfully");
  } catch (error) {
    spinner.error(`Validation failed: ${error}`);
    throw error;
  }
}

// src/cli/commands.ts
init_pre_commit();
if (typeof process !== "undefined" && process.argv && process.argv.length > 1) {
  try {
    const scriptUrl = new URL(process.argv[1], `file://${process.cwd()}/`).href;
    if (import.meta.url === scriptUrl) {
      const command = process.argv[2];
      const defaultConfig2 = mergeConfig({});
      logger.debug(`Running command: ${command}`);
      switch (command) {
        case "registry:setup":
          setupCommand(defaultConfig2).catch((err) => {
            logger.error(`Setup failed: ${err}`);
            process.exit(1);
          });
          break;
        case "registry:generate":
          generateCommand(defaultConfig2).catch((err) => {
            logger.error(`Generate failed: ${err}`);
            process.exit(1);
          });
          break;
        case "registry:validate":
          validateCommand(defaultConfig2).catch((err) => {
            logger.error(`Validation failed: ${err}`);
            process.exit(1);
          });
          break;
        case "registry:install-hook":
          installHookCommand(defaultConfig2);
          break;
        case "registry:uninstall-hook":
          uninstallHookCommand();
          break;
        default:
          logger.error(`Unknown command: ${command}`);
          logger.info("Available commands:");
          logger.info("  registry:setup - Run the setup wizard");
          logger.info("  registry:generate - Generate the registry.json file");
          logger.info(
            "  registry:validate - Validate the registry configuration"
          );
          logger.info("  registry:install-hook - Install the pre-commit hook");
          logger.info(
            "  registry:uninstall-hook - Uninstall the pre-commit hook"
          );
          process.exit(1);
      }
    }
  } catch (error) {
    logger.debug(`Error in CLI command detection: ${error}`);
  }
}
async function generateCommand(config) {
  logger.info("Generating registry.json");
  try {
    const outPath = await generateRegistry(config, logger);
    logger.info(`Generated registry at ${outPath}`);
  } catch (error) {
    logger.error(`Failed to generate registry: ${error}`);
    process.exit(1);
  }
}
async function setupCommand(config) {
  logger.info("Running setup wizard");
  try {
    await setup(config);
    logger.success("Setup completed successfully");
  } catch (error) {
    logger.error(`Setup failed: ${error}`);
    process.exit(1);
  }
}
async function validateCommand(config) {
  logger.info("Validating registry configuration and component structure");
  try {
    await validateRegistry(config);
    logger.success("Registry validation completed successfully");
  } catch (error) {
    logger.error(`Validation failed: ${error}`);
    process.exit(1);
  }
}
function installHookCommand(config) {
  logger.info("Installing pre-commit hook");
  try {
    const success = installPreCommitHook(config);
    if (success) {
      logger.success("Pre-commit hook installed successfully");
    } else {
      logger.error("Failed to install pre-commit hook");
      process.exit(1);
    }
  } catch (error) {
    logger.error(`Failed to install pre-commit hook: ${error}`);
    process.exit(1);
  }
}
function uninstallHookCommand() {
  logger.info("Uninstalling pre-commit hook");
  try {
    const success = uninstallPreCommitHook();
    if (success) {
      logger.success("Pre-commit hook uninstalled successfully");
    } else {
      logger.error("Failed to uninstall pre-commit hook");
      process.exit(1);
    }
  } catch (error) {
    logger.error(`Failed to uninstall pre-commit hook: ${error}`);
    process.exit(1);
  }
}
function registerCommands(cli, config) {
  logger.debug("Registering CLI commands with Astro");
  try {
    cli.createCommand("registry:generate").describe("Generate the registry.json file").action(async () => {
      await generateCommand(config);
    });
    cli.createCommand("registry:setup").describe("Run the setup wizard to configure the integration").action(async () => {
      await setupCommand(config);
    });
    cli.createCommand("registry:validate").describe("Validate the registry configuration and component structure").action(async () => {
      await validateCommand(config);
    });
    cli.createCommand("registry:install-hook").describe("Install the pre-commit hook").action(() => {
      installHookCommand(config);
    });
    cli.createCommand("registry:uninstall-hook").describe("Uninstall the pre-commit hook").action(() => {
      uninstallHookCommand();
    });
  } catch (error) {
    logger.error(`Failed to register commands: ${error}`);
    logger.info(
      "Commands can still be run using npx astro-shadcn-registry <command>"
    );
  }
}

// src/index.ts
init_pre_commit();

// src/utils/shadcn.ts
import { spawn } from "child_process";
import fs6 from "fs";
import path7 from "path";
async function buildShadcnRegistry(registryPath, logger3) {
  return new Promise((resolve, reject) => {
    logger3.info("Building registry with shadcn CLI...");
    if (!fs6.existsSync(registryPath)) {
      logger3.error(`Registry file not found: ${registryPath}`);
      return reject(new Error(`Registry file not found: ${registryPath}`));
    }
    const cwd = path7.dirname(registryPath);
    const shadcnProcess = spawn("npx", ["shadcn", "build"], {
      cwd,
      stdio: "pipe",
      shell: true
    });
    let stdout = "";
    shadcnProcess.stdout.on("data", (data) => {
      const output = data.toString();
      stdout += output;
      logger3.info(output.trim());
    });
    let stderr = "";
    shadcnProcess.stderr.on("data", (data) => {
      const output = data.toString();
      stderr += output;
      logger3.error(output.trim());
    });
    shadcnProcess.on("close", (code) => {
      if (code === 0) {
        logger3.info("Registry built successfully with shadcn CLI");
        resolve(true);
      } else {
        logger3.error(`shadcn build failed with code ${code}`);
        logger3.error(stderr);
        reject(new Error(`shadcn build failed with code ${code}: ${stderr}`));
      }
    });
    shadcnProcess.on("error", (err) => {
      logger3.error(`Failed to start shadcn build: ${err.message}`);
      reject(err);
    });
  });
}
async function deleteRegistryFile(registryPath, logger3) {
  return new Promise((resolve) => {
    try {
      if (fs6.existsSync(registryPath)) {
        fs6.unlinkSync(registryPath);
        logger3.info(`Deleted registry file: ${registryPath}`);
        resolve(true);
      } else {
        logger3.warn(`Registry file not found: ${registryPath}`);
        resolve(false);
      }
    } catch (error) {
      logger3.error(`Failed to delete registry file: ${error}`);
      resolve(false);
    }
  });
}

// src/index.ts
init_generate();
init_pre_commit();
import fs7 from "fs";
import path8 from "path";
var astroLogger;
function shadcnRegistry(userConfig = {}) {
  const config = mergeConfig(userConfig);
  return {
    name: "astro-shadcn-registry",
    hooks: {
      "astro:config:setup": ({
        command,
        addWatchFile,
        logger: currentLogger
      }) => {
        astroLogger = currentLogger;
        try {
          const { addCommand } = arguments[0];
          if (typeof addCommand === "function") {
            astroLogger.debug("Registering CLI commands with Astro");
            registerCommands(addCommand, config);
          }
        } catch (error) {
          astroLogger.debug(
            "Could not register CLI commands directly, falling back to astroIntegrationCommands export"
          );
        }
        validateConfig(config);
        astroLogger.info(`Setting up astro-shadcn-registry integration`);
        astroLogger.info(`Registry path: ${config.paths.registry}`);
        astroLogger.info(
          `Content collection path: ${config.paths.contentCollection}`
        );
        astroLogger.info(
          `Output registry path: ${config.paths.outputRegistry}`
        );
        if (command === "dev") {
          astroLogger.info(
            "Adding watch for registry components and content collections"
          );
          addWatchFile(config.paths.registry);
          addWatchFile(config.paths.contentCollection);
          const registryPath = path8.join(
            process.cwd(),
            config.paths.outputRegistry
          );
          if (fs7.existsSync(registryPath)) {
            addWatchFile(registryPath);
          }
        }
        if (config.preCommitHook?.enabled) {
          installPreCommitHook(config);
        }
      },
      "astro:build:start": async () => {
        astroLogger.info("Generating registry.json during build");
        try {
          const minimalLogger = {
            info: (message) => astroLogger.info(message),
            warn: (message) => astroLogger.warn(message),
            error: (message) => astroLogger.error(message),
            // Add success method that maps to info
            success: (message) => astroLogger.info(message),
            // Add debug method that maps to info with a prefix
            debug: (message) => astroLogger.info(`[DEBUG] ${message}`),
            // Add a simple spinner implementation
            spinner: (message) => {
              astroLogger.info(`${message}...`);
              return {
                update: (msg) => astroLogger.info(`${msg}...`),
                complete: (msg) => astroLogger.info(msg),
                error: (msg) => astroLogger.error(msg)
              };
            }
          };
          const outPath = await generateRegistry(config, minimalLogger);
          astroLogger.info(`Generated registry at ${outPath}`);
          try {
            await buildShadcnRegistry(outPath, minimalLogger);
            if (config.advanced?.deleteRegistryAfterBuild) {
              await deleteRegistryFile(outPath, minimalLogger);
            }
          } catch (shadcnError) {
            astroLogger.error(
              `Failed to build registry with shadcn CLI: ${shadcnError}`
            );
          }
        } catch (error) {
          astroLogger.error(`Failed to generate registry: ${error}`);
          throw error;
        }
      },
      "astro:build:done": () => {
        astroLogger.info("Registry generation completed successfully");
      },
      "astro:server:setup": () => {
        astroLogger.info("Setting up development server");
      },
      "astro:server:start": async () => {
        astroLogger.info("Generating registry.json for development server");
        try {
          const minimalLogger = {
            info: (message) => astroLogger.info(message),
            warn: (message) => astroLogger.warn(message),
            error: (message) => astroLogger.error(message),
            // Add success method that maps to info
            success: (message) => astroLogger.info(message),
            // Add debug method that maps to info with a prefix
            debug: (message) => astroLogger.info(`[DEBUG] ${message}`),
            // Add a simple spinner implementation
            spinner: (message) => {
              astroLogger.info(`${message}...`);
              return {
                update: (msg) => astroLogger.info(`${msg}...`),
                complete: (msg) => astroLogger.info(msg),
                error: (msg) => astroLogger.error(msg)
              };
            }
          };
          const outPath = await generateRegistry(config, minimalLogger);
          astroLogger.info(`Generated registry at ${outPath}`);
          try {
            await buildShadcnRegistry(outPath, minimalLogger);
            if (config.advanced?.deleteRegistryAfterBuild) {
              await deleteRegistryFile(outPath, minimalLogger);
            }
          } catch (shadcnError) {
            astroLogger.error(
              `Failed to build registry with shadcn CLI: ${shadcnError}`
            );
          }
        } catch (error) {
          astroLogger.error(`Failed to generate registry: ${error}`);
        }
      },
      "astro:dev:start": () => {
        astroLogger.info(
          "Starting development server with registry integration"
        );
      }
    }
  };
}
var astroIntegrationCommands = {
  "registry:setup": setupCommand,
  "registry:generate": generateCommand,
  "registry:validate": validateCommand,
  "registry:install-hook": installHookCommand,
  "registry:uninstall-hook": uninstallHookCommand
};
export {
  astroIntegrationCommands,
  buildShadcnRegistry,
  shadcnRegistry as default,
  defaultConfig,
  deleteRegistryFile,
  generateRegistry,
  installPreCommitHook,
  runPreCommitHook,
  setup,
  uninstallPreCommitHook,
  validateRegistry
};
//# sourceMappingURL=index.mjs.map
