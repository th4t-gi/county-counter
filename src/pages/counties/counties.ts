import { County, CountyFeature, NatureOptions, SortOptions, Visit } from "../../types"
import { arrayUnion, deleteDoc, doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { auth, countyConverter, db, visitConverter } from "../../firebase";


export const sortOptions: { [key in SortOptions]?: string } = {
  visited: "Visited or Not",
  count: "# of Visits",
  year: "Year",
  nature: "Type of Visit"
}

export const natureOptions: { [key in NatureOptions]: string } = {
  layover: "Layover",
  driven: "Drove Through",
  steppedIn: "Stepped In",
  visited: "Visited",
  stayed: "Stayed",
  lived: "Lived"
}

export const getCounty = async (uid: string, countyId: number) => {
  const docRef = doc(db, 'users', uid, 'counties', countyId.toString()).withConverter(countyConverter)
  return (await getDoc(docRef)).data()
}


export const addVisit = async (uid: string, feature: CountyFeature, exists: boolean,
  visit: Visit = {
    nature: 'visited',
    trip: null,
    timestamp: new Date().toJSON()
  }
) => {
  const { properties, id } = feature
  const docRef = doc(db, 'users', uid, 'counties', id.toString()).withConverter(countyConverter)

  if (exists) {
    const newVisit = visitConverter.toFirestore(visit)
    await updateDoc(docRef, {
      visits: arrayUnion(newVisit)
    })
  } else {
    await setDoc(docRef, {
      id,
      name: properties.name,
      state: properties.state || "",
      visits: [visit]
    })
  }
}

export const deleteCounty = async (countyId: number) => {
  const uid = auth.currentUser?.uid
  if (uid) {
    const docRef = doc(db, 'users', uid, 'counties', countyId.toString())
    await deleteDoc(docRef)
  }
}

export const deleteVisit = async (county: County, visitIndex: number) => {
  const uid = auth.currentUser?.uid
  if (uid) {
    const docRef = doc(db, 'users', uid, 'counties', county.id.toString()).withConverter(countyConverter)
    if (county.visits.length > 1) {
      await setDoc(docRef, {
        visits: county.visits.filter((v, i) => i !== visitIndex)
      }, { merge: true })
    } else {
      await deleteDoc(docRef)
    }
  }
}

export const updateVisit = async (county: County, visitIndex: number, visit: Visit) => {
  const uid = auth.currentUser?.uid
  const visits = county.visits.map((v, i) => i === visitIndex ? visit : v)

  if (uid) {
    const docRef = doc(db, 'users', uid, 'counties', county.id.toString()).withConverter(countyConverter)
    await setDoc(docRef, {
      ...county,
      visits
    })
  }
}
