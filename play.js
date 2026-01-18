// ---------------- CONFIG ----------------
const clientId = "72ab1593eaf44789bf478dab42ed836d";
const redirectUri = "https://rozin-org.github.io/travel-mate/play.html";
const playlistId = "3WS6zmsdvRWu5dVf8nfEOG";
const scopes = [
  "playlist-read-private",
  "playlist-read-collaborative",
  "streaming",
  "user-read-email",
  "user-read-private",
  "user-modify-playback-state"
].join(" ");

let token = null;
let tracks = [];
let currentIndex = 0;
let deviceId = null;
let player = null;

// ---------------- UTILS ----------------
async function sha256(plain) {
  const encoder = new TextEncoder();
  const data = encoder.encode(plain);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return btoa(String.fromCharCode(...new Uint8Array(hash)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function generateRandomString(length) {
  let text = "";
  const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

// ---------------- LOGIN ----------------
document.getElementById("loginBtn").onclick = async () => {
  const codeVerifier = generateRandomString(128);
  localStorage.setItem("code_verifier", codeVerifier);

  const codeChallenge = await sha256(codeVerifier);

  const authUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scopes)}&code_challenge_method=S256&code_challenge=${codeChallenge}`;

  window.location = authUrl;
};

// ---------------- HANDLE REDIRECT ----------------
window.addEventListener("load", async () => {
  const params = new URLSearchParams(window.location.search);
  const code = params.get("code");

  if (code) {
    const codeVerifier = localStorage.getItem("code_verifier");

    const body = new URLSearchParams({
      client_id: clientId,
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
      code_verifier: codeVerifier
    });

    const res = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body
    });

    const data = await res.json();
    token = data.access_token;
    document.getElementById("loginBtn").disabled = true;

    await initPlayer();
    await loadPlaylist();
    document.getElementById("nextBtn").disabled = false;
  }
});

// ---------------- SPOTIFY PLAYER ----------------
async function initPlayer() {
  window.onSpotifyWebPlaybackSDKReady = () => {
    player = new Spotify.Player({
      name: "GitHub Pages Player",
      getOAuthToken: cb => cb(token),
      volume: 0.8
    });

    player.addListener("ready", ({ device_id }) => {
      console.log("Ready with Device ID", device_id);
      deviceId = device_id;
    });

    player.addListener("not_ready", ({ device_id }) => {
      console.log("Device went offline", device_id);
    });

    player.addListener("player_state_changed", state => {
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
    shuffleTracks();
    currentIndex = 0;
    index = 0;
  }

  const track = tracks[index];
  document.getElementById("trackInfo").innerText =
    `${track.name} — ${track.artists.map(a => a.name).join(", ")}`;

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
