const path = require('node:path')
const util = require('./lib/util')
const metadata = require('./lib/metadata')
const directory = require('./lib/directory')
const playlist = require('./lib/playlist')
const fs = require('node:fs')
/*
  we're going to name batches of folders as an entity

  for now we'll statically set this all. future this will be definable in the UI
  location types:
    - bandcamp:
      - we expect <label>/<release/album>/<track> folder structure
      - logo.png and banner.png located in the <label> folder
      - cover.png localted in the <release/album> folder
      - no nested albums like album/disk1/track0.mp3
      - essentially everything is .ogg. I download flacs sometimes but those are for archival reasons(I should be archiving everything, no space)

  no other location types at the moment. for some reason im not indexing my locally sourced files,
  mostly because I dont feel like listening to it(burnt the fuck out). some day ill index non bandcamp
  stuff and ill create a location type for it. ill probably make the folders the same structure as
  bandcamp because why not, but the file names wont be, I hate that shit
*/

const entities = {
  'm3_test': {
    title: 'm3_test', // duh
    sources: [
      {
        // NOTE: sources can have the same exact album which will clap the current logic. sources should be named(uniqified) to prevent this.
        // I dont plan on ever scanning more than one music folder but in the case I do then this will need to be fixed
        path: 'C:\\_test_music_folder',
        type: 'bandcamp',
      }
    ],
  }
}
const selectedEntityName = 'm3_test'

// wtf I dont have a single async fn yet
const api = {
  init: () => {
    const entity = entities[selectedEntityName]
    if (!entity) {
      throw Error (`entity name '${selectedEntityName}' does not exist in entities ${Object.keys(entities).join(', ')}`)
    }
    // NOTE: verify all paths exist? verify location.type is supported? someday
    const entityPath = path.join(__dirname, util.settings.localDataFolderName, selectedEntityName)
    const playlistPath = path.join(entityPath, 'playlists')
    util.fs.mkdir(entityPath)
    util.fs.mkdir(playlistPath)

    // entity: saving this data because this will suck having to refetch this all on every load
    let entityDataPath = path.join(entityPath, 'data.json')
    let entityData
    if (!fs.existsSync()) {
      entityData = JSON.parse(JSON.stringify(entity))
      for (let i = 0; i < entityData.sources.length; i++) {
        const source = entityData.sources[i]
        source.data = directory.scan.bandcamp(source.path)
        // for whatever reason im keeping file scanning(above) and metadata processing(below) separate
        metadata.process(source)
      }
      // save this entity as state for now. probably should be something else
      util.fs.writeJson(entityDataPath, entityData, true)
    } else {
      entityData = util.fs.readJson(entityDataPath)
    }

    // state: splitting this from entity data because this will be saved very often, all the time
    let state
    const statePath = path.join(entityPath, 'state.json')
    if (!fs.existsSync(statePath)) {
      // TODO: probably create a template for this
      state = {} // no need to save an empty object right now
    } else {
      state = util.fs.readJson(statePath)
    }

    // playlist
    let defaultPlaylistPath = path.join(playlistPath, 'default.json')
    let defaultPlaylist
    if (!fs.existsSync(defaultPlaylistPath)) {
      // NOTE: this is where, or at least the first place we would combine sources. we only have one
      // for now so lets keep it simple
      // TODO: combine sources or whatever once we are reffing more than one music folder
      defaultPlaylist = playlist.create(entityData.sources[0])
      util.fs.writeJson(defaultPlaylistPath, defaultPlaylist, true)
    } else {
      defaultPlaylist = util.fs.readJson(defaultPlaylistPath)
    }

    console.log('alright I think everything is handled now')
    return {
      playlist: defaultPlaylist,
      entityData,
      state,
    }
  },
  state: {
    get: () => {

    },
    save: async (state) => {
      if (typeof state !== 'object') {
        throw Error(`m3.state.save: received some nonsense`, state)
      }
      console.log('state.save: saving state', state)
      const entityPath = path.join(__dirname, util.settings.localDataFolderName, selectedEntityName)
      util.fs.mkdir(entityPath) // this makes me feel much gooder
      const statePath = path.join(entityPath, 'state.json')
      util.fs.writeJson(statePath, state, true)
      return
    },
  },
}
module.exports = api
