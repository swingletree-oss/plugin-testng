import { Harness } from "@swingletree-oss/harness";
import { TemplateData } from "./template/template-engine";

export class TestNgReportData {
  report: TestNg.Report;
  source: Harness.ScmSource;

  constructor(report: TestNg.Report, source: Harness.ScmSource) {
    this.report = report;
    this.source = source;
  }
}

export namespace TestNg {

  export interface Report {
    "testng-results": SuiteCollection;
    _tests: {
      failed: number;
      total: number;
      succeeded: number;
      skipped: number;
    }
  }

  export interface SuiteCollection {
    suite: Suite[];
  }

  export interface Suite {
    "$": {
      name: string
    };

    groups: GroupContainer;
    test: Test[];
  }

  export interface GroupContainer {
    "$": {
      name: string;
    };

    group: Group[];
  }

  export interface Group {
    "$": {
      name: string;
    };

    method: Method[];
  }

  export interface Method {
    "$": {
      signature: string;
      name: string;
      class: string;
    };
  }

  export interface Test {
    "$": {
      name: string;
    };

    "class": TestClass[];
  }

  export interface TestClass {
    "$": {
      name: string;
    };

    "test-method": TestMethod[];
  }

  export interface TestMethod {
    "$": {
      status: "PASS" | "FAIL" | string;
      signature: string;
      name: string;
      "duration-ms": number;
      "started-at": Date;
      "description": string;
      "finished-at": Date;
      "is-config": boolean;
    };
  }

  export interface ReportTemplate extends TemplateData {
    event: TestNgReportData;
    annotations: Harness.Annotation[];
  }
}
