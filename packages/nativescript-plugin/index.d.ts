import { ConsentCategories, ConsentStatus, Expiry, TealiumCommon } from './common';

export declare class Tealium extends TealiumCommon {
	private _visitorId: string;
	private _consentStatus: ConsentStatus;
	private _consentCategories: ConsentCategories[];

	/**
	 * Retrieves the Tealium Visitor ID
	 */
	public static get visitorId() {}

	/**
	 * Retrieves the user's consent status
	 */
	public static get consentStatus() {}

	/**
	 * Retrieves the user's consent categories
	 */
	public static get consentCategories() {}

	/**
	 * Sets the user's consent status
	 */
	public static set consentStatus(status: ConsentStatus) {}

	/**
	 * Sets the user's consent categories
	 */
	public static set consentCategories(categories: ConsentCategories[]) {}

	/**
	 * Initializes the Tealium SDK
	 * @param config Config options to change SDK behavior
	 */
	public static initialize(config: TealiumConfig) {}

	/**
	 * Terminates the current Tealium instance
	 */
	public static terminateInstance() {}

	/**
	 * Sets up a remote command for later execution
	 * @param id The ID used to invoke the remote command
	 * @param callback Callback function to be called when the remote command is triggered
	 */
	public static addRemoteCommand(id: string, callback: (response: any) => void) {}

	/**
	 * Removes a previously-added remote command
	 * @param id The ID used to invoke the remote command
	 */
	public static removeRemoteCommand(id: string) {}

	/**
	 * Sets a listener to be called when the AudienceStream visitor profile is updated
	 * @param callback Callback function to be called when the vistior profile is updated
	 */
	public static setVisitorServiceListener(callback: (response: any) => void) {}

	/**
	 * Removes a previously-added visitor service listener
	 */
	public static removeVisitorServiceListener() {}

	/**
	 * Adds data to the data layer
	 * @param data A dictionary containing the key-value pairs to be added to the data layer
	 * @param expiry When the data should expire. Choose `Expiry.session` if unsure.
	 */
	public static addData(data: Map<string, any>, expiry: Expiry) {}

	/**
	 * Removes data from the data layer
	 * @param keys The keys of the data to be removed
	 */
	public static removeData(keys: string[]) {}

	/**
	 * Retrieves track data from the data layer and collectors
	 * @param callback Callback function to be called for iOS results
	 */
	public static gatherTrackData(callback?: (result: any) => void) {}

	/**
	 *
	 * @param key The key of the data to retrieve from the data layer
	 */
	public static getData(key: string): any {}

	/**
	 * Tracks an event/view
	 * @param dispatch A `TealiumEvent` or `TealiumView` object
	 */
	public static track(dispatch: TealiumDispatch) {}

	/**
	 * Joins a trace session with the specified Trace ID
	 * @param id Trace ID
	 */
	public static joinTrace(id: string) {}

	/**
	 * Leaves a trace session
	 */
	public static leaveTrace() {}
}
