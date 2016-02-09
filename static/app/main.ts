import {AppComponent} from "./components/app";
import {bootstrap} from "angular2/platform/browser";
import {enableProdMode} from 'angular2/core';

enableProdMode();
bootstrap(AppComponent).catch(err => console.error(err));
