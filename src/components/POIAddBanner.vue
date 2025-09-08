<template>
    <div>
        {{ message || 'Click anywhere to add POI'}}
    </div>
</template>

<script setup lang="ts">
defineProps<{ message?: string}>()
</script>