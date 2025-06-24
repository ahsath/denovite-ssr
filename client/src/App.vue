<template>
  <div class="flex justify-center">
    <a href="https://deno.com/" target="_blank">
      <img src="./assets/svg/deno.svg" class="logo deno" alt="Deno logo" />
    </a>
    <a href="https://vite.dev/" target="_blank">
      <img src="./assets/svg/vite.svg" class="logo" alt="Vite logo" />
    </a>
    <a href="https://vuejs.org/" target="_blank">
      <img src="./assets/svg/vue.svg" class="logo vue" alt="Vue logo" />
    </a>
  </div>
  <HelloWorld msg="Deno + Vite + Vue" />
</template>

<script setup lang="ts">
import HelloWorld from "./components/HelloWorld.vue";
</script>

<style scoped>
.logo {
  height: 9rem;
  padding: 1.5rem;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2rem #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2rem #42b883aa);
}
.logo.deno:hover {
  filter: drop-shadow(0 0 2rem #ffffff3e);
}
</style>
