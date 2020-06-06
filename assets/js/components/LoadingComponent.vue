<template>
  <div v-show="isShown">
    <div class="whole">
      <fa-icon icon="cog" class="fa-spin" />
    </div>
  </div>
</template>

<script>
    export default {
        data() {
            return {
                isShown: false,
            };
        },
        mounted() {
            this.$root.$on('loading_start', () => {
                this.isShown = true;
            });
            this.$root.$on('loading_stop', () => {
                this.isShown = false;
            });
        },
    }
</script>

<style lang="scss" scoped>
    .whole {
        position: fixed;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        overflow: auto;
        background-color: rgba(0, 0, 0, 0.5);
        color: white;
        font-size: 48px;
        text-align: center;
        line-height: 100vh;
        z-index: 100;
    }
</style>
