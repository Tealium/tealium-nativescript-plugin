import { Observable, EventData, Page } from '@nativescript/core';
import { DemoSharedTealium } from '@demo/shared';
import {} from '@tealium-nativescript/tealium';

export function navigatingTo(args: EventData) {
	const page = <Page>args.object;
	page.bindingContext = new DemoModel();
}

export class DemoModel extends DemoSharedTealium {}
