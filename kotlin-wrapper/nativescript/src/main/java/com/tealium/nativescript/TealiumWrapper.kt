package com.tealium.nativescript

import android.app.Application
import com.tealium.collectdispatcher.Collect
import com.tealium.collectdispatcher.overrideCollectBatchUrl
import com.tealium.collectdispatcher.overrideCollectDomain
import com.tealium.collectdispatcher.overrideCollectUrl
import com.tealium.core.*
import com.tealium.core.collection.App
import com.tealium.core.collection.Connectivity
import com.tealium.core.collection.Device
import com.tealium.core.collection.Time
import com.tealium.core.consent.*
import com.tealium.core.persistence.Expiry
import com.tealium.dispatcher.Dispatch
import com.tealium.dispatcher.TealiumEvent
import com.tealium.dispatcher.TealiumView
import com.tealium.lifecycle.Lifecycle
import com.tealium.lifecycle.isAutoTrackingEnabled
import com.tealium.remotecommanddispatcher.RemoteCommands
import com.tealium.remotecommanddispatcher.remoteCommands
import com.tealium.remotecommands.RemoteCommand
import com.tealium.tagmanagementdispatcher.TagManagement
import com.tealium.tagmanagementdispatcher.overrideTagManagementUrl
import com.tealium.visitorservice.*
import org.json.JSONArray
import org.json.JSONObject
import java.util.*
import java.util.concurrent.TimeUnit

class TealiumWrapper {

    companion object {
        private const val ACCOUNT = "account"
        private const val PROFILE = "profile"
        private const val ENVIRONMENT = "environment"
        private const val COLLECTORS = "collectors"
        private const val DISPATCHERS = "dispatchers"
        private const val CUSTOM_VISITOR_ID = "customVisitorId"
        private const val ENABLE_VISITOR_SERVICE = "visitorServiceEnabled"


        private var tealium: Tealium? = null
        private var instanceName = "main"
        private var visitorUpdatedListener: VisitorUpdatedListener? = null

        @Suppress("unused")
        var consentStatus: String
            get() {
                return tealium?.consentManager?.userConsentStatus.toString()
            }
            set(value) {
                when (value) {
                    "consented" -> tealium?.consentManager?.userConsentStatus =
                        ConsentStatus.CONSENTED
                    "notConsented" -> tealium?.consentManager?.userConsentStatus =
                        ConsentStatus.NOT_CONSENTED
                    else -> tealium?.consentManager?.userConsentStatus = ConsentStatus.UNKNOWN
                }
            }

        @Suppress("unused")
        var consentCategories: Array<String>?
            get() {
                return tealium?.consentManager?.userConsentCategories?.map {
                    it.toString()
                }?.toTypedArray()
            }
            set(value) {
                value?.let {
                    tealium?.consentManager?.userConsentCategories = consentCategoriesArrayToSet(it)
                }
            }

        fun create(
            application: Application,
            config: String
        ) {
            val configurations = JsonUtils.mapFor(JSONObject(config))
            val account = configurations[ACCOUNT] as String
            val profile = configurations[PROFILE] as String
            val environment = configurations[ENVIRONMENT] as String

            val collectorsSet = getCollectorsSet(configurations[COLLECTORS] as? JSONArray).apply {
                add(Collectors.Time)
            }
            val modulesSet = getModulesSet(configurations[COLLECTORS] as? JSONArray)
            if (configurations[ENABLE_VISITOR_SERVICE] == true) {
                modulesSet.add(Modules.VisitorService)
            }

            val dispatchersSet = getDispatchersSet(configurations[DISPATCHERS] as? JSONArray)

            val env = when (environment.toLowerCase(Locale.ROOT)) {
                "dev" -> Environment.DEV
                "qa" -> Environment.QA
                "prod" -> Environment.PROD
                else -> Environment.DEV
            }

            val tealiumConfig = TealiumConfig(
                application,
                account,
                profile,
                env,
                dataSourceId = configurations["dataSource"] as? String,
                collectors = collectorsSet,
                modules = modulesSet,
                dispatchers = dispatchersSet
            )

            checkAndApplyOptions(tealiumConfig, configurations)
            tealium = Tealium.create(instanceName, tealiumConfig) { }
        }

        fun terminateInstance() {
            Tealium.destroy(instanceName)
            tealium = null
        }

        fun addData(data: String, expiry: String) {
            val exp = when (expiry.toLowerCase(Locale.ROOT)) {
                "forever" -> Expiry.FOREVER
                "session" -> Expiry.SESSION
                "untilrestart" -> Expiry.UNTIL_RESTART
                else -> Expiry.SESSION
            }

            JsonUtils.mapFor(JSONObject(data)).forEach { (key, value) ->
                when (value) {
                    is String -> tealium?.dataLayer?.putString(key, value, exp)
                    is Int -> tealium?.dataLayer?.putInt(key, value, exp)
                    is Long -> tealium?.dataLayer?.putLong(key, value, exp)
                    is Double -> tealium?.dataLayer?.putDouble(key, value, exp)
                    is Boolean -> tealium?.dataLayer?.putBoolean(key, value, exp)
                    is JSONObject -> tealium?.dataLayer?.putJsonObject(key, value, exp)
                    is IntArray -> {
                        tealium?.dataLayer?.putIntArray(key, value.toList().toTypedArray(), exp)
                    }
                    is BooleanArray -> {
                        tealium?.dataLayer?.putBooleanArray(key, value.toList().toTypedArray(), exp)
                    }
                    is LongArray -> {
                        tealium?.dataLayer?.putLongArray(key, value.toList().toTypedArray(), exp)
                    }
                    is DoubleArray -> {
                        tealium?.dataLayer?.putDoubleArray(key, value.toList().toTypedArray(), exp)
                    }
                    is Array<*> -> {
                        val formatted = value.toList()
                            .map { i -> i.toString() }
                            .toTypedArray()
                        tealium?.dataLayer?.putStringArray(key, formatted, exp)
                    }
                }
            }
        }

        fun removeData(keys: Array<String>) {
            keys.forEach { key ->
                tealium?.dataLayer?.remove(key)
            }
        }

        fun fetchVisitorId(): String? {
            return tealium?.visitorId
        }

        fun fetchData(key: String): Any? {
            return tealium?.dataLayer?.all()?.get(key)
        }

        fun track(dispatch: String) {
            val payload = JsonUtils.mapFor(JSONObject(dispatch))
            val dataLayerString = payload["dataLayer"]?.toString()
            var dataLayer = mapOf<String, Any>()
            dataLayerString?.let {
                dataLayer = JsonUtils.mapFor(JSONObject(it))
            }

            val tealiumDispatch: Dispatch = when (payload["type"]) {
                "view" -> {
                    (payload["viewName"] as? String)?.let {
                        TealiumView(it, dataLayer)
                    } ?: run {
                        TealiumView("view", dataLayer)
                    }
                }
                else -> {
                    (payload["eventName"] as? String)?.let {
                        TealiumEvent(it, dataLayer)
                    } ?: run {
                        TealiumEvent("event", dataLayer)
                    }
                }
            }

            tealium?.track(tealiumDispatch)
        }

        fun addRemoteCommand(id: String, remoteCommandCallback: RemoteCommandCallback) {
            val command = object : RemoteCommand(id, null) {
                override fun onInvoke(response: Response?) {
                    response?.requestPayload?.let {
                        val responseData = mapOf(
                            "payload" to it,
                            "status" to response?.status
                        )
                        remoteCommandCallback.remoteCommandCallback(responseData)
                    }
                }
            }
            tealium?.remoteCommands?.add(command)
        }

        fun removeRemoteCommand(id: String) {
            tealium?.remoteCommands?.remove(id)
        }

        fun setVisitorServiceListener(listener: VisitorServiceListener) {
            visitorUpdatedListener = object : VisitorUpdatedListener {
                override fun onVisitorUpdated(visitorProfile: VisitorProfile) {
                    val map = mutableMapOf<String, Any>()
                    visitorProfile.audiences?.let {
                        map["audiences"] = it
                    }
                    visitorProfile.badges?.let {
                        map["badges"] = it
                    }

                    visitorProfile.dates?.let {
                        map["dates"] = it
                    }

                    visitorProfile.booleans?.let {
                        map["booleans"] = it
                    }

                    visitorProfile.arraysOfBooleans?.let {
                        map["arraysOfBooleans"] = it
                    }

                    visitorProfile.numbers?.let {
                        map["numbers"] = it
                    }

                    visitorProfile.arraysOfNumbers?.let {
                        map["arraysOfNumbers"] = it
                    }

                    visitorProfile.tallies?.let {
                        map["tallies"] = it
                    }

                    visitorProfile.strings?.let {
                        map["strings"] = it
                    }

                    visitorProfile.arraysOfStrings?.let {
                        map["arraysOfStrings"] = it
                    }

                    visitorProfile.setsOfStrings?.let {
                        map["setsOfStrings"] = it
                    }

                    visitorProfile.currentVisit?.let { visit ->
                        val currentVisitMap = mutableMapOf<String, Any>()
                        visit.arraysOfBooleans?.let {
                            currentVisitMap["arraysOfBooleans"] = it
                        }
                        visit.arraysOfNumbers?.let {
                            currentVisitMap["arraysOfNumbers"] = it
                        }
                        visit.arraysOfStrings?.let {
                            currentVisitMap["arraysOfStrings"] = it
                        }
                        visit.booleans?.let {
                            currentVisitMap["booleans"] = it
                        }

                        visit.dates?.let {
                            currentVisitMap["dates"] = it
                        }
                        visit.numbers?.let {
                            currentVisitMap["numbers"] = it
                        }
                        visit.setsOfStrings?.let {
                            currentVisitMap["setsOfStrings"] = it
                        }
                        visit.strings?.let {
                            currentVisitMap["strings"] = it
                        }
                        visit.tallies?.let {
                            currentVisitMap["tallies"] = it
                        }
                        map["currentVisit"] = JsonUtils.mapFor(JsonUtils.jsonFor(currentVisitMap))
                    }
                    listener.updatedVisitorProfile(JsonUtils.mapFor(JsonUtils.jsonFor(map)))
                }
            }

            visitorUpdatedListener?.let {
                tealium?.events?.subscribe(it)
            }
        }

        fun removeVisitorServiceListener() {
            visitorUpdatedListener?.let {
                tealium?.events?.unsubscribe(it)
            }
        }

        fun joinTrace(id: String) {
            tealium?.joinTrace(id)
        }

        fun leaveTrace() {
            tealium?.leaveTrace()
        }

        private fun checkAndApplyOptions(config: TealiumConfig, options: Map<String, Any>) {
            options.forEach { (key, value) ->
                when (key) {
                    "overrideCollectURL" -> config.overrideCollectUrl = value.toString()
                    "overrideCollectBatchURL" -> config.overrideCollectBatchUrl = value.toString()
                    "overrideCollectDomain" -> config.overrideCollectDomain = value.toString()
                    "overrideLibrarySettingsURL" -> config.overrideLibrarySettingsUrl =
                        value.toString()
                    "overrideTagManagementURL" -> config.overrideTagManagementUrl = value.toString()
                    "deepLinkTrackingEnabled" -> config.deepLinkTrackingEnabled =
                        value.toString().toBoolean()
                    "qrTraceEnabled" -> config.qrTraceEnabled = value.toString().toBoolean()
                    "consentLoggingEnabled" -> config.consentManagerLoggingEnabled =
                        value.toString().toBoolean()
                    "useRemoteLibrarySettings" -> config.useRemoteLibrarySettings =
                        value.toString().toBoolean()
                    "lifecycleAutotrackingEnabled" -> config.isAutoTrackingEnabled =
                        value.toString().toBoolean()
                    "visitorServiceRefreshInterval" -> value.toString().toLongOrNull()?.let {
                        config.visitorServiceRefreshInterval = TimeUnit.MINUTES.toSeconds(it)
                    }
                    "consentPolicy" -> {
                        when (value.toString()) {
                            "ccpa" -> {
                                config.consentManagerPolicy = ConsentPolicy.CCPA
                                config.consentManagerEnabled = true
                            }
                            "gdpr" -> {
                                config.consentManagerPolicy = ConsentPolicy.GDPR
                                config.consentManagerEnabled = true
                            }
                            else -> {
                                config.consentManagerEnabled = false
                                config.consentManagerPolicy = null
                            }
                        }
                    }
                    "consentExpiry" -> {
                        val map = JsonUtils.mapFor(JSONObject(value.toString()))
                        map["time"]?.let { time ->
                            map["unit"]?.let { unit ->
                                config.consentExpiry = getConsentExpiry(time.toString().toLong(), unit as String)
                            }
                        }
                    }
                    CUSTOM_VISITOR_ID -> {
                        (value as? String)?.let {
                            config.existingVisitorId = it
                        }
                    }
                }
            }
        }

        private fun getCollectorsSet(collectors: JSONArray?): MutableSet<CollectorFactory> {
            val collectorsSet = mutableSetOf<CollectorFactory>()
            collectors?.let {
                for (i in 0 until it.length()) {
                    when ((it[i] as String).toLowerCase(Locale.ROOT)) {
                        "devicedata" -> collectorsSet.add(Collectors.Device)
                        "connectivity" -> collectorsSet.add(Collectors.Connectivity)
                        "appdata" -> collectorsSet.add(Collectors.App)
                    }
                }
            }

            return collectorsSet
        }

        private fun getModulesSet(modules: JSONArray?): MutableSet<ModuleFactory> {
            val modulesSet = mutableSetOf<ModuleFactory>()
            modules?.let { mod ->
                for (i in 0 until modules.length()) {
                    when ((mod[i] as String).toLowerCase(Locale.ROOT)) {
                        "lifecycle" -> modulesSet.add(Modules.Lifecycle)
                    }
                }
            }

            return modulesSet
        }

        private fun getDispatchersSet(dispatchers: JSONArray?): MutableSet<DispatcherFactory> {
            val dispatchersSet = mutableSetOf<DispatcherFactory>()
            dispatchers?.let { dispatcher ->
                for (i in 0 until dispatchers.length()) {
                    when ((dispatcher[i] as String).toLowerCase(Locale.ROOT)) {
                        "tagmanagement" -> dispatchersSet.add(Dispatchers.TagManagement)
                        "collect" -> dispatchersSet.add(Dispatchers.Collect)
                        "remotecommands" -> dispatchersSet.add(Dispatchers.RemoteCommands)
                    }
                }
            }
            return dispatchersSet
        }

        private fun getConsentExpiry(time: Long, unit: String): ConsentExpiry? {
            if (time <= 0) return null

            val count: Long = if (unit == "months") {
                // No TimeUnit.MONTHS, so needs conversion to days.
                val cal = Calendar.getInstance()
                val today = cal.timeInMillis
                cal.add(Calendar.MONTH, time.toInt())
                (cal.timeInMillis - today) / (1000 * 60 * 60 * 24)
            } else { time }
            return timeUnitFromString(unit)?.let { ConsentExpiry(count, it) }
        }

        private fun timeUnitFromString(unit: String): TimeUnit? {
            return when(unit) {
                "minutes" -> TimeUnit.MINUTES
                "hours" -> TimeUnit.HOURS
                "days" -> TimeUnit.DAYS
                "months" -> TimeUnit.DAYS
                else -> null
            }
        }

        private fun consentCategoriesArrayToSet(categories: Array<String>): Set<ConsentCategory> {
            val categoriesSet = mutableSetOf<ConsentCategory>()

            categories.forEach {
                when (it) {
                    "affiliates" -> categoriesSet.add(ConsentCategory.AFFILIATES)
                    "analytics" -> categoriesSet.add(ConsentCategory.ANALYTICS)
                    "big_data" -> categoriesSet.add(ConsentCategory.BIG_DATA)
                    "cdp" -> categoriesSet.add(ConsentCategory.CDP)
                    "cookiematch" -> categoriesSet.add(ConsentCategory.COOKIEMATCH)
                    "crm" -> categoriesSet.add(ConsentCategory.CRM)
                    "display_ads" -> categoriesSet.add(ConsentCategory.DISPLAY_ADS)
                    "email" -> categoriesSet.add(ConsentCategory.EMAIL)
                    "engagement" -> categoriesSet.add(ConsentCategory.ENGAGEMENT)
                    "mobile" -> categoriesSet.add(ConsentCategory.MOBILE)
                    "monitoring" -> categoriesSet.add(ConsentCategory.MONITORING)
                    "personalization" -> categoriesSet.add(ConsentCategory.PERSONALIZATION)
                    "search" -> categoriesSet.add(ConsentCategory.SEARCH)
                    "social" -> categoriesSet.add(ConsentCategory.SOCIAL)
                    "misc" -> categoriesSet.add(ConsentCategory.MISC)
                }
            }
            return categoriesSet.toSet()
        }

        private fun arrayForJson(responseJson: JSONObject): Array<String?> {
            val resultData = responseJson.getJSONArray("data")
                .getJSONObject(0)
                .getJSONArray("result")
            return Array<String?>(resultData.length()) { i -> resultData.getString(i) }
        }
    }
}

interface RemoteCommandCallback {
    fun remoteCommandCallback(responseData: Map<String, Any?>)
}

interface VisitorServiceListener {
    fun updatedVisitorProfile(responseData: Map<String, Any?>)
}

