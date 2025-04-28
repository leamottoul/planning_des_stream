class Planning {
  constructor(id, events) {
    this.id = id
    this.events = events
  }

  static docToInstance(document) {
    let data = document.data()
    return data ? new Planning(document.id, data) : null
  }

  static async getAll() {
    let plannings = []
    await db.collection("plannings").get()
      .then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          let planning = Planning.docToInstance(doc)
          if (planning) {
            plannings.push(planning)
          }
        })
      })
    return plannings
  }

  static async getById(id) {
    let planning = null
    await db.collection("plannings").doc(id).get()
      .then((doc) => {
        planning = Planning.docToInstance(doc)
      })
    return planning
  }

  async save() {
    let planning = {
      events: this.events
    }
    await db.collection("plannings").doc(this.id).set(planning, { merge: true })
  }
  async delete() {
    await db.collection("plannings").doc(this.id).delete()
  }

}
