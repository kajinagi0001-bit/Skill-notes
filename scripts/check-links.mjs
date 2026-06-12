import { existsSync, readdirSync, readFileSync } from "node:fs";
import { extname, join, relative } from "node:path";
import { parse } from "parse5";

const outputDirectory = join(process.cwd(), "dist");
const base = (process.env.BASE_PATH ?? "/Skill-notes").replace(/\/$/, "");
const site = new URL(
  process.env.SITE_URL ?? "https://kajinagi0001-bit.github.io/Skill-notes/",
);
const externalUrls = new Set();
const failures = [];

function listHtmlFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory()
      ? listHtmlFiles(path)
      : extname(entry.name) === ".html"
        ? [path]
        : [];
  });
}

function visit(node, callback) {
  callback(node);
  for (const child of node.childNodes ?? []) {
    visit(child, callback);
  }
  if (node.content) {
    visit(node.content, callback);
  }
}

function outputPath(pathname) {
  const decoded = decodeURIComponent(pathname);
  const withoutBase =
    base && decoded.startsWith(`${base}/`)
      ? decoded.slice(base.length)
      : decoded;
  const clean = withoutBase.replace(/^\/+/, "");

  if (!clean || clean.endsWith("/")) {
    return join(outputDirectory, clean, "index.html");
  }

  return join(outputDirectory, clean);
}

for (const file of listHtmlFiles(outputDirectory)) {
  const pagePath =
    `/${relative(outputDirectory, file).replaceAll("\\", "/")}`.replace(
      /index\.html$/,
      "",
    );
  const pageUrl = new URL(`${base}${pagePath}`, site.origin);
  const document = parse(readFileSync(file, "utf8"));

  visit(document, (node) => {
    for (const attribute of node.attrs ?? []) {
      if (!["href", "src"].includes(attribute.name)) continue;
      const value = attribute.value.trim();
      if (
        !value ||
        value.startsWith("#") ||
        /^(data|mailto|javascript):/.test(value)
      ) {
        continue;
      }

      const url = new URL(value, pageUrl);
      if (url.origin !== site.origin) {
        externalUrls.add(url.href);
        continue;
      }

      const target = outputPath(url.pathname);
      if (!existsSync(target)) {
        failures.push(`${relative(outputDirectory, file)} -> ${value}`);
      }
    }
  });
}

for (const url of externalUrls) {
  try {
    let response = await fetch(url, {
      method: "HEAD",
      redirect: "follow",
      signal: AbortSignal.timeout(15_000),
    });
    if (response.status === 405) {
      response = await fetch(url, {
        redirect: "follow",
        signal: AbortSignal.timeout(15_000),
      });
    }
    if (response.status === 404 || response.status === 410) {
      failures.push(`${url} -> HTTP ${response.status}`);
    } else {
      console.log(`[external ${response.status}] ${url}`);
    }
  } catch (error) {
    console.warn(`[external warning] ${url}: ${error.message}`);
  }
}

if (failures.length > 0) {
  console.error("Broken links:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(
  `Checked ${listHtmlFiles(outputDirectory).length} HTML files and ${externalUrls.size} external URLs.`,
);
