import container from "./ioc-config";
import { log } from "@swingletree-oss/harness";
import { WebServer } from "./webserver";
import TestNgStatusEmitter from "./status-emitter";
import TestNgWebhook from "./webhook";

require("source-map-support").install();

process.on("unhandledRejection", error => {
  // Will print "unhandledRejection err is not defined"
  console.log("unhandledRejection ", error);
});

export class TestNgPlugin {

  constructor() {
  }

  public run(): void {
    log.info("Starting up TestNg Plugin...");
    const webserver = container.get<WebServer>(WebServer);

    // initialize Emitters
    container.get<TestNgStatusEmitter>(TestNgStatusEmitter);

    // add webhook endpoint
    webserver.addRouter("/report", container.get<TestNgWebhook>(TestNgWebhook).getRouter());
  }

}

new TestNgPlugin().run();
