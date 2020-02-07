"use strict";

import * as chai from "chai";
import { describe } from "mocha";
import { expect } from "chai";
import * as sinon from "sinon";
import { ConfigurationServiceMock, TemplateEngineMock } from "../mock-classes";
import TestNgStatusEmitter from "../../src/status-emitter";

import * as xml2js from "xml2js";
import * as fs from "fs";

chai.use(require("sinon-chai"));

describe("Status Emitter", () => {

  let uut;
  let testData;

  beforeEach( async() => {
    uut = new TestNgStatusEmitter(
      new ConfigurationServiceMock(),
      new TemplateEngineMock()
    );

    testData = await xml2js.parseStringPromise(
      fs.readFileSync("./test/mock/testng-report.xml")
    );
  });

  it(`should transform report to annotations`, async () => {
    const result = (uut as any).processEvent(testData);

    expect(result).not.to.be.undefined;
    expect(result.length).to.equal(1);
    expect(result[0]).to.include({
      "type": "project",
      "severity": "blocker",
      "title": "test1()",
      "detail": "someDescription2"
    });
  });


  it(`should count test states`, async () => {
    const result = (uut as any).processEvent(testData);

    expect(testData._tests).to.include({
      failed: 1,
      skipped: 0,
      succeeded: 2,
      total: 3
    });
  });

});
