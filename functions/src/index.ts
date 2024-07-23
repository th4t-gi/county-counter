/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import { onRequest } from "firebase-functions/v2/https";
import { onDocumentCreated, onDocumentDeleted } from "Firebase-functions/v2/firestore"
import * as logger from "firebase-functions/logger";
import * as admin from "firebase-admin"
import { getFirestore } from "firebase-admin/firestore"
import { increment } from "firebase/firestore"

admin.initializeApp()

export const helloWorld = onRequest((request, response) => {
  logger.info("Hello logs!", { structuredData: true });
  response.send("Hello from Firebase!");
});

export const countyadded = onDocumentCreated("/users/{uid}/counties/{c}", (event) => {
  const db = getFirestore()

  db.doc(`stats/unique-visits`).set({
    [event.params.c]: increment(1)
  })
})

export const countydeleted = onDocumentDeleted("/users/{uid}/counties/{c}", (event) => {
  const db = getFirestore()

  db.doc(`stats/unique-visits`).set({
    [event.params.c]: increment(1)
  })
})

