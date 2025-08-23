<template>
    <!-- Add building card -->
    <button 
        v-if="!building" 
        class="card add" 
        type="button"
        @click="onAdd" 
        title="Add Building">
        <div class="icon-add">
            <font-awesome-icon icon="plus"/>
        </div>
    </button>

    <!-- Normal card -->
     <div v-else 
        class="card normal" 
        @click="onOpen" 
        title="`Open ${building.name}`"
    >
        <div class="thumb" />
        <div class="row">
            <span class="card-name">{{ building.name }}</span>
            <button 
                class="trash" 
                title="Delete" 
                @click="onDelete">
                <font-awesome-icon icon="trash"/>
            </button>
        </div>
     </div>    
</template>

<script setup lang="ts">
import type { Building } from '@/types';

const props = defineProps<{
    building?: Building
}>() // if undefined, render Add card


const emit = defineEmits<{
    (e: 'open', id: string): void
    (e: 'delete', id: string): void
    (e: 'add'): void
}>()

function onOpen(){
    if(props.building) emit('open', props.building.id)
}

function onDelete(e: MouseEvent){
    e.stopPropagation()
    if(props.building) emit('delete', props.building.id)
}

function onAdd(){
    emit('add')
}

</script>

<style src="../styles/BuildingCard.css"></style>