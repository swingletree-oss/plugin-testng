"use strict";

import * as chai from "chai";
import { describe } from "mocha";
import { expect } from "chai";
import * as sinon from "sinon";
import { ConfigurationServiceMock, TemplateEngineMock } from "../mock-classes";
import TestNgStatusEmitter from "../../src/status-emitter";

import * as xml2js from "xml2js";
import * as fs from "fs";
import { TemplateEngine, Templates } from "../../src/template/template-engine";
import { TestNg } from "../../src/model";

chai.use(require("sinon-chai"));

describe("Status Emitter", () => {

  let uut: TemplateEngine;
  let statusEmitter;
  let testData;

  beforeEach( async() => {
    uut = new TemplateEngine();

    statusEmitter = new TestNgStatusEmitter(
      new ConfigurationServiceMock(),
      new TemplateEngineMock()
    );

    testData = await xml2js.parseStringPromise(
      fs.readFileSync("./test/mock/testng-report.xml")
    );
  });

  it(`should generate markdown report from template`, async () => {
    const result = (statusEmitter as any).processEvent(testData);

    const templateData: TestNg.ReportTemplate = {
      event: testData,
      annotations: result
    };

    const markdown = uut.template(Templates.REPORT, templateData);

    expect(markdown).to.be.not.undefined;
    expect(markdown).to.include("**2**");
    expect(markdown).to.include("**0**");
    expect(markdown).to.include("**1**");
  });
});
