<template>
  <v-layout class="rounded rounded-md">
    <!-- <v-app-bar title="OpenIAP"></v-app-bar> -->
    <!-- image="https://picsum.photos/1920/1080?random" -->
    <v-app-bar color="teal-darken-4">
      <template v-slot:image>
        <v-img gradient="to top right, rgba(19,84,122,.8), rgba(128,208,199,.8)"></v-img>
      </template>

      <template v-slot:prepend>
        <v-app-bar-nav-icon></v-app-bar-nav-icon>
      </template>

      <v-app-bar-title>OpenIAP {{ version }}</v-app-bar-title>

      <v-spacer></v-spacer>

      <!-- <v-text-field v-model.trim="searchText" dense filled rounded clearable placeholder="Search"
        prepend-inner-icon="mdi-magnify" class="pt-6 shrink expanding-search"
        :class="{ closed: searchBoxClosed && !searchText }" @focus="searchBoxClosed = false"
        @blur="searchBoxClosed = true" ref="search" @keyup.escape="searchText='';searchBoxClosed = true" /> -->

      <!-- <button class="hidden" v-shortkey.propagte="['ctrl', 'f']" @shortkey="FocusSearch">Search</button> -->
      <button class="hidden" v-shortkey.propagte="['ctrl', 'k']" @shortkey="FocusSearch">Search</button>

      <!-- <v-btn icon>
        <v-icon>mdi-magnify</v-icon>
      </v-btn> -->

      <v-btn icon href="https://github.com/sponsors/skadefro" target="_blank">
        <v-icon>mdi-heart</v-icon>
      </v-btn>

      <v-btn icon @click="toggleTheme">
        <v-icon>mdi-theme-light-dark</v-icon>
      </v-btn>


      <v-btn icon>
        <v-icon>mdi-dots-vertical</v-icon>
      </v-btn>
    </v-app-bar>

    <!-- rail -->
    <v-navigation-drawer theme="dark">
      <v-list-item prepend-avatar="https://randomuser.me/api/portraits/women/75.jpg" nav></v-list-item>

      <v-divider></v-divider>

      <v-list density="compact" nav>
        <v-list-item v-for="([title, icon, to], i) in joinedmenu" :key="i" :prepend-icon="icon" :title="title"
          :value="title" :to="to"></v-list-item>
      </v-list>
    </v-navigation-drawer>

    <!-- <v-navigation-drawer v-if="submenu != null && submenu.length > 0">
        <v-list>
          <v-list-item v-for="([title, icon, to], i) in submenu" :key="i" :prepend-icon="icon" :title="title"
            :value="title" :to="to"></v-list-item>
        </v-list>
      </v-navigation-drawer> -->

    <!-- https://pictogrammers.com/library/mdi/ -->
    <!-- <v-navigation-drawer>
      <v-list-item prepend-icon="mdi-home" title="Home" to="/" />
      <v-list v-model:opened="openedGroups">
        <v-list-group value="Agents">
          <template v-slot:activator="{ props }">
            <v-list-item @click="navigate('/Agents')" v-bind="props" title="Agents" prepend-icon="mdi-account-hard-hat"></v-list-item>
          </template>
          <v-list-item v-for="([title, icon, to], i) in agents" :key="i" :prepend-icon="icon" :title="title"
            :value="title" :to="to"></v-list-item>
        </v-list-group>
        <v-list-group value="Workitems">
          <template v-slot:activator="{ props }">
            <v-list-item @click="navigate('/Workitems')" v-bind="props" title="Workitems" prepend-icon="mdi-format-list-checks" />
          </template>
          <v-list-item v-for="([title, icon, to], i) in workitems" :key="i" :prepend-icon="icon" :title="title"
            :value="title" :to="to"></v-list-item>
        </v-list-group>

        <v-list-group value="Users">
          <template v-slot:activator="{ props }">
            <v-list-item @click="navigate('/Users')" v-bind="props" title="Users" prepend-icon="mdi-account-multiple-outline" />
          </template>
          <v-list-item v-for="([title, icon, to], i) in users" :key="i" :prepend-icon="icon" :title="title"
            :value="title" :to="to"></v-list-item>
        </v-list-group>

        <v-list-group value="Admin">
          <template v-slot:activator="{ props }">
            <v-list-item v-bind="props" title="Admin" prepend-icon="mdi-account-multiple-outline" />
          </template>
          <v-list-item v-for="([title, icon, to], i) in admin" :key="i" :prepend-icon="icon" :title="title"
            :value="title" :to="to"></v-list-item>
        </v-list-group>
        
      </v-list>
    </v-navigation-drawer> -->






    <v-main class="justify-center" style="min-height: 300px;">
      <router-view></router-view>
    </v-main>

  </v-layout>

  <v-dialog max-width="500" v-model="isSearching">
    <v-card title="Search result">
      <v-card-text>
        <v-autocomplete ref="autocomplete" label="Autocomplete" v-model="search" :items="searcharray"
          @keyup.escape="isSearching = false" @keyup.enter="onSearchEnter()"></v-autocomplete>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn text="Close Dialog" @click="isSearching = false"></v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
<!-- <template>
  <div class="app">
    <nav class="nav">
      <div class="nav-left">
        <div class="tabs">
          <router-link to="/">Tasks</router-link>
          <router-link to="/Agents">Agents</router-link>
          <router-link to="/Workitems">Workitems</router-link>
          <router-link to="/Entities">Entities</router-link>
          <a href="#" @click.prevent="$oidc.signOut" v-if="$oidc.isAuthenticated">Signout</a>
          <theme-button />
          <pwaprompter></pwaprompter>
        </div>
      </div>
    </nav>
    <router-view></router-view>
  </div>
</template> -->
<script>
import { mapGetters, mapActions, mapMutations } from 'vuex'
import ThemeButton from "@/components/ThemeButton.vue";
import pwaprompter from "@/components/pwaprompter.vue";
import { config } from "@openiap/jsapi";

import { Util } from './Util'
const { err, info } = config

var excq = "";
function onMessage(client, message) {
  info("Received message from server: " + message);
}

export default {
  name: 'App',
  data() {
    return {
      submenu: [],

      joinedmenu: [],
      menu: [
        ['Agents', 'mdi-account-hard-hat', '/Agents', [
          ['Overview', 'mdi-account-hard-hat', '/Agents'],
          ['Add agent', 'mdi-plus', '/Agent'],
          ['Packages', 'mdi-archive', '/Packages'],
        ]],
        ['Tasks', 'mdi-sitemap', '/Tasks', [
          ['Overview', 'mdi-sitemap', '/Tasks'],
          ['Start Workflow', 'mdi-plus', '/Workflows'],       
        ]],
        ['Workitems', 'mdi-format-list-checks', '/Workitems', [
          ['Overview', 'mdi-format-list-checks', '/Workitems'],
          ['Add Workitem', 'mdi-plus', '/Workitem'],
          ['Workitem Queues', 'mdi-format-list-group', '/WorkitemQueues'],
          ['Add Workitem Queue', 'mdi-plus', '/WorkitemQueue'],
        ]],
        ['Users', 'mdi-account-hard-hat', '/Users', [
          ['Overview', 'mdi-account-hard-hat', '/Users'],
          ['Create User', 'mdi-plus', '/User'],
          ['Roles', 'mdi-account-supervisor', '/Roles'],
          ['Create Role', 'mdi-plus', '/Role'],
        ]],
        ['Entities', 'mdi-database', '/Entities'],
        ['Admin', 'mdi-cog-outline', '', [
          ['Management', 'mdi-account-multiple-outline'],
          ['Settings', 'mdi-cog-outline'],          
        ]],
      ],


      majorversion: "",
      searchText: "",
      searchBoxClosed: true,
      isSearching: false,
      activeGroup: null,
      searcharray: ["Agents", "Entities", "Users", "Tasks", "Workitems"],
      search: "",
    }
  },
  methods: {
    ...mapActions(['Signin', 'AddWebpushNotification']),
    ...mapMutations(['setAccessToken', 'setWebPushSubscription']),
    updateAvailable(event) {
      // console.debug('swUpdated', event)
    },
    WebPushSubscribed(event) {
      // console.debug('webpushsubscribed', event.detail);
      this.setWebPushSubscription(event.detail);
      // this.RegisterWebPush();
    },
    WebpushNotification(notification) {
      // console.debug('webpushnotification', notification);
      this.AddWebpushNotification(notification);
    },
    toggleTheme() {
      if (this.$vuetify.theme.dark == true) {
        this.setTheme("light");
      } else {
        this.setTheme("dark")
      }
    },
    setTheme(theme) {
      this.$vuetify.theme.dark = theme == "dark";
      this.$vuetify.theme.global.name = theme;
    },
    navigate(to) {
      this.$router.push(to);
    },
    FocusSearch(e) {
      // this.searchBoxClosed = false;
      // this.$nextTick(() => {
      //   this.$refs.search.focus();
      // });
      this.isSearching = true;
      this.search = "";
      this.$nextTick(() => {
        this.$refs.autocomplete.focus();
      });
    },
    onSearchEnter() {
      console.log(this.search, JSON.parse( JSON.stringify(this.$refs.autocomplete) ));
      if(this.search == "" || this.search == null) {
        if(this.$refs.autocomplete.filteredItems && this.$refs.autocomplete.filteredItems.length > 0 ){
          var item = this.$refs.autocomplete.filteredItems[0];
          this.$router.push({ path: '/' + item.value });
        } else {
          console.log("No item in filteredItems");
        }
      } else {
        console.log("search is not empty", this.search);
      }
      this.closeSearch();
    },
    closeSearch() {
      this.isSearching = false;
      this.search = ""; // Reset search field
    },
    SearchSelect(v) {
      this.closeSearch();
    },
    RegisterWebPush: async function (val, oldVal) {
      if (this.WebPushSubscriped == true && this.WebPushSubscription != null) {
        // console.debug('RegisterWebPush');
        const loco = window.location;
        var url = `http:///${this.Config.domain}/webpushsubscribe`
        if (this.Config.wsurl.startsWith("wss://")) url = `https:///${this.Config.domain}/webpushsubscribe`
        var payload = JSON.parse(JSON.stringify(this.WebPushSubscription));
        payload.jwt = this.jwt
        payload.host = loco.host
        payload.domain = this.Config.domain
        payload._type = 'customwebapp'
        fetch(url, {
          method: "POST",
          body: JSON.stringify(payload),
          headers: {
            "content-type": "application/json"
          }
        });
      } else {
        // console.debug('RegisterWebPush skipped', this.WebPushSubscriped, this.WebPushSubscription);
      }
    },
    UpdateSubmenu() {
      // console.log(this.$route.path)
      for(let i = 0; i < this.menu.length; i++) {
        // console.log(this.$route.path, "includes", this.menu[i][2])
        if (this.menu[i][2] != '' && this.$route.path.includes(this.menu[i][2])) {
          this.submenu = this.menu[i][3]
          this.joinedmenu = this.menu.slice();
          // add each submenu item to joinedmenu at index i
          if(this.menu[i].length > 3) {
            for(let y = 0; y < this.menu[i][3].length; y++) {
              this.joinedmenu.splice(i + y + 1, 0, this.menu[i][3][y])
            }
          }
          console.log("Found by menu", this.menu[i][2])
          break;
        }
        if(this.menu[i].length < 4) {
          // console.log("No submenu", this.menu[i][0])
          continue;
        }
        for(let y = 0; y < this.menu[i][3].length; y++) {
          // console.log(this.$route.path, "includes", this.menu[i][3][y][2])
          if (this.menu[i][3][y][2] != '' && this.$route.path.includes(this.menu[i][3][y][2])) {
            console.log("Found by submenu", this.menu[i][3][y][2])
            this.submenu = this.menu[i][3]
            this.joinedmenu = this.menu.slice();
            // add each submenu item to joinedmenu at index i
            if(this.menu[i].length > 3) {
              for(let y = 0; y < this.menu[i][3].length; y++) {
                this.joinedmenu.splice(i + y + 1, 0, this.menu[i][3][y])
              }
            }
            break;
          }
        }
      }
    }
  },
  computed: {
    ...mapGetters(['User', 'AccessToken', 'Signedin', 'Client', 'jwt', 'Config', 'WebPushSubscriped', 'WebPushSubscription']),
    token() {
      return this.$oidc.accessToken
    },
    username() {
      if (!this.User.name) return "";
      return this.User.name;
    },
    version() {
      if (this.majorversion != null && this.majorversion != "") return this.majorversion;
      if (this.Config == null) return "";
      if (this.Config.version == null || this.Config.version == "") return "";
      this.majorversion = this.Config.version;
      const dotCount = this.majorversion.split('.').length - 1;
      console.log(this.majorversion)
      if (dotCount == 3) {
        this.majorversion = this.majorversion.substring(0, this.majorversion.lastIndexOf('.'));
      }
      return this.majorversion;
    }
    
  },
  mounted: function () {    
    this.UpdateSubmenu()
  },
  watch: {
    '$route.path': function (to, from) {
      this.UpdateSubmenu()
    },
    Signedin: function (val, oldVal) {
      if (val == true && oldVal != val) {
      }
    },
    token: async function (val, oldVal) {
      if (!Util.IsNullEmpty(val) && oldVal != val) {
        this.setAccessToken(this.token);
        await this.Signin()
      }
    },
    User: async function (val, oldVal) {
      if (!Util.IsNullEmpty(val) && oldVal != val) {
        // this.RegisterWebPush();
      }
    },
    search: function (val, oldVal) {
      if (val != "" && val != null) {
        this.$router.push({ path: '/' + val });
      }
    }
  },
  async created() {
    document.addEventListener('swUpdated', this.updateAvailable, { once: true })
    document.addEventListener('webpushsubscribed', this.WebPushSubscribed, { once: true })
    if (navigator.serviceWorker && navigator.serviceWorker.addEventListener) {
      navigator.serviceWorker.addEventListener('message', event => {
        if (event.data.type === 'webpush') {
          this.WebpushNotification(event.data.data)
        } else {
          console.debug('unknown message', event.data)
        }
      });
    }
    if (!Util.IsNullEmpty(this.token)) {
      this.setAccessToken(this.token);
      await this.Signin()
    }
  },
  components: {
    ThemeButton,
    pwaprompter
  },
}

document.addEventListener('keydown', function (event) {
  // if (event.ctrlKey && event.key === 'f') {
  //   event.preventDefault();
  // }
  if (event.ctrlKey && event.key === 'k') {
    event.preventDefault();
  }
}); 
</script>

<style>
.hidden {
  display: none;
}

body {
  margin-left: 10px;
  margin-right: 10px;
}

.nav {
  margin-bottom: 10px;
}

body.dark {
  --bg-color: #000;
  --bg-secondary-color: #131316;
  --bg-hoover-color: #777;
  --font-color: #f5f5f5d7;
  --color-grey: #ccc;
  --color-darkGrey: #777;
  --easy-table-border: 1px solid #445269;
  --easy-table-row-border: 1px solid #445269;
  --easy-table-scrollbar-track-color: #4c5d7a;
  --easy-table-scrollbar-color: #4c5d7a;
  --easy-table-scrollbar-corner-color: #4c5d7a;
  --easy-table-scrollbar-thumb-color: #2d3a4f;
  --easy-table-header-font-color: var(--font--color);
  --easy-table-body-even-row-font-color: var(--font-color);
  --easy-table-body-row-font-color: var(--color-grey);
  --easy-table-body-row-hover-font-color: var(--font-color);
  --easy-table-footer-font-color: var(--font-color);
  --easy-table-body-even-row-background-color: var(--bg-secondary-color);
  --easy-table-body-row-hover-background-color: var(--bg-hoover-color);
  --easy-table-footer-background-color: var(--bg-color-color);
  --easy-table-loading-mask-background-color: var(--bg-color);
  --easy-table-header-background-color: var(--bg-color);
  --easy-table-body-row-background-color: var(--bg-color);
}

.arrow {
  border-top-color: var(--color-grey) !important;
  border-left-color: var(--color-grey) !important;
}

body.dark input {
  background-color: var(--bg-secondary-color);
  color: var(--font-color);
}

body.dark textarea {
  background-color: var(--bg-secondary-color);
  color: var(--font-color);
}

body.dark select {
  background-color: var(--bg-secondary-color);
  color: var(--font-color);
}

/*
Convert below to normal css:
 .v-input.expanding-search
	transition: max-width 0.5s
	.v-input__slot
	&.closed
		max-width: 70px */

.expanding-search {
  transition: max-width 0.5s;
}

.expanding-search.closed {
  max-width: 50px;
}
</style>

/*
--easy-table-header-font-color: #c1cad4;
--easy-table-body-even-row-font-color: #fff;
--easy-table-body-row-font-color: #c0c7d2;
--easy-table-body-row-hover-font-color: #2d3a4f;
--easy-table-footer-font-color: #c0c7d2;

--easy-table-body-even-row-background-color: #4c5d7a;
--easy-table-body-row-hover-background-color: #738bb4;
--easy-table-footer-background-color: #2d3a4f;
--easy-table-loading-mask-background-color: #2d3a4f;
--easy-table-header-background-color: #2d3a4f;
--easy-table-body-row-background-color: #2d3a4f;
*/