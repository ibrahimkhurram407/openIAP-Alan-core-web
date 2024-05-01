<script lang="ts">
  export let value: string;
  let dt: Date;
  let since = "";
  $: {
    dt = new Date(value);
    if (value == null || value == "") {
      since = "";
    } else {
      const now = new Date();
      const diff = now.getTime() - dt.getTime();
      const seconds = Math.floor(diff / 1000);
      const minutes = Math.floor(seconds / 60);
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);
      const months = Math.floor(days / 30);
      const years = Math.floor(months / 12);
      if (years > 0) {
        since = years + " years ago";
      } else if (months > 0) {
        since = months + " months ago";
      } else if (days > 0) {
        since = days + " days ago";
      } else if (hours > 0) {
        since = hours + " hours ago";
      } else if (minutes > 0) {
        since = minutes + " minutes ago";
      } else {
        since = seconds + " seconds ago";
      }
      // or in the future
      if (years < 0) {
        since = "in " + Math.abs(years) + " years";
      } else if (months < 0) {
        since = "in " + Math.abs(months) + " months";
      } else if (days < 0) {
        since = "in " + Math.abs(days) + " days";
      } else if (hours < 0) {
        since = "in " + Math.abs(hours) + " hours";
      } else if (minutes < 0) {
        since = "in " + Math.abs(minutes) + " minutes";
      } else if (seconds < 0) {
        since = "in " + Math.abs(seconds) + " seconds";
      }
    }
  }
</script>

{since}

