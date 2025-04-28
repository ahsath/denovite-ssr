<template>
  <div class="test-island">
    <p>This is Test Island {{ islandId }}</p>
    <button @click="count++">Clicked: {{ count }}</button>
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";

defineProps<{ islandId: number; otherData: string }>();

const count = ref(0);
</script>

<style>
.test-island {
  border: 1px solid blue;
  padding: 10px;
  margin: 10px;
}
</style>
