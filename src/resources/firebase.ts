// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { createUserWithEmailAndPassword, getAuth, signInWithEmailAndPassword, signOut } from 'firebase/auth'
import {  DocumentData, Firestore, QueryDocumentSnapshot, SnapshotOptions, collection, doc, getDocs, initializeFirestore, persistentLocalCache, query, setDoc } from "firebase/firestore"
import { getStorage } from 'firebase/storage'
import { County, CountyObject, FirebaseVisit, Visit } from "./utils";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: "county-counting.firebaseapp.com",
  projectId: "county-counting",
  storageBucket: "county-counting.appspot.com",
  messagingSenderId: "372503305136",
  appId: "1:372503305136:web:2934935a76be1aa03bd475"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const databaseId = process.env.REACT_APP_ENV === 'production' ? '(default)' : 'countycounter-dev'

export const auth = getAuth(app)
export const db = initializeFirestore(app, {localCache: persistentLocalCache({})}, databaseId);
export const storage = getStorage(app);

export const getUserDoc = (db: Firestore, uid: string) => {
  return doc(db, "users", uid)
}


// export const setCounty = (db: Firestore, uid: string, data: County) => {
//   const docRef = doc(db, 'users', uid, 'counties', data.id.toString())
//   setDoc(docRef, data);
// }

const converter = {
  toFirestore(county: County): DocumentData {
    return county
    // return {title: post.title, author: post.author};
  },
  fromFirestore(
    snapshot: QueryDocumentSnapshot,
    options: SnapshotOptions
  ): County {
    const data = snapshot.data(options)!;
    let visits: Visit[] = (data.visits as FirebaseVisit[]).map(v => ({...v, timestamp: v.timestamp.toDate()}))
    return {...data, visits} as County
  }
};

export const getCounties = async (db: Firestore, uid: string) => {
  const countiesRef = collection(db, 'users', uid, 'counties');

  const snapshot = await getDocs(query(countiesRef).withConverter(converter))
  const counties = snapshot.docs.reduce((acc: CountyObject, d) => {
    const doc = d.data() as County
    acc[doc.id] = doc
    return acc
  }, {})
  
  return counties
}

export const initializeUserFirestore = (db: Firestore, user: { username: string, uid: string, email: string, hometown: string }) => {
  const userDoc = getUserDoc(db, user.uid)

  const data = {
    username: user.username,
    hometown: user.hometown,
    admin: false,
    settings: {
      theme: "light"
    }
  }
  setDoc(userDoc, data).then(v => {
  }).catch(console.error)

  // return userDoc
}

export const logInWithEmailAndPassword = async (email: string, password: string) => {
  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (err: any) {
    console.error(err);
  }
};

export const signUpWithEmailAndPassword = async (email: string, password: string) => {
  try {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    return cred.user.uid
  } catch (err: any) {
    console.error(err);
  }
  return ""
};

export const logout = async () => {
  try {
    await signOut(auth);
  } catch (err: any) {
    console.error(err);
  }
}

