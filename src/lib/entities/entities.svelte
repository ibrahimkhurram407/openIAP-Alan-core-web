<script lang="ts">
  import { onMount, createEventDispatcher } from "svelte";
  import { tick } from "svelte";
  import SuperDebug from "sveltekit-superforms";
	import { client, getStoreValue, isSignedin,collections } from "$lib/stores";
  import { createTable , Render, Subscribe, createRender } from "svelte-headless-table";
  import { addPagination, addSortBy, addHiddenColumns, addSelectedRows } from "svelte-headless-table/plugins";
  import { ScrollArea } from "$lib/components/ui/scroll-area/index.js";
  import ArrowUpDown from "lucide-svelte/icons/arrow-up-down";
  import ArrowUp from "lucide-svelte/icons/arrow-up";
  import ArrowDown from "lucide-svelte/icons/arrow-down";
  import ChevronDown from "lucide-svelte/icons/chevron-down";
  import * as Table from "$lib/components/ui/table";
  import DataTableActions from "./data-table-actions.svelte";
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
  import DataTableCheckbox from "./data-table-checkbox.svelte";
  import { writable, type Writable } from "svelte/store";
  import { setting, deleteAllSettings, deleteSettings } from "$lib/pstore";
    import { set } from "zod";
  // https://www.shadcn-svelte.com/docs/components/data-table
  // https://github.com/bryanmylee/svelte-headless-table/discussions/56

  let serverItemCount = writable(-1);
  const error = writable("");
  const dispatch = createEventDispatcher();


  export let collectionname = "entities";
  let currentcollectionname = collectionname;
  export let query = {};
  export let key:string;
  export let searchstring: Writable<string> = writable("");
  export let multiselect = false;
  export let showquery = false;
  export let explain = false;
  export let showInsert = true;

  let explainquery = writable(null);

  // deleteAllSettings
  // deleteSettings(key)
  export let selecteditems = [];
  let unsubscribe4;
  let unsubscribe5;


  export let defaultcolumns = ["_id", "", "name"];
  
  const currentquery = writable({});

  let sortKeys;
  updateSortKeys();
  let ShowColumns = setting(key, "ShowColumns", {});
  let _pageindex = setting(key, "pageindex", 0);
  let pagesize = setting(key, "pagesize", 10);

  
  let _selectedDataIds = setting(key, "selectedDataIds", {});
  if(Object.keys($_selectedDataIds).length > 0) {
    multiselect = true;
  }
  let psearchstring = setting(key, "searchstring", "");
  if($psearchstring != "") {
    $searchstring = $psearchstring;
  }


  if(isNaN(parseInt($_pageindex))) {
    _pageindex.set(0);
  }

  let selectedDataIds;

  function updateSortKeys() {
    let sortDefault = [{id: "_created", order: "desc"}];
    if(collectionname == "dbusage") {
      sortDefault = [];
    } else if(collectionname == "cvr") {
      sortDefault = [{id: "sidstOpdateret", order: "desc"}];
    }
    sortKeys = setting(key, "sortKeys", sortDefault);
  }

  function updateShowColumns(viewModel) {
    for(let y = 0; y < $sortKeys.length; y++) {
        const key = $sortKeys[y].id;
        $ShowColumns[key] = true;
      }
    const ids = viewModel.flatColumns.map((col) => col.id)
    for(let i = 0; i < ids.length; i++) {
      const id = ids[i];
      if(id == "_id") {
        $ShowColumns[id] = multiselect;
        continue;
      }
      if(id == "_created" || id == "_modified") {
      } else if(id.startsWith("_") || id == "name" || id == "") {
        $ShowColumns[id] = true;
        continue;
      }
      if($ShowColumns[id] != null) {
        continue;
      }
      if(defaultcolumns.indexOf(id) == -1) {
        $ShowColumns[id] = false;
      } else {
        $ShowColumns[id] = true;
      }
    }
    viewModel.pluginStates.hide.hiddenColumnIds.set(Object.entries($ShowColumns).filter(([, hide]) => !hide).map(([id]) => id));
  }
  
  function parseJson(txt, reviver, context) {
        context = context || 20
        try {
            return JSON.parse(txt, reviver)
        } catch (e) {
            if (typeof txt !== "string") {
                const isEmptyArray = Array.isArray(txt) && txt.length === 0
                const errorMessage = "Cannot parse " +
                    (isEmptyArray ? "an empty array" : String(txt))
                $error = errorMessage
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
    }
    function safeEval(jsStr) {
    try {
        return Function(`"use strict";return (` + jsStr + `)`)();
    } catch (e) {
        $error = e.message
        return null;
    }
}
  function createQuery() {
    let q = {...query};
    psearchstring = setting(key, "searchstring", "");
    $psearchstring = $searchstring;

    if($searchstring == null || $searchstring == "") {
      return q;
    }
    if ($searchstring.indexOf("{") == 0) {
        if ($searchstring.lastIndexOf("}") == ($searchstring.length - 1)) {
            try {
                q = parseJson($searchstring, null, null);
            } catch (e) {
              try {
                q = safeEval($searchstring);
              } catch (error2) {
                $error = e.message;
                return null;
              }
            }
        } else {
          $error = "Incomplete query object";
        }
    } else {
      // q["name"] = new RegExp([searchstring.substring(1)].join(""), "i")
      q["name"] = {"$regex": $searchstring, "$options": "i"}
    }
    return q;
  }

  // const items = writable([{_id: "12", name: "test"}]);
  const items = writable([]);
  function reCreateTable() {
    let table = createTable(items, {
    page: addPagination({
      initialPageIndex: $_pageindex,
      initialPageSize: $pagesize,
      serverItemCount,
      serverSide: true
    }),
    sort: addSortBy({serverSide: true, initialSortKeys: $sortKeys, disableMultiSort: false }),
    hide: addHiddenColumns(),
    select: addSelectedRows(),
  });
  let columns = [];
  columns.push(table.column({
    id: "_id",
    accessor: ({ _id }) => _id,
    header: (_, { pluginStates }) => {
      const { allPageRowsSelected } = pluginStates.select;
      return createRender(DataTableCheckbox, {
        checked: allPageRowsSelected,
      });
    },
    cell: ({ row }, { pluginStates }) => {
      const { getRowState } = pluginStates.select;
      const { isSelected } = getRowState(row);

      return createRender(DataTableCheckbox, {
        checked: isSelected,
      });
    }
  }));
  if($items.length > 0) {
    columns.push(table.column({
      accessor: (item) => item.name,
      header: "name"
    }));
    var keys = Object.keys($items[0]);
    var keys2 = Object.keys($ShowColumns);
    // keep the columns in the same order as the keys
    for(let i = 0; i < keys2.length; i++) {
      const key = keys2[i];
      // if(keys.indexOf(key) == -1) continue; // if enabled, show no even if not present on first item
      if(key == "") continue;
      if(key == "_created" || key == "_modified") {
      } else if(key.startsWith("_") || key == "name") {
        continue;
      }
      try {
        if(columns.find(x=> x.id == key) != null) continue;
        columns.push(table.column({
          accessor: (item) => item[key],
          header: key
        }));
      } catch (error3) {        
      }
    }
    // add any new columns
    for(let i = 0; i < keys.length; i++) {
      const key = keys[i];
      if(keys2.indexOf(key) != -1) continue;
      if(key == "_created" || key == "_modified") {
      } else if(key.startsWith("_") || key == "name") {
        continue;
      }
      if(columns.find(x=> x.id == key) != null) continue;
      columns.push(table.column({
        accessor: (item) => item[key],
        header: key
      }));
    }
    // force adding columns that we are sorting by
    for(let y = 0; y < $sortKeys.length; y++) {
      const key = $sortKeys[y].id;
      if(keys.indexOf(key.id) == -1) {
        if(columns.find(x=> x.id == key) != null) continue;
        columns.push(table.column({
          accessor: (item) => item[key],
          header: key
        }));
      }
    }
  }
  columns.push(table.column({
      accessor: ({ _id }) => _id,
      header: "",
      cell: ({ value }) => {
        return createRender(DataTableActions, { id: value });
      }
    }));
    let viewModel = table.createViewModel(table.createColumns(columns), { rowDataId: ({ _id }) => _id  });

    if(unsubscribe5) unsubscribe4();
    unsubscribe5 = viewModel.pluginStates.sort.sortKeys.subscribe((value) => {
      sortKeys.set(value);
    });

    
    selectedDataIds = viewModel.pluginStates.select.selectedDataIds;
    $selectedDataIds = $_selectedDataIds;
    if(unsubscribe4) unsubscribe4();
    unsubscribe4 = selectedDataIds.subscribe((value) => {
      _selectedDataIds.set(value);
      selecteditems = Object.keys(value);
    });
    
    updateShowColumns(viewModel);


    return viewModel;
  }
  let viewModel = reCreateTable();
  let { hasNextPage, hasPreviousPage, pageIndex } = viewModel.pluginStates.page;


  let tableAttrs = viewModel.tableAttrs;
  let headerRows = viewModel.headerRows;
  let tableBodyAttrs = viewModel.tableBodyAttrs;
  let pageRows = viewModel.pageRows;
  let rows = viewModel.rows;

  $: tableAttrs = viewModel.tableAttrs;
  $: headerRows = viewModel.headerRows;
  $: tableBodyAttrs = viewModel.tableBodyAttrs;
  $: pageRows = viewModel.pageRows;
  $: rows = viewModel.rows;
  $: if(collectionname != currentcollectionname) {
    psearchstring = setting(key, "searchstring", "");
    $searchstring = $psearchstring;

    currentcollectionname = collectionname;
    ShowColumns = setting(key, "ShowColumns", {})
    _pageindex = setting(key, "pageindex", 0);
    pagesize = setting(key, "pagesize", 10);
    updateSortKeys();
    _selectedDataIds = setting(key, "selectedDataIds", {});

    $pageIndex = $_pageindex;
    $serverItemCount = -1;
    GetData();
  }

  $: if (explain && $explainquery == null) {
    GetData();
  } else if(explain == false) {
    $explainquery = null;
  }

  let lastselectedDataIds = -1;
 
  updateShowColumns(viewModel);
  

 
  $: viewModel.pluginStates.hide.hiddenColumnIds.set(Object.entries($ShowColumns)
    .filter(([, hide]) => !hide)
    .map(([id]) => id));
    
 
  const nonhidableCols = ["_id", ""];

  let loading = false;
  const GetData = async () => {
    try {
      $error = "";
      if(loading) return;
      if($isSignedin == false) return;
      loading = true;
      try {
        let orderby = {};
        for(let i = 0; i < $sortKeys.length; i++) {
          const sortKey = $sortKeys[i];
          orderby[sortKey.id] = (sortKey.order == "desc" ? -1 : 1);
        }
        console.log(collectionname, "orderby", JSON.stringify(orderby))
        $currentquery = createQuery();
        if($currentquery == null) {
          loading = false;
          return;
        }

        if(explain == true) {
          $explainquery = await $client.Query({collectionname, top: $pagesize, skip: $pageIndex * $pagesize, query: $currentquery, orderby, explain: true})
        }

        $items = await $client.Query({collectionname, top: $pagesize, skip: $pageIndex * $pagesize, query: $currentquery, orderby})
        if($items.length > 0) {
          viewModel = reCreateTable();

        }
        let filteredresults = [];
        for(let i = 0; i < $items.length; i++) {
          var item:any = {...$items[i]};
          item.source = key;
          filteredresults.push(item);
          if(filteredresults.length == 3) break;
        }
      } catch (e) {
        $error = e.message;
      }
      loading = false;
      if($serverItemCount == -1) {
        $serverItemCount = await $client.Count({collectionname, query: $currentquery})
        if($pageIndex > 0) {
          if(($pageIndex * $pagesize) - $pagesize >= $serverItemCount) {
            _pageindex.set(0);
            console.log("count force reload", collectionname);
            GetData();
          }
        }
      }
    } catch (e) {
      $error = e.message;
    }
  }
  function onSearchQuery(value) {
    $serverItemCount = -1;
    GetData();
  };

  onMount(() => {
    const unsubscribe = searchstring.subscribe(GetData);
    const unsubscribe2 = isSignedin.subscribe((value) => {
      if (value) {
        GetData();
      }
    });
    const unsubscribe3 = pageIndex.subscribe((value) => {
      _pageindex.set(value);
      GetData();
    });
    // const unsubscribe5 = sortKeys.subscribe((value) => {
    //   GetData();
    // });

    const unsubscribe6 = sortKeys.subscribe((value) => {
      GetData()
    });


    return () => {
      unsubscribe();
      unsubscribe2();
      unsubscribe3();
      if(unsubscribe4) unsubscribe4();
      if(unsubscribe5) unsubscribe5();
      unsubscribe6();
    };
  });

  GetData();

</script>
{#if $error != null && $error != ""}
<SuperDebug data={$error} />
{/if}
<div class="rounded-md border">
  <Table.Root {...$tableAttrs}>
    <Table.Header class="table-head">
      {#each $headerRows as headerRow}
        <Subscribe rowAttrs={headerRow.attrs()}>
          <Table.Row>
            {#each headerRow.cells as cell (cell.id)}
              <Subscribe
                attrs={cell.attrs()}
                let:attrs
                props={cell.props()}
                let:props
                sort={viewModel.pluginStates.sort.sortKeys}
                let:sort

              >
              {#if cell.id === ""}
              <Table.Head {...attrs} style="width: 35px;">
                <DropdownMenu.Root>
                  <DropdownMenu.Trigger asChild let:builder>
                    <Button variant="outline" class="ml-auto" builders={[builder]}>
                      Columns <ChevronDown class="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenu.Trigger>
                  <DropdownMenu.Content>
                    <ScrollArea class="max-h-[36rem] min-w-[12rem] rounded-md border">
                      {#each viewModel.flatColumns as col}
                        {#if !nonhidableCols.includes(col.id)}
                          <DropdownMenu.CheckboxItem bind:checked={$ShowColumns[col.id]}>
                            {col.header}
                          </DropdownMenu.CheckboxItem>
                        {/if}
                      {/each}
                    </ScrollArea>
                  </DropdownMenu.Content>
                </DropdownMenu.Root>
              </Table.Head>
              {:else if cell.id === "name"}
                <Table.Head {...attrs}  style="width: *;"> <!-- style="width: *;"-->
                  <Button variant="ghost" on:click={props.sort.toggle}>
                    <Render of={cell.render()} />
                    {#if props.sort.order == "asc"}
                      <ArrowUp class="ml-2 h-4 w-4" />
                    {:else if props.sort.order == "desc"}
                      <ArrowDown class="ml-2 h-4 w-4" />
                    {/if}
                    <!-- <ArrowUpDown class="ml-2 h-4 w-4" /> -->
                  </Button>
                </Table.Head>
                {:else if cell.id === "_created" || cell.id === "_modified"}
                <Table.Head {...attrs}  style="width: 210px;"> <!-- style="width: *;"-->
                  <Button variant="ghost" on:click={props.sort.toggle}>
                    <Render of={cell.render()} />
                    {#if props.sort.order == "asc"}
                      <ArrowUp class="ml-2 h-4 w-4" />
                    {:else if props.sort.order == "desc"}
                      <ArrowDown class="ml-2 h-4 w-4" />
                    {/if}
                    <!-- <ArrowUpDown class="ml-2 h-4 w-4" /> -->
                  </Button>
                </Table.Head>
                {:else if cell.id === "id" || cell.id === "_id"}
                  <Table.Head {...attrs} style="width: 35px;">
                    <Render of={cell.render()} /> 
                  </Table.Head>
                {:else}
                <Table.Head {...attrs}  style="width: {100 / nonhidableCols.length}%;">
                  <Button variant="ghost"  on:click={props.sort.toggle}>
                    <Render of={cell.render()} />
                    {#if props.sort.order == "asc"}
                      <ArrowUp class="ml-2 h-4 w-4" />
                    {:else if props.sort.order == "desc"}
                      <ArrowDown class="ml-2 h-4 w-4" />
                    {/if}
                    <!-- <ArrowUpDown class={"ml-2 h-4 w-4"} /> -->
                  </Button>
                </Table.Head>
                {/if}
              </Subscribe>
            {/each}
          </Table.Row>
        </Subscribe>
      {/each}
    </Table.Header>
    <Table.Body {...$tableBodyAttrs}>
      {#each $pageRows as row (row.id)}
        <Subscribe rowAttrs={row.attrs()} let:rowAttrs>
          <Table.Row {...rowAttrs}>
            {#each row.cells as cell (cell.id)}
              <Subscribe attrs={cell.attrs()} let:attrs>
                <Table.Cell {...attrs}>
                    <Render of={cell.render()} />
                </Table.Cell>
              </Subscribe>
            {/each}
          </Table.Row>
        </Subscribe>
      {/each}
    </Table.Body>
  </Table.Root>
</div>
<!-- <div class="flex items-center justify-end space-x-4 py-4"> -->
<div class="flex items-center space-x-4 py-4">
  <div class="flex-1 text-sm text-muted-foreground">
    Page {$pageIndex + 1} of {Math.ceil($serverItemCount / $pagesize)}
    {#if Object.keys($selectedDataIds).length > 0}
      ( 
        {Object.keys($selectedDataIds).length} of{" "}
        {$serverItemCount} row(s) selected. )
    {:else}
      ( { $serverItemCount } row(s) )
    {/if}
    in {collectionname}
  </div>
  <Button
  class="lg:hidden"
  variant="outline"
  size="sm"
  data-shortcut={"Control+a,Meta+a" }
  on:click={() => {
    if(multiselect == false) {
      multiselect = true;
      $ShowColumns["_id"] = multiselect;
      // return;
    }
    const selectcount = Object.keys($selectedDataIds).length;
    // if(selectcount == 0) {
    //   const { allPageRowsSelected } = pluginStates.select;
    //   allPageRowsSelected.set(true)
    // } else 
    if(selectcount <= $serverItemCount) {
      for(let i = 0; i < $rows.length; i++) {
        const row = $rows[i];
        // @ts-ignore
        $selectedDataIds[row.dataId] = true;
      }
    }
    if(selectcount == Object.keys($selectedDataIds).length) {
      if(lastselectedDataIds != selectcount) {
        if(selectcount <= $serverItemCount) {
          for(let i = 0; i < $rows.length; i++) {
            const row = $rows[i];
            // @ts-ignore
            $selectedDataIds[row.dataId] = false;
          }
        }
        lastselectedDataIds = selectcount;
        return;
      } else {
        lastselectedDataIds = -1;
        selectedDataIds.clear();
      }
    } else {
      lastselectedDataIds = -1;
    }
  }}>Select all</Button
>
  <DropdownMenu.Root >
    <DropdownMenu.Trigger asChild let:builder>
      <Button variant="outline" class="ml-auto" builders={[builder]}>
        {$pagesize} <ChevronDown class="ml-2 h-4 w-4" />
      </Button>
    </DropdownMenu.Trigger>
    <DropdownMenu.Content>
      {#each [5,10,15,25,50,100] as col}
      <DropdownMenu.Item on:click={() => { $pagesize = col; _pageindex.set(0); GetData()}}>
        <span>{col}</span>
      </DropdownMenu.Item>
      {/each}
    </DropdownMenu.Content>
  </DropdownMenu.Root>
  <Button
  variant="outline"
  size="sm"
  hidden={!showInsert}
  data-shortcut={"Insert" }
  on:click={() =>  dispatch('insert', { collectionname: collectionname })}>Insert</Button
  >
  <Button
    variant="outline"
    size="sm"
    data-shortcut={"ArrowLeft" }
    on:click={() => ($pageIndex = $pageIndex - 1)}
    disabled={(!$hasPreviousPage && $serverItemCount > -1) || ($pageIndex == 0)}>Previous</Button
  >
  <Button
    variant="outline"
    size="sm"
    disabled={!$hasNextPage && $serverItemCount > -1}
    data-shortcut={"ArrowRight" }
    on:click={() => ($pageIndex = $pageIndex + 1)}>Next</Button
  >
  
  <Button
    hidden
    variant="outline"
    size="sm"
    data-shortcut={"Alt+r,Meta+r" }
    on:click={GetData}>Reload</Button
  >
  <Button
  hidden
  variant="outline"
  size="sm"
  data-shortcut={"Control+u,Meta+u" }
  on:click={() => {
    selectedDataIds.clear();
    multiselect = false;
    $ShowColumns["_id"] = false;
    }}>Unselect all</Button
  >
</div>
{#if $currentquery != null && showquery == true}
<SuperDebug data={$currentquery} theme="vscode" />
{/if}
{#if $explainquery !== null}
<SuperDebug data={$explainquery} />
{/if}
