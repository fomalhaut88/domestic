<template>
  <modal ref="refModal" class="text-center" esc-hide @click.stop="">
    <h3>{{ title }}</h3>
    <p>{{ text }}</p>
    <div>
      <button type="button" class="btn btn-secondary"
              @click.stop="hide()">
        No
      </button>
      <button type="button" class="btn btn-primary"
              @click.stop="callback()">
        Yes
      </button>
    </div>
  </modal>
</template>

<script>
    export default {
        props: {
            title: String,
            text: String,
            callback: Function,
        },
        methods: {
            show() {
                this.$refs.refModal.show();
            },

            hide() {
                this.$refs.refModal.hide();
            },
        },
    }
</script>
