import Service from '@ember/service';

export default class LocalStore extends Service {
  constructor(...args) {
    super(...args);

    const report = window.localStorage.getItem('ynab-report');
    if (report) {
      this.parseReports(report);
    } else {
      this.writeReports();
    }
  }

  parseReports(report) {
    this.set('storedData', JSON.parse(report));
  }

  writeReports() {
    let report = this.get('storedData');
    if (!report) {
      report = {};
      this.set('storedData', report);
    }

    window.localStorage.setItem('ynab-report', JSON.stringify(report));
  }

  setItem(key, value) {
    this.get('storedData')[key] = value;
    this.writeReports();
  }

  getItem(key) {
    return this.get('storedData')[key];
  }
}
