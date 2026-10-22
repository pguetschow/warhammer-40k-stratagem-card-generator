<template>
  <!-- Drawn like a card's title: the black label with its cut corner, and the count where the CP cost sits. -->
  <button
      class="group inline-flex h-11 items-stretch border-2 border-band bg-slip font-heavy uppercase focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-teal disabled:cursor-not-allowed disabled:opacity-40"
      type="button"
  >
    <span
        class="flex clip-corner items-center bg-band pr-6 pl-4 text-[14px] tracking-[0.04em] text-title [--clip:12px] group-hover:bg-teal group-disabled:bg-band"
    >
      {{ label }}
    </span>
    <span class="flex min-w-11 items-center justify-center px-2 text-[18px] tracking-[-0.04em] text-band">
      {{ count }}
    </span>
  </button>
</template>

<script lang="ts" setup>
defineProps<{ label: string, count: number }>()
</script>
