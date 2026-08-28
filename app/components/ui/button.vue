<script setup lang="ts">
import type { PropType } from "vue"

defineProps({
    text : {
        type: String,
        default : ""
    },
    callback : {
        type: Function,
        default : () => {}
    },
    type : {
        type : String as PropType<"button" | "reset" | "submit">,
        default : "button"
    }
})

</script>

<template>
    <button :type="type" class="bg-primary-500 text-on-primary p-4 font-semibold rounded-lg w-full" @click="callback()">
        {{ text }}
    </button>
</template>