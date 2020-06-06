<template>
  <div class="p-3">
    <h4>About Domestic</h4>

    <p>About Domestic.</p>

    <hr>

    <h4>Log out</h4>
    <p>You will need to enter your username and password again.</p>
    <button class="btn btn-primary" @click="$refs.logoutDialog.show()">Log out</button>
    <confirm-dialog ref="logoutDialog"
                    title="Log out"
                    text="Do you really want to log out?"
                    :callback="logout" />

    <hr>

    <h4>Delete profile</h4>
    <p>All the data will be removed permanently.</p>
    <button class="btn btn-danger" @click="$refs.deleteProfileDialog.show()">Delete profile</button>
    <confirm-dialog ref="deleteProfileDialog"
                    title="Delete profile"
                    text="Do you really want to delete your profile?"
                    :callback="deleteProfile" />
  </div>
</template>

<script>
    export default {
        methods: {
            logout() {
                this.$auth.logout();
                window.location.reload();
            },

            deleteProfile() {
                console.log("deleteProfile");
            },
        },
    }
</script>
