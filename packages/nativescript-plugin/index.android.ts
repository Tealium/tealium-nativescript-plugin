import { Application } from '@nativescript/core';
import { ConsentCategories, ConsentStatus, Expiry, TealiumCommon, TealiumConfig, TealiumDispatch, Constants } from './common';

const TealiumWrapper = com.tealium.nativescript.TealiumWrapper.Companion;
const RemoteCommandCallback = com.tealium.nativescript.RemoteCommandCallback;
const VisitorServiceListener = com.tealium.nativescript.VisitorServiceListener;

export class Tealium extends TealiumCommon {
	private _visitorId: string;
	private static _consentStatus: ConsentStatus;
	private static _consentCategories: ConsentCategories[];

	public get visitorId() {
		return TealiumWrapper.fetchVisitorId();
	}

	public static get consentStatus(): ConsentStatus {
		return TealiumWrapper.getConsentStatus();
	}

	public static get consentCategories(): ConsentCategories[] {
		let categories = TealiumWrapper.getConsentCategories();
		if (categories === null) {
			return [];
		}
		let count = categories.length;
		var array = [];
		for (let i = 0; i < count; i++) {
			array.push(categories[i]);
		}
		let finalCategories = array as ConsentCategories[];

		return finalCategories;
	}

	public static set consentStatus(status: ConsentStatus) {
		TealiumWrapper.setConsentStatus(status.toString());
	}

	public static set consentCategories(categories: ConsentCategories[]) {
		TealiumWrapper.setConsentCategories(categories.toString().split(','));
	}

	public static initialize(config: TealiumConfig) {
		TealiumWrapper.create(Application.android.context, JSON.stringify(config));
		this.addData(Constants.pluginDetails, Expiry.forever);
	}

	public static terminateInstance() {
		TealiumWrapper.terminateInstance();
	}

	public static addRemoteCommand(id: string, callback: (response: any) => void) {
		let response = new RemoteCommandCallback({
			remoteCommandCallback(param: java.util.Map<string, any>) {
				let responseMap = {};
				let iterator = param.entrySet().iterator();
				while (iterator.hasNext()) {
					let entry = iterator.next();
					let value = JSON.parse(JSON.stringify(entry.getValue().toString()));
					responseMap[entry.getKey().toString()] = JSON.parse(value);
				}
				callback(responseMap);
			},
		});

		TealiumWrapper.addRemoteCommand(id, response);
	}

	public static removeRemoteCommand(id: string) {
		TealiumWrapper.removeRemoteCommand(id);
	}

	public static setVisitorServiceListener(callback: (response: any) => void) {
		let listener = new VisitorServiceListener({
			updatedVisitorProfile(param: java.util.Map<string, any>) {
				let responseMap = {};
				let iterator = param.entrySet().iterator();
				while (iterator.hasNext()) {
					let entry = iterator.next();
					let value = JSON.parse(JSON.stringify(entry.getValue().toString()));
					responseMap[entry.getKey()] = JSON.parse(value);
				}
				callback(responseMap);
			},
		});

		TealiumWrapper.setVisitorServiceListener(listener);
	}

	public static removeVisitorServiceListener() {
		TealiumWrapper.removeVisitorServiceListener();
	}

	public static addData(data: Map<string, any>, expiry: Expiry) {
		TealiumWrapper.addData(JSON.stringify(mapToObj(data)), expiry.toString());
	}

	public static removeData(keys: string[]) {
		TealiumWrapper.removeData(keys);
	}

	public static getData(key: string): any {
		return TealiumWrapper.fetchData(key);
	}

	public static gatherTrackData(): any {
		return TealiumWrapper.gatherTrackData();
	}

	public static track(dispatch: TealiumDispatch) {
		TealiumWrapper.track(dispatch.toJson());
	}

	public static joinTrace(id: string) {
		TealiumWrapper.joinTrace(id);
	}

	public static leaveTrace() {
		TealiumWrapper.leaveTrace();
	}
}

function mapToObj(map) {
	const obj = {};
	for (let [k, v] of map) obj[k] = v;
	return obj;
}
