import { Application } from '@nativescript/core';
import { ConsentCategories, ConsentStatus, Expiry, TealiumCommon, TealiumConfig, TealiumDispatch, Constants } from './common';

declare class TealiumWrapper extends NSObject {
	static alloc(): TealiumWrapper; // inherited from NSObject

	static new(): TealiumWrapper; // inherited from NSObject

	static createWithConfig(config: TealiumConfig): void;
	static terminateInstance(): void;
	static addToDataLayerWithDataExpiry(data: Map<string, any>, expiry: Expiry): void;
	static removeFromDataLayerWithKeys(keys: string[]): void;
	static getDataFromDataLayerWithKey(key: string): any;
	static addRemoteCommandWithId(id: string, callback: (response: string) => void): void;
	static removeRemoteCommandWithId(id: string): void;
	static setVisitorServiceListener(callback: (response: Map<string, any>) => void): void;
	static removeVisitorServiceListener(): void;
	static trackWithDispatch(dispatch: TealiumDispatch): void;
	static joinTraceWithId(traceId: string): void;
	static leaveTrace(): void;
	static get visitorId(): string;
	static get consentStatus(): ConsentStatus;
	static get consentCategories(): ConsentCategories[];
	static set consentStatus(status: ConsentStatus);
	static set consentCategories(categories: ConsentCategories[]);
}

export class Tealium extends TealiumCommon {
	private static _visitorId: string;
	private static _consentStatus: ConsentStatus;
	private static _consentCategories: ConsentCategories[];

	public static get visitorId() {
		return TealiumWrapper.visitorId;
	}

	public static get consentStatus(): ConsentStatus {
		return TealiumWrapper.consentStatus;
	}

	public static get consentCategories(): ConsentCategories[] {
		return TealiumWrapper.consentCategories;
	}

	public static set consentStatus(status: ConsentStatus) {
		TealiumWrapper.consentStatus = status;
	}

	public static set consentCategories(categories: ConsentCategories[]) {
		TealiumWrapper.consentCategories = categories;
	}

	public static initialize(config: TealiumConfig) {
		TealiumWrapper.createWithConfig(config);
		TealiumWrapper.addToDataLayerWithDataExpiry(Constants.pluginDetails, Expiry.forever);
	}

	public static terminateInstance() {
		TealiumWrapper.terminateInstance();
	}

	public static addRemoteCommand(id: string, callback: (response: any) => void) {
		var newCallback = (nativeResponse: any) => {
			let json = JSON.parse(nativeResponse);
			callback(json);
		};

		TealiumWrapper.addRemoteCommandWithId(id, newCallback);
	}

	public static removeRemoteCommand(id: string) {
		TealiumWrapper.removeRemoteCommandWithId(id);
	}

	public static setVisitorServiceListener(callback: (response: any) => void) {
		var newCallback = (nativeResponse: any) => {
			let json = JSON.parse(nativeResponse);
			callback(json);
		};
		TealiumWrapper.setVisitorServiceListener(newCallback);
	}

	public static removeVisitorServiceListener() {
		TealiumWrapper.removeVisitorServiceListener();
	}

	public static addData(data: Map<string, any>, expiry: Expiry) {
		TealiumWrapper.addToDataLayerWithDataExpiry(data, expiry);
	}

	public static removeData(keys: string[]) {
		TealiumWrapper.removeFromDataLayerWithKeys(keys);
	}

	public static getData(key: string): any {
		return TealiumWrapper.getDataFromDataLayerWithKey(key);
	}

	public static track(dispatch: TealiumDispatch) {
		TealiumWrapper.trackWithDispatch(dispatch);
	}

	public static joinTrace(id: string) {
		TealiumWrapper.joinTraceWithId(id);
	}

	public static leaveTrace() {
		TealiumWrapper.leaveTrace();
	}
}
