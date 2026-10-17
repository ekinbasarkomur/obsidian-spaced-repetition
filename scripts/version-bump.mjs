// Run by `npm version <version>`: copies the new package.json version into
// manifest.json and versions.json, so the release tag matches the manifest.
import { readFileSync, writeFileSync } from "fs";

const targetVersion = process.env.npm_package_version;

const manifest = JSON.parse(readFileSync("manifest.json", "utf8"));
manifest.version = targetVersion;
writeFileSync("manifest.json", JSON.stringify(manifest, null, 4) + "\n");

const versions = JSON.parse(readFileSync("versions.json", "utf8"));
writeFileSync(
    "versions.json",
    JSON.stringify({ [targetVersion]: manifest.minAppVersion, ...versions }, null, 4) + "\n",
);
