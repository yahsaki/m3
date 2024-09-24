const md = require('./lib/metadata')

;(async => {
  const res = md.scanMusicFolder()
  console.log(res)
  const playlist = md.generatePlaylist(res)
  console.log(playlist)
})()
