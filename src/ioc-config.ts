import "reflect-metadata";

import { Container } from "inversify";

import { ConfigurationService } from "./configuration";
import { TemplateEngine } from "./template/template-engine";
import { WebServer } from "./webserver";


const container = new Container();

container.bind<ConfigurationService>(ConfigurationService).toSelf().inSingletonScope();
container.bind<WebServer>(WebServer).toSelf().inSingletonScope();
container.bind<TemplateEngine>(TemplateEngine).toSelf().inSingletonScope();


export default container;