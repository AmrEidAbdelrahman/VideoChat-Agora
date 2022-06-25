const APP_ID = "438705e7ad5248b2856f46ddb69d0310";
const CHANNEL = sessionStorage.getItem('channel');
const NAME = sessionStorage.getItem('name');
const TOKEN = sessionStorage.getItem('token');
const UID = sessionStorage.getItem('uid');

const client = AgoraRTC.createClient({mode: 'rtc', codec: 'vp8'});

let localTracks = []
let remoteUsers = {}

let joinAndDisplayLocalStream = async () => {
  try {
    await client.join(APP_ID, CHANNEL, TOKEN, UID);
    document.getElementById('room-name').innerText = CHANNEL;
  }catch (e) {
    window.open('/', '_self');
  }


  client.on('user-published', handleUserJoin);
  client.on('user-left', handleUserLeave);

  // [audio, camera]
  localTracks = await AgoraRTC.createMicrophoneAndCameraTracks()

  let player = `<div  class="video-container" id="user-container-${UID}">
                     <div class="video-player" id="user-${UID}"></div>
                     <div class="username-wrapper"><span class="user-name">${NAME}</span></div>
                  </div>`
  console.log(document.getElementById('video-stream'))
  document.getElementById('video-streams').insertAdjacentHTML('beforeend', player);

  localTracks[1].play(`user-${UID}`);
  localTracks[0].play();


  await client.publish([localTracks[0], localTracks[1]]);

}

let handleUserJoin = async (user, mediaType) => {
  console.log(user);
  let userUID = user.uid;
  remoteUsers[userUID] = user;
  await client.subscribe(user, mediaType);

  let res = await fetch(`/member/${CHANNEL}/${userUID}/`)
  let data = await res.json();
  console.log(data);
  if (mediaType === 'video') {
    let player = document.getElementById(`user-container-${userUID}`);
    if (player != null) {
      player.remove();
    }

    player = `<div  class="video-container" id="user-container-${userUID}">
                     <div class="video-player" id="user-${userUID}"></div>
                     <div class="username-wrapper"><span class="user-name">${data.username}</span></div>
                  </div>`

    document.getElementById(`video-streams`).insertAdjacentHTML('beforeend', player);
    user.videoTrack.play(`user-${userUID}`);
  }

  if (mediaType === 'audio') {
    user.audioTrack.play();
  }
}

let handleUserLeave = async (user) => {
  delete remoteUsers[user.uid]
  document.getElementById(`user-container-${user.uid}`).remove();
}

let roomLeaveAndClose = async () => {
  for (let i = 0; i < localTracks.length; i++) {
    localTracks[i].stop();
    localTracks[i].close();
  }

  await client.leave();

  window.open('/', '_self');
}

let toggleCamera = async (e) => {
  if (localTracks[1].muted) {
    await localTracks[1].setMuted(false);
    e.target.style.background = '#fff'
  } else {
    await localTracks[1].setMuted(true);
    e.target.style.background = 'rgb(255, 80, 80, 1)'
  }
}

let toggleMic = async (e) => {
  if (localTracks[0].muted) {
    await localTracks[0].setMuted(false);
    e.target.style.background = '#fff'
  } else {
    await localTracks[0].setMuted(true);
    e.target.style.background = 'rgb(255, 80, 80, 1)'
  }
}

joinAndDisplayLocalStream();

document.getElementById('leave-btn').addEventListener('click', roomLeaveAndClose)
document.getElementById('camera-btn').addEventListener('click', toggleCamera)
document.getElementById('mic-btn').addEventListener('click', toggleMic)