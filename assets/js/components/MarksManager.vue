<template>
  <div>
    <!-- marksListModal -->
    <modal ref="marksListModal" class="text-left" :max-width="600">
      <h3>Marks</h3>

      <div class="py-2">
        <button class="btn btn-primary btn-sm" @click="marksAddModalShow()"><fa-icon icon="plus" /> New mark</button>
      </div>

      <div v-show="isLoading"><fa-icon icon="spinner" class="fa-spin" /></div>

      <table class="table table-bordered table-sm" v-if="!isLoading && Object.keys(marks).length">
        <thead>
          <tr>
            <th>Issue</th>
            <th>Date</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="mark in marksSorted">
            <td><a href="#" @click="marksEditModalShow(mark)">{{ issues[mark.issueId].name }}</a></td>
            <td>{{ mark.date }}</td>
            <td>{{ mark.value }}</td>
          </tr>
        </tbody>
      </table>

      <div v-if="!isLoading && !Object.keys(marks).length">
        no marks
      </div>

      <div class="d-flex">
        <div><a href="#" @click="marksBack()"><fa-icon icon="caret-left" /> {{ monthNumberAsString(currentMonthNumber - 1) }}</a></div>
        <div class="px-3"><a href="#"><strong>{{ monthNumberAsString(currentMonthNumber) }}</strong></a></div>
        <div><a href="#" @click="marksForward()">{{ monthNumberAsString(currentMonthNumber + 1) }} <fa-icon icon="caret-right" /></a></div>
      </div>
    </modal>

    <!-- marksAddModal -->
    <modal ref="marksAddModal" esc-hide>
      <h3>New mark</h3>

      <div class="form-group row">
        <label class="col-sm-3 col-form-label">Issue:</label>
        <div class="col-sm-9">
          <b-form-select v-model="markAdd.issueId" :options="issueOptions"></b-form-select>
        </div>
      </div>

      <div class="form-group row">
        <label class="col-sm-3 col-form-label">Date:</label>
        <div class="col-sm-9">
          <input type="date" class="form-control" v-model="markAdd.date">
        </div>
      </div>

      <div class="form-group row">
        <label class="col-sm-3 col-form-label">Value:</label>
        <div class="col-sm-9">
          <b-form-select v-model="markAdd.value" :options="valueOptions"></b-form-select>
        </div>
      </div>

      <div class="form-group row px-3">
        <button class="btn btn-primary" @click="addMark">Add new mark</button>
      </div>
    </modal>

    <!-- marksEditModal -->
    <modal ref="marksEditModal" esc-hide>
      <h3>Edit mark</h3>

      <div class="form-group row">
        <label class="col-sm-3 col-form-label">Issue:</label>
        <div class="col-sm-9">
          <b-form-select v-model="markEdit.issueId" :options="issueOptions"></b-form-select>
        </div>
      </div>

      <div class="form-group row">
        <label class="col-sm-3 col-form-label">Date:</label>
        <div class="col-sm-9">
          <input type="date" class="form-control" v-model="markEdit.date">
        </div>
      </div>

      <div class="form-group row">
        <label class="col-sm-3 col-form-label">Value:</label>
        <div class="col-sm-9">
          <b-form-select v-model="markEdit.value" :options="valueOptions"></b-form-select>
        </div>
      </div>

      <div class="form-group row">
        <button class="btn btn-primary mx-2" @click="editMark">Save mark</button>
        <button class="btn btn-danger mx-2" @click="$refs.deleteMarkConfirm.show()">Delete mark</button>
      </div>
    </modal>

    <!-- deleteMarkConfirm -->
    <confirm-dialog ref="deleteMarkConfirm"
                    title="Delete mark"
                    text="Do you really want to delete mark? The history will be updated."
                    :callback="deleteMark" />
  </div>
</template>

<script>
    import { getMonthNumber, monthNumberAsString } from '../utils';

    export default {
        data() {
            return {
                isLoading: null,
                currentMonthNumber: null,
                issues: {},
                marks: {},
                markAdd: {},
                markEdit: {},
            };
        },
        computed: {
            valueOptions() {
                return [
                    {value: true, text: 'Done'},
                    {value: false, text: 'Undone'},
                ];
            },

            issueOptions() {
                return Object.values(this.issues).map(issue => {
                    return {
                        value: issue.id,
                        text: issue.name,
                    };
                });
            },

            marksSorted() {
                return Object.values(this.marks).sort((a, b) => (a.date < b.date) ? 1 : -1);
            },
        },
        methods: {
            monthNumberAsString,

            show() {
                this.load();
                this.$refs.marksListModal.show();
            },

            load() {
                this.currentMonthNumber = getMonthNumber(new Date().toISOString().slice(0, 10));

                this.isLoading = true;

                // Loading issues
                this.$resources.issues.getBlock(null, block => {
                    this.issues = block;

                    // loading marks
                    this.$resources.marks.getBlock(this.currentMonthNumber, block => {
                        this.marks = block;
                        this.isLoading = false;
                        this.$forceUpdate();
                    });
                });
            },

            updateMarks() {
                this.isLoading = true;
                this.$resources.marks.getBlock(this.currentMonthNumber, block => {
                    this.marks = block;
                    this.isLoading = false;
                    this.$forceUpdate();
                });
            },

            marksBack() {
                this.currentMonthNumber -= 1;
                this.updateMarks();
            },

            marksForward() {
                this.currentMonthNumber += 1;
                this.updateMarks();
            },

            marksAddModalShow() {
                this.markAdd = {};
                this.markAdd.id = null;
                this.markAdd.issueId = null;
                this.markAdd.date = new Date().toISOString().slice(0, 10);
                this.markAdd.value = true;
                this.$forceUpdate();
                this.$refs.marksAddModal.show();
            },

            marksEditModalShow(mark) {
                this.markEdit = Object.assign({}, mark);
                this.$forceUpdate();
                this.$refs.marksEditModal.show();
            },

            addMark() {
                if (this.markAdd.issueId) {
                    this.markAdd.id = `${getMonthNumber(this.markAdd.date)}:${this.$resources.generateUniqueId()}`;
                    this.$root.$emit('loading_start');
                    this.$resources.marks.save(
                        this.markAdd.id, this.markAdd,
                        () => {
                            this.$root.$emit('loading_stop');
                            this.updateMarks();
                            this.$refs.marksAddModal.hide();
                            this.$root.$emit('marks_updated', 'add', this.markAdd);
                        }
                    );
                }
            },

            editMark() {
                this.$root.$emit('loading_start');
                this.$resources.marks.save(
                    this.markEdit.id, this.markEdit,
                    () => {
                        this.$root.$emit('loading_stop');
                        this.updateMarks();
                        this.$refs.marksEditModal.hide();
                        this.$root.$emit('marks_updated', 'update', this.markEdit);
                    }
                );
            },

            deleteMark() {
                this.$root.$emit('loading_start');
                this.$resources.marks.delete(
                    this.markEdit.id,
                    () => {
                        this.$root.$emit('loading_stop');
                        this.updateMarks();
                        this.$refs.deleteMarkConfirm.hide();
                        this.$refs.marksEditModal.hide();
                        this.$root.$emit('marks_updated', 'delete', this.markEdit);
                    }
                );
            },
        },
    }
</script>
