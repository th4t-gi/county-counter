import { browserLocalPersistence, browserSessionPersistence, createUserWithEmailAndPassword, setPersistence, signInWithEmailAndPassword, signOut, updateProfile } from 'firebase/auth'
import { doc, setDoc } from 'firebase/firestore'
import { auth, db } from '../../firebase'
import { LoginPayload, Profile, ProfilePayload } from '../../types'


export const createUser = async (user: ProfilePayload, remember: boolean) => {
  const persistence = remember ? browserLocalPersistence : browserSessionPersistence
  await setPersistence(auth, persistence)
  const cred = await createUserWithEmailAndPassword(auth, user.email, user.password);

  await updateProfile(cred.user, { displayName: user.username })

  setUserProfile(user, cred.user.uid)
}

export const loginUser = async ({ email, password }: LoginPayload, remember: boolean) => {
  //Authentication
  const persistence = remember ? browserLocalPersistence : browserSessionPersistence
  await setPersistence(auth, persistence)
  await signInWithEmailAndPassword(auth, email, password);
}

export const logoutUser = async () => {
  await signOut(auth)
}


// export const getUserProfile = createAsyncThunk<Profile | null, void, { state: RootState} >(
//   "auth/getUserProfile",
//   async (payload, {getState}) => {
//     const uid = auth.currentUser?.uid
//     if (uid) {
//       const userDoc = doc(db, "users", uid)
//       const snapshot = await getDoc(userDoc)
//       const profile = snapshot.data() as Profile
//       return profile
//     }
//     return null
//   }
// )

export const setUserProfile = async (user: ProfilePayload, uid: string) => {
  const userDoc = doc(db, "users", uid)

  const profile: Profile = {
    username: user.username,
    email: user.email,
    hometown: user.hometown,
    settings: {
      theme: "light"
    }
  }
  await setDoc(userDoc, profile)
}
