<script lang="ts">
	import { client, isSignedin } from '$lib/stores';
  import { createTable , Render, Subscribe, createRender } from "svelte-headless-table";
  import { addPagination, addSortBy, addTableFilter, addHiddenColumns, addSelectedRows } from "svelte-headless-table/plugins";
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
  // https://muonw.github.io/muonw-powertable/examples/example8
  // https://www.shadcn-svelte.com/docs/components/data-table

  let serverItemCount = writable(0);

  export let collectionname = "entities";
  export let query = {};
  export let key:string;

  export let selecteditems = [];

  const _pageindex = setting(key, 'pageindex', 0);
  
  const items = writable([]);
  let initialPageSize = 5;
  const table = createTable(items, {
    page: addPagination({
      initialPageIndex: $_pageindex,
      initialPageSize,
      serverItemCount,
      serverSide: true
    }),
    sort: addSortBy(),
    filter: addTableFilter({
      fn: ({ filterValue, value }) =>
        value.toLowerCase().includes(filterValue.toLowerCase()),
    }),
    hide: addHiddenColumns(),
    select: addSelectedRows(),
  });

  const columns = table.createColumns([
    table.column({
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
        },
        filter: {
          exclude: true,
        },
      },
    }),
    table.column({
      accessor: "name",
      header: "Name",
      plugins: {
        sort: {
          disable: false,
        },
      },
    }),
    table.column({
      accessor: ({ _id }) => _id,
      header: "",
      cell: ({ value }) => {
        return createRender(DataTableActions, { id: value });
      },
      plugins: {
        sort: {
          disable: true,
        },
        filter: {
          exclude: true,
        },
      },
    }),
  ]);

  const { headerRows, pageRows, tableAttrs, tableBodyAttrs, pluginStates, flatColumns, rows, } =
    table.createViewModel(columns, {
      rowDataId: ({ _id }) => _id,

    });

  const { hasNextPage, hasPreviousPage, pageIndex } = pluginStates.page;
  const { filterValue } = pluginStates.filter;
  const { hiddenColumnIds } = pluginStates.hide;
  const { selectedDataIds } = pluginStates.select;

  const _selectedDataIds = setting(key, 'selectedDataIds', {});
  let lastselectedDataIds = -1;
  $selectedDataIds = $_selectedDataIds;
  selectedDataIds.subscribe((value) => {
    _selectedDataIds.set(value);
    selecteditems = Object.keys(value);
  });
 

  const ids = flatColumns.map((col) => col.id);
  let hideForId = Object.fromEntries(ids.map((id) => [id, true]));
 
  $: $hiddenColumnIds = Object.entries(hideForId)
    .filter(([, hide]) => !hide)
    .map(([id]) => id);
 
  const nonhidableCols = ["_id", ""];

  let loading = false;
  const GetData = async () => {
    console.log("GetData", $isSignedin, loading);
    if(loading) return;
    if($isSignedin == false) return;
    loading = true;
    try {
    if($isSignedin == true) {
      var q = {...query};

      var _items: any = await $client.Query({collectionname, top: initialPageSize, skip: $pageIndex * initialPageSize, query: q})
      for(let i = 0; i < _items.length; i++) {
        const item = _items[i];
        // @ts-ignore
        item.id = item._id;
      }
      $items = _items;
    }
    } catch (error) {
      console.error("Error getting data", error);
    }
    loading = false;
    if($serverItemCount == 0) {
      $serverItemCount = await $client.Count({collectionname, query: q})
      if($pageIndex > 0) {
        console.log($pageIndex * initialPageSize, ($pageIndex * initialPageSize) - initialPageSize, $serverItemCount)
        if(($pageIndex * initialPageSize) - initialPageSize >= $serverItemCount) {
          console.log("Resetting page index")
          _pageindex.set(0);
          GetData();
        }
      }
    }
  }
  isSignedin.subscribe((value) => {
    if (value) {
      GetData();
    }
  });
  pageIndex.subscribe((value) => {
    _pageindex.set(value);
    GetData();
  });
  GetData();
  const cmdK = ['⌘', 'k']
  </script>

<div>
  <div class="flex items-center py-4">
    <Input
      class="max-w-sm"
      placeholder="Filter emails..."
      type="text"
      bind:value={$filterValue}
    />
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild let:builder>
        <Button variant="outline" class="ml-auto" builders={[builder]}>
          Columns <ChevronDown class="ml-2 h-4 w-4" />
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content>
        {#each flatColumns as col}
          {#if !nonhidableCols.includes(col.id)}
            <DropdownMenu.CheckboxItem bind:checked={hideForId[col.id]}>
              {col.header}
            </DropdownMenu.CheckboxItem>
          {/if}
        {/each}
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  </div>
</div>
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
                <Table.Head {...attrs}>
                  {#if cell.id === "name"}
                    <Button variant="ghost" on:click={props.sort.toggle}>
                        <Render of={cell.render()} />
                        <ArrowUpDown class="ml-2 h-4 w-4" />
                    </Button>
                  {:else if cell.id === "id" || cell.id === "_id" || cell.id === ""}
                    <Render of={cell.render()} /> 
                  {:else}
                    <Button variant="ghost" on:click={props.sort.toggle}>
                      <Render of={cell.render()} />
                      <ArrowUpDown class={"ml-2 h-4 w-4"} />
                    </Button>
                  {/if}
                </Table.Head>
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
                {#if cell.id === "id" || cell.id === "_id" || cell.id === ""}
                  <Table.Cell {...attrs} style="width: 10px;">
                      <Render of={cell.render()} />
                  </Table.Cell>
                {:else}
                  <Table.Cell {...attrs}>
                    <Render of={cell.render()} />
                  </Table.Cell>
                {/if}
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
    console.log("Unselect all")
    selectedDataIds.clear();
    }}>Unselect all</Button
  >
  <Button
    hidden
    variant="outline"
    size="sm"
    data-shortcut={'Control+a,Meta+a' }
    on:click={() => {
      console.log("Select all")
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
>