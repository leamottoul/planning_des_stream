

class Event {
  constructor(id, date, hour, type, title) {
    this.id = id
    this.date = date
    this.hour = hour
    this.type = type
    this.title = title
  }

  static docToInstance(document) {
    let data = document.data()
    return data ? new Event(document.id, data.date, data.hour, data.type, data.title) : null
  }

  static async getAll() {
    let events = []
    await db.collection("events").get()
      .then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          let event = Event.docToInstance(doc)
          if (event) events.push(event)
        })
      })
    return events
  }
  static async getByDate(date) {
    let events = []
    await db.collection("events").where("date", "==", date).get()
      .then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          let event = Event.docToInstance(doc)
          if (event) events.push(event)
        })
      })
    return events
  }

  static async getById(id) {
    let event = null
    await db.collection("events").doc(id).get()
      .then((doc) => {
        event = Event.docToInstance(doc)
      })
    return event
  }

  static async listenAll(callback) {
    db.collection("events").onSnapshot((querySnapshot) => {
      let events = []
      querySnapshot.forEach((doc) => {
        let event = Event.docToInstance(doc)
        if (event) events.push(event)
      })
      callback(events)
    })
  }

  static async listenByDate(date, callback) {
    db.collection("events").where("date", "==", date).onSnapshot((querySnapshot) => {
      let events = []
      querySnapshot.forEach((doc) => {
        let event = Event.docToInstance(doc)
        if (event) events.push(event)
      })
      callback(events)
    })
  }

  static async listenById(id, callback) {
    db.collection("events").doc(id).onSnapshot((doc) => {
      let event = Event.docToInstance(doc)
      callback(event)
    })
  }

  async save() {
    let data = {
      date: this.date,
      hour: this.hour,
      type: this.type,
      title: this.title
    }
    if (this.id) {
      await db.collection("events").doc(this.id).set(data, { merge: true })
    } else {
      let docRef = await db.collection("events").add(data)
      this.id = docRef.id
    }
  }

  async delete() {
    await db.collection("events").doc(this.id).delete()
  }

}
