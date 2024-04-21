<script lang="ts">
  import SuperDebug from 'sveltekit-superforms';
	import { client, isSignedin, searchQuery } from '$lib/stores';
  import { createTable , Render, Subscribe, createRender } from "svelte-headless-table";
  import { addPagination, addSortBy, addHiddenColumns, addSelectedRows } from "svelte-headless-table/plugins";
  import ArrowUpDown from "lucide-svelte/icons/arrow-up-down";
  import ChevronDown from "lucide-svelte/icons/chevron-down";
  import * as Table from "$lib/components/ui/table";
  import DataTableActions from "./data-table-actions.svelte";
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
  import DataTableCheckbox from "./data-table-checkbox.svelte";
  import { writable, type Writable } from 'svelte/store';
  import { setting } from '$lib/pstore';
  // https://www.shadcn-svelte.com/docs/components/data-table
  // https://github.com/bryanmylee/svelte-headless-table/discussions/56

  let serverItemCount = writable(-1);

  export let collectionname = "entities";
  let currentcollectionname = collectionname;
  export let query = {};
  export let key:string;

  export let selecteditems = [];
  const currentquery = writable({});

  
  function parseJson(txt, reviver, context) {
        context = context || 20
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
    }
    function safeEval(jsStr) {
    try {
        return Function('"use strict";return (' + jsStr + ')')();
    } catch (error) {
        console.error("Failed to parse string", error);
        return null;
    }
}
  function createQuery() {
    let q = {...query};
    console.log("query", JSON.stringify(query))
    let searchstring = $searchQuery;
    if(searchstring == null || searchstring == "") {
      return q;
    }
    if ((searchstring as string).indexOf("{") == 0) {
        if ((searchstring as string).lastIndexOf("}") == ((searchstring as string).length - 1)) {
            try {
                q = parseJson(searchstring, null, null);
            } catch (error) {
              try {
                q = safeEval(searchstring);
              } catch (error2) {
                console.error("Error parsing query", error);
                throw error;
              }
            }
        }
    } else {
      // q["name"] = new RegExp([searchstring.substring(1)].join(""), "i")
      q["name"] = {"$regex": searchstring, "$options": "i"}
    }
    return q;
  }
  let _pageindex = setting(key, 'pageindex', 0);
  if(isNaN(parseInt($_pageindex))) {
    _pageindex.set(0);
  }

  const items = writable([{_id: "12", name: "test"}]);
  let initialPageSize = 5;
  function reCreateTable() {
    let table = createTable(items, {
    page: addPagination({
      initialPageIndex: $_pageindex,
      initialPageSize,
      serverItemCount,
      serverSide: true
    }),
    sort: addSortBy(),
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
    },
    plugins: {
      sort: {
        disable: false,
      }
    },
  }));
  columns.push(table.column({
    // @ts-ignore
    accessor: "name",
    header: "Name",
    plugins: {
      sort: {
        disable: false,
      },
    },
  }));
  var keys = Object.keys($items[0]);
  for(let i = 0; i < keys.length; i++) {
    const key = keys[i];
    if(key.startsWith("_") || key == "name") {
      continue;
    }
    columns.push(table.column({
        // @ts-ignore
        accessor: key,
        header: key,
        plugins: {
          sort: {
            disable: false,
          },
        },
      }));
  }
  columns.push(table.column({
      accessor: ({ _id }) => _id,
      header: "",
      cell: ({ value }) => {
        return createRender(DataTableActions, { id: value });
      },
      plugins: {
        sort: {
          disable: true,
        }
      },
    }));
    let viewModel = table.createViewModel(table.createColumns(columns), { rowDataId: ({ _id }) => _id  });
    return viewModel;
  }
  let viewModel = reCreateTable();

  let { hasNextPage, hasPreviousPage, pageIndex } = viewModel.pluginStates.page;
  let { selectedDataIds } = viewModel.pluginStates.select;


  let tableAttrs = viewModel.tableAttrs;
  let headerRows = viewModel.headerRows;
  let tableBodyAttrs = viewModel.tableBodyAttrs;
  let pageRows = viewModel.pageRows;
  let rows = viewModel.rows;
  let _selectedDataIds = setting(key, 'selectedDataIds', {});

  $: tableAttrs = viewModel.tableAttrs;
  $: headerRows = viewModel.headerRows;
  $: tableBodyAttrs = viewModel.tableBodyAttrs;
  $: pageRows = viewModel.pageRows;
  $: rows = viewModel.rows;
  $: if(collectionname != currentcollectionname) {
    currentcollectionname = collectionname;
    _pageindex = setting(key, 'pageindex', 0);
    $pageIndex = $_pageindex;
    $serverItemCount = -1;
    _selectedDataIds = setting(key, 'selectedDataIds', {});
    $selectedDataIds = $_selectedDataIds;
    GetData();
  }

  let lastselectedDataIds = -1;
  $selectedDataIds = $_selectedDataIds;
 

  const ids = viewModel.flatColumns.map((col) => col.id);
  let hideForId = Object.fromEntries(ids.map((id) => [id, true]));
 
  $: viewModel.pluginStates.hide.hiddenColumnIds.set(Object.entries(hideForId)
    .filter(([, hide]) => !hide)
    .map(([id]) => id));
 
  const nonhidableCols = ["_id", ""];

  let loading = false;
  const GetData = async () => {
    try {
      if(loading) return;
      if($isSignedin == false) return;
      loading = true;
      try {
        $currentquery = createQuery();
        console.log(JSON.stringify($currentquery));
        $items = await $client.Query({collectionname, top: initialPageSize, skip: $pageIndex * initialPageSize, query: $currentquery})
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
      } catch (error) {
        console.error("Error getting data", error);
      }
      loading = false;
      if($serverItemCount == -1) {
        $serverItemCount = await $client.Count({collectionname, query: $currentquery})
        if($pageIndex > 0) {
          console.debug($pageIndex * initialPageSize, ($pageIndex * initialPageSize) - initialPageSize, $serverItemCount)
          if(($pageIndex * initialPageSize) - initialPageSize >= $serverItemCount) {
            console.debug("Resetting page index")
            _pageindex.set(0);
            GetData();
          }
        }
      }
    } catch (error) {
      console.error("Error getting data", error.message);      
    }
  }
  function onSearchQuery(value) {
    $serverItemCount = -1;
    GetData();
  };

  import { onMount } from 'svelte';
  onMount(() => {
    const unsubscribe2 = isSignedin.subscribe((value) => {
      if (value) {
        GetData();
      }
    });
    const unsubscribe3 = pageIndex.subscribe((value) => {
      _pageindex.set(value);
      GetData();
    });
    const unsubscribe4 = selectedDataIds.subscribe((value) => {
      _selectedDataIds.set(value);
      selecteditems = Object.keys(value);
    });

    return () => {
      unsubscribe2();
      unsubscribe3();
      unsubscribe4();
    };
  });

  GetData();
  const cmdK = ['⌘', 'k']
  </script>
<!-- <div>
  <div class="flex items-center py-4">
    <div>
    </div>
    <div>
      collectionname:{collectionname} key: {key}
    </div>
  </div>
</div> -->
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
              >
              {#if cell.id === "name"}
                <Table.Head {...attrs}>
                  <Button variant="ghost" on:click={props.sort.toggle}>
                    <Render of={cell.render()} />
                    <ArrowUpDown class="ml-2 h-4 w-4" />
                  </Button>
                </Table.Head>
                {:else if cell.id === ""}
                <Table.Head {...attrs}>
                  <DropdownMenu.Root>
                    <DropdownMenu.Trigger asChild let:builder>
                      <Button variant="outline" class="ml-auto" builders={[builder]}>
                        Columns <ChevronDown class="ml-2 h-4 w-4" />
                      </Button>
                    </DropdownMenu.Trigger>
                    <DropdownMenu.Content>
                      {#each viewModel.flatColumns as col}
                        {#if !nonhidableCols.includes(col.id)}
                          <DropdownMenu.CheckboxItem bind:checked={hideForId[col.id]}>
                            {col.header}
                          </DropdownMenu.CheckboxItem>
                        {/if}
                      {/each}
                    </DropdownMenu.Content>
                  </DropdownMenu.Root>
                </Table.Head>
                {:else if cell.id === "id" || cell.id === "_id"}
                  <Table.Head {...attrs} style="width: 35px;">
                    <Render of={cell.render()} /> 
                  </Table.Head>
                {:else}
                <Table.Head {...attrs}>
                    <Button variant="ghost" on:click={props.sort.toggle}>
                      <Render of={cell.render()} />
                      <ArrowUpDown class={"ml-2 h-4 w-4"} />
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
    Page {$pageIndex + 1} of {Math.ceil($serverItemCount / initialPageSize)}
    {#if Object.keys($selectedDataIds).length > 0}
      ( 
        {Object.keys($selectedDataIds).length} of{" "}
        {$serverItemCount} row(s) selected. )
    {:else}
      ( { $serverItemCount } row(s) )
    {/if}
  </div>
  <Button
    variant="outline"
    size="sm"
    data-shortcut={'ArrowLeft' }
    on:click={() => ($pageIndex = $pageIndex - 1)}
    disabled={!$hasPreviousPage}>Previous</Button
  >
  <Button
    variant="outline"
    size="sm"
    disabled={!$hasNextPage}
    data-shortcut={'ArrowRight' }
    on:click={() => ($pageIndex = $pageIndex + 1)}>Next</Button
  >
  <Button
    hidden
    variant="outline"
    size="sm"
    data-shortcut={'Alt+r,Meta+r' }
    on:click={GetData}>Reload</Button
  >
  <Button
  hidden
  variant="outline"
  size="sm"
  data-shortcut={'Control+u,Meta+u' }
  on:click={() => {
    selectedDataIds.clear();
    }}>Unselect all</Button
  >
  <Button
    hidden
    variant="outline"
    size="sm"
    data-shortcut={'Control+a,Meta+a' }
    on:click={() => {
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
  </div>
<SuperDebug data={$currentquery} />