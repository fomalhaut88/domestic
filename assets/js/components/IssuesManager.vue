<template>
  <div>
    <!-- issuesListModal -->
    <modal ref="issuesListModal" class="text-left" :max-width="600">
      <h3>Issues</h3>

      <div class="py-2">
        <button class="btn btn-primary btn-sm" @click="issuesAddModalShow()"><fa-icon icon="plus" /> New issue</button>
      </div>

      <div v-show="isLoading"><fa-icon icon="spinner" class="fa-spin" /></div>

      <table class="table table-bordered table-sm" v-if="!isLoading && Object.keys(issues).length">
        <thead>
          <tr>
            <th>Name</th>
            <th>Period</th>
            <th>Weight</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="issue in getIssuesSorted()">
            <td><a href="#" @click="issuesEditModalShow(issue)">{{ issue.name }}</a></td>
            <td>{{ issue.period }}</td>
            <td>{{ issue.weight }}</td>
          </tr>
        </tbody>
      </table>

      <div v-if="!isLoading && !Object.keys(issues).length">
        no issues
      </div>
    </modal>

    <!-- issuesAddModal -->
    <modal ref="issuesAddModal" esc-hide>
      <h3>New issue</h3>

      <div class="form-group row">
        <label class="col-sm-3 col-form-label">Name:</label>
        <div class="col-sm-9">
          <input type="text" class="form-control" placeholder="Name" v-model="issueAdd.name">
        </div>
      </div>

      <div class="form-group row">
        <label class="col-sm-3 col-form-label">Text:</label>
        <div class="col-sm-9">
          <textarea class="form-control resize-none" placeholder="Text" v-model="issueAdd.text" rows="3"></textarea>
        </div>
      </div>

      <div class="form-group row">
        <label class="col-sm-3 col-form-label">Period:</label>
        <div class="col-sm-9">
          <input type="number" class="form-control" placeholder="Period" v-model="issueAdd.period">
        </div>
      </div>

      <div class="form-group row">
        <label class="col-sm-3 col-form-label">Weight:</label>
        <div class="col-sm-9">
          <input type="number" class="form-control" placeholder="Weight" v-model="issueAdd.weight">
        </div>
      </div>

      <div class="form-group row">
        <label class="col-sm-3 col-form-label text-nowrap">Start date:</label>
        <div class="col-sm-9">
          <input type="date" class="form-control" v-model="issueAdd.startDate">
        </div>
      </div>

      <div class="form-group row px-3">
        <button class="btn btn-primary" @click="addIssue">Add new issue</button>
      </div>
    </modal>

    <!-- issuesEditModal -->
    <modal ref="issuesEditModal" esc-hide>
      <h3>Edit issue</h3>

      <div class="form-group row">
        <label class="col-sm-3 col-form-label">Name:</label>
        <div class="col-sm-9">
          <input type="text" class="form-control" placeholder="Name" v-model="issueEdit.name">
        </div>
      </div>

      <div class="form-group row">
        <label class="col-sm-3 col-form-label">Text:</label>
        <div class="col-sm-9">
          <textarea class="form-control resize-none" placeholder="Text" v-model="issueEdit.text" rows="3"></textarea>
        </div>
      </div>

      <div class="form-group row">
        <label class="col-sm-3 col-form-label">Period:</label>
        <div class="col-sm-9">
          <input type="number" class="form-control" placeholder="Period" v-model="issueEdit.period">
        </div>
      </div>

      <div class="form-group row">
        <label class="col-sm-3 col-form-label">Weight:</label>
        <div class="col-sm-9">
          <input type="number" class="form-control" placeholder="Weight" v-model="issueEdit.weight">
        </div>
      </div>

      <div class="form-group row">
        <label class="col-sm-3 col-form-label text-nowrap">Start date:</label>
        <div class="col-sm-9">
          <input type="date" class="form-control" v-model="issueEdit.startDate">
        </div>
      </div>

      <div class="form-group row">
        <label class="col-sm-3 col-form-label text-nowrap">End date:</label>
        <div class="col-sm-9">
          <input type="date" class="form-control" v-model="issueEdit.endDate">
        </div>
      </div>

      <div class="form-group row">
        <button class="btn btn-primary mx-2" @click="editIssue" :disabled="!issueEdit.name || !issueEdit.text || !issueEdit.period || !issueEdit.weight || !issueEdit.startDate">Save issue</button>
        <button class="btn btn-danger mx-2" @click="$refs.deleteIssueConfirm.show()">Delete issue</button>
      </div>
    </modal>

    <!-- deleteIssueConfirm -->
    <confirm-dialog ref="deleteIssueConfirm"
                    title="Delete issue"
                    text="Do you really want to delete issue? The history will be updated."
                    :callback="deleteIssue" />
  </div>
</template>

<script>
    export default {
        data() {
            return {
                isLoading: null,
                issues: {},
                issueAdd: {},
                issueEdit: {},
            };
        },
        methods: {
            show() {
                this.load();
                this.$refs.issuesListModal.show();
            },

            load() {
                this.isLoading = true;
                this.$resources.issues.getBlock(null, block => {
                    this.issues = block;
                    this.isLoading = false;
                    this.$forceUpdate();
                });
            },

            getIssuesSorted() {
                return Object.values(this.issues).sort((a, b) => (a.name >= b.name) ? 1 : -1);
            },

            issuesAddModalShow() {
                this.issueAdd = {};
                this.issueAdd.id = this.$resources.generateUniqueId();
                this.issueAdd.name = "";
                this.issueAdd.text = "";
                this.issueAdd.period = null;
                this.issueAdd.weight = 1;
                this.issueAdd.startDate = new Date().toISOString().slice(0, 10);
                this.issueAdd.endDate = null;
                this.$forceUpdate();
                this.$refs.issuesAddModal.show();
            },

            issuesEditModalShow(issue) {
                this.issueEdit = Object.assign({}, issue);
                this.$forceUpdate();
                this.$refs.issuesEditModal.show();
            },

            addIssue() {
                if (!(!this.issueAdd.name ||
                      !this.issueAdd.text ||
                      !this.issueAdd.period ||
                      !this.issueAdd.weight ||
                      !this.issueAdd.startDate)) {
                    this.issues[this.issueAdd.id] = this.issueAdd;
                  this.$root.$emit('loading_start');
                    this.$resources.issues.save(
                        this.issueAdd.id, this.issueAdd,
                        () => {
                            this.$root.$emit('loading_stop');
                            this.$refs.issuesAddModal.hide();
                            this.$forceUpdate();
                            this.$root.$emit('issues_updated', 'add', this.issueAdd);
                        }
                    );
                }
            },

            editIssue() {
                this.issues[this.issueEdit.id] = this.issueEdit;
                this.$root.$emit('loading_start');
                this.$resources.issues.save(
                    this.issueEdit.id, this.issueEdit,
                    () => {
                        this.$root.$emit('loading_stop');
                        this.$refs.issuesEditModal.hide();
                        this.$forceUpdate();
                        this.$root.$emit('issues_updated', 'update', this.issueEdit);
                    }
                );
            },

            deleteIssue() {
                delete this.issues[this.issueEdit.id];
                this.$root.$emit('loading_start');
                this.$resources.issues.delete(
                    this.issueEdit.id,
                    () => {
                        this.$root.$emit('loading_stop');
                        this.$refs.deleteIssueConfirm.hide();
                        this.$refs.issuesEditModal.hide();
                        this.$forceUpdate();
                        this.$root.$emit('issues_updated', 'delete', this.issueEdit);
                    }
                );
            },
        },
    }
</script>
