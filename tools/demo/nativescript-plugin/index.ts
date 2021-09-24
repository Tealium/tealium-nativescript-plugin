import { DemoSharedBase } from '../utils';
import { Tealium } from '@tealium/nativescript-plugin';
import { TealiumConfig, TealiumView, TealiumEvent, ConsentCategories, Dispatchers, Collectors, ConsentPolicy, Expiry, ConsentStatus, ConsentExpiry, TealiumEnvironment, TimeUnit } from '@tealium/nativescript-plugin/common';

export class DemoSharedTealium extends DemoSharedBase {
	init() {
		let config: TealiumConfig = {
			account: 'tealiummobile',
			profile: 'demo',
			environment: TealiumEnvironment.dev,
			dispatchers: [Dispatchers.Collect, Dispatchers.RemoteCommands, Dispatchers.TagManagement],
			collectors: [Collectors.AppData, Collectors.DeviceData, Collectors.Lifecycle, Collectors.Connectivity],
			consentLoggingEnabled: true,
			consentPolicy: ConsentPolicy.gdpr,
			visitorServiceEnabled: true,
			// visitorServiceRefreshInterval: '1',
			consentExpiry: new ConsentExpiry(3, TimeUnit.minutes),
			useRemoteLibrarySettings: false,
		};
		console.log(config.collectors);
		console.log(config.dispatchers);
		Tealium.initialize(config);
	}

	setVisitorServiceListener() {
		Tealium.setVisitorServiceListener((result: any): void => {
			// console.log(result);
			// examples of other possible properties
			// console.log(result['currentVisit']['setsOfStrings']['5228']);
			console.log('audiences:');
			console.log(result['audiences']);
			// console.log(result["badges"]);
			// console.log(result["dates"]);
			// console.log(result["booleans"]);
			// console.log(result["arraysOfBooleans"]);
			// console.log(result["numbers"]);
			// console.log(result["arraysOfNumbers"]);
			// console.log(result["tallies"]);
			// console.log(result["strings"]);
			// console.log(result["arraysOfStrings"]);
			// console.log(result["setsOfStrings"]);

			// console.log(result['currentVisit']["dates"]);
			// console.log(result['currentVisit']["booleans"]);
			// console.log(result['currentVisit']["arraysOfBooleans"]);
			// console.log(result['currentVisit']["numbers"]);
			// console.log(result['currentVisit']["arraysOfNumbers"]);
			// console.log(result['currentVisit']["tallies"]);
			// console.log(result['currentVisit']["strings"]);
			// console.log(result['currentVisit']["arraysOfStrings"]);
			// console.log(result['currentVisit']["setsOfStrings"]);
		});
	}

	removeVisitorServiceListener() {
		// Tealium.removeVisitorServiceListener();
	}

	trackView() {
		let view = new TealiumView('Test View', new Map([['view_name', 'test']]));
		Tealium.track(view);
	}

	trackEvent() {
		let event = new TealiumEvent('Test Event', new Map([['event_name', 'test']]));
		Tealium.track(event);
	}

	addData() {
		const data: Map<string, any> = new Map([['test_session_data', 'test']]);
		data.set('my_test_value', 1);
		data['my_test_value'] = 1;
		Tealium.addData(data, Expiry.session);
	}

	removeData() {
		Tealium.removeData(['test_session_data']);
		Tealium.removeData(['my_test_value']);
	}

	getData() {
		console.log(Tealium.getData('plugin_name'));
	}

	getConsentStatus() {
		console.log(Tealium.consentStatus);
	}

	getConsentCategories() {
		console.log(Tealium.consentCategories);
	}

	addRemoteCommand() {
		Tealium.addRemoteCommand('hello', (result: any): void => {
			console.log('hello from remote command');
			console.log(result);
		});
	}

	removeRemoteCommand() {
		Tealium.removeRemoteCommand('hello');
	}

	optOut() {
		Tealium.consentStatus = ConsentStatus.notConsented;
	}

	optIn() {
		Tealium.consentStatus = ConsentStatus.consented;
	}

	resetConsent() {
		Tealium.consentStatus = ConsentStatus.unknown;
	}

	setRandomConsentCategories() {
		let randomCategories = this.randomItems([ConsentCategories.affiliates, ConsentCategories.analytics, ConsentCategories.bigData, ConsentCategories.cdp, ConsentCategories.cookieMatch, ConsentCategories.crm, ConsentCategories.displayAds, ConsentCategories.email, ConsentCategories.engagement, ConsentCategories.misc, ConsentCategories.mobile, ConsentCategories.monitoring, ConsentCategories.personalization, ConsentCategories.search, ConsentCategories.social]);
		Tealium.consentCategories = randomCategories;
	}

	joinTrace(args: any) {
		let id = args.object.text;
		if (id === 'Leave Trace' || id === '') {
			alert('Trace Ended');
			Tealium.leaveTrace();
		} else if (id !== '') {
			alert('Trace started with ID: ' + id);
			Tealium.joinTrace(id);
			args.object.text = '';
		}
	}

	terminate() {
		Tealium.terminateInstance();
	}

	randomItems<T>(items: T[]): T[] {
		return items
			.map((a) => ({ sort: Math.random(), value: a }))
			.sort((a, b) => a.sort - b.sort)
			.map((a) => a.value)
			.slice(0, 3);
	}
}
