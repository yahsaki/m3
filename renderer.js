var _playlist
var _state = {
  track: 0, // which track we're on
  paused: false,
  currentTime: 0,
  volume: 1, //float, 1 = max, 0.5 = 50%
}
let intervalId

window.addEventListener('DOMContentLoaded', () => {
  console.log('content loaded')
  setTimeout(async () => {
    const res = await window.electronAPI.getData()
    console.log('initial load data', res)
    if (!res?.playlist || !res.playlist.tracks?.length || !res.state) {
      console.log('some nonsense returned from thing', res)
      return
    }

    // set state properties property by property
    for (let prop in _state) { if (res.state[prop]) _state[prop] = res.state[prop] }
    console.log('state updated, check output', _state)
    _playlist = res.playlist
    createPlayer()
    playTrack()
  }, 2000)
})

async function saveState() {
  if (intervalId) clearInterval(intervalId)
  intervalId = setInterval(async () => {
    const audio = document.getElementById('audio-player')
    if (!audio) {
      console.log(`audio element does not exist`)
      clearInterval(intervalId)
      return
    }
    _state.paused = audio.paused
    _state.currentTime = audio.currentTime
    _state.volume = audio.volume
    const saveStateRes = await window.electronAPI.saveState(_state)
    // saveStateRes is null
    console.log('state saved')
    if (audio.paused) {
      clearInterval(intervalId)
    }
  }, 1000)
}

function playTrack() {
  const track = _playlist.tracks[_state.track]
  if (!track) { console.log('nothing to play', _playlist);return }

  const cover = document.getElementById('img-cover')
  cover.setAttribute('src', track.coverPath)

  const trackDisplay = document.getElementById('div-track-display')
  trackDisplay.innerText = `${_state.track+1}/${_playlist.tracks.length}`

  const info = document.getElementById('div-info')
  while (info.firstChild) { info.removeChild(info.firstChild) }
  ce('div',[],`Album: `,info)
  ce('div',[],`Artist: `,info)
  ce('div',[],`Song: ${track.title}`,info)

  const audio = document.getElementById('audio-player')
  audio.setAttribute('src', track.trackPath)
  audio.play()
  saveState()
}
function createPlayer() {
  // lets assume playlist exists at this point
  if (!_playlist) { throw Error(`playlist does not exist`) }
  const root = document.getElementById('root')
  while (root.firstChild) { root.removeChild(root.firstChild) }

  const wrapper = ce('div',[{name:'class',val:'wrapper'}],null,root)
  const playerWrapper = ce('div',[{name:'class',val:'player-wrapper'}],null,wrapper)
  const info = ce('div',[{name:'id',val:'div-info'}],null,playerWrapper)
  const cover = ce('div',[{name:'class',val:'cover'}],null,playerWrapper)
  const coverImage = ce('img',[{name:'id',val:'img-cover'},{name:'width',val:'280px'}],null,cover)
  const controls = ce('div',[{name:'class',val:'controls'}],null,playerWrapper)
  const buttonPrevious = ce('button',[{name:'id',val:'btn-player-previous'}],'PREV',controls)
  const buttonNext = ce('button',[{name:'id',val:'btn-player-next'}],'NEXT',controls)
  const tdval = `${_state.track+1}/${_playlist.tracks.length}`
  const trackDisplay = ce('div',[{name:'id',val:'div-track-display'}],tdval,controls)
  const audio = ce('audio', [
    {name:'controls',val:''},
    {name:'src',val:_playlist.tracks[0].trackPath},
    {name:'id',val:'audio-player'},
  ],null,playerWrapper)
  audio.paused = _state.paused
  audio.currentTime = _state.currentTime
  audio.volume = _state.volume

  audio.addEventListener('play', (e) => {
    // Playback has begun.
    console.log('play', e)
    //_state.paused = false
    saveState()
  })
  audio.addEventListener('ended', (e) => {
    // Playback has stopped because the end of the media was reached.
    console.log('ended', e)
    //_state.paused = false
    //_state.currentTime = 0
    saveState()
  })
  audio.addEventListener('volumechange', (e) => {
    // The volume has changed.
    console.log('volumechange', e)
    //_state.volume = e.srcElement.volume
    saveState()
  })
  audio.addEventListener('pause', (e) => {
    console.log('pause', e)
    //_state.paused = true
    //_state.currentTime = e.srcElement.currentTime
    saveState()
  })

  buttonNext.addEventListener('click', playerButtonNextOnClick)
  buttonPrevious.addEventListener('click', playerButtonPreviousOnClick)
}

function playerButtonNextOnClick() {
  if (_state.track+1 <= _playlist.tracks.length) {
    _state.track+=1
    playTrack()
  }
}
function playerButtonPreviousOnClick() {
  if (_state.track > 1) {
    _state.track-=1
    playTrack()
  }
}

function playFirstSong(playlist) {
  const root = document.getElementById('root')
  while (root.firstChild) { root.removeChild(root.firstChild) }
  const audio = ce('audio', [
    {name:'controls',val:''},
    {name:'src',val:playlist.tracks[0].trackPath},
    {name:'id',val:'audio-playlist'},
  ],null,root)
  setTimeout(() => {
    document.getElementById('audio-playlist').play()
  },1000)
}
// utility
function ce(type, attribs = [], text = null, parent = null) {
  const element = document.createElement(type)
  if (text) element.textContent = text
  attribs.forEach(a => { element.setAttribute(a.name, a.val) })
  if (parent) parent.appendChild(element)
  return element
}
