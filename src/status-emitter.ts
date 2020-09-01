import { inject, injectable } from "inversify";
import { TemplateEngine, Templates } from "./template/template-engine";
import { ConfigurationService, TestNgConfig } from "./configuration";
import { Harness, log } from "@swingletree-oss/harness";
import { TestNg, TestNgReportData } from "./model";
import ScottyClient from "@swingletree-oss/scotty-client";

@injectable()
class TestNgStatusEmitter {
  private readonly templateEngine: TemplateEngine;
  private readonly context: string;
  private readonly scottyClient: ScottyClient;

  constructor(
    @inject(ConfigurationService) configurationService: ConfigurationService,
    @inject(TemplateEngine) templateEngine: TemplateEngine
  ) {
    this.templateEngine = templateEngine;
    this.scottyClient = new ScottyClient(configurationService.get(TestNgConfig.SCOTTY_URL));
    this.context = configurationService.get(TestNgConfig.CONTEXT);
  }

  public processEvent(report: TestNg.Report): Harness.Annotation[] {
    const annotations: Harness.Annotation[] = [];

    const results = report["testng-results"];

    report._tests = {
      failed: 0,
      skipped: 0,
      succeeded: 0,
      total: 0
    };

    results.suite?.forEach((suite: TestNg.Suite) => {
      suite.test?.forEach((test: TestNg.Test) => {
        test.class?.forEach((testClass) => {
          testClass["test-method"]?.forEach((method: TestNg.TestMethod) => {
            report._tests.total++;

            const annotation = new Harness.ProjectAnnotation();
            if (method.$.status == "FAIL") {
              report._tests.failed++;
              annotation.severity = Harness.Severity.BLOCKER;
            } else if (method.$.status == "SKIP") {
              report._tests.skipped++;
              annotation.severity = Harness.Severity.WARNING;
            } else if (method.$.status == "PASS") {
              report._tests.succeeded++;
              return; // continue loop; do not add annotation
            }

            annotation.title = method.$.signature;
            annotation.detail = method.$.description;
            annotation.metadata = {
              duration_ms: method.$["duration-ms"],
              suite: suite.$.name,
              class: testClass.$.name,
              started: method.$["started-at"],
              finished: method.$["finished-at"]
            };

            annotations.push(annotation);
          });
        });
      });
    }, [] as Harness.Annotation[]);

    return annotations;
  }

  public async sendReport(event: TestNgReportData, uid: string) {
    const annotations = this.processEvent(event.report);

    const templateData: TestNg.ReportTemplate = {
      event: event,
      annotations: annotations
    };

    const notificationData: Harness.AnalysisReport = {
      sender: this.context,
      source: event.source,
      uuid: uid,
      checkStatus: annotations.length == 0 ? Harness.Conclusion.PASSED : Harness.Conclusion.BLOCKED,
      title: `${event.report._tests.failed} failed tests`,
      annotations: annotations,
      markdown: this.templateEngine.template(Templates.REPORT, event),
      metadata: {
        tests: event.report._tests
      }
    };

    notificationData.markdown = this.templateEngine.template<TestNg.ReportTemplate>(
      Templates.REPORT,
      templateData
    );

    try {
      return await this.scottyClient.sendReport(notificationData);
    } catch (error) {
      log.error("could not send payload to scotty.\n%j", error);
    }
  }
}

export default TestNgStatusEmitter;