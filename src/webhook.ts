"use strict";

import { Comms, Harness, log } from "@swingletree-oss/harness";
import { BadRequestError } from "@swingletree-oss/harness/dist/comms";
import { Request, Response, Router } from "express";
import { inject, injectable } from "inversify";
import { ConfigurationService, TestNgConfig } from "./configuration";
import TestNgStatusEmitter from "./status-emitter";
import { TestNg, TestNgReportData } from "./model";
import * as xml2js from "xml2js";

/** Provides a Webhook for Sonar
 */
@injectable()
class TestNgWebhook {
  private configurationService: ConfigurationService;
  private emitter: TestNgStatusEmitter;

  constructor(
    @inject(TestNgStatusEmitter) emitter: TestNgStatusEmitter,
    @inject(ConfigurationService) configurationService: ConfigurationService,
  ) {
    this.configurationService = configurationService;
    this.emitter = emitter;
  }

  private isWebhookEventRelevant(event: TestNg.Report) {
    return event && event["testng-results"] !== undefined;
  }

  public getRouter(): Router {
    const router = Router();
    router.post("/", this.webhook.bind(this));
    return router;
  }

  public webhook = async (req: Request, res: Response) => {
    log.debug("received TestNg webhook event");

    if (this.configurationService.getBoolean(TestNgConfig.LOG_WEBHOOK_EVENTS)) {
      log.debug("webhook data: %j", req.body);
    }

    const message: Comms.Gate.PluginReportProcessRequest<TestNg.Report> = req.body;

    log.debug("parsing xml report");

    let reportData: TestNg.Report;
    try {
      reportData = await xml2js.parseStringPromise(message.data.report);
    } catch (err) {
      log.info("failed to parse provided xml. %j", err);
      res.status(400).send({
        errors: [new Comms.BadRequestError("testng report xml could not be parsed.")]
      } as Comms.Message.ErrorMessage);
      return;
    }

    if (!message.meta || !message.meta.source) {
      res.status(400).send(
        new Comms.Message.ErrorMessage(
          new BadRequestError("malformed source object in request metadata.")
        )
      );
      return;
    }

    const source = new Harness.GithubSource(message.meta.source as Harness.GithubSource);

    if (!Harness.GithubSource.isDataComplete(source)) {
      res.status(400).send(
        new Comms.Message.ErrorMessage(
          new BadRequestError("missing source coordinates in request metadata.")
        )
      );
      return;
    }

    if (this.isWebhookEventRelevant(reportData)) {
      const reportReceivedEvent = new TestNgReportData(reportData, source);

      this.emitter.sendReport(reportReceivedEvent, message.meta.buildUuid);
    } else {
      log.debug("testng webhook data did not contain a report. This event will be ignored.");
      res.status(400).send({
          errors: [new Comms.BadRequestError("testng webhook data did not contain a report")]
        } as Comms.Message.ErrorMessage);
      return;
    }

    res.status(204).send();
  }
}

export default TestNgWebhook;