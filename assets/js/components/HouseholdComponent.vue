<template>
  <div>
    <div class="row mx-0">
      <div class="col-lg-9 d-none d-lg-block">
        <canvas id="householdHistoryChart" height="400"></canvas>
      </div>
      <div class="col-lg-3">
        <canvas id="householdTodayChart" height="400"></canvas>
      </div>
    </div>

    <div class="clearfix p-3">
      <div v-for="issue in issuesShown" class="card float-left m-2 text-dark bg-light text-center">
        <div class="card-body p-3">
          <h5 class="card-title">{{ issue.name }}</h5>
          <p class="card-text">{{ issue.text }}</p>
          <a href="#" class="btn btn-success btn-sm" @click="markIssue(issue.id, true)"><fa-icon icon="check" /> Yes</a>
          <a href="#" class="btn btn-danger btn-sm" @click="markIssue(issue.id, false)"><fa-icon icon="times" /> No</a>
        </div>
      </div>
    </div>

    <hr>

    <div class="px-3 row text-center h5">
      <div class="col-lg py-2"><a href="#" @click="$refs.issuesManager.show()"><fa-icon icon="th" /> Issues</a></div>
      <div class="col-lg py-2"><a href="#" @click="$refs.marksManager.show()"><fa-icon icon="edit" /> Marks</a></div>
      <div class="col-lg py-3"><a href="#" @click="updateHistoryAndLastMarkDates()"><fa-icon icon="refresh" /> Update history</a></div>
    </div>

    <issues-manager ref="issuesManager" />
    <marks-manager ref="marksManager" />
  </div>
</template>

<script>
    import Chart from 'chart.js';
    import { getRange, getMonthNumber, getDatesBetween, getMaxString, getMinString } from '../utils';
    import QueueUpdater from '../queue_updater';

    export default {
        data() {
            return {
                history: [],
                today: null,
                issues: {},
                marks: {},
                issuesShown: [],
                newMarkQueueUpdater: new QueueUpdater((mark, callback) => {
                    this.$resources.marks.save(mark.id, mark, callback);
                }, 1000),
                historyQueueUpdater: new QueueUpdater((history, callback) => {
                    this.$resources.history.saveBlock(null, { history }, callback);
                }, 1000),
            };
        },
        methods: {
            plotHistoryChart() {
                var chart = new Chart('householdHistoryChart', {
                    type: 'line',

                    data: {
                        labels: this.history.map(x => x.date),
                        datasets: [{
                            label: "History",
                            backgroundColor: 'rgb(0, 128, 255, 0.3)',
                            borderWidth: 2,
                            borderColor: 'rgb(0, 128, 255)',
                            data: this.history.map(x => x.total ? (100 * x.count / x.total) : 0.0),
                            pointRadius: 1,
                            lineTension: 0.25,
                        }]
                    },

                    options: {
                        maintainAspectRatio: false,
                        scales: {
                            yAxes: [{
                                ticks: {
                                    min: 0,
                                    max: 100
                                }
                            }]
                        }
                    }
                });
            },

            plotTodayChart() {
                var last = this.history.length ? this.history[this.history.length - 1] : {};
                var value = ((last.date == this.today) && last.total) ? (100 * last.count / last.total) : 0.0;

                var chart = new Chart('householdTodayChart', {
                    type: 'bar',

                    data: {
                        labels: [this.today],
                        datasets: [
                            {
                                label: "Done",
                                backgroundColor: 'rgb(0, 128, 80, 0.3)',
                                borderWidth: 5,
                                borderColor: 'rgb(0, 128, 80)',
                                data: [value],
                            },
                            {
                                label: "Not done",
                                backgroundColor: 'rgb(172, 0, 32, 0.3)',
                                borderWidth: 5,
                                borderColor: 'rgb(172, 0, 32)',
                                data: [100.0 - value],
                            },
                        ]
                    },

                    options: {
                        maintainAspectRatio: false,
                        scales: {
                            xAxes: [{
                                barThickness: 75,
                                stacked: true,
                            }],
                            yAxes: [{
                                ticks: {
                                    min: 0,
                                    max: 100
                                },
                                stacked: true,
                            }]
                        }
                    }
                });
            },

            loadIssues(callback) {
                this.$resources.issues.getBlock(null, block => {
                    this.issues = block;
                    callback();
                });
            },

            loadMarks(callback) {
                var currentMonthNumber = getMonthNumber(this.today);
                this.$resources.marks.getBlock(currentMonthNumber, block => {
                    this.marks = block;
                    callback();
                });
            },

            loadHistory(callback) {
                this.$resources.history.getBlock(null, block => {
                    if (Object.keys(block).length) {
                        this.history = block.history;
                    }
                    if (!this.history.length || this.history[this.history.length - 1].date != this.today) {
                        this.updateHistoryAndLastMarkDates();
                    }
                    callback();
                });
            },

            load() {
                this.$root.$emit('loading_start');
                Promise.all([
                    new Promise(this.loadHistory),
                    new Promise(this.loadIssues),
                    new Promise(this.loadMarks),
                ]).then(() => {
                    this.issuesShown = this.getIssuesShown();
                    this.plotHistoryChart();
                    this.plotTodayChart();
                    this.$forceUpdate();
                    this.$root.$emit('loading_stop');
                });
            },

            getIssuesShown() {
                return Object.values(this.issues).filter(issue =>
                        (this.today >= issue.startDate) &&
                        (!issue.endDate || (this.today <= issue.endDate)) &&
                        (!issue.lastMarkDate || (new Date(this.today) - new Date(issue.lastMarkDate) >= issue.period * 86400000)) &&
                        (!Object.values(this.marks).filter(mark => mark.issueId == issue.id).find(mark => mark.date == this.today)));
            },

            markIssue(issueId, value) {
                // Saving new mark
                var mark = {
                    id: `${getMonthNumber(this.today)}:${this.$resources.generateUniqueId()}`,
                    issueId: issueId,
                    date: this.today,
                    value: value,
                };
                this.newMarkQueueUpdater.push(mark);

                // Updating issues to mark
                this.marks[mark.id] = mark;
                this.issuesShown = this.getIssuesShown();

                // Updating diagrams
                if (this.history.length && this.history[this.history.length - 1].date == this.today) {
                    if (value) {
                        this.history[this.history.length - 1].count += 1;
                        this.historyQueueUpdater.push(this.history);
                        this.plotHistoryChart();
                        this.plotTodayChart();
                        this.$forceUpdate();
                    }
                }
            },

            updateHistoryAndLastMarkDates() {
                this.$root.$emit('loading_start');

                var issues = {};
                var marks = {};

                // Requesting issues
                this.$resources.issues.getBlock(null, block => {
                    issues = block;

                    // Calculating the earliest start date
                    var startDate = getMinString(
                        Object.values(issues).map(issue => issue.startDate)
                    );
                    if (startDate === undefined) {
                        startDate = this.today;
                    }

                    // Generate dates untill today
                    var dates = getDatesBetween(startDate, this.today, true);

                    // Generate month range
                    var months = getRange(
                        getMonthNumber(startDate),
                        getMonthNumber(this.today) + 1
                    );

                    // Requesting marks by months
                    Promise.all(months.map(month => new Promise(resolve => {
                        this.$resources.marks.getBlock(month, resolve);
                    }))).then(result => {
                        // Storing marks
                        result.forEach(items => {
                            Object.assign(marks, items);
                        });

                        // Building issue-marks dictionary
                        var dctIssueMarks = {};
                        Object.values(marks).forEach(mark => {
                            if (mark.value) {
                                if (mark.issueId in dctIssueMarks) {
                                    dctIssueMarks[mark.issueId].push(mark);
                                } else {
                                    dctIssueMarks[mark.issueId] = [mark];
                                }
                            }
                        });

                        // Updating lastMarkDate
                        Object.values(issues).forEach(issue => {
                            issue.lastMarkDate = null;

                            if (issue.id in dctIssueMarks) {
                                var dates = dctIssueMarks[issue.id].map(mark => mark.date);
                                if (dates.length) {
                                    issue.lastMarkDate = getMaxString(dates);
                                }
                            }
                        });

                        // Saving updated issues
                        this.$resources.issues.saveBlock(null, issues, () => {
                            // Updating issuesShown
                            this.issues = issues;
                            this.marks = marks;
                            this.issuesShown = this.getIssuesShown();
                            this.$forceUpdate();
                        });

                        // Calculating total series
                        var total = dates.map(date =>
                            Object.values(issues).filter(
                                issue => (date >= issue.startDate) &&
                                         (!issue.endDate || (date <= issue.endDate))
                                ).length
                        );

                        // Calculating count series
                        var count = dates.map(date =>
                            Object.values(issues).filter(
                                issue => (date >= issue.startDate) &&
                                         (!issue.endDate || (date <= issue.endDate)) &&
                                         (issue.id in dctIssueMarks) &&
                                         dctIssueMarks[issue.id].find(
                                            mark => (date >= mark.date) &&
                                                    (new Date(date) - new Date(mark.date) < issue.period * 86400000)
                                         )
                                ).length
                        );

                        // Building history block
                        var history = dates.map((date, idx) => {
                            return {
                                date: date,
                                count: count[idx],
                                total: total[idx],
                            };
                        });

                        // Saving history
                        this.$resources.history.saveBlock(null, { history }, () => {
                            // Updating diagrams
                            this.history = history;
                            this.plotHistoryChart();
                            this.plotTodayChart();
                            this.$forceUpdate();
                            this.$root.$emit('loading_stop');
                        });
                    });
                });
            },
        },
        mounted() {
            this.today = new Date().toISOString().slice(0, 10);

            this.$root.$on('issues_updated', () => {
                this.updateHistoryAndLastMarkDates();
            });

            this.$root.$on('marks_updated', () => {
                this.updateHistoryAndLastMarkDates();
            });

            this.load();

            this.newMarkQueueUpdater.start();
            this.historyQueueUpdater.start();
        },
    }
</script>
