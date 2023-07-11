import { React, useState, useEffect } from "react";
import ArtistInfo from "./artist_page/ArtistInfo";
import ReleasesList from "./artist_page/ReleasesList";
import { getArtist, fetchReleaseFromID } from "../functions";
import { Link, useParams } from "react-router-dom";
import { getDoc } from "firebase/firestore";
import { DocumentReference } from "firebase/firestore";


const ArtistPage = (props) => {
  const [artist, setArtist] = useState([]);
  const [releases, setReleases] = useState([]);
  const [artistImage, setArtistImage] = useState();
  const [genres, setGenres] = useState([]);

  const urlParams = useParams().artist;
  const fetchData = async (artist) => {
    const data = await getArtist(artist);
    const releasesCopy = data.releases.slice();
    const sortedReleases = data.releases.sort((a, b) => (a.year > b.year) ? 1 : (a.year < b.year) ? -1 : 0);
    const bestRelease = releasesCopy.sort((a , b) => (a.average < b.average) ? 1 : (a.average > b.average) ? -1 : 0);
    setArtist(data);
    setReleases(sortedReleases);
    setArtistImage(bestRelease[0].imagePath);
    setGenres(data.genres.join(', '));
    const 
  };

  useEffect(() => {
    fetchData(urlParams);
  }, []);

  const ContributionsContainer = (props) => {
    if (!props.userStatus) {
      return (
        <div><Link to='/account/signin'>Log in</Link> to submit a correction or upload art for this release</div>
      )
    } else return (
      <div className='contribution'>
        <div className='contribution-group'>
          <Link to={`/artist/edit/${artist.artistID}`}><button className='contribution-button'>Update profile</button></Link>
          <Link to={`/artist/history/${artist.artistID}`}><button className='contribution-button'>History</button></Link>
          <Link to={`/artist/${urlParams}/add_release`}><button className="contribution-button">Add release</button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="artist-page content-page">
      <div className="artist_left-col">
      <div className="artist-page_image-frame">
          <img src={artistImage} alt="recommended release cover art" className="artist-page_image" />
        </div>
      </div>
      <div className="artist_right-col">
        <ArtistInfo
          artist={artist.artist}
          formed={artist.formed}
          country={artist.country}
          genres={genres}
          artistID={artist.artistID}
         />
        <ReleasesList
          artist={artist.artist} 
          releases={releases}
          />
      </div>
      <div className='artist-page_contributions'>
          <h2 onClick={() => console.log(artist.ref)}>Contributions</h2>
          <ContributionsContainer userStatus={props.userStatus} />
        </div>
    </div>
  )
}

export default ArtistPage;