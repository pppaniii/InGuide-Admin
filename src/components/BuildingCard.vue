<template>
    <!-- Add building card -->
    <button 
        v-if="!building" 
        class="card add" 
        type="button"
        @click="onAdd" 
        title="Add Building">+</button>

    <!-- Normal card -->
     <div v-else class="card normal" @click="onOpen" title="`Open ${building.name}`">
        <div class="thumb" />
        <div class="row">
            <span class="card-name">{{ building.name }}</span>
            <button class="trash" title="Delete" @click="onDelete">Delete</button>
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

<style scoped>

.card {
    height: 180px;
    padding: 10px; 
    border-radius: 12px;
    border: 1px solid #cfe0d3; 
    background:#e3f0e7;
    display: flex; 
    flex-direction: column; 
    justify-content: space-between;
    transition: transform .06s ease, box-shadow .06s ease; 
    cursor: pointer;
}

.card:hover { 
    transform: translateY(-1px); 
    box-shadow: 0 2px 10px rgba(0,0,0,.06); }

.card.add {
    align-items: center; 
    justify-content: center;
    border: 1px dashed #b8cfbc; 
    background: #d9ebdc; 
    font-size: 28px;
}

.card-normal {
    border: 1px solid;
}

.thumb { 
    flex: 1; 
    border-radius: 5px;
    background: #fff; 
}

.row { 
    display: flex; 
    align-items: center; 
    justify-content: space-between; 
    margin-top: 8px; 
}

.card-name { 
    font-weight: 700; 
    color: #3d5949; 
}

.trash { 
    background: transparent;
    border: 0; 
    cursor: pointer; 
    font-size: 16px; 
}
</style>