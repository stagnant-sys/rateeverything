import {React, useState, useEffect} from "react";
import { getReleaseByID, updateReleaseRating, updateReleaseRatingByID } from "../../functions";
import { getAuth } from "firebase/auth";
import "C:/Users/paysa/Documents/GitHub/rateeverything/src/App.css";

const Rating = (props) => {
  const [targetRelease, setTargetRelease] = useState();

  const updateRating = async (e) => {
    e.preventDefault();
    const release = await getReleaseByID(props.releaseID);
    let rating = document.getElementById('rating').value;
    updateReleaseRatingByID(props.releaseID, getAuth().currentUser.displayName, getAuth().currentUser.uid, rating);
    //updateReleaseRating(release, getAuth().currentUser.displayName, getAuth().currentUser.uid, rating);
  }

  return (
    <div className="rating-component release_right-col-element">
      <div className="rating-component_title">Rate/Catalog</div>
      <div className="rating-actions">
        <div className="rating-container">
          <form onSubmit={updateRating}>
            <label htmlFor="rating">Rate:</label>
            <input type="number" min="0" max="5" step="0.5" name="rating" id="rating" />
            <input type="submit" />
          </form>
          
        </div>
        <div className="catalog-container">
          Catalog
        </div>
        <button className="catalog-review" onClick={props.onClick}>
          Review
        </button>
      </div>
    </div>
  )
}

export default Rating;