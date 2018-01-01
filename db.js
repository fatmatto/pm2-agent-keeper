const fs = require('fs')
const EventEmitter = require('events');

class Jar {

  constructor() {
    this.emitter = new EventEmitter()
    this.configuration = {
      filepath : './jar.json',
      /**
       * When should the data be persisted to the filepath
       * Possible values are
       * set: Save to disk at each set() call
       * interval: Save to disk every N ms
       * never: Never persist to disk
       * @type {String}
       */
      peristanceStrategy : 'set'
    }
    this.data = {}
    fs.readFile(this.configuration.filepath, 'utf-8', (err, file) => {
      if (err) {
        console.log("No database file available. Creating a new one...");
        this.persist(() => {
          console.log("New database file created.")
        })
      } else {
        try {
          this.data = JSON.parse(file)
        } catch (e) {
          this.emitter.emit('error', e)
          console.log(this.configuration.filepath+" file is not valid json. Creating a new one.")
          this.persist(() => {
            console.log("New db file created")
          })
        }
      }

      /**
       * If the persistance strategy is interval then we register the interval
       */
      if (this.configuration.peristanceStrategy === 'interval') {
        setInterval(() => {
          this.persist()
        })
      }
    })
  }

  /**
   * Writes current data to a file and calls optional cllback with error
   * @param  {Function} cb [description]
   */
  persist(cb) {
    let json = JSON.stringify(this.data)
    fs.writeFile(this.configuration.filepath, json, (err) => {
      if (err) {
        this.emitter.emit('error', err)
      } else {
        this.emitter.emit('persisted')
        if ("function" === typeof cb) {
          cb()
        }
      }
    })
  }


  get(key) {
    return this.data[key]
  }

  set(key, value) {
    this.data[key] = value
    if (this.configuration.peristanceStrategy === 'interval') {
      this.persist()
    }
  }
}


module.exports = Jar