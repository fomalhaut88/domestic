<template>
  <div>
    <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
      <a class="navbar-brand" href="/">
        <img src="assets/i/domestic.png" width="30" height="30" alt="">
        Domestic
      </a>
      <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>

      <div class="collapse navbar-collapse" id="navbarSupportedContent">
        <ul class="navbar-nav mr-auto">
          <li class="nav-item" :class="{active: routerLinkIsActive('/household/')}">
            <router-link class="nav-link" to="/household/"><fa-icon class="fa-icon" icon="home" /> Household</router-link>
          </li>
          <!--<li class="nav-item" :class="{active: routerLinkIsActive('/tasks/')}">
            <router-link class="nav-link" to="/tasks/"><fa-icon class="fa-icon" icon="list" /> Tasks</router-link>
          </li>
          <li class="nav-item" :class="{active: routerLinkIsActive('/counters/')}">
            <router-link class="nav-link" to="/counters/"><fa-icon class="fa-icon" icon="bar-chart" /> Counters</router-link>
          </li>-->
        </ul>
        <ul class="navbar-nav ml-auto">
          <li class="nav-item" :class="{active: routerLinkIsActive('/settings/')}">
            <router-link class="nav-link" to="/settings/"><fa-icon class="fa-icon" icon="cog" /> Settings</router-link>
          </li>
        </ul>
      </div>
    </nav>

    <div v-if="$auth.isAuthenticated()">
      <router-view />
    </div>
    <need-login v-else />

    <loading-component />
  </div>
</template>

<script>
    import VueRouter from 'vue-router';

    import HouseholdComponent from './HouseholdComponent.vue';
    import TasksComponent from './TasksComponent.vue';
    import CountersComponent from './CountersComponent.vue';
    import SettingsComponent from './SettingsComponent.vue';

    const router = new VueRouter({
        routes: [
            { path: '/', redirect: '/household/' },
            { path: '/household/', component: HouseholdComponent },
            { path: '/tasks/', component: TasksComponent },
            { path: '/counters/', component: CountersComponent },
            { path: '/settings/', component: SettingsComponent },
        ]
    });

    export default {
        router: router,
        data() {
            return {
                router: router,
            };
        },
        methods: {
            routerLinkIsActive(href) {
                return this.router && this.router.currentRoute.path == href;
            },
        },
        mounted() {
            this.$root.$on('is_ready', () => {
                this.$forceUpdate();
            });
        },
    }
</script>

<style lang="scss" scoped>
    .active {
        font-weight: bold;
    }

    .fa-icon {
        width: 24px;
    }
</style>
