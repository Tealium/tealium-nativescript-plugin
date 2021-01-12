/// <reference path="android-declarations.d.ts"/>

declare module com {
	export module tealium {
		export module nativescript {
			export class BuildConfig {
				public static class: java.lang.Class<com.tealium.nativescript.BuildConfig>;
				public static DEBUG: boolean;
				public static LIBRARY_PACKAGE_NAME: string;
				public static BUILD_TYPE: string;
				public static VERSION_CODE: number;
				public static VERSION_NAME: string;
				public constructor();
			}
		}
	}
}

declare module com {
	export module tealium {
		export module nativescript {
			export class RemoteCommandCallback {
				public static class: java.lang.Class<com.tealium.nativescript.RemoteCommandCallback>;
				/**
				 * Constructs a new instance of the com.tealium.nativescript.RemoteCommandCallback interface with the provided implementation. An empty constructor exists calling super() when extending the interface class.
				 */
				public constructor(implementation: { remoteCommandCallback(param0: java.util.Map<string, any>): void });
				public constructor();
				public remoteCommandCallback(param0: java.util.Map<string, any>): void;
			}
		}
	}
}

declare module com {
	export module tealium {
		export module nativescript {
			export class TealiumWrapper {
				public static class: java.lang.Class<com.tealium.nativescript.TealiumWrapper>;
				public static Companion: com.tealium.nativescript.TealiumWrapper.Companion;
				public constructor();
			}
			export module TealiumWrapper {
				export class Companion {
					public static class: java.lang.Class<com.tealium.nativescript.TealiumWrapper.Companion>;
					public joinTrace(param0: string): void;
					public setConsentCategories(param0: native.Array<string>): void;
					public fetchVisitorId(): string;
					public terminateInstance(): void;
					public addRemoteCommand(param0: string, param1: com.tealium.nativescript.RemoteCommandCallback): void;
					public getConsentStatus(): string;
					public getConsentCategories(): native.Array<string>;
					public fetchData(param0: string): any;
					public setConsentStatus(param0: string): void;
					public track(param0: string): void;
					public removeRemoteCommand(param0: string): void;
					public removeData(param0: native.Array<string>): void;
					public leaveTrace(): void;
					public setVisitorServiceListener(param0: com.tealium.nativescript.VisitorServiceListener): void;
					public removeVisitorServiceListener(): void;
					public addData(param0: string, param1: string): void;
					public create(param0: globalAndroid.app.Application, param1: string): void;
				}
			}
		}
	}
}

declare module com {
	export module tealium {
		export module nativescript {
			export class VisitorServiceListener {
				public static class: java.lang.Class<com.tealium.nativescript.VisitorServiceListener>;
				/**
				 * Constructs a new instance of the com.tealium.nativescript.VisitorServiceListener interface with the provided implementation. An empty constructor exists calling super() when extending the interface class.
				 */
				public constructor(implementation: { updatedVisitorProfile(param0: java.util.Map<string, any>): void });
				public constructor();
				public updatedVisitorProfile(param0: java.util.Map<string, any>): void;
			}
		}
	}
}
