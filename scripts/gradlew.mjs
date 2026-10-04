import { spawnSync } from "node:child_process";
import { platform } from "node:process";

// Valitsee oikean Gradle-wrapperin käyttöjärjestelmän mukaan:
// gradlew.bat Windowsilla, ./gradlew muualla.
const gradlew = platform === "win32" ? "gradlew.bat" : "./gradlew";
const result = spawnSync(gradlew, process.argv.slice(2), {
  stdio: "inherit",
  cwd: new URL("../android", import.meta.url),
});
process.exit(result.status ?? 1);
