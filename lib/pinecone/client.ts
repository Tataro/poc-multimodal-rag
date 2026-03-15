import { Pinecone } from "@pinecone-database/pinecone";

import { assertRuntimeSecrets, config } from "@/lib/config";

function getClient() {
  assertRuntimeSecrets();
  return new Pinecone({ apiKey: config.PINECONE_API_KEY });
}

export function getIndex() {
  const pinecone = getClient();
  if (config.PINECONE_INDEX_HOST) {
    return pinecone.index(
      config.PINECONE_INDEX_NAME,
      config.PINECONE_INDEX_HOST,
    );
  }
  return pinecone.index(config.PINECONE_INDEX_NAME);
}

export async function pingPinecone() {
  const pinecone = getClient();
  await pinecone.listIndexes();
  return true;
}
