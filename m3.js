const util = require('./lib/util')
const metadata = require('./lib/metadata')

const api = {
  getPlaylist: () => {
    const res = metadata.scanMusicFolder()
    const playlist = metadata.generatePlaylist(res)
    return playlist
  }
}
module.exports = api
