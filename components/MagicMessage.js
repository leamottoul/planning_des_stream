const MagicMessage = {
	template: `
    <v-dialog v-model="open" max-width="600px" scrim="#0f0e22" opacity="0.5" persistent>
      <v-card class="rounded-xl" style="background-color: rgb(var(--v-theme-surface));;">
        <v-card-text>          
          <div class="mt-5">
            <h3 class="text-center" v-html="message"></h3>
            <v-btn color="primary" class="w-100 mt-2" variant="plain" @click="close">Ok</v-btn>
          </div>

        </v-card-text>
      </v-card>
    </v-dialog>
  `,
	props: ["modelValue", "message"],
  data() {
    return {
      open: false,
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
    close() {
      this.open = false
    },
  },
}
