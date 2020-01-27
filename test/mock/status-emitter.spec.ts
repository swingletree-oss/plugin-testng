"use strict";

import * as chai from "chai";
import { describe } from "mocha";
import * as sinon from "sinon";
import { ConfigurationServiceMock, TemplateEngineMock } from "../mock-classes";
import TestNgStatusEmitter from "../../src/status-emitter";

import * as xml2js from "xml2js";
import * as fs from "fs";

chai.use(require("sinon-chai"));

const sandbox = sinon.createSandbox();

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

    const result = (uut as any).getAnnotations(testData);

    console.log(JSON.stringify(result, null, 2));
  });
});
