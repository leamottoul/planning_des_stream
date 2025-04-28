

class Setting {
  constructor(id, magicWord, popupMessage,starsMode, title, magicWordFound, lastMagicWordFound) {
    this.id = id
    this.magicWord = magicWord
    this.popupMessage = popupMessage
    this.starsMode = starsMode
    this.title = title
    this.magicWordFound = magicWordFound
    this.lastMagicWordFound = lastMagicWordFound
  }
  
  static docToInstance(document) {
    let data = document.data()
    return data ? new Setting(document.id, data.magicWord, data.popupMessage, data.starsMode, data.title, data.magicWordFound, data.lastMagicWordFound) : null
  }

  static async getAll() {
    let settings = []
    await db.collection("settings").get()
      .then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          let setting = Setting.docToInstance(doc)
          if (setting) {
            settings.push(setting)
          }
        })
      })
    return settings
  }

  static async getById(id) {
    let setting = null
    await db.collection("settings").doc(id).get()
      .then((doc) => {
        setting = Setting.docToInstance(doc)
      })
    return setting
  }

  static async listenAll(callback) {
    let unsubscribe = db.collection("settings").onSnapshot((querySnapshot) => {
      let settings = []
      querySnapshot.forEach((doc) => {
        let setting = Setting.docToInstance(doc)
        if (setting) {
          settings.push(setting)
        }
      })
      callback(settings)
    })
    return unsubscribe
  }

  static async listenById(id, callback) {
    let unsubscribe = db.collection("settings").doc(id).onSnapshot((doc) => {
      let setting = Setting.docToInstance(doc)
      callback(setting)
    })
    return unsubscribe
  }

  async save() {
    let setting = {
      magicWord: this.magicWord,
      popupMessage: this.popupMessage,
      starsMode: this.starsMode,
      title: this.title,
      magicWordFound: this.magicWordFound,
      lastMagicWordFound: this.lastMagicWordFound
    }
    await db.collection("settings").doc(this.id).set(setting, { merge: true })
  }

  async delete() {
    await db.collection("settings").doc(this.id).delete()
  }
}
