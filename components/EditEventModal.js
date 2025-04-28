const EditEventModal = {
	template: `
    <v-dialog v-model="open" max-width="800px" scrim="#0f0e22" opacity="0.5" persistent>
      <v-card class="rounded-xl" style="background-color: rgb(var(--v-theme-surface));;">
        <v-card-text>
          <div class="d-flex flex-row align-center justify-space-between w-100">
            <h3 style="color:rgb(var(--v-theme-primary))">Modifier le stream du {{formatedDate}}</h3>
            <v-btn color="primary" icon variant="plain"><v-icon size="32" @click="close">mdi-close</v-icon></v-btn>
          </div>
          
          <div class="mt-5">
            <div class="d-flex flex-row align-center justify-space-between w-100">
              <v-text-field base-color="primary" color="primary" style="color:rgb(var(--v-theme-primary))" variant="underlined" label="Heures" v-model="hours"></v-text-field>
              <h4 class="mx-1" style="color:rgb(var(--v-theme-primary));">h</h4>
              <v-text-field base-color="primary" color="primary" style="color:rgb(var(--v-theme-primary))" variant="underlined" label="Minutes" v-model="minutes"></v-text-field>
            </div>
            <v-text-field base-color="primary" color="primary" style="color:rgb(var(--v-theme-primary))" variant="underlined" label="Titre" v-model="event.title"></v-text-field>
            <v-select base-color="primary" color="primary" style="color:rgb(var(--v-theme-primary))" variant="underlined" :items="allTypes" item-title="text" item-value="value" v-model="type" label="Catégorie"></v-select>
            <v-btn color="primary" class="w-100 mt-2" variant="plain" @click="save">Valider</v-btn>
          </div>

        </v-card-text>
      </v-card>
    </v-dialog>
  `,
	props: ["modelValue", "event", "user"],
  data() {
    return {
      open: false,
      type: null,
      hours: null,
      minutes: null,
    };
  },
  watch: {
    modelValue(newValue) {
      this.open = newValue
    },
    open(newValue) {
      this.$emit('update:modelValue', newValue)
    },
    event(newValue) {
      if (newValue) {

        if(newValue.hour == null){
          this.hours = "00"
          this.minutes = "00"
        }else{
          this.hours = newValue.hour.split("h")[0]
          this.minutes = newValue.hour.split("h")[1]
        }

        this.type = newValue.type
      }
    },
  },
  computed: {
    formatedDate() {
      let isoDate = this.event.date + "T00:00:00Z"
      let date = new Date(isoDate)
      let options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
      let formatedDate = date.toLocaleDateString('fr-FR', options)
      return formatedDate
    },
    allTypes() {
      let types = []
      games.forEach((game) => {
        if (game && game.id) {
          types.push({ text: game.name, value: game.id })
        }
      })
      return types
    },
  },
  methods: {
    async save(){
      //check if type.default
      let game = games.find(g => g.id == this.type)
      if(game && game.default){
        this.event.hour = null
        this.event.title = null
      }

      this.event.hour = this.hours + "h" + this.minutes
      this.event.type = this.type

      await this.event.save()
      
      let log = new History(null, this.user.username, this.user.role, new Date().toLocaleDateString(), new Date().toLocaleTimeString(), 'Modification du stream du ' + this.event.date + ' à ' + this.event.hour)
      await log.save()

      this.close()
    },
    close() {
      this.open = false
    },
  },
}
