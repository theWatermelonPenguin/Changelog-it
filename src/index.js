#!/usr/bin/env node
import { execSync } from "child_process";
import fs from "fs";

const typeMap = {
  feat: "Added",
  fix: "Fixed",
  chore: "Changed",
  refactor: "Changed",
  perf: "Changed",
  docs: "Changed",
  style: "Changed",
  test: "Changed",
  breaking: "Changed",
};

const changelogIntro = `# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

`;

function getAllTags() {
  try {
    const tags = execSync("git tag --sort=creatordate").toString().trim();
    return tags ? tags.split("\n") : [];
  } catch {
    return [];
  }
}

function getTagDate(tag) {
  try {
    const date = execSync(`git log -1 --format=%aI ${tag}`).toString().trim();
    return date.slice(0, 10); // Get YYYY-MM-DD
  } catch {
    return null;
  }
}

function getCommitsBetween(from, to) {
  const range = from ? `${from}..${to}` : to;
  const log = execSync(`git log ${range} --pretty=format:%s`).toString();

  const grouped = {
    Added: [],
    Changed: [],
    Fixed: [],
  };

  log.split("\n").forEach(line => {
    // Skip GitHub Actions bot commits (e.g., automated changelog updates)
    const lower = line.toLowerCase();
    if (
      lower.includes("update unreleased section") ||
      lower.includes("[skip ci]")
    ) {
      return; // skip this line
    }

    const match = line.match(/^(feat|fix|docs|chore|refactor|perf|test|build|ci|style|breaking)(\(.+\))?:\s*(.*)$/);
    if (match) {
      const type = match[1];
      const message = match[3];
      const heading = typeMap[type];
      if (heading) {
        grouped[heading].push(`- ${message.trim()}`);
      }
    }
  });

  return grouped;
}


function formatGroupedCommits(version, groups, date = null) {
  let result = `## [${version}]${date ? ` - ${date}` : ""}\n`;

  ["Added", "Changed", "Fixed"].forEach(section => {
    if (groups[section].length) {
      result += `\n### ${section}\n${groups[section].join("\n")}\n`;
    }
  });

  return result.trim() + "\n";
}

function regenerateChangelog() {
  const tags = getAllTags();
  const sections = [];

  // Unreleased
  const latestTag = tags.length > 0 ? tags[tags.length - 1] : null;
  const unreleased = getCommitsBetween(latestTag, "HEAD");
  const unreleasedFormatted = formatGroupedCommits("Unreleased", unreleased);
  sections.push(unreleasedFormatted);

  // Tagged versions (most recent at bottom)
  for (let i = tags.length - 1; i >= 0; i--) {
    const tag = tags[i];
    const prevTag = i > 0 ? tags[i - 1] : null;
    const grouped = getCommitsBetween(prevTag, tag);
    const date = getTagDate(tag);
    const formatted = formatGroupedCommits(tag, grouped, date);
    sections.push(formatted);
  }

  const changelogContent = changelogIntro + sections.join("\n\n");
  fs.writeFileSync("CHANGELOG.md", changelogContent.trim());
  console.log("CHANGELOG.md regenerated with tag dates!");
}


try {
  regenerateChangelog();
} catch (e) {
  console.error("Failed to regenerate changelog:", e.message);
}
