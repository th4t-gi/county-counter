// Import the functions you need from the SDKs you need
import { FirebaseApp, getApp, initializeApp } from "firebase/app";
import { createUserWithEmailAndPassword, getAuth, signInWithEmailAndPassword, signOut } from 'firebase/auth'
import { DocumentData, DocumentSnapshot, Firestore, FirestoreDataConverter, Timestamp, addDoc, collection, doc, getDoc, getFirestore, setDoc } from "firebase/firestore"
import { County } from "./utils";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBK2kh0-HoYMocw7IoaWZeGJLLEocvTHSA",
  authDomain: "county-counting.firebaseapp.com",
  projectId: "county-counting",
  storageBucket: "county-counting.appspot.com",
  messagingSenderId: "372503305136",
  appId: "1:372503305136:web:2934935a76be1aa03bd475"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app)
export const db = getFirestore(app);

export const getUserDoc = (db: Firestore, uid: string) => {
  return doc(db, "users", uid)
}

// const countiesConverter = {
//   // toFirestore: (county: County) => {
//   //   const {count, visits, image, trips} = county
//   //   return {
//   //     count,
//   //     visits,
//   //     image,
//   //     name: county.NAME,
//   //     state: county.STATE,
//   //     trips
//   //   };
//   // },
//   fromFirestore: (snapshot: DocumentSnapshot, options: any) => {
//     const data = snapshot.data(options);
//     return {}
//   }
// }

export const saveCounties = (db: Firestore, data: any) => {
  // getUserDoc().withConverter(countiesConverter)
}

export const initializeUserFirestore = (db: Firestore, user: { username: string, uid: string, email: string, hometown: string }) => {
  const userDoc = getUserDoc(db, user.uid)

  const data = {
    username: user.username,
    hometown: user.hometown,
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

