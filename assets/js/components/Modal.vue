<template>
  <div v-show="isShown">
    <div class="whole" :style="{ 'z-index': zIndex }">
      <div class="content" :style="{ 'max-width': maxWidth + 'px' }">
        <span class="close" @click="hide()" v-if="!disableClose">&times;</span>
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script>
    export default {
        props: {
            escHide: Boolean,
            disableClose: Boolean,
            zIndex: { type: Number, default: 1 },
            maxWidth: { type: Number, default: 400 },
        },
        data() {
            return {
                isShown: false,
            }
        },
        methods: {
            show() {
                this.isShown = true;
            },

            hide() {
                this.isShown = false;
            },

            toggle() {
                this.isShown = !this.isShown;
            },
        },
        mounted() {
            if (this.escHide) {
                document.body.addEventListener('keyup', e => {
                    if (e.keyCode === 27) {  // Esc
                        this.hide();
                    }
                });
            }
        }
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
        background-color: rgba(0, 0, 0, 0.375);
    }

    .content {
        position: relative;
        background-color: white;
        margin: 0 auto;
        transform: translateY(calc(50vh - min(50%, 50vh)));
        padding: 18px;
    }

    .close {
        position: absolute;
        top: 8px;
        right: 8px;
        font-size: 24px;
        cursor: pointer;
        color: #888;
        &:hover {
            opacity: 0.75;
        }
    }
</style>
