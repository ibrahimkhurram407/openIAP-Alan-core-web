<template>
  <v-container>
    <v-row>
      <!-- Filtering Button Group -->
      <v-col cols="12">
        <v-btn-toggle v-model="selectedType" mandatory dense>
          <v-btn v-for="type in types" :key="type" @click="GetData()">
            {{ type }}
          </v-btn>
        </v-btn-toggle>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12" sm="6" md="4" lg="3" v-for="item in filteredItems" :key="item.id">
        <v-card class="pa-3" flat tile>
          <v-card-text>
            <div>
              <h3>{{ item.name }}</h3>
              <p>Slug: {{ item.slug }}</p>
              <p>Image: {{ item.image }}</p>
              <p>Architecture: {{ item.arc }}</p>
              <p>Status: {{ item.status }}</p>
            </div>
            <div class="d-flex align-center justify-space-around mt-2">
              <v-btn icon @click="startAgent(item)">
                <v-icon>mdi-play</v-icon>
              </v-btn>
              <v-btn icon @click="BrowseAgent(item)">
                <v-icon>mdi-open-in-new</v-icon>
              </v-btn>
              <v-btn icon @click="stopAgent(item)">
                <v-icon>mdi-stop</v-icon>
              </v-btn>
              <v-btn icon @click="editAgent(item)">
                <v-icon>mdi-pencil</v-icon>
              </v-btn>
              <v-btn icon @click="deleteAgent(item)">
                <v-icon>mdi-delete</v-icon>
              </v-btn>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import { vue3Debounce } from 'vue-debounce'
import { User, openiap } from '@openiap/jsapi';

export default {
  data() {
    return {
      errormessage: "",
      knownpods: [],
      loading: false,
      searchValue: "",
      collectionname: "users",
      lastSearchValue: "",
      serverItemsPending: false,
      serverItemsLength: 0,
      rowsItems: [10, 25, 50, 100],
      autoUpdateInterval: 0,
      serverOptions: {
        page: 1,
        rowsPerPage: 10,
        sortBy: '',
        sortType: 'desc',
      },
      collections: ['audit', 'entities', 'users'],
      selectedType: '4',
      types: ['Disabled', 'Validated', 'DB Locked', 'All'],
      headers: [
      ],
      searchfields: ['name'],
      items: [
      ],
      itemsSelected: [],
      timer: null,
    }
  },
  async created() {
    this.searchValue = await this.PageStateGet({ key: "entities_" + this.collectionname + "_searchValue", defaultvalue: "" });
    this.serverOptions.rowsPerPage = await this.PageStateGet({ key: "entities_" + this.collectionname + "_rowsPerPage", defaultvalue: 10 });
    this.serverOptions.sortBy = await this.PageStateGet({ key: "entities_" + this.collectionname + "_sortby", defaultvalue: "" });
    if (this.collectionname == "fs.files" && this.serverOptions.sortBy == "_created") {
      this.serverOptions.sortBy = "metadata._created"
    }
    this.serverOptions.sortType = await this.PageStateGet({ key: "entities_" + this.collectionname + "_sorttype", defaultvalue: "desc" });
    this.GetData()
    this.LoadCollections()
  },
  mounted() {
    this.FocusSearch();
  },
  computed: {
    ...mapGetters(['User', 'Signedin', 'Config', 'Client', 'Cache']),
    /**
     * @returns {openiap} Client object with server-side functions
     */
    client() {
      return this.Client;
    },
    /**
     * @returns {User} Client object with server-side functions
     */
     user() {
      return this.User;
    },
    filteredItems() {
      return this.items;
    }
    
  },
  directives: {
    debounce: vue3Debounce({ lock: true })
  },
  components: {
  },
  watch: {
    Signedin: function (val, oldVal) {
      if (val == true && oldVal != val) {
        this.GetData();
        this.LoadCollections()
      }
    },
    serverOptions: {
      handler: function (val, oldVal) {
        if (oldVal != val) {
          this.GetData();
        }
      },
      deep: true
    }
  },
  beforeMount() {
    this.addAutoUpdate();
  },
  beforeUnmount() {
    this.cancelAutoUpdate();
  },
  methods: {
    ...mapActions(['PageStateGet', 'PageStateSet']),
    async startAgent(agent) {
      this.client.CustomCommand({ command: 'startagent', id: agent._id }).catch(error => {
        this.errormessage = error.message ? error.message : error;
      });
    },
    hasPod(agent) {
      if(agent == null) return false;
      let result = false;
      this.knownpods.forEach(pod => {
        if (pod.metadata.labels.agentid == agent._id) {
          result = true;
        }
      });
      return result;
    },
    async stopAgent(agent) {
      this.client.CustomCommand({ command: 'stopagent', id: agent._id }).catch(error => {
        this.errormessage = error.message ? error.message : error;
      });
    },
    async DeleteAgent(agent) {
      var isExecuted = confirm("Are you sure want to delete the " + agent.name + " agent?");
      if (!isExecuted) return;
      this.client.CustomCommand({ command: 'deleteagent', id: agent._id }).catch(error => {
        this.errormessage = error.message ? error.message : error;
      });
    },
    async BrowseAgent(agent) {
      var url = "//" + this.Config.agent_domain_schema.replace("$slug$", agent.slug)
      // open in new windows
      window.open(url, '_blank');
    },
    async editAgent(agent) {},


    editItem(item) {
      this.$router.push({ name: 'EntityViewWithId', params: { collectionname: this.collectionname, id: item._id } });
    },
    openlinkItem(item) {
      if (item.href != "" && item.href != null) {
        window.open(item.href, '_blank');
      }
    },
    Insert() {
      this.$router.push({ name: 'EntityView', params: { collectionname: this.collectionname } });
    },
    Reload() {
      this.GetData();
    },
    async DoSearch() {
      if (this.lastSearchValue != this.searchValue) {
        await this.PageStateSet({ key: "entities_" + this.collectionname + "_searchValue", value: this.searchValue });
        this.serverItemsLength = 0;
        this.serverOptions.page = 1;
        this.GetData();
      }
    },
    PreviusPage() {
      if (this.serverOptions.page > 1) {
        this.serverOptions.page--;
        this.GetData();
      }
    },
    NextPage() {
      if (this.serverOptions.page < this.serverItemsLength / this.serverOptions.rowsPerPage) {
        this.serverOptions.page++;
        this.GetData();
      }
    },
    SelectAll() {
      for(let i = 0; i < this.items.length; i++) {
        if(this.itemsSelected.indexOf(this.items[i]._id) == -1) {
          this.itemsSelected.push(this.items[i]._id)
        }
      }
    },
    FocusSearch() {
      // this.$refs.searchfield.focus();
    },
    async LoadCollections() {
      if (!this.Signedin) return;
      var collections = await this.Client.ListCollections({});
      this.collections = collections.map(x => x.name);
    },
    async GetData() {
      if (!this.Signedin) return;
      if(this.knownpods.length == 0) {
        this.client.CustomCommand({ command: "getagentpods" }).then(value => {
          console.log("getagentpods", JSON.parse(value));
          this.knownpods = JSON.parse(value);
        });
      }

      this.loading = true
      this.cancelAutoUpdate();
      try {
        var orderby = {};
        this.headers = [
          { text: "Name", value: "name" },
          { text: "State", value: "state", sortable: true },
          { text: "By", value: "_createdby", sortable: false },
          { text: "Created", value: "_created", sortable: true },
          { text: "Due", value: "lastrun", sortable: false },
          { text: "Operation", value: "operation" },
        ]
        if (this.serverOptions.sortBy == "" || this.serverOptions.sortBy == null) {
          this.serverOptions.sortBy = await this.PageStateGet({ key: "entities_" + this.collectionname + "_sortby", defaultvalue: "_created" });
        }

        if (this.serverOptions.sortBy != null && this.serverOptions.sortBy != "") {
          if (this.serverOptions.sortType == "asc") {
            orderby[this.serverOptions.sortBy] = 1;
          }
          if (this.serverOptions.sortType == "desc") {
            orderby[this.serverOptions.sortBy] = -1;
          }
        }
        var query = {"_type": "user"};
        // types: ['Disabled', 'Validated', 'DB Locked', 'All'],
        if(this.selectedType == 0) {
          query["disabled"] = true;
        } else if(this.selectedType == 1) {
          query["validated"] = true;
        } else if(this.selectedType == 2) {
          query["dblocked"] = true;
        }
        var exactquery = null;
        await this.PageStateSet({ key: "entities_" + this.collectionname + "_searchValue", value: this.searchValue });
        if (this.searchValue !== "" && this.searchValue != null) {
          if (this.searchValue.indexOf("{") == 0) {
            if (this.searchValue.lastIndexOf("}") == (this.searchValue.length - 1)) {
              try {
                this.errormessage = "";
                query = this.parseJson(this.searchValue, null, null);
              } catch (error) {
                this.errormessage = error.message ? error.message : error;
              }
            }
          } else {
            let finalor = [];
            const finalexactor = [];
            for (let i = 0; i < this.searchfields.length; i++) {
              let newq = {};
              const newexactq = {};
              // exact match case sensitive
              // newq[this.searchfields[i]] = this.searchValue;
              // exact match case insensitive
              newexactq[this.searchfields[i]] = new RegExp(["^", this.searchValue, "$"].join(""), "i");
              // newexactq[this.searchfields[i]] = new RegExp(["^", this.searchValue].join(""), "i");

              // exact match string contains
              newq[this.searchfields[i]] = new RegExp([this.searchValue.substring(1)].join(""), "i");

              finalor.push(newq);
              finalexactor.push(newexactq);
            }
            var hastextindex = false;
            if (!this.searchValue.startsWith(".") && hastextindex) {
              finalor = [{ $text: { $search: this.searchValue.toLowerCase() } }]
            }
            if (Object.keys(query).length == 0) {
              query = { $or: finalor.concat() };
              exactquery = { $or: finalexactor.concat() };
            } else {
              query = { $and: [query, { $or: finalor.concat() }] };
              exactquery = { $and: [query, { $or: finalexactor.concat() }] };
            }
            if (!this.searchValue.startsWith(".") && hastextindex) {
              exactquery = { "_searchnames": this.searchValue.toLowerCase() };
            }

          }
        }


        if (this.serverOptions.page == 1) {
          await this.PageStateSet({ key: "entities_" + this.collectionname + "_page", value: "" });
        } else {
          await this.PageStateSet({ key: "entities_" + this.collectionname + "_page", value: this.serverOptions.page });
        }
        if (this.serverOptions.rowsPerPage == 10) {
          await this.PageStateSet({ key: "entities_" + this.collectionname + "_rowsperpage", value: "" });
        } else {
          await this.PageStateSet({ key: "entities_" + this.collectionname + "_rowsperpage", value: this.serverOptions.page });
        }
        if (this.serverOptions.sortBy == "_created" && this.collectionname != "fs.files") {
          await this.PageStateSet({ key: "entities_" + this.collectionname + "_sortby", value: "" });
        } else {
          await this.PageStateSet({ key: "entities_" + this.collectionname + "_sortby", value: this.serverOptions.sortBy });
        }
        if (this.serverOptions.sortType == "desc") {
          await this.PageStateSet({ key: "entities_" + this.collectionname + "_sorttype", value: "" });
        } else {
          await this.PageStateSet({ key: "entities_" + this.collectionname + "_sorttype", value: this.serverOptions.sortType });
        }

        if (this.serverItemsLength == 0 && !this.serverItemsPending) {
          var _collectionname = this.collectionname.toString();
          this.Client.Count({ query, collectionname: this.collectionname }).then(value => {
            if (_collectionname == this.collectionname) {
              this.serverItemsLength = value;
            }
          });
        }
        if (this.serverItemsLength == 0) {
          this.serverItemsLength = ((this.serverOptions.page - 1) * this.serverOptions.rowsPerPage) + this.serverOptions.rowsPerPage + 1;
          // this.serverItemsLength = await this.Client.Count({ query, collectionname: this.collectionname });
        }
        if (this.serverItemsLength > 0) {
          if (exactquery != null && this.serverOptions.page == 1) {
            var arr = (await this.Client.Query({
              query: exactquery, collectionname: this.collectionname, top: 1
            }));
            if (arr.length > 0) {
              arr = arr.concat(await this.Client.Query({
                query, collectionname: this.collectionname, top: this.serverOptions.rowsPerPage - 1, orderby
              }));
            } else {
              arr = await this.Client.Query({
                query, collectionname: this.collectionname, top: this.serverOptions.rowsPerPage, orderby
              });

            }
            this.items = arr.filter((v, i, a) => a.findIndex(v2 => (v2._id === v._id)) === i)
          } else {
            this.items = await this.Client.Query({
              query, collectionname: this.collectionname, top: this.serverOptions.rowsPerPage,
              skip: (this.serverOptions.page - 1) * this.serverOptions.rowsPerPage,
              orderby,
              sort: this.serverOptions.sortBy + " " + this.serverOptions.sortType
            })
            if (this.serverOptions.page == 1 && this.items.length < this.serverOptions.rowsPerPage) {
              this.serverItemsLength = this.items.length;
            }
          }
        } else {
          this.items = [];
        }
        for (let i = 0; i < this.items.length; i++) {
          const model = this.items[i];
          model.fa = "fa-solid fa-question-circle";
          model.fa2 = "";
          if (model.clientagent == 'openrpa') model.fa = 'fa-solid fa-robot';
          if (model.clientagent == 'webapp') model.fa = 'fa-solid fa-globe';
          if (model.clientagent == 'browser') model.fa = 'fa-solid fa-globe';
          if (model.clientagent == 'mobileapp') model.fa = 'fa-solid fa-mobile-alt';
          if (model.clientagent == 'nodered') model.fa = 'fa-brands fa-node-js';
          if (model.clientagent == 'getUserFromRequest') model.fa = 'fa-brands fa-node-js';
          if (model.clientagent == 'googleverify') model.fa = 'fa-brands fa-google';
          if (model.clientagent == 'samlverify') model.fa = 'fa-brands fa-windows';
          if (model.clientagent == 'aiotwebapp') model.fa = 'fa-solid fa-globe';
          if (model.clientagent == 'aiotmobileapp') model.fa = 'fa-solid fa-mobile-alt';
          if (model.clientagent == 'nodered-cli') model.fa = 'fa-brands fa-node-js';
          if (model.clientagent == 'openflow-cli') model.fa = 'fa-brands fa-node-js';

          if (model.impostorname != '' && model.impostorname != null) model.fa2 = 'fa-solid fa-user-secret';
          // fa-solid fa-user-secret
        }

        this.lastSearchValue = this.searchValue;
      } catch (error) {
        console.error(error);
      }
      finally {
        this.addAutoUpdate();
        this.loading = false;
      }
    },
    addAutoUpdate() {
      if (this.timer == null && this.autoUpdateInterval > 0) {
        this.timer = setInterval(this.doAutoUpdate, this.autoUpdateInterval * 1000);
      }
    },
    doAutoUpdate() {
      try {
        if (this.itemsSelected == null || this.itemsSelected.length == 0) {
          this.GetData();
        } else {
          this.addAutoUpdate();
        }
      } catch (error) {
      }
    },
    cancelAutoUpdate() {
      clearInterval(this.timer);
      this.timer = null;
    },
    parseJson(txt, reviver) {
      const context = 50;
      try {
        return JSON.parse(txt, reviver)
      } catch (e) {
        if (typeof txt !== "string") {
          const isEmptyArray = Array.isArray(txt) && txt.length === 0
          const errorMessage = "Cannot parse " +
            (isEmptyArray ? "an empty array" : String(txt))
          throw new TypeError(errorMessage)
        }
        const syntaxErr = e.message.match(/^Unexpected token.*position\s+(\d+)/i)
        const errIdx = syntaxErr
          ? +syntaxErr[1]
          : e.message.match(/^Unexpected end of JSON.*/i)
            ? txt.length - 1
            : null
        if (errIdx != null) {
          const start = errIdx <= context
            ? 0
            : errIdx - context
          const end = errIdx + context >= txt.length
            ? txt.length
            : errIdx + context
          e.message += ` while parsing near "${start === 0 ? "" : "..."
            }${txt.slice(start, end)}${end === txt.length ? "" : "..."
            }"`
        } else {
          e.message += ` while parsing "${txt.slice(0, context * 2)}"`
        }
        throw e
      }
    },
    _timeSince(timeStamp) {
      try {
        timeStamp = new Date(timeStamp);
      } catch (error) {
        return;
      }
      const now = new Date(),
        secondsPast = (now.getTime() - timeStamp.getTime()) / 1000;
      if (secondsPast < 60) {
        return parseInt(secondsPast.toString()) + 's';
      }
      if (secondsPast < 3600) {
        return parseInt((secondsPast / 60).toString()) + 'm';
      }
      if (secondsPast <= 86400) {
        return parseInt((secondsPast / 3600).toString()) + 'h';
      }
      if (secondsPast > 86400) {
        let day = timeStamp.getDate();
        let month = timeStamp.toDateString().match(/ [a-zA-Z]*/)[0].replace(" ", "");
        let year = timeStamp.getFullYear() == now.getFullYear() ? "" : " " + timeStamp.getFullYear();
        return day + " " + month + year;
      }
    },
    _timeToo(timeStamp) {
      const now = new Date();
      let secondsPast = (now.getTime() - timeStamp.getTime()) / 1000;
      var suffix = "";
      if (secondsPast > 0) suffix = " ago";
      if (secondsPast < 0) secondsPast *= -1

      if (secondsPast < 60) {
        return parseInt(secondsPast.toString()) + 's' + suffix;
      }
      if (secondsPast < 3600) {
        return parseInt((secondsPast / 60).toString()) + 'm' + suffix;
      }
      if (secondsPast <= 86400) {
        return parseInt((secondsPast / 3600).toString()) + 'h' + suffix;
      }
      if (secondsPast > 86400) {
        let day = timeStamp.getDate();
        let month = timeStamp.toDateString().match(/ [a-zA-Z]*/)[0].replace(" ", "");
        let year = timeStamp.getFullYear() == now.getFullYear() ? "" : " " + timeStamp.getFullYear();
        return day + " " + month + year;
      }
    },
  },


  name: 'EntitiesView'
}
</script>

<style scoped>
body.dark {
  filter: saturate(3);
  --easy-table-header-font-color: rgba(255, 255, 255, 0.418);
}

body.dark .easy-checkbox {
  background: var(--easy-table-header-font-color)
}

body.dark .card a {
  color: var(--easy-table-header-font-color);
}

.operation-wrapper .operation-icon {
  width: 20px;
  cursor: pointer;
}

body.dark .operation-wrapper .operation-icon {
  filter: invert(100%);
}
</style>