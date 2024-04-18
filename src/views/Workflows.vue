<template>
  <v-data-table-server v-model:items-per-page="serverOptions.rowsPerPage" :items-per-page-options="rowsItems"
    :page="serverOptions.page" :headers="headers" :items="serverItems" :items-length="totalItems" :loading="loading"
    :search="searchValue" item-value="_id" @update:options="GetData" show-select
    v-model="itemsSelected"
    @click:row="handleClick"
    >
  </v-data-table-server>
  <button class="hidden" v-shortkey.propagte="['insert']" @shortkey="Insert">Next</button>
  <button class="hidden" v-shortkey.propagte="['arrowright']" @shortkey="NextPage">Next</button>
  <button class="hidden" v-shortkey.propagte="['arrowleft']" @shortkey="PreviusPage">Previus</button>
  <button class="hidden" v-shortkey.propagte="['arrowup']" @shortkey="PreviusCollection">Next</button>
  <button class="hidden" v-shortkey.propagte="['arrowdown']" @shortkey="NextCollection">Previus</button>
  <button class="hidden" @click="SelectAll" v-shortkey.propagte="['ctrl', 'a']" @shortkey="SelectAll">SelectAll</button>
  <button class="hidden" v-shortkey.propagte="['ctrl', 'f']" @shortkey="FocusSearch">Search</button>

</template>

<script>
import { Util } from '../Util'
import { mapGetters } from 'vuex'
import { vue3Debounce } from 'vue-debounce'

export default {
  name: 'WorkitemsView',
  props: {
    propwiqid: { default: '' }
  },
  data() {
    return {
      headers: [
      ],
      search: '',
      serverItems: [],
      loading: true,
      totalItems: 0,
      state: "all",
      states: ["new", "successful", "failed", "processing", "all"],

      errormessage: "",
      loading: false,
      searchValue: "",
      collectionname: "workflow",
      wiqid: "",
      lastSearchValue: "",
      serverItemsLength: 0,
      rowsItems: [10, 25, 50, 100],
      autoUpdateInterval: 15,
      serverOptions: {
        page: 1,
        rowsPerPage: 10,
        sortBy: '_created',
        sortType: 'desc',
      },
      workitemqueues: [],
      searchfields: ['name'],
      items: [
      ],
      itemsSelected: [],
      timer: null,
      showfailed: false,
      showsuccessful: false,
      shownew: false,
      showprocessing: false,
    }
  },
  created() {
    if (!Util.IsNullEmpty(this.propwiqid)) this.wiqid = this.propwiqid;
    this.GetData()
  },
  mounted() {
    this.FocusSearch();
  },
  computed: {
    ...mapGetters(['User', 'Signedin', 'Config', 'Client'])
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
      }
    },
    state: function (val, oldVal) {
      if (oldVal != val) {
        this.serverItemsLength = 0;
        this.serverOptions.page = 1;
        this.GetData();
      }
    },
    wiqid: function (val, oldVal) {
      if (oldVal != val) {
        this.$router.push({ path: `/Workitems/${val}` })
        this.itemsSelected = [];
        this.serverItemsLength = 0;
        this.serverOptions.page = 1;
        this.GetData();
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
    async Delete() {
      if (this.itemsSelected.length > 0) {
        let isExecuted = confirm("Are you sure want to delete the " + this.itemsSelected.length + " selected items?");
        if (!isExecuted) return;
        await this.Client.DeleteMany({ collectionname: this.collectionname, ids: this.itemsSelected.map(x => x._id) });
        this.itemsSelected = [];
        this.serverItemsLength = 0;
        this.GetData();
      }
    },
    editItem(item) {
      this.$router.push({ name: 'WorkItemViewWithId', params: { id: item._id } });
    },
    Insert() {
      this.$router.push({ name: 'WorkItem', params: { wiqid: this.wiqid } });
    },
    RowClick(item) {
      // this.itemsSelected = [...this.itemsSelected, item];
      var rowitem = this.items.find(x => x._id == item._id);
      rowitem.isSelected = !item.isSelected;
      item.isSelected = !item.isSelected;
      this.itemsSelected = this.items.filter(x => x.isSelected == true);
      // this.itemsSelected.push(item);
    },
    Reload() {
      this.GetData();
    },
    ToggleNew() {
      this.shownew = !this.shownew;
      this.serverItemsLength = 0;
      this.GetData();
    },
    ToggleSuccessful() {
      this.showsuccessful = !this.showsuccessful;
      this.serverItemsLength = 0;
      this.GetData();
    },
    ToggleFailed() {
      this.showfailed = !this.showfailed;
      this.serverItemsLength = 0;
      this.GetData();
    },
    ToggleProcessing() {
      this.showprocessing = !this.showprocessing;
      this.serverItemsLength = 0;
      this.GetData();
    },
    DoSearch() {
      if (this.lastSearchValue != this.searchValue) {
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
    PreviusCollection() {
      var index = this.states.indexOf(this.state);
      if (index > 0) {
        index--;
      } else {
        index = this.states.length - 1;
      }
      this.state = this.states[index];
    },
    NextCollection() {
      var index = this.states.indexOf(this.state);
      if (index < this.states.length - 1) {
        index++;
      } else {
        index = 0;
      }
      this.state = this.states[index];
    },
    SelectAll(e) {
      for(let i = 0; i < this.items.length; i++) {
        if(this.itemsSelected.indexOf(this.items[i]._id) == -1) {
          this.itemsSelected.push(this.items[i]._id)
        }
      }
    },
    FocusSearch() {
      // this.$refs.searchfield.focus();
    },
    async loadItems() {
      this.loading = true
      this.serverItems = this.items
      this.totalItems = this.serverItemsLength
      this.loading = false
    },
    async handleClick(e, row) {
      console.log("handleClick", row)
      if(this.itemsSelected.find(x => x._id == row.item._id) == null) {
        this.itemsSelected.push(row.item._id)
        console.log("Selected", row.item._id)
      } else {
        this.itemsSelected = this.itemsSelected.filter(x => x._id != row.item._id)
        console.log("UnSelected", row.item._id)
      }
    },
    async GetData(options) {
      if (options != null) {
        console.log("GetData", JSON.parse(JSON.stringify(options)))
      }
      var orderby = {};

      if (!this.Signedin) return;
      const { page, itemsPerPage, sortBy } = options || {}
      if (page != null) this.serverOptions.page = page;
      if (itemsPerPage != null) this.serverOptions.rowsPerPage = itemsPerPage;

      if (sortBy != null && sortBy.length > 0) {
        for (let i = 0; i < sortBy.length; i++) {
          orderby[sortBy[i].sortBy] = sortBy[i].sortDesc ? -1 : 1;
        }
      }
      this.loading = true
      this.cancelAutoUpdate();
      try {
        // if (this.serverOptions.sortType == "asc") {
        //   orderby[this.serverOptions.sortBy] = 1;
        // }
        // if (this.serverOptions.sortType == "desc") {
        //   orderby[this.serverOptions.sortBy] = -1;
        // }
        var query = { "_type": "workflow" };
        var exactquery = null;
        if (!Util.IsNullEmpty(this.wiqid)) query["wiqid"] = this.wiqid;
        if (!Util.IsNullEmpty(this.wiqid)) query["wiqid"] = this.wiqid;

        if (this.state != null && this.state != "" && this.state != "all") {
          query["state"] = this.state
          console.log("Filter by state", this.state)
        }
        var states = [];
        if (this.shownew) states.push("new");
        if (this.showsuccessful) states.push("successful");
        if (this.showfailed) states.push("failed");
        if (this.showprocessing) states.push("processing");
        if (states.length > 0) query["state"] = { "$in": states };

        if (this.searchValue !== "" && this.searchValue != null) {
          if (this.searchValue.indexOf("{") == 0) {
            if (this.searchValue.lastIndexOf("}") == (this.searchValue.length - 1)) {
              try {
                this.errormessage = "";
                var _q = this.parseJson(this.searchValue, null, null);
                query = Object.assign(query, _q);
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
            if (this.Config.collections_with_text_index.indexOf(this.collectionname) > -1) {
              hastextindex = true;
            }
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


        // {
        //   title: 'Name',
        //   align: 'start', , align: 'end'
        //   sortable: false,
        //   key: 'name',
        // },

        this.headers = [
          { title: "Name", key: "name", sortable: true },
          { title: "By", key: "_createdby", sortable: false },
        ]

        this.items = [];
        if (this.serverItemsLength == 0) {
          this.serverItemsLength = ((this.serverOptions.page - 1) * this.serverOptions.rowsPerPage) + this.serverOptions.rowsPerPage + 1;
          this.Client.Count({ query, collectionname: this.collectionname }).then(value => {
            this.serverItemsLength = value;
          });
        }
        if (this.serverItemsLength > 0) {
          if (exactquery != null && this.serverOptions.page == 1) {
            var arr = this.items = (await this.Client.Query({
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
        this.lastSearchValue = this.searchValue;
      } catch (error) {
        console.error(error);
      }
      finally {
        this.addAutoUpdate();
        this.loading = false;
      }
      this.loadItems({ page: this.serverOptions.page, itemsPerPage: this.serverOptions.rowsPerPage, sortBy: this.serverOptions.sortBy });
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
}
document.addEventListener('keydown', function (event) {
  if (event.ctrlKey && event.key === 'a') {
    event.preventDefault();
  }
}); 
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