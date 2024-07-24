// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { connectAuthEmulator, getAuth } from 'firebase/auth'
import { FirestoreDataConverter, QueryDocumentSnapshot, Timestamp, initializeFirestore, persistentLocalCache, connectFirestoreEmulator } from "firebase/firestore"
import { getStorage } from 'firebase/storage'
import { County, FirebaseVisit, Visit } from "./types";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
export const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: "county-counting.firebaseapp.com",
  projectId: "county-counting",
  storageBucket: "county-counting.appspot.com",
  messagingSenderId: "372503305136",
  appId: "1:372503305136:web:2934935a76be1aa03bd475"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app)
export const db = initializeFirestore(app, { localCache: persistentLocalCache({}) });
export const storage = getStorage(app);
// const databaseId = process.env.REAdCT_APP_ENV === 'production' ? '(default)' : 'countycounter-dev'

if (process.env.REACT_APP_ENV !== 'production') {
  // Set up emulators    
  connectFirestoreEmulator(db, '127.0.0.1', 9000);
  // connectFunctionsEmulator(functions, 'localhost', 5001)
  connectAuthEmulator(auth, "http://127.0.0.1:9099");
}

// export const getUserDoc = (db: Firestore, uid: string) => {
//   return doc(db, "users", uid)
// }

export const countyConverter: FirestoreDataConverter<County, County<FirebaseVisit>> = {
  toFirestore: (county: County) => {
    const visits = county.visits.map(visitConverter.toFirestore).sort((a, b) => a.timestamp.toMillis() - b.timestamp.toMillis())
    return { ...county, visits }
  },
  fromFirestore: (snapshot: QueryDocumentSnapshot<County<FirebaseVisit>, County>) => {
    const county = snapshot.data()
    const visits = county.visits.map(visitConverter.fromFirestore)
    return { ...county, visits }
  }
};

export const visitConverter = {
  toFirestore: (visit: Visit): FirebaseVisit => {
    return {
      ...visit,
      timestamp: Timestamp.fromDate(new Date(visit.timestamp))
    }
  },
  fromFirestore: (visit: FirebaseVisit): Visit => {
    return {
      ...visit,
      timestamp: visit.timestamp.toDate().toJSON()
    }
  }
}

// export const getCounties = async (db: Firestore, uid: string) => {
//   const countiesRef = collection(db, 'users', uid, 'counties');

//   const snapshot = await getDocs(query(countiesRef).withConverter(countyConverter))
//   const counties = snapshot.docs.reduce((acc: CountyObject, d) => {
//     const doc = d.data() as County
//     acc[doc.id] = doc
//     return acc
//   }, {})

//   return counties
// }
