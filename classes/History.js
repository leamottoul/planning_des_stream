

class History {
  constructor(id, user, role, date, time, changes) {
    this.id = id
    this.user = user
    this.role = role
    this.date = date
    this.time = time
    this.changes = changes
  }
  
  static docToInstance(document) {
    let data = document.data()
    return data ? new History(document.id, data.user, data.role, data.date, data.time, data.changes) : null
  }

  static async getAll() {
    let histories = []
    await db.collection("settings").doc("history").collection("logs").get()
      .then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          let history = History.docToInstance(doc)
          if (history) {
            histories.push(history)
          }
        })
      })
    return histories
  }

  static async getById(id) {
    let history = null
    await db.collection("settings").doc("history").collection("logs").doc(id).get()
      .then((doc) => {
        history = History.docToInstance(doc)
      })
    return history
  }

  static async listenAll(callback) {
    let unsubscribe = db.collection("settings").doc("history").collection("logs").onSnapshot((querySnapshot) => {
      let histories = []
      querySnapshot.forEach((doc) => {
        let history = History.docToInstance(doc)
        if (history) {
          histories.push(history)
        }
      })
      callback(histories)
    })
    return unsubscribe
  }

  static async listenById(id, callback) {
    let unsubscribe = db.collection("settings").doc("history").collection("logs").doc(id).onSnapshot((doc) => {
      let history = History.docToInstance(doc)
      callback(history)
    })
    return unsubscribe
  }

  async save() {
    let history = {
      user: this.user,
      role: this.role,
      date: this.date,
      time: this.time,
      changes: this.changes
    }
    
    if (this.id) {
      await db.collection("settings").doc("history").collection("logs").doc(this.id).set(history, { merge: true })
    }
    else {
      this.id = db.collection("settings").doc("history").collection("logs").doc().id
      history.id = this.id
      await db.collection("settings").doc("history").collection("logs").doc(this.id).set(history)
    }
  }

  async delete() {
    await db.collection("settings").doc("history").collection("logs").doc(this.id).delete()
  }
}
