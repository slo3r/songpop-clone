import React, { useEffect, useState, useRef } from 'react';
import ironmaiden from '../images/ironmaiden.jpg';
import bfmv from '../images/bfmv.jpeg';
import soad from '../images/soad.jpg';
import Slipknot from '../images/Slipknot.jpg';
import Polyphia from '../images/Polyphia.jpg';
import Trivium from '../images/Trivium.jpg';
import { db } from './firebase';
import { getStorage, ref, listAll, getDownloadURL } from "firebase/storage";
import {
  collection,
  getDocs,
} from "firebase/firestore";

const Index = () => {
  const [artists, setArtists] = useState([]);
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [countdown, setCountdown] = useState(null);
  const [showCountdown, setShowCountdown] = useState(true);
  const [selectedSong, setSelectedSong] = useState(null);
  const [selectedSongURL, setSelectedSongURL] = useState(null);
  const [correctSong, setCorrectSong] = useState(null);
  const [userSelectedSong, setUserSelectedSong] = useState(null);
  const [playedSongs, setPlayedSongs] = useState([]);
  const [shuffledSongs, setShuffledSongs] = useState([]);
  const audioPlayerRef = useRef(null);

useEffect(() =>{
  if (playedSongs.length === 5) {
    window.location.reload();
  }
},[playedSongs])

 const handleSongSelection = (selectedSong) => {
  const SelectedSong = selectedSong;

  if (SelectedSong === correctSong) {
    // Mark the button as correct (green)
    setUserSelectedSong(selectedSong);
 
  } else {
    // Mark the button as wrong (red)
    setUserSelectedSong(selectedSong);
  }

  setTimeout(() => {
    nextSong();
    audioPlayerRef.current.play();
    setUserSelectedSong(null);
  }, 2000);
 };

 const nextSong = () => {
  if (correctSong) {
    setPlayedSongs([...playedSongs, correctSong]);
  }
  const artistData = artists.find((artist) => artist.id === selectedArtist);
  const songsToShuffle = [...artistData.song];
  const shuffled = shuffleArray(songsToShuffle);
  const visibleSongs = shuffled.slice(0, 4);
  setShuffledSongs(visibleSongs);

  const remainingVisibleSongs = visibleSongs.filter((song) => !playedSongs.includes(song));

  const availableSongs = remainingVisibleSongs.filter((song) => song !== correctSong);

  let newCorrectSong;
  if (availableSongs.length > 0) {
    newCorrectSong = availableSongs[Math.floor(Math.random() * availableSongs.length)];
  } else {
    newCorrectSong = songsToShuffle.find((song) => !playedSongs.includes(song));
  }

  setCorrectSong(newCorrectSong);
  if (selectedArtist && newCorrectSong) {
    const storage = getStorage();
    const storageRef = ref(storage, selectedArtist);

    const songFileName = newCorrectSong + ".mp3";
    const songRef = ref(storageRef, songFileName);

    getDownloadURL(songRef)
      .then((url) => {
        audioPlayerRef.current.src = url;
        audioPlayerRef.current.play();
      })
      .catch((err) => {
        console.log('Error getting download URL:', err.message);
      });
  }

};
  
  useEffect(() => {
    const songRef = collection(db, 'artist');
  
    getDocs(songRef)
      .then((snapshot) => {
        let artistsData = [];
        snapshot.docs.forEach((doc) => {
          artistsData.push({ ...doc.data(), id: doc.id });
        });
        setArtists(artistsData);
      })
      .catch((err) => {
        console.log(err.message);
      });
  }, []);

  // Function to shuffle an array in place (Fisher-Yates algorithm)
  const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };

  // Function to handle the selection of an artist
  const handleArtistSelection = (selectedArtistId) => {
    setSelectedArtist(selectedArtistId);
    const storage = getStorage();
    const storageRef = ref(storage, selectedArtistId);
  
    listAll(storageRef)
      .then((res) => {
        const items = res.items;
        // Filter the songs from Firebase storage based on the selected artist's song list
        const artistData = artists.find((artist) => artist.id === selectedArtistId);
        if (artistData) {
          const songsToShuffle = [...artistData.song];
          const shuffled = shuffleArray(songsToShuffle);
          const visibleSongs = shuffled.slice(0, 4);
          setShuffledSongs(visibleSongs);
          const filteredItems = items.filter((item) => visibleSongs.includes(item.name.slice(0, -4)));
          const randomIndex = Math.floor(Math.random() * filteredItems.length);
          getDownloadURL(filteredItems[randomIndex])
            .then((url) => {
              const selectedSongName = filteredItems[randomIndex].name;
              console.log(selectedSongName)
              setSelectedSong(selectedSongName.slice(0, -4));
              setSelectedSongURL(url);
              setCorrectSong(selectedSongName.slice(0, -4));
            })
            .catch((err) => {
              console.log('Error getting download URL:', err.message);
            });
        }
      })
      .catch((err) => {
        console.log('Error listing items:', err.message);
      });
  };
  


 useEffect(() => {
    if(selectedArtist != null){
    if (countdown === null) {
      const timer = setTimeout(() => {
        setCountdown(3);
      });

      return () => clearTimeout(timer); 
    }
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);

      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      setShowCountdown(false);
    }
  }
  }, [selectedArtist, countdown]);

  useEffect(() => {
    if (selectedSongURL && countdown == 0) {
      if (audioPlayerRef.current) {
        audioPlayerRef.current.src = selectedSongURL;
        audioPlayerRef.current.play();
      }
    }
  }, [selectedSongURL, countdown, audioPlayerRef]);

  
  return (
    <div className='page-container'>
      {selectedArtist ? null : (
        <div className="selection">
          <h2>Choose a playlist</h2>
          <div className='artist-selection'>
            <div className='artist-container' onClick={() => handleArtistSelection('Iron Maiden')}>
              <h5>Iron Maiden</h5>
              <img src={ironmaiden} alt='Iron Maiden'></img>
            </div>
            <div className='artist-container' onClick={() => handleArtistSelection('Bullet For My Valentine')}>
              <h5>Bullet For My Valentine</h5>
              <img src={bfmv} alt='Bullet For My Valentine'></img>
            </div>
            <div className='artist-container' onClick={() => handleArtistSelection('System Of A Down')}>
              <h5>System Of A Down</h5>
              <img src={soad} alt='System Of A Down'></img>
            </div>
            <div className='break'></div>
             <div className='artist-container' onClick={() => handleArtistSelection('Slipknot')}>
              <h5>Slipknot</h5>
              <img src={Slipknot} alt='Slipknot'></img>
              </div>
              <div className='artist-container' onClick={() => handleArtistSelection('Trivium')}>
              <h5>Trivium</h5>
              <img src={Trivium} alt='Trivium'></img>
            </div>
            <div className='artist-container' onClick={() => handleArtistSelection('Polyphia')}>
              <h5>Polyphia</h5>
              <img src={Polyphia} alt='Polyphia'></img>
            </div>
            <div className='break'></div>
          </div>
        </div>
      )}
      {showCountdown && countdown !== null && (
        <div className='countdown'>{countdown}</div>
      )}
   {selectedArtist && (
        <div className='gameContainer'>
          <div className='artist'>{selectedArtist}</div>
          <div className='choices'>
          {artists
  .filter((artist) => selectedArtist ? artist.id === selectedArtist : true)
  .map((artist) => {
    return (
      <div key={artist.id}>
        {shuffledSongs.slice(0, 4).map((song, index) => (
          <button
            key={index}
            onClick={() => handleSongSelection(song)}
            // Set the button color based on selection correctness
            style={{ backgroundColor: song === userSelectedSong ? (song === correctSong ? 'lightgreen' : 'rgb(255, 76, 76)') : 'initial' }}
          >
            {song}
          </button>
                    ))}
                  </div>
                );
              })}
          </div>
        </div>
      )}
       {selectedSongURL && (
        <audio ref={audioPlayerRef} controls style={{ display: 'none' }}>
          <source src={selectedSongURL} type='audio/mpeg' />
        </audio>
      )}
    </div>
  );
};

export default Index;
