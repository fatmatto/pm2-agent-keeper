
const fs = require('fs')
const EventEmitter = require('events');

class Jar {

  constructor() {
    this.emitter = new EventEmitter()
    this.data = {}
    fs.readFile('./jar.json','utf-8', (err, file) => {
      if (err) {
        console.log("No file available");
      } else {
        try {
          this.data = JSON.parse(file)
        } catch (e) {
          this.emitter.emit('error',e)
          console.log("jar.json file is not valid json. Ignoring it.")
        }
      }
    })
  }

  persist(cb) {
    fs.writeFile('./jar.json',JSON.stringify(this.data), (err) => {
      if (err) {
        this.emitter.emit('error',err)
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

  set(key,value) {
    this.data[key] = value
    return this.persist()
  }
}


module.exports = Jar