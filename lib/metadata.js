const fs = require('node:fs')
const path = require('node:path')
const util = require('./util')
const isWin = process.platform === 'win32'

supportedAudioTypes = ['.ogg','.mp3']
supportedImageTypes = ['.jpg','.jpeg','.png']

const api = {
  tags: {
    save: async (args) => {
      /*
        wtf do we need to save this properly? its easy to get the path to the intended data file
        but we want that tag to... propagate to... other places? not in the mindset to do this
        properly atm
        if we read all data files on every load then we dont need to bother saving to other locations
        other than the intended data file
      */
      const trackPath = args?.trackPath
      const tags = args?.tags
      if (typeof trackPath !== 'string' || !trackPath?.length) { throw Error(`m3.tags.save: trackPath invalid`) }
      if (!Array.isArray(tags)) { throw Error(`m3.tags.save: tags invalid`) }

      console.log('trackPath', trackPath, tags)
      const pathObj = path.parse(trackPath)
      const trackName = pathObj.base
      console.log('pathObj', pathObj)
      pathObj.base = util.settings.dataFileName
      const dataFilePath = path.format(pathObj)
      console.log('dataFilePath', dataFilePath)
      let file
      try {
        file = util.fs.readJson(dataFilePath)
      } catch(ex) {
        throw ex
      }

      if (!file) {
        const message = `data file missing at '${dataFilePath}', not responsible for creating it at this point`
        console.log(message)
        return { message }
      }

      const date = new Date()
      file.updateDate = date.toISOString()
      let track = file.tracks.find(x => x.filename === trackName)
      if (!track) {
        // for some reason we added tracks to the data file in the old implementation so ill do that
        // here. im not aware of a situation where this would occur
        track = JSON.parse(JSON.stringify(util.template.track))
        track.updateDate = date.toISOString()
        track.tags.concat(tags)
        file.tracks.push(track)
      }

      // check for existing
      const tagsAdded = []
      for (let i = 0; i < tags.length; i++) {
        const tag = tags[i]
        if (!track.tags.find(x => x === tag)) {
          track.tags.push(tag)
          tagsAdded.push(tag)
        }
      }

      if (tagsAdded.length) {
        track.updateDate = date.toISOString()
        util.fs.writeJson(dataFilePath, file, true)
        //emitter.emit('log', 'track updated')
        return {
          message: `added tags ${tagsAdded.join(', ')}`,
          // TODO: add whatever is needed to update the tags field and auto tag adder thingy
          // that doesnt quite exist yet
          data: {
            tagsAdded,
            totalTags: [...track.tags],
          }
        }
      } else {
        //emitter.emit('log', 'no tags added')
        return {message:`no tags added`}
      }
    },
  },
  rating: {
    save: async (args) => {
      throw Error('unimplemented')
    },
  },
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
