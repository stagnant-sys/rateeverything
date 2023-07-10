import { doc, collection, getCountFromServer, getDoc, getDocs, setDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { query, where } from "firebase/firestore";
import { db } from "./firebase";
import format from "date-fns/format";


// Firestore
const userFirestoreSetup = async (username) => {  
  await setDoc(doc(db, 'users', username), {
    username: username,
    ratings: [],
    reviews: [],
    lists: [],
    date: format(new Date(), 'dd MMM yy'),
    avatar: {
      link: "",
      caption: "",
    },
  });
}

const getAllUsernames = async () => {
  const querySnapshot = await getDocs(collection(db, "users"));
  const usernamesList = [];
  querySnapshot.forEach(user => usernamesList.push(user.data().username))
  return usernamesList;
}

const getUserInfo = async (userID) => {
  const userRef = doc(db, 'users', userID);
  const docSnap = await getDoc(userRef);
  const accountDate = docSnap.data().date;
  return docSnap.data();
}

const updateUserAvatar = async (username, imagePath, caption) => {
  const userRef = doc(db, 'users', username);
  await updateDoc(userRef, {
    avatar: {
      link: imagePath,
      caption: caption,
    }
  })
}

const getRatingsCounter = async () => {
  const querySnapshot = await getDocs(collection(db, "users"));
  let counter = 0;
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    counter += data.ratings.length;
  });
  return counter;
}

const getReviewsCounter = async () => {
  const querySnapshot = await getDocs(collection(db, "users"));
  let counter = 0;
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    counter += data.reviews.length;
  });
  return counter;
}

const getListsCounter = async () => {
  const querySnapshot = await getDocs(collection(db, "users"));
  let counter = 0;
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    counter += data.lists.length;
  });
  return counter;
}

// Firebase Storage
const storage = getStorage();

const uploadImage = async (path, file) => {
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file)
  const url = await getDownloadURL(ref(storage, path))
  return url;
}

const getImageUrl = async (path) => {
  const url = await getDownloadURL(ref(storage, path))
  return url;
}

const addImageToRelease = async (path, file) => {
  await uploadImage(path, file);
  getImageUrl(path);
}

// Website features
const getCollLength = async () => {
  const coll = collection(db, 'artists');
  const snapshot = await getCountFromServer(coll);
  return snapshot.data().count;
}

const submitArtist = async (artist, formed, country, genres) => {
  const artistID = await getCollLength();
  const docRef = doc(db, 'artists', artist);
  try {
    const docSnap = await getDoc(docRef);
    if(docSnap.exists()) {
      console.log(docSnap.data());
  } else {
    await setDoc(doc(db, "artists", artist), {
      artistID: artistID,
      artist: artist,
      formed: formed,
      country: country,
      genres: genres,
      releases: [],
    })
  }
  } catch(error) {
    console.log(error)
  }
}

const updateArtist = async (artist, formed, country, genres, username) => {
  // Get artist document
  const artistRef = doc(db, 'artists', artist);
  const docSnap = await getDoc(artistRef);
  const data = docSnap.data();
  const copyData = data;
  // History variables setup
  const history = copyData.editHistory;
  const changes = [];
  // Update history
  if (formed !== copyData.formed) {
    changes.push(`Formed (from "${copyData.formed}" to "${formed}")`);
  }
  if (JSON.stringify(genres) !== JSON.stringify(copyData.genres)) {
    changes.push(`Genres (from "${copyData.genres}" to "${genres}")`);
  }
  if (country !== copyData.country) {
    changes.push(`Country (from "${copyData.country}" to "${country}")`);
  }
  const historyData = {
    author: username,
    date: format(new Date(), 'dd/LL/yyyy HH:mm'),
    changes : changes,
  }
  history.push(historyData);
  // Update doc with new data
  await updateDoc(artistRef, 
    {
      country: country,
      formed: formed,
      genres: genres,
      editHistory: history,
    });
}

const submitRelease = async (artist, release, year, tracks, genres, ratings, reviews, imagePath, username) => {
  const albumID = await getAllReleasesLength();
  const artistRef = doc(db, 'artists', artist);
  const originalHistory = {
    author: username,
    date: format(new Date(), 'dd/LL/yyyy at HH:mm'),
    changes: ['Original submission']
  }
  await updateDoc(artistRef, {
    releases: arrayUnion({
      artist: artist, 
      release: release,
      year: year,
      tracks: tracks,
      ratings: ratings,
      reviews: reviews,
      genres: genres,
      albumID: albumID,
      average: '',
      imagePath: imagePath,
      editHistory: [originalHistory],
    })
  })
}

const updateRelease = async (artist, albumID, release, year, tracks, genres, username, imagePath) => {
  // Get artist document
  const artistRef = doc(db, 'artists', artist);
  const docSnap = await getDoc(artistRef);
  const data = docSnap.data();
  
  // Get releases array and find the targeted release for editing
  const copyReleases = data.releases;
  let targetIndex = undefined;
  copyReleases.forEach((el, i) => {
    if (el.albumID === albumID) {
      targetIndex = i;
    }
  });
  const targetRelease = data.releases[targetIndex];
  // History variables setup
  const history = targetRelease.editHistory;
  const changes = [];
  // Copy fixed data
  const keepAverage = targetRelease.average;
  const keepRatings = targetRelease.ratings;
  const keepReviews = targetRelease.reviews;
  let newCover;
  if (imagePath === undefined) {
    newCover = targetRelease.imagePath;
  } else {
    newCover = imagePath;
    changes.push('Cover art');
  }
  // Update history
  if (release !== targetRelease.release) {
    changes.push(`Release title (from "${targetRelease.release}" to "${release}")`);
  }
  if (year !== targetRelease.year) {
    changes.push(`Release date (from "${targetRelease.year}" to "${year}")`);
  }
  if (JSON.stringify(genres) !== JSON.stringify(targetRelease.genres)) {
    changes.push(`Genres (from "${targetRelease.genres}" to "${genres}")`);
  }
  if (JSON.stringify(tracks) !== JSON.stringify(targetRelease.tracks)) {
    changes.push('Tracklist');
  }
  const historyData = {
    author: username,
    date: format(new Date(), 'dd/LL/yyyy HH:mm'),
    changes : changes,
  }
  history.push(historyData);
  // Create new release object for replacing old one => KEEP REVIEWS AND RATINGS
  const newObject = {
    artist: artist, 
    release: release,
    year: year,
    tracks: tracks,
    ratings: keepRatings,
    reviews: keepReviews,
    genres: genres,
    albumID: albumID,
    average: keepAverage,
    imagePath: newCover,
    editHistory: history,
  }
  copyReleases[targetIndex] = newObject;
  console.log(targetRelease, tracks);
  // Update doc with new data
  await updateDoc(artistRef, 
    {
      releases: copyReleases,
    });
}

const getArtistsList = async () => {
  const querySnapshot = await getDocs(collection(db, 'artists'));
  const list = [];
  querySnapshot.forEach((doc) => {
    list.push(doc.id);
  });
  return list;
}

const getAllArtistsData = async () => {
  const allArtists = [];
  const artists = await getArtistsList();
  for (const artist of artists) {
    const data = await getArtist(artist);
    allArtists.push(data);
  }
  return allArtists;
}

const getArtist = async (artist) => {
  const docRef = doc(db, 'artists', artist);
  try {
    const docSnap = await getDoc(docRef);
    return docSnap.data();
  } catch(error) {
    console.log(error)
  }
}

const getArtistByID = async (artistID) => {
  const allArtists = await getAllArtistsData();
  let target;
  allArtists.forEach((el) => {
    if (el.artistID === artistID) {
      target = el;
    } else {
      return null;
    }
  })
  return target;
}

const getReleases = async (artist) => {
  const data = await getArtist(artist);
  return data.releases;
}

const getAllReleases = async () => {
  const releasesListByArtist = [];
  const allReleasesList = [];
  const allArtists = await getAllArtistsData();
  for (const artist of allArtists) {
    releasesListByArtist.push(artist.releases)
  }
  for (const item of releasesListByArtist) {
    item.forEach(release => {
      allReleasesList.push(release)
    })
  }
  return allReleasesList;
}

const getAllReleasesLength = async () => {
  const releasesList = [];
  const allArtists = await getAllArtistsData();
  for (const artist of allArtists) {
    releasesList.push(artist.releases.length)
  }
  const length = releasesList.reduce((acc, curr) => acc + curr, 0);
  return length;
}

const getUniqueRelease = async (artist, releaseName) => {
  const data = await getArtist(artist);
  let targetIndex = undefined
  data.releases.forEach((el, i) => {
    if (el.release === releaseName) {
      targetIndex = i;
    }
  })
  return data.releases[targetIndex];
}

const getReleaseByID = async (targetID) => {
 const allReleases = await getAllReleases();
 let targetIndex = undefined;
 allReleases.forEach((el, i) => {
  if (el.albumID === targetID) {
    targetIndex = i;
  }
 })
 return allReleases[targetIndex];
}

const updateReleaseRating = async (releaseID, username, userID, rating) => {
  // Get the artistRef from the album ID
  const artistRef = doc(db, 'artists', releaseID.artist);
  // Get album index from the "release" array
  const docSnap = await getDoc(artistRef);
  const data = docSnap.data();
  let index = 0;
  let targetIndex = undefined;
  for (const item of data.releases) {
    if (releaseID.albumID !== item.albumID) {
      index++;
    } else {
      targetIndex = index;
    }
  }
  // Use local copy before sending the data back to modify nested ratings array
  const localCopy = data;
  const localRatings = localCopy.releases[targetIndex].ratings;
  const ratingDate = format(new Date(), 'dd MMM yy');
  // if user has already rated the release, replace the rating
  const userRatingObject = localRatings.find((obj) => obj.userID === userID);
  if (!userRatingObject && +rating !== 0) {
    localRatings.push({
      username: username,
      userID: userID,
      rating: +rating,
      date: ratingDate,
    })
  } else if (+rating === 0) {
    // if the rating is 0, find the rating and remove it from the array
    let index = 0;
    let targetIndex = undefined;
    for (const rating of localRatings) {
      if (rating.userID !== userID) {
        index++;
      } else {
        targetIndex = index;
      }
    }
    localRatings.splice(targetIndex, 1);
  } else {
    userRatingObject.rating = +rating;
    userRatingObject.date = ratingDate;
  }
  // Update average rating
  const ratingsSum = localRatings.reduce((acc, el) => {return acc + el.rating;}, 0);
  const averageRating = +(ratingsSum / localRatings.length).toFixed(2);
  localCopy.releases[targetIndex].average = averageRating;
  await updateDoc(artistRef, localCopy);
  linkRatingToUser(username, releaseID, rating, ratingDate);
}

const linkRatingToUser = async (username, release, rating, date) => {
  const userRef = doc(db, 'users', username);
  const docSnap = await getDoc(userRef);
  const data = docSnap.data();
  const localCopy = data;
  const localRatings = data.ratings;
  const existingRating = localRatings.find((obj) => obj.release.releaseID === release.albumID);
  if (existingRating === undefined && +rating !== 0) {
    localRatings.push({
      release: {
        releaseID: release.albumID,
        artist: release.artist,
        title: release.release,
        imagePath: release.imagePath,
      },
      rating: rating,
      date: date,
    })
  } else if (+rating === 0) {
    let index = 0;
    let targetIndex = undefined;
    for (const rating of localRatings) {
      if (rating.release !== release) {
        index++;
      } else {
        targetIndex = index;
      }
    }
    localRatings.splice(targetIndex, 1);
  } else {
    existingRating.rating = rating;
    existingRating.date = date;
  }
  await updateDoc(userRef, localCopy);
}

const getRatingsByRelease = async (release) => {
  // Get the artistRef from the album ID
  const artistRef = doc(db, 'artists', release.artist);
  // Get album index from the "release" array
  const docSnap = await getDoc(artistRef);
  const data = docSnap.data();
  let index = 0;
  let targetIndex = undefined;
  for (const item of data.releases) {
    if (release.albumID !== item.albumID) {
      index++;
    } else {
      targetIndex = index;
    }
  }
  const ratings = data.releases[targetIndex].ratings;
  const userRatingsData = []
  ratings.map((el) => userRatingsData.push([el.username, el.rating]))
  // Trier les notes par date
  console.log(userRatingsData);
  return userRatingsData;
}

const getPersonalRatings = async (username) => {
  const userRef = doc(db, 'users', username);
  const docSnap = await getDoc(userRef);
  const data = docSnap.data();
  const ratings = data.ratings;
  return ratings;
}

const sendReview = async (releaseID, username, userID, review) => {
  const artistRef = doc(db, 'artists', releaseID.artist);
  const docSnap = await getDoc(artistRef);
  const data = docSnap.data();
  let index = 0;
  let targetIndex = undefined;
  for (const item of data.releases) {
    if (releaseID.albumID !== item.albumID) {
      index++;
    } else {
      targetIndex = index;
    }
  }
  const localCopy = data;
  const localReviews = localCopy.releases[targetIndex].reviews;
  const reviewDate = format(new Date(), 'dd MMM yy');
  // if user has already rated the release, replace the rating
  const userReviewObject = localReviews.find((obj) => obj.userID === userID);
  if (!userReviewObject) {
    localReviews.push({
      username: username,
      userID: userID,
      review: review,
      date: reviewDate,
      reviewsScore: 0,
    })
  } else {
    userReviewObject.review = review;
    userReviewObject.date = reviewDate;
  }
  await updateDoc(artistRef, localCopy);
  linkReviewToUser(username, releaseID, review, reviewDate);
}

const linkReviewToUser = async (username, release, review, date) => {
  const userRef = doc(db, 'users', username);
  const docSnap = await getDoc(userRef);
  const data = docSnap.data();
  const localCopy = data;
  const localReviews = data.reviews;
  const existingReview = localReviews.find((obj) => obj.release.albumID === release.albumID);
  if (!existingReview) {
    localReviews.push({
      reviewDate: date,
      review: review,
      author: username,
      release: {
        releaseID: release.albumID,
        artist: release.artist,
        title: release.release,
        imagePath: release.imagePath,
      },
    })
  } else {
    existingReview.review = review;
    existingReview.date = date;
  }
  await updateDoc(userRef, localCopy);
}

const getPersonalReviews = async (username) => {
  const userRef = doc(db, 'users', username);
  const docSnap = await getDoc(userRef);
  const data = docSnap.data();
  const reviews = data.reviews;
  return reviews;
}

const searchArtistByName = async (prompt) => {
  // Set up prompt and artist list for search
  const list = await getArtistsList();
  const cleanPrompt = prompt.trim().toLowerCase().replace(/[^a-zA-Z0-9]/g, '').replace(/the/g, '');
  const cleanList = list.map(el => {
    return el.trim().toLowerCase().replace(/[^a-zA-Z0-9]/g, '').replace(/the/g, '');
  })
  // When a match is found, retrieve the artist from the list by index
  let index = 0;
  const targetIndexes = [];
  cleanList.forEach(el => {
    if (el.includes(cleanPrompt)) {
      targetIndexes.push(index);
    } else {
      index++
    }
  })
  const searchResult = [];
  for (const index of targetIndexes) {
    const targetArtist = await getArtist(list[index]);
    searchResult.push(targetArtist);
  }
  return searchResult;
}

const searchRelease = async (prompt) => {
  const list = await getAllReleases();
  const namesList = list.map(el => {
    return el.release
  })
  const cleanPrompt = prompt.trim().toLowerCase().replace(/[^a-zA-Z0-9]/g, '').replace(/the/g, '');
  const cleanList = namesList.map(el => {
    return el.trim().toLowerCase().replace(/[^a-zA-Z0-9]/g, '').replace(/the/g, '');
  })
  let index = 0;
  const targetIndexes = [];
  cleanList.forEach(el => {
    if (el.includes(cleanPrompt)) {
      targetIndexes.push(index);
    } else {
      index++
    }
  })
  const searchResult = []
  for (const index of targetIndexes) {
    const targetRelease = list[index];
    searchResult.push(targetRelease);
  }
  return searchResult;
}

// AFTER DATABASE STRUCTURE CHANGE
const submitReleaseByID = async (artist, title, date, type, tracks, genres, ratings, reviews, imagePath, username) => {
  const coll = collection(db, 'releases');
  const snapshot = await getCountFromServer(coll);
  const albumID = snapshot.data().count.toString();
  const originalHistory = {
    author: username,
    date: format(new Date(), 'dd/LL/yyyy at HH:mm'),
    changes: ['Original submission']
  }
  await setDoc(doc(db, 'releases', albumID), {
    artist: artist, 
    title: title,
    date: date,
    type: type,
    tracks: tracks,
    ratings: ratings,
    reviews: reviews,
    genres: genres,
    albumID: albumID,
    average: '',
    imagePath: imagePath,
    editHistory: [originalHistory],
  });
}

const fetchReleaseFromID = async (releaseID) => {
  const docRef = doc(db, 'releases', releaseID);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return docSnap.data();
  } else {
    console.log("No such document!");
  }
}

const updateReleaseRatingByID = async (releaseID, username, userID, rating) => {
  // Get the release from ID
  const docRef = doc(db, 'releases', releaseID);
  const docSnap = await getDoc(docRef);
  const data = docSnap.data();
  // Use local copy before sending the data back to modify nested ratings array
  const localCopy = data;
  const localRatings = localCopy.ratings;
  const ratingDate = format(new Date(), 'dd MMM yy');
  // if user has already rated the release, replace the rating
  const userRatingObject = localRatings.find((obj) => obj.userID === userID);
  if (!userRatingObject && +rating !== 0) {
    localRatings.push({
      username: username,
      userID: userID,
      rating: +rating,
      date: ratingDate,
    })
  } else if (+rating === 0) {
    // if the rating is 0, find the rating and remove it from the array
    let index = 0;
    let targetIndex = undefined;
    for (const rating of localRatings) {
      if (rating.userID !== userID) {
        index++;
      } else {
        targetIndex = index;
      }
    }
    localRatings.splice(targetIndex, 1);
  } else {
    userRatingObject.rating = +rating;
    userRatingObject.date = ratingDate;
  }
  // Update average rating
  const ratingsSum = localRatings.reduce((acc, el) => {return acc + el.rating;}, 0);
  const averageRating = +(ratingsSum / localRatings.length).toFixed(2);
  localCopy.average = averageRating;
  await updateDoc(docRef, localCopy);
  linkRatingToUserByID(username, releaseID, rating, ratingDate);
}

const linkRatingToUserByID = async (username, releaseID, rating, date) => {
  const userRef = doc(db, 'users', username);
  const docSnap = await getDoc(userRef);
  const data = docSnap.data();
  const localCopy = data;
  const localRatings = data.ratings;
  const existingRating = localRatings.find((obj) => obj.release.releaseID === releaseID);
  if (existingRating === undefined && +rating !== 0) { 
    const releaseData = await fetchReleaseFromID(releaseID.toString());
    localRatings.push({
      release: {
        releaseID: releaseData.albumID,
        artist: releaseData.artist,
        title: releaseData.title,
        imagePath: releaseData.imagePath,
      },
      rating: rating,
      date: date,
    })
  } else if (+rating === 0) {
    let index = 0;
    let targetIndex = undefined;
    for (const rating of localRatings) {
      if (rating.release.releaseID !== releaseID) {
        index++;
      } else {
        targetIndex = index;
      }
    }
    localRatings.splice(targetIndex, 1);
  } else {
    existingRating.rating = rating;
    existingRating.date = date;
  }
  await updateDoc(userRef, localCopy);
}

const sendReviewByID = async (releaseID, username, userID, review) => {
  // Get the release from ID
  const docRef = doc(db, 'releases', releaseID);
  const docSnap = await getDoc(docRef);
  const data = docSnap.data();
  const localCopy = data;
  const localReviews = localCopy.reviews;
  const reviewDate = format(new Date(), 'dd MMM yy');
  // if user has already rated the release, replace the rating
  console.log(localReviews);
  const userReviewObject = localReviews.find((obj) => obj.userID === userID);
  if (!userReviewObject) {
    localReviews.push({
      username: username,
      userID: userID,
      review: review,
      date: reviewDate,
      reviewsScore: 0,
    })
  } else {
    userReviewObject.review = review;
    userReviewObject.date = reviewDate;
  }
  await updateDoc(docRef, localCopy);
  linkReviewToUserByID(username, releaseID, review, reviewDate);
}

const linkReviewToUserByID = async (username, releaseID, review, date) => {
  const userRef = doc(db, 'users', username);
  const docSnap = await getDoc(userRef);
  const data = docSnap.data();
  const localCopy = data;
  const localReviews = data.reviews;
  const existingReview = localReviews.find((obj) => obj.release.releaseID === releaseID);
  if (!existingReview) {
    const releaseData = await fetchReleaseFromID(releaseID.toString());
    localReviews.push({
      reviewDate: date,
      review: review,
      author: username,
      release: {
        releaseID: releaseData.albumID,
        artist: releaseData.artist,
        title: releaseData.title,
        imagePath: releaseData.imagePath,
      },
    })
  } else {
    existingReview.review = review;
    existingReview.date = date;
  }
  await updateDoc(userRef, localCopy);
}

export { 
  userFirestoreSetup,
  getAllUsernames,
  getUserInfo,
  updateUserAvatar,
  getRatingsCounter,
  getReviewsCounter,
  getListsCounter,
  uploadImage,
  getImageUrl,
  getCollLength,
  addImageToRelease,
  submitArtist,
  updateArtist,
  submitRelease,
  updateRelease,
  getArtistsList, 
  getAllArtistsData, 
  getArtist,
  getArtistByID,
  getReleases, 
  getAllReleases,
  getAllReleasesLength, 
  getUniqueRelease, 
  getReleaseByID,
  updateReleaseRating, 
  getRatingsByRelease,
  getPersonalRatings,
  sendReview,
  getPersonalReviews,
  searchArtistByName,
  searchRelease,

  submitReleaseByID,
  fetchReleaseFromID,
  updateReleaseRatingByID,
  sendReviewByID,
};