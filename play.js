// ---------------- CONFIG ----------------
const clientId = "72ab1593eaf44789bf478dab42ed836d";
const redirectUri = "https://rozin-org.github.io/travel-mate/play.html";
const playlistId = "3WS6zmsdvRWu5dVf8nfEOG"; // replace with your playlist

let token = null;
let tracks = [];
let currentIndex = 0;
let deviceId = null;
let player = null;

// ---------------- LOGIN ----------------
document.getElementById("loginBtn").onclick = () => {
  const scopes = [
    "playlist-read-private",
    "playlist-read-collaborative",
    "streaming",
    "user-read-email",
    "user-read-private",
    "user-modify-playback-state"
  ].join("%20");

  window.location = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=token&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scopes}`;
};

// ---------------- GET TOKEN ----------------
window.addEventListener("load", async () => {
  const hash = window.location.hash;
  if (hash) {
    const params = new URLSearchParams(hash.replace("#", ""));
    token = params.get("access_token");
    if (token) {
      document.getElementById("loginBtn").disabled = true;
      await initPlayer();
      await loadPlaylist();
      document.getElementById("nextBtn").disabled = false;
    }
  }
});

// ---------------- SPOTIFY PLAYER ----------------
async function initPlayer() {
  window.onSpotifyWebPlaybackSDKReady = () => {
    player = new Spotify.Player({
      name: 'Continuous Player',
      getOAuthToken: cb => cb(token),
      volume: 0.8
    });

    player.addListener('ready', ({ device_id }) => {
      console.log('Ready with Device ID', device_id);
      deviceId = device_id;
    });

    player.addListener('not_ready', ({ device_id }) => {
      console.log('Device ID has gone offline', device_id);
    });

    // Listen for track end to auto-play next
    player.addListener('player_state_changed', state => {
      if (!state || !state.track_window.current_track) return;
      const { paused, position, duration } = state;
      if (!paused && duration && position >= duration - 500) {
        nextTrack();
      }
    });

    player.connect();
  };
}

// ---------------- FETCH PLAYLIST ----------------
async function loadPlaylist() {
  const res = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks?limit=100`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await res.json();
  tracks = data.items.map(i => i.track).filter(Boolean);
  shuffleTracks();
  playTrack(currentIndex);
}

// ---------------- SHUFFLE ----------------
function shuffleTracks() {
  for (let i = tracks.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [tracks[i], tracks[j]] = [tracks[j], tracks[i]];
  }
}

// ---------------- PLAY TRACK ----------------
async function playTrack(index) {
  if (!tracks.length) return;

  if (index >= tracks.length) {
    // reached end, reshuffle
    shuffleTracks();
    currentIndex = 0;
    index = 0;
  }

  const track = tracks[index];
  document.getElementById("trackInfo").innerText = `${track.name} — ${track.artists.map(a => a.name).join(", ")}`;

  await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
    method: "PUT",
    body: JSON.stringify({ uris: [track.uri] }),
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    }
  });
}

// ---------------- NEXT TRACK ----------------
document.getElementById("nextBtn").onclick = nextTrack;

function nextTrack() {
  currentIndex++;
  playTrack(currentIndex);
}
