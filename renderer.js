var _playlist

window.addEventListener('DOMContentLoaded', () => {
  console.log('content loaded')
  setTimeout(async () => {
    const playlist = await window.electronAPI.getPlaylist();
    console.log('playlist', playlist)
    // for now lets just create audio element and play first song
    //playFirstSong(playlist)
    if (playlist && playlist.tracks?.length) {
      _playlist = playlist
      // no need to separate player from other shit, just doing now for whatever
      createPlayer()
      playTrack()
    }
  }, 2000)
})

function playTrack() {
  const track = _playlist.tracks[_playlist.state.currentTrack]
  if (!track) { console.log('nothing to play', _playlist);return }

  const cover = document.getElementById('img-cover')
  cover.setAttribute('src', track.coverPath)

  const trackDisplay = document.getElementById('div-track-display')
  trackDisplay.innerText = `${_playlist.state.currentTrack+1}/${_playlist.tracks.length}`

  const info = document.getElementById('div-info')
  while (info.firstChild) { info.removeChild(info.firstChild) }
  ce('div',[],`Album: `,info)
  ce('div',[],`Artist: `,info)
  ce('div',[],`Song: ${track.title}`,info)

  const audio = document.getElementById('audio-player')
  audio.setAttribute('src', track.trackPath)
  audio.play()
}
function createPlayer() {
  // lets assume playlist exists at this point
  if (!_playlist) { throw Error(`playlist does not exist`) }
  if (!_playlist.state) _playlist.state = {currentTrack:0}
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
  const tdval = `${_playlist.state.currentTrack+1}/${_playlist.tracks.length}`
  const trackDisplay = ce('div',[{name:'id',val:'div-track-display'}],tdval,controls)
  const audio = ce('audio', [
    {name:'controls',val:''},
    {name:'src',val:_playlist.tracks[0].trackPath},
    {name:'id',val:'audio-player'},
  ],null,playerWrapper)

  buttonNext.addEventListener('click', playerButtonNextOnClick)
  buttonPrevious.addEventListener('click', playerButtonPreviousOnClick)
}

function playerButtonNextOnClick() {
  if (_playlist.state.currentTrack+1 <= _playlist.tracks.length) {
    _playlist.state.currentTrack+=1
    playTrack()
  }
}
function playerButtonPreviousOnClick() {
  if (_playlist.state.currentTrack > 1) {
    _playlist.state.currentTrack-=1
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
