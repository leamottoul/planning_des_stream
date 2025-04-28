const ParametersModal = {
	template: `
    <v-dialog v-model="open" max-width="800px" scrim="#0f0e22" opacity="0.5" persistent>
      <v-card class="rounded-xl" style="background-color: rgb(var(--v-theme-surface));">
        <v-card-text>
          <div class="d-flex flex-row align-center justify-space-between w-100">
            <h3 style="color:rgb(var(--v-theme-primary))">Paramètres</h3>
            <v-btn color="primary" icon variant="plain"><v-icon size="32" @click="close">mdi-close</v-icon></v-btn>
          </div>
          
          <v-tabs v-model="tab" class="mt-5" background-color="#0f0e22" color="primary" slider-color="primary" align-tabs="center" justify-center>
            <v-tab value="custom">Personnalisation</v-tab>
            <v-tab value="admin" v-if="user && ['admin'].includes(user.role)">Admin</v-tab>
            <v-tab value="history" v-if="user && ['admin'].includes(user.role)">Historique</v-tab>
            <v-tab value="stats" v-if="user && ['admin'].includes(user.role)">Statistiques</v-tab>
          </v-tabs>

          <v-tabs-window v-model="tab">
            <v-tabs-window-item value="custom">
              <div class="mt-3 d-flex flex-column align-center justify-start w-100">
                <div class="d-flex flex-row align-center justify-start w-100 my-1">
                  <h4 class="mr-2">Theme :</h4>
                  <v-select base-color="primary" color="primary" style="color:rgb(var(--v-theme-primary))" hide-details variant="outlined" :items="allThemes" item-title="text" item-value="value" v-model="LightTheme"></v-select>
                </div>
                <div class="d-flex flex-row align-center justify-start w-100 my-1" v-if="magicWordEnabled">
                  <h4 class="mr-2">Etoiles :</h4>
                  <v-select base-color="primary" color="primary" style="color:rgb(var(--v-theme-primary))" hide-details variant="outlined" :items="[{text:'Avec', value:true},{text:'Sans', value:false}]" item-title="text" item-value="value" v-model="starsEnabled"></v-select>
                </div>
              </div>
          
              <div class="mt-3">
                <v-btn color="primary" class="w-100 mt-2" variant="plain" @click="save">Valider</v-btn>
              </div>
            </v-tabs-window-item>

            <v-tabs-window-item value="admin">              
              <div class="mt-3 d-flex flex-column align-center justify-start w-100">
                <div class="d-flex flex-row align-center justify-start w-75">
                  <v-text-field base-color="primary" color="primary" style="color:rgb(var(--v-theme-primary))" variant="underlined" label="Titre" v-model="newTitle"></v-text-field>
                </div>
                <div class="d-flex flex-row align-center justify-start w-75">
                  <v-text-field base-color="primary" color="primary" style="color:rgb(var(--v-theme-primary))" variant="underlined" label="Mot magique" v-model="newMagicWord"></v-text-field>
                </div>
                <div class="d-flex flex-row align-center justify-start w-75">
                  <v-text-field base-color="primary" color="primary" style="color:rgb(var(--v-theme-primary))" variant="underlined" label="Message" v-model="newPopupMessage"></v-text-field>
                </div>
              </div>
              
              <div class="mt-3">
                <v-btn color="primary" class="w-100 mt-2" variant="plain" @click="save">Valider</v-btn>
              </div>
            </v-tabs-window-item>

            <v-tabs-window-item value="history" style="overflow-y: auto; max-height: 400px;">
              <div v-for="item in history" class="mt-3 d-flex flex-column align-center justify-start w-100">
                <div class="d-flex flex-column align-center justify-start w-100">
                  <div class="d-flex flex-row align-center justify-start w-100">
                    <h1>⌛</h1>
                    <div>
                      <h4 class="mr-2">Le {{item.date}} à {{item.time}} : {{item.changes}}</h4>
                      <h5 class="mr-2">(Utilisateur : {{item.user}}, Role : {{item.role}})</h5>
                    </div>
                  </div>
                </div>
                <div class="mt-3 w-100">
                  <v-divider></v-divider>
                </div>
              </div>
            </v-tabs-window-item>
          </v-tabs-items>

            <v-tabs-window-item value="stats" style="overflow-y: auto; max-height: 400px;">
              <div class="mt-3 d-flex flex-column align-center justify-center">
                <div class="d-flex flex-row align-center justify-center my-3">
                  <div class="d-flex flex-column align-start justify-center my-1">
                    <h4>Nombre de mots magiques trouvés</h4>
                    <h5>(depuis toujours)</h5>
                  </div>
                  <div class="d-flex flex-column align-center justify-center my-1">
                    <h1><v-icon size="20" class="mx-3">mdi-arrow-right</v-icon> {{settings.magicWordFound}}</h1>
                  </div>
                </div>
                <div class="d-flex flex-row align-center justify-center my-3">
                  <div class="d-flex flex-column align-start justify-center my-1">
                    <h4>Nombre de mots magiques trouvés</h4>
                    <h5>(depuis le dernier changement)</h5>
                  </div>
                  <div class="d-flex flex-column align-center justify-center my-1">
                    <h1><v-icon size="20" class="mx-3">mdi-arrow-right</v-icon> {{settings.lastMagicWordFound}}</h1>
                  </div>
                </div>
              </div>
          
              <div class="mt-3">
                <v-btn color="primary" class="w-100 mt-2" variant="plain" @click="save">Valider</v-btn>
              </div>
            </v-tabs-window-item>
          </v-tabs-items>

        </v-card-text>
      </v-card>
    </v-dialog>
  `,
	props: ["modelValue", "settings", "user", "history", "themes"],
  data() {
    return {
      open: false,
      tab: 'custom',

      userIp: null,
      
      magicWordEnabled: false,

      LightTheme: 'dark',
      starsEnabled: false,
      newMagicWord: "",
      newPopupMessage: "",
      newTitle: "",
    }
  },
  async mounted() {
    this.getData()

    //recuperation de l'IP de l'utilisateur
    const response = await fetch('https://api.ipify.org?format=json')
    const data = await response.json()
    this.userIp = data.ip
  },
  watch: {
    modelValue(newValue) {
      this.open = newValue
      this.getData()
    },
    open(newValue) {
      this.$emit('update:modelValue', newValue)
      this.getData()
    },
  },
  computed: {
    allThemes() {
      let allThemes = []
      for(let index in this.themes){
        if(!this.themes[index].needMagicWord || this.magicWordEnabled){
          allThemes.push({text:this.themes[index].name, value:index})
        }
      }
      return allThemes
    },
  },
  methods: {
    close() {
      this.open = false
    },
    async save() {
      if(sessionStorage.getItem("theme") != this.LightTheme || this.starsEnabled.toString() != sessionStorage.getItem("starsEnabled")){
        sessionStorage.setItem("theme", this.LightTheme)
        sessionStorage.setItem("starsEnabled", this.starsEnabled)

        if(this.user && this.user.username && this.user.role) {
          let log = new History(null, this.user.username, this.user.role, new Date().toLocaleDateString(), new Date().toLocaleTimeString(), 'Changement de paramètres user')
          await log.save()
        }else{
          let log = new History(null, "Anonyme ("+this.userIp+")", "user", new Date().toLocaleDateString(), new Date().toLocaleTimeString(), 'Changement de paramètres user')
          await log.save()
        }
      }

      if(this.settings.magicWord != this.newMagicWord){
        this.settings.lastMagicWordFound = 0
        this.settings.save()
      }

      if(this.settings.magicWord != this.newMagicWord || this.settings.popupMessage != this.newPopupMessage || this.settings.title != this.newTitle){
        this.settings.magicWord = this.newMagicWord
        this.settings.popupMessage = this.newPopupMessage
        this.settings.title = this.newTitle

        if(this.user && this.user.username && this.user.role) {
          let log = new History(null, this.user.username, this.user.role, new Date().toLocaleDateString(), new Date().toLocaleTimeString(), 'Changement de paramètres admin')
          await log.save()
        }else{
          let log = new History(null, "Anonyme ("+this.userIp+")", "user", new Date().toLocaleDateString(), new Date().toLocaleTimeString(), 'Changement de paramètres admin')
          await log.save()
        }
      }

      this.settings.save()

      this.$emit('update')

      this.close()
    },
    getData() {
      this.magicWordEnabled = sessionStorage.getItem("magicWordEnabled") == "true"

      this.LightTheme = sessionStorage.getItem("theme")
      this.starsEnabled = sessionStorage.getItem("starsEnabled") == "true"

      this.newMagicWord = this.settings.magicWord
      this.newPopupMessage = this.settings.popupMessage
      this.newTitle = this.settings.title
    },
  },
}
