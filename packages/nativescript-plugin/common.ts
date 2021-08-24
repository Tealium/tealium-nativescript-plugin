import { Observable } from '@nativescript/core';

export enum Collectors {
	AppData = 'AppData',
	Connectivity = 'Connectivity',
	DeviceData = 'DeviceData',
	Lifecycle = 'Lifecycle',
}

export class Constants {
	static pluginDetails = new Map([
		['plugin_name', 'Tealium-NativeScript'],
		['plugin_version', '1.1.2'],
	]);
}

export enum Dispatchers {
	Collect = 'Collect',
	TagManagement = 'TagManagement',
	RemoteCommands = 'RemoteCommands',
}

export enum Expiry {
	forever = 'forever',
	untilRestart = 'untilRestart',
	session = 'session',
}

export enum ConsentPolicy {
	ccpa = 'ccpa',
	gdpr = 'gdpr',
}

export interface TealiumDispatch {
	dataLayer: Map<string, any>;
	type: string;
	toJson(): string;
}

export class TealiumView implements TealiumDispatch {
	public type: string = 'view';
	constructor(public viewName: string, public dataLayer: Map<string, any>) {}
	toJson() {
		let dictionary = {};
		dictionary['type'] = this.type;
		dictionary['dataLayer'] = {};
		for (let [k, v] of this.dataLayer) {
			dictionary['dataLayer'][k] = v;
		}
		dictionary['type'] = this.type;
		dictionary['viewName'] = this.viewName;
		return JSON.stringify(dictionary);
	}
}

export class TealiumEvent implements TealiumDispatch {
	public type: string = 'event';
	constructor(public eventName: string, public dataLayer: Map<string, any>) {}
	toJson() {
		let dictionary = {};
		dictionary['type'] = this.type;
		dictionary['dataLayer'] = {};
		for (let [k, v] of this.dataLayer) {
			dictionary['dataLayer'][k] = v;
		}
		dictionary['type'] = this.type;
		dictionary['eventName'] = this.eventName;
		return JSON.stringify(dictionary);
	}
}

export class ConsentExpiry {
	constructor(public time: number, public unit: TimeUnit) {}
}

export enum TimeUnit {
	minutes = 'minutes',
	hours = 'hours',
	days = 'days',
	months = 'months',
}

export enum ConsentStatus {
	consented = 'consented',
	notConsented = 'notConsented',
	unknown = 'unknown',
}

export enum LogLevel {
	dev = 'dev',
	qa = 'qa',
	prod = 'prod',
	silent = 'silent',
}

export enum TealiumEnvironment {
	dev = 'dev',
	qa = 'qa',
	prod = 'prod',
}

export enum ConsentCategories {
	analytics = 'analytics',
	affiliates = 'affiliates',
	displayAds = 'display_ads',
	email = 'email',
	personalization = 'personalization',
	search = 'search',
	social = 'social',
	bigData = 'big_data',
	mobile = 'mobile',
	engagement = 'engagement',
	monitoring = 'monitoring',
	crm = 'crm',
	cdp = 'cdp',
	cookieMatch = 'cookiematch',
	misc = 'misc',
}

export interface TealiumConfig {
	account: string;
	profile: string;
	environment: TealiumEnvironment;
	dataSource?: string;
	collectors: Collectors[];
	dispatchers: Dispatchers[];
	customVisitorId?: string;
	memoryReportingEnabled?: boolean;
	overrideCollectURL?: string;
	overrideCollectBatchURL?: string;
	overrideCollectDomain?: string;
	overrideLibrarySettingsURL?: string;
	overrideTagManagementURL?: string;
	deepLinkTrackingEnabled?: boolean;
	qrTraceEnabled?: boolean;
	loglevel?: LogLevel;
	consentLoggingEnabled?: boolean;
	consentPolicy?: ConsentPolicy;
	consentExpiry?: ConsentExpiry;
	lifecycleAutotrackingEnabled?: boolean;
	useRemoteLibrarySettings?: boolean;
	visitorServiceEnabled?: boolean;
	visitorServiceRefreshInterval?: string;
}

export class TealiumCommon extends Observable {}
