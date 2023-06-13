import { React, useState, useEffect } from "react";
import ArtistInfo from "./artist_page/ArtistInfo";
import ReleasesList from "./artist_page/ReleasesList";
import { getArtist } from "../functions";
import { Link, useParams } from "react-router-dom";


const ArtistPage = (props) => {
  const [artist, setArtist] = useState([]);
  const [releases, setReleases] = useState([]);
  const [genres, setGenres] = useState([]);

  const urlParams = useParams().artist;
  const fetchData = async (artist) => {
    const data = await getArtist(artist);
    setArtist(data);
    setReleases(data.releases);
    setGenres(data.genres.join(', '));
  };

  useEffect(() => {
    fetchData(urlParams);
  }, []);

  return (
    <div className="artist-page">
      <div className="artist_left-col">
      <button onClick={() => console.log(artist)}>Test</button>
      </div>
      <div className="artist_right-col">
        <ArtistInfo
          artist={artist.artist}
          formed={artist.formed}
          country={artist.country}
          genres={genres}
          artistID={artist.artistID} />
        <ReleasesList
          artist={artist.artist} 
          releases={releases}
          />
        <Link to={`/artist/${urlParams}/add_release`}>Add new release</Link>
      </div>
    </div>
  )
}

export default ArtistPage;