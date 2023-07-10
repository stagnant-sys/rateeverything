import { React, useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import ReleaseInfo from "./release_page/ReleaseInfo";
import Rating from "./release_page/Rating";
import UserRatingsPage from "./release_page/UserRatings";
import Reviews from "./release_page/Reviews";
import AddReview from "./release_page/AddReview";
import Tracklist from "./release_page/Tracklist";

import { getReleaseByID, getUniqueRelease, fetchReleaseFromID } from "../functions";

import "../App.css"

const ReviewWritingUI = ({reviewUI, releaseID}) => {
  if (reviewUI) {
    return (
      <AddReview 
      releaseID={releaseID}
    />
    )
  } else {
    return null
  }
}

const ReleasePage = (props) => {
  const [release, setRelease] = useState([]);
  const [genres, setGenres] = useState([]);
  const [releaseID, setReleaseID] = useState(undefined);
  const [personalRating, setPersonalRating] = useState();
  const [ratings, setRatings] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [reviewUI, setReviewUI] = useState(false);
  const [trackList, setTracklist] = useState([]);
  const [totalTime, setTotalTime] = useState();
  const [imagePath, setImagePath] = useState();

  const urlParams = useParams();

  const calculateTotalTime = (data) => {
    const tracks = [];
    data.tracks.map(el => {
      const separatedTime = el.time.split(':')
      const trackTime = +separatedTime[0] * 60 + +separatedTime[1]
      tracks.push(trackTime);
    })
    const totalSeconds = tracks.reduce((acc, curr) => acc + curr, 0);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    if (seconds < 10) {
      setTotalTime(`${minutes}:0${seconds}`);
    } else {
      setTotalTime(`${minutes}:${seconds}`);
    }

  }

  const fetchDataByID = async (albumID) => {
    const data = await fetchReleaseFromID('0');
    //const data = await getReleaseByID(albumID);
    console.log(data);
    const sortedRatings = data.ratings.sort((a, b) => (a.date < b.date) ? 1 : (a.date > b.date) ? -1 : 0);
    setRatings(sortedRatings);
    setImagePath(data.imagePath);
    setGenres(data.genres.join(', '));
    setRelease(data);
    setReleaseID(data.albumID);
    setReviews(data.reviews);
    setTracklist(data.tracks)
    calculateTotalTime(data);
  }

  const toggleReviewUI = () => {
    if (reviewUI) {
      setReviewUI(false)
    } else {
      setReviewUI(true)
    }
  }

  useEffect(() => {
    fetchDataByID(+urlParams.releaseID);
  }, []);

  const ContributionsContainer = (props) => {
    if (!props.userStatus) {
      return (
        <div><Link to='/account/signin'>Log in</Link> to submit a correction or upload art for this release</div>
      )
    } else return (
      <div className='contribution'>
        <div className='contribution-group'>
          <Link to={`/releases/edit/${releaseID}`}><button className='contribution-button'>Correct entry</button></Link>
          <Link to={`/releases/history/${releaseID}`}><button className='contribution-button'>History</button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="release-page content-page">
      <div className="release_left-col">
        <div className="release-page_image-frame">
          <img src={imagePath} alt="cover art" className="release-page_image" />
        </div>
        <Tracklist 
          tracks={trackList}
          totalTime={totalTime}
        />
      </div>
      <div className="release_right-col">
        <ReleaseInfo
          id={`Album${release.albumID}`}
          title={release.title}
          artist={release.artist}
          type={release.type}
          date={release.date}
          generalRating={release.average}
          ratingsNumber={ratings.length}
          genres={genres}
        />
        <Rating
          releaseID={releaseID}
          onClick={toggleReviewUI}
        />
        <ReviewWritingUI 
          reviewUI={reviewUI}
          releaseID={releaseID}
        />
        <Reviews
          reviews={reviews} 
          ratings={ratings}
        />  
        <UserRatingsPage
          ratings={ratings}
          username={props.username} />
      </div>

      <div className='release-page_contributions'>
        <h2 onClick={() => {console.log(release)}}>Contributions</h2>
        <ContributionsContainer userStatus={props.userStatus} />
      </div>
    </div>
  )
}

export default ReleasePage;