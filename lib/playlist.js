const path = require('node:path')
const util = require('./util')


// wtf I dont have a single async fn yet
const api = {
  create: (source) => {
    if (!source?.data?.length) { throw Error(`metadata.generatePlaylist: source data all wrong`) }
    // atm source.data = Record Labels
    const playlist = {
      basePath: source.path,
      tracks: [],
    }
    for (let i = 0; i < source.data.length; i++) {
      const label = source.data[i]
      for (let j = 0; j < label.releases.length; j++) {
        const release = label.releases[j]
        for (let k = 0; k < release.tracks.length; k++) {
          const track = release.tracks[k]
          const playlistTrack = {
            title: track.title,
            releaseTitle: release.title,
            labelTitle: label.title,
            trackPathPart: path.join(label.pathPart, release.pathPart, track.pathPart),
            coverPathPart: release.cover ? path.join(label.pathPart, release.pathPart, release.cover) : null,
            logoPathPart: label.logo ? path.join(label.pathPart, label.logo) : null,
            bannerPathPart: label.banner ? path.join(label.pathPart, label.banner) : null,
          }
          playlistTrack.trackPath = path.join(playlist.basePath, playlistTrack.trackPathPart)
          playlistTrack.coverPath = path.join(playlist.basePath, playlistTrack.coverPathPart)
          playlistTrack.logoPath = path.join(playlist.basePath, playlistTrack.logoPathPart)
          playlistTrack.bannerPath = path.join(playlist.basePath, playlistTrack.bannerPathPart)
          playlist.tracks.push(playlistTrack)
        }
      }
    }

    playlist.tracks = util.shuffle(playlist.tracks)
    return playlist
  },
  get: () => {
    throw Error('not implemented')

    const res = metadata.scanMusicFolder()
    const playlist = metadata.generatePlaylist(res)
    return playlist
  },
}
module.exports = api
