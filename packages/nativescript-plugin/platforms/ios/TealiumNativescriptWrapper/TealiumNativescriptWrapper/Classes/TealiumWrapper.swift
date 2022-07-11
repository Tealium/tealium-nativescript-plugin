//
//  TealiumWrapper.swift
//  TealiumWrapper
//
//  Created by Craig Rouse on 27/11/2020.
//

import Foundation
import TealiumSwift

@objc public class TealiumWrapper: NSObject {
    
    static var tealium: Tealium?
    private static var config: TealiumConfig?
    static var visitorServiceCallback: ((String) -> Void)?
    static var visitorServiceDelegate = VisitorDelegate()
    
    @objc public static func create(config: [String: Any]) {
        
        guard let account = config["account"] as? String,
              let profile = config["profile"] as? String,
              let environment = config["environment"] as? String else {
            return
        }
        
        let localConfig = TealiumConfig(account: account,
                                        profile: profile,
                                        environment: environment,
                                        dataSource: config["dataSource"] as? String)
        
        if let consentPolicy = config["consentPolicy"] as? String {
            switch consentPolicy {
            case "ccpa":
                localConfig.consentPolicy = .ccpa
            case "gdpr":
                localConfig.consentPolicy = .gdpr
            default:
                localConfig.consentPolicy = nil
            }
            localConfig.consentLoggingEnabled =  config["consentLoggingEnabled"] as? Bool ?? true
        }

        if let customVisitorId = config["customVisitorId"] as? String {
            localConfig.existingVisitorId = customVisitorId
        }
        
        if let lifecycleAutoTrackingEnabled = config["lifecycleAutoTrackingEnabled"] as? Bool {
            localConfig.lifecycleAutoTrackingEnabled = lifecycleAutoTrackingEnabled
        }
        
        var configDispatchers = [Dispatcher.Type]()
        var configCollectors = [Collector.Type]()
        
        if let dispatchers = config["dispatchers"] as? [String] {
            if dispatchers.contains("TagManagement") {
                configDispatchers.append(Dispatchers.TagManagement)
            }
            
            if dispatchers.contains("Collect") {
                configDispatchers.append(Dispatchers.Collect)
            }
            
            if dispatchers.contains("RemoteCommands") {
                configDispatchers.append(Dispatchers.RemoteCommands)
            }
        }
        
        if let collectors = config["collectors"] as? [String] {
            if collectors.contains("AppData") {
                configCollectors.append(Collectors.AppData)
            }
            
            if collectors.contains("Connectivity") {
                configCollectors.append(Collectors.Connectivity)
            }
            
            if collectors.contains("DeviceData") {
                configCollectors.append(Collectors.Device)
            }
            
            if collectors.contains("Lifecycle") {
                configCollectors.append(Collectors.Lifecycle)
            }
        }
        
        if let useRemoteLibrarySettings = config["useRemoteLibrarySettings"] as? Bool {
            localConfig.shouldUseRemotePublishSettings = useRemoteLibrarySettings
        }
        
        if let logLevel = config["logLevel"] as? String {
            switch logLevel {
            case "dev":
                localConfig.logLevel = .info
            case "qa":
                localConfig.logLevel = .debug
            case "prod":
                localConfig.logLevel = .error
            case "silent":
                localConfig.logLevel = .silent
            default:
                localConfig.logLevel = .error
            }
        }
        
        if let overrideCollectURL = config["overrideCollectURL"] as? String {
            localConfig.overrideCollectURL = overrideCollectURL
        }
        
        if let overrideTagManagementURL = config["overrideTagManagementURL"] as? String {
            localConfig.tagManagementOverrideURL = overrideTagManagementURL
        }

        if let overrideCollectBatchURL = config["overrideCollectBatchURL"] as? String {
            localConfig.overrideCollectBatchURL = overrideCollectBatchURL
        }

        if let overrideCollectDomain = config["overrideCollectDomain"] as? String {
            localConfig.overrideCollectDomain = overrideCollectDomain
        }

        if let overrideCollectProfile = config["overrideCollectProfile"] as? String {
            localConfig.overrideCollectProfile = overrideCollectProfile
        }
        
        //         not yet supported in Swift
//        if let overrideLibrarySettingsURL = config["overrideLibrarySettingsURL"] as? String {
//            localConfig.overrideLibrarySettingsURL = overrideLibrarySettingsURL
//        }
        
        if let visitorServiceRefreshInterval = Int((config["visitorServiceRefreshInterval"] as? String ?? "5")) {
            localConfig.visitorServiceRefresh = .every(visitorServiceRefreshInterval, .minutes)
        }

        localConfig.sessionCountingEnabled = config["sessionCountingEnabled"] as? Bool ?? false
        
        localConfig.qrTraceEnabled = config["qrTraceEnabled"] as? Bool ?? true
        
        localConfig.deepLinkTrackingEnabled = config["deepLinkTrackingEnabled"] as? Bool ?? true
        
        localConfig.lifecycleAutoTrackingEnabled = config["lifecycleAutotrackingEnabled"] as? Bool ?? true
        
        if config["visitorServiceEnabled"] as? Bool == true {
            configCollectors.append(Collectors.VisitorService)
            localConfig.visitorServiceDelegate = visitorServiceDelegate
        }
        
        if let consentExpiry = config["consentExpiry"] as? [String:Any],
           let time = consentExpiry["time"] as? Int,
           let unit = consentExpiry["unit"] as? String {
            var unitType = TimeUnit.days
            
            switch unit.lowercased() {
            case "minutes":
                unitType = .minutes
            case "hours":
                unitType = .hours
            case "months":
                unitType = .months
            default:
                break
            }
            localConfig.consentExpiry = (time: time, unit: unitType)
        }
        
        localConfig.memoryReportingEnabled = config["memoryReportingEnabled"] as? Bool ?? true
        
        localConfig.collectors = configCollectors
        
        localConfig.dispatchers = configDispatchers
        TealiumWrapper.config = localConfig.copy
        tealium = Tealium(config: localConfig)
    }
    
    @objc public static func terminateInstance() {
        guard let config = config else {
            return
        }
        TealiumInstanceManager.shared.removeInstance(config: config)
        tealium = nil
    }
    
    @objc public static func setConsentStatus(status: String) {
        if status == "consented" {
            tealium?.consentManager?.userConsentStatus = .consented
        } else {
            tealium?.consentManager?.userConsentStatus = .notConsented
        }
    }
    
    @objc public static var visitorId: String? {
        get {
            tealium?.visitorId
        }
    }
    
    @objc public static var consentStatus: String? {
        get {
            return tealium?.consentManager?.userConsentStatus.rawValue
        }
        
        set {
            guard let newValue = newValue else {
                return
            }
            guard let consentStatus = TealiumConsentStatus(rawValue: newValue) else {
                return
            }
            tealium?.consentManager?.userConsentStatus = consentStatus
        }
    }
    
    @objc public static var consentCategories: [String]? {
        get {
            return tealium?.consentManager?.userConsentCategories?.compactMap {
                $0.rawValue
            }
        }
        
        set {
            guard let newValue = newValue else {
                return
            }
            
            let consentCategories = newValue.compactMap {
                TealiumConsentCategories(rawValue: $0)
            }
            
            guard consentCategories.count > 0 else {
                return
            }
            
            tealium?.consentManager?.userConsentCategories = consentCategories
        }
    }
    
    @objc public static func addToDataLayer(data: NSDictionary?, expiry: String) {
        guard let data = data as? [String: Any] else {
            return
        }
        
        var expires: Expiry
        
        switch expiry {
        case "forever":
            expires = .forever
        case "restart":
            expires = .untilRestart
        default:
            expires = .session
        }

        tealium?.dataLayer.add(data: data, expiry: expires)
    }
    
    @objc public static func removeFromDataLayer(keys: [String]) {
        tealium?.dataLayer.delete(for: keys)
    }
    
    @objc public static func deleteFromDataLayer(keys: [String]) {
        tealium?.dataLayer.delete(for: keys)
    }
    
    @objc public static func getDataFromDataLayer(key: String) -> Any? {
        return tealium?.dataLayer.all[key]
    } 

    @objc public static func gatherTrackData(_ completion: @escaping (Any) -> Void) {
        tealium?.gatherTrackData(completion: { response in
            guard let result = response as Any? else {
                return
            }
            completion([result])
        })
    } 
    
    @objc public static func addRemoteCommand(id: String,
                                              _ completion: @escaping (String) -> Void) {
        let remoteCommand = RemoteCommand(commandId: id, description: nil) { response in
            var responseDictionary = [String: Any]()
            responseDictionary["payload"] = response.payload
            responseDictionary["status"] = response.status
            responseDictionary["error"] = response.error
            if let data = try? JSONSerialization.data(withJSONObject: responseDictionary),
               let string = String(data: data, encoding: .utf8) {
                completion(string)
            }
            
        }
        tealium?.remoteCommands?.add(remoteCommand)
    }
    
    @objc public static func removeRemoteCommand(id: String) {
        tealium?.remoteCommands?.remove(commandWithId: id)
    }
    
    @objc public static func setConsentCategories(categories: [String]) {
        tealium?.consentManager?.userConsentCategories = TealiumConsentCategories.consentCategoriesStringArrayToEnum(categories)
    }
    
    @objc public static func track(dispatch: [String: Any]) {
        let type = dispatch["type"] as? String ?? "event"
        let dataLayer = dispatch["dataLayer"] as? [String: Any]
        var track: TealiumDispatch
        switch type {
        case "view":
            guard let viewName = dispatch["viewName"] as? String else {
                return
            }
            track = TealiumView(viewName, dataLayer: dataLayer)
        default:
            guard let eventName = dispatch["eventName"] as? String else {
                return
            }
            track = TealiumEvent(eventName, dataLayer: dataLayer)
        }
        tealium?.track(track)
    }
    
    @objc public static func joinTrace(id: String) {
        tealium?.joinTrace(id: id)
    }
    
    @objc public static func leaveTrace() {
        tealium?.leaveTrace()
    }
    
    @objc public static func setVisitorServiceListener(_ completion: @escaping (String) -> Void) {
        visitorServiceCallback = completion
    }
    
    @objc public static func removeVisitorServiceListener() {
        visitorServiceCallback = nil
    }
}

class VisitorDelegate: VisitorServiceDelegate {
    public func didUpdate(visitorProfile: TealiumVisitorProfile) {
        let currentVisit: [String: Any?] = [
            "dates": visitorProfile.currentVisit?.dates,
            "booleans": visitorProfile.currentVisit?.booleans,
            "arraysOfBooleans": visitorProfile.currentVisit?.arraysOfBooleans,
            "numbers": visitorProfile.currentVisit?.numbers,
            "arraysOfNumbers": visitorProfile.currentVisit?.arraysOfNumbers,
            "tallies": visitorProfile.currentVisit?.tallies,
            "strings": visitorProfile.currentVisit?.strings,
            "arraysOfStrings": visitorProfile.currentVisit?.arraysOfStrings,
            // Sets cannot be serialized to JSON, so convert to array first
            "setsOfStrings": visitorProfile.currentVisit?.setsOfStrings.map({ (stringSet) -> [String: [String]] in
            var newValue = [String: [String]]()
            stringSet.forEach {
                newValue[$0.key] = Array($0.value)
            }
            return newValue
        }),
        ]
        
        let dictionaryProfile: [String: Any?] = [
            "audiences": visitorProfile.audiences,
            "badges": visitorProfile.badges,
            "dates": visitorProfile.dates,
            "booleans": visitorProfile.booleans,
            "arraysOfBooleans": visitorProfile.arraysOfBooleans,
            "numbers": visitorProfile.numbers,
            "arraysOfNumbers": visitorProfile.arraysOfNumbers,
            "tallies": visitorProfile.tallies,
            "strings": visitorProfile.strings,
            "arraysOfStrings": visitorProfile.arraysOfStrings,
            // Sets cannot be serialized to JSON, so convert to array first
            "setsOfStrings": visitorProfile.setsOfStrings.map({ (stringSet) -> [String: [String]] in
                var newValue = [String: [String]]()
                stringSet.forEach {
                    newValue[$0.key] = Array($0.value)
                }
                return newValue
            }),
            "currentVisit": currentVisit.compactMapValues { $0 }
        ]
        
        
        if let data = try? JSONSerialization.data(withJSONObject: dictionaryProfile.compactMapValues({$0})),
           let string = String(data: data, encoding: .utf8) {
           TealiumWrapper.visitorServiceCallback?(string)
        }
    }
}

