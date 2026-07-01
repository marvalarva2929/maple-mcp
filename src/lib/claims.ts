import { appendFile, mkdir } from "fs/promises";
import { join } from "path";
import { homedir } from "os";

const MAPLE_DIR = join(homedir(), ".maple");
const CLAIMS_FILE = join(MAPLE_DIR, "claims.jsonl");

export async function logClaim(discountId: string): Promise<void> {
  await mkdir(MAPLE_DIR, { recursive: true });
  const record = JSON.stringify({ discount_id: discountId, claimed_at: new Date().toISOString() });
  await appendFile(CLAIMS_FILE, record + "\n", "utf-8");
}
