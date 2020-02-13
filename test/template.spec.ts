"use strict";

import * as chai from "chai";
import { describe } from "mocha";
import { expect } from "chai";
import * as sinon from "sinon";
import { ConfigurationServiceMock, TemplateEngineMock } from "./mock-classes";
import TestNgStatusEmitter from "../src/status-emitter";

import * as xml2js from "xml2js";
import * as fs from "fs";
import { TemplateEngine, Templates } from "../src/template/template-engine";
import { TestNg } from "../src/model";

chai.use(require("sinon-chai"));

describe("Templating", () => {

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
    expect(markdown).to.include("someDescription2");
    expect(markdown).to.include("test1()");
    expect(markdown).to.include("test2()");
    expect(markdown).to.include("setUp()");
  });

  it(`should be able to process multiple test-suites`, async () => {
    const data = await xml2js.parseStringPromise(fs.readFileSync("./test/mock/testng-report-multiple.xml"));
    const result = (statusEmitter as any).processEvent(
      data
    );

    const templateData: TestNg.ReportTemplate = {
      event: data,
      annotations: result
    };

    const markdown = uut.template(Templates.REPORT, templateData);

    expect(markdown).to.be.not.undefined;
    expect(markdown).to.include("s2_test1()");
    expect(markdown).to.include("s2_test2()");
    expect(markdown).to.include("Suite2");
  });
});
