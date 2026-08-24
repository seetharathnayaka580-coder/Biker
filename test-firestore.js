import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import fs from 'fs';
const config = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf-8'));

const app = initializeApp({
  projectId: config.projectId,
  apiKey: config.apiKey,
  appId: config.appId
});
const db = getFirestore(app, config.firestoreDatabaseId);

async function test() {
  try {
    const snap = await getDoc(doc(db, "bikes", "BKT-1374"));
    console.log("SUCCESS:", snap.exists());
    process.exit(0);
  } catch(e) {
    console.error("ERROR:", e);
    process.exit(1);
  }
}
test();
