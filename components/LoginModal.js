const LoginModal = {
	template: `
    <v-dialog v-model="open" max-width="800px" scrim="#0f0e22" opacity="0.5" persistent>
      <v-card class="rounded-xl" style="background-color: rgb(var(--v-theme-surface));">
        <v-card-text>
          <div class="d-flex flex-row align-center justify-space-between w-100">
            <h3 style="color:rgb(var(--v-theme-primary))">Se connecter</h3>
            <v-btn color="primary" icon variant="plain"><v-icon size="32" @click="close">mdi-close</v-icon></v-btn>
          </div>

          <v-alert type="red" variant="tonal" v-if="error">{{errorMessage}}</v-alert>
          
          <div class="mt-5">
            <v-text-field type="text" base-color="primary" color="primary" style="color:rgb(var(--v-theme-primary))" variant="underlined" label="Nom d'utilisateur" v-model="username"></v-text-field>
            <v-text-field type="password" base-color="primary" color="primary" style="color:rgb(var(--v-theme-primary))" variant="underlined" label="Mot de pass" v-model="password"></v-text-field>
            <v-btn color="primary" class="w-100 mt-2" variant="plain" @click="checkAuth">Se connecter</v-btn>
          </div>

        </v-card-text>
      </v-card>
    </v-dialog>
  `,
	props: ["modelValue"],
  data() {
    return {
      open: false,
      username: "",
      password: "",
      error: false,
      errorMessage: "",
    }
  },
  watch: {
    modelValue(newValue) {
      this.open = newValue
      this.username = ""
      this.password = ""
      this.error = false
      this.errorMessage = ""
    },
    open(newValue) {
      this.$emit('update:modelValue', newValue)
      this.username = ""
      this.password = ""
      this.error = false
      this.errorMessage = ""
    }
  },
  methods: {
    checkAuth() {
      let user = users.find((user) => user.username === this.username)
      let hash = CryptoJS.SHA256(this.password).toString()
      if (user && user.password === hash) {
        this.$emit("login", user)
        this.error = false
        this.close()
      } else {
        this.$emit("logout")
        this.error = true
        this.errorMessage = "Nom d'utilisateur ou mot de passe incorrect"
      }
    },
    close() {
      this.open = false
    },
  },
}
