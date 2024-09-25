window.addEventListener('DOMContentLoaded', () => {
  console.log('content loaded')
  setTimeout(async () => {
    console.log('timedout')
    const playlist = await window.electronAPI.getPlaylist();
    console.log('playlist', playlist)
    // for now lets just create audio element and play first song
    playFirstSong(playlist)
  }, 2000)
})

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
