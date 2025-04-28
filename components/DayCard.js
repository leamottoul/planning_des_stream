const DayCard = {
	template: `
    <v-hover>
      <template v-slot:default="{ isHovering, props }">
        <v-card v-bind="props" outlined color="primary" class="dayCard rounded-xl h-100 w-100 ma-1" :style="bgStyle + ( isHovering && canEdit ? ' background-blend-mode: multiply; filter: saturate(0.5)' : '')">
          <v-card-text class="w-100 h-100 pa-0 d-flex flex-column align-center justify-space-between" v-if="event">
            <h2 class="text-center w-100 py-1 text-white" style="background-color:rgb(var(--v-theme-primary))">{{ day }}</h2>
            <div class="w-100 d-flex flex-column justify-center align-center">
              <div class="w-100 d-flex justify-center align-center">
                <v-btn class="mx-1" color="primary" icon v-if="isHovering && canEdit" @click="editEvent"><v-icon size="24">mdi-pencil</v-icon></v-btn>
                <v-btn class="mx-1" color="primary" icon v-if="isHovering && canEdit && amount < 3" @click="addEvent"><v-icon size="24">mdi-plus</v-icon></v-btn>
                <v-btn class="mx-1" color="primary" icon v-if="isHovering && canEdit && amount > 1" @click="removeEvent"><v-icon size="24">mdi-minus</v-icon></v-btn>
              </div>
            </div>
            <div v-if="(!eventGame || !eventGame.banner) && isHovering && canEdit"></div>
            <div class="w-100 py-1" style="background-color:rgb(var(--v-theme-primary));" v-if="eventGame && eventGame.banner">
              <h2 class="text-center text-white">{{event.hour}}</h2>
              <v-divider color="white" class="border-opacity-50"></v-divider>
              <div style="height:50px">
                <h4 class="text-center text-white">{{event.title}}</h4>
                <h5 class="text-center text-white">({{eventGame.name}})</h5>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </template>
    </v-hover>
  `,
	props: ["day", "event", "user", "amount"],
  computed: {
    bgUrl() {
      if(this.eventGame){
        return 'assets/images/'+this.eventGame.image
      }
    },
    bgStyle() {
      let style = 'background-image: url(\'' + this.bgUrl + '\'); background-size: cover; background-position: center;transition: all 0.3s ease;'
      return style
    },
    eventGame(){
      let game = null
      if(this.event && this.event.type && games.find(g => g.id == this.event.type)){
        game = games.find(g => g.id == this.event.type)
      }else if(games.find(g => g.default)){
        game = games.find(g => g.default)
      }
      return game
    },
    canEdit(){
      if(this.user && ['admin'].includes(this.user.role)){
        return true
      }else{
        return false
      }
    }
  },
  methods: {
    editEvent() {
      this.$emit("edit", this.event)
    },
    async addEvent() {
      let tmpEvent =  new Event(this.event.date + "-" + new Date().getTime(), this.event.date, null, null, null)
      await tmpEvent.save()
    },
    async removeEvent() {
      await this.event.delete()
    }
  },

}
