const MagicModal = {
	template: `
    <v-dialog v-model="open" max-width="800px" scrim="#0f0e22" opacity="0.5" persistent>
      <v-card class="rounded-xl" style="background-color: rgb(var(--v-theme-surface));">
        <v-card-text>
          <div class="d-flex flex-row align-center justify-space-between w-100">
            <h3 style="color:rgb(var(--v-theme-primary))">Le mot magique</h3>
            <v-btn color="primary" icon variant="plain"><v-icon size="32" @click="close">mdi-close</v-icon></v-btn>
          </div>
          
          <div class="mt-5">
            <v-text-field base-color="primary" color="primary" style="color:rgb(var(--v-theme-primary))" variant="underlined" label="Mot magique" v-model="word"></v-text-field>
            <v-btn color="primary" class="w-100 mt-2" variant="plain" @click="checkMagicWord">Valider</v-btn>
          </div>

        </v-card-text>
      </v-card>
    </v-dialog>
  `,
	props: ["modelValue"],
  data() {
    return {
      open: false,
      word: "",
    };
  },
  watch: {
    modelValue(newValue) {
      this.open = newValue
    },
    open(newValue) {
      this.$emit('update:modelValue', newValue)
    }
  },
  methods: {
    checkMagicWord() {
      this.$emit("magic-word", this.word)
      this.close()
    },
    close() {
      this.open = false
    },
  },
}
