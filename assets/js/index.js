/* CSS */

import 'bootstrap-vue/dist/bootstrap-vue.css';
import 'font-awesome/scss/font-awesome.scss';
import '../scss/_base.scss';


/* JS */

import 'bootstrap';


/* Basic imports */

import Vue from 'vue';
import { BootstrapVue } from 'bootstrap-vue';
import VueRouter from 'vue-router';

Vue.use(BootstrapVue);
Vue.use(VueRouter);


/* Initializing */

import Auth from './auth';
import Api from './api';
import Resources from './resources';

Vue.prototype.$auth = new Auth();
Vue.prototype.$api = new Api();
Vue.prototype.$resources = new Resources();


/* Vuew components */

var req = require.context('./components/', false, /\.vue$/i)
for (var key of req.keys()) {
    var name = key.match(/\w+/)[0]
    Vue.component(name, req(key).default)
}


/* Onload */

window.onload = function() {
    const app = new Vue({
        el: '#app',
        beforeCreate: function() {
            wasm_bindgen("assets/hash-storage-wasm/hash_storage_wasm_bg.wasm").then(() => {
                this.$auth.init(wasm_bindgen);
                this.$auth.load();
                this.$api.init(this.$auth);
                this.$resources.init(this.$api);
                this.$root.$emit('is_ready');
            });
        }
    });
};

