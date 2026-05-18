/** Quick check: attendance store key parsing (YYYY-MM-DD:employeeId). */
const key = "2026-05-13:BE19990002";
const match = String(key).match(/^(\d{4}-\d{2}-\d{2}):(.+)$/);
if (!match || match[1] !== "2026-05-13" || match[2] !== "BE19990002") {
  console.error("FAIL key parse", match);
  process.exit(1);
}
const bad = key.split(":");
if (bad[0] === "2026" && bad[1] === "05") {
  console.error("FAIL old split would break date");
  process.exit(1);
}
console.log("OK attendance key parse:", match[1], match[2]);
