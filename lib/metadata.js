const fs = require('node:fs')
const path = require('node:path')
const util = require('./util')
const isWin = process.platform === 'win32'

supportedAudioTypes = ['.ogg','.mp3']
supportedImageTypes = ['.jpg','.jpeg','.png']

const api = {
  // atm this fn just creates the data files. I intend to merge existing data with scanned source
  // soon
  process: (source) => {
    if (!source?.data?.length) { throw Error(`metadata.process: source data all wrong`) }
    for (let i = 0; i < source.data.length; i++) {
      const label = source.data[i]
      for (let j = 0; j < label.releases.length; j++) {
        const release = label.releases[j]
        const dataFilePath = path.join(source.path, label.pathPart, release.pathPart, util.settings.dataFileName)

        // TODO: process metadata for entire release/album, not just track. never got that far in any of my attempts yet
        const date = new Date()
        if (!fs.existsSync(dataFilePath)) {
          const metadataFile = JSON.parse(JSON.stringify(util.template.base))
          metadataFile.metadata = {
            releaseTitle: release.title,
            labelTitle: label.title,
          }
          metadataFile.createDate = date.toISOString()
          metadataFile.updateDate = date.toISOString()

          for (let k = 0; k < release.tracks.length; k++) {
            const sourceTrack = release.tracks[k]
            const metadataTrack = JSON.parse(JSON.stringify(util.template.track))
            metadataTrack.updateDate = date.toISOString()
            metadataTrack.filename = sourceTrack.pathPart
            metadataFile.tracks.push(metadataTrack)

            sourceTrack.metadata = metadataTrack
          }

          util.fs.writeJson(dataFilePath, metadataFile, true)
        } else {
          const metadataFile = util.fs.readJson(dataFilePath)
          for (let k = 0; k < release.tracks.length; k++) {
            const sourceTrack = release.tracks[k]
            let metadataTrack = metadataFile.tracks.find(x => x.filename === sourceTrack.pathPart)
            if (!metadataTrack) {
              // honestly we should throw
              console.log(`metadata.process: failed to find metadata for track '${sourceTrack.pathPart}', should not happen`)
              metadataTrack = util.template.track
              metadataTrack.updateDate = date.toISOString()
              metadataTrack.filename = sourceTrack.pathPart
              metadataFile.tracks.push(metadataTrack)
            }

            sourceTrack.metadata = metadataTrack
          }
        }
      }
    }
    console.log('metadata processed')
  },
}


module.exports = api
