<template>
  <span class="fa" :class="faClass" @click="$emit('click', $event)"></span>
</template>

<script>
    export default {
        props: {
            icon: String,
        },
        computed: {
            faClass() {
                return `fa-${this.icon}`;
            }
        },
    }
</script>

<style lang="scss" scoped>
    .fa {
        text-align: center;
    }
</style>
