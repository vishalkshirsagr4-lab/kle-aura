import { loadVATData } from "./paperVat";

/* Lazy singleton for the decoded paper-crumple animation data.
   The FBX + EXR (~2.9 MB) are fetched from /public/vat only when the
   events section first approaches the viewport. The decoded result is
   shared by every event card. */

const BASE = "/vat/";
let pending = null;

export function loadPaperAsset() {
  if (!pending) {
    pending = loadVATData(BASE).catch((err) => {
      pending = null; // allow a retry on a later visit
      throw err;
    });
  }
  return pending;
}
